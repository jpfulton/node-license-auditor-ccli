/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import { exec, execFile } from "child_process";
import { readFileSync } from "fs";

import bluebird from "bluebird";
import lodash from "lodash";
const { mapSeries } = bluebird;
const { get } = lodash; // used to access properties of an object given a path

import Retriever from "./retriever.js";

import {
  Dependency,
  DependencyLicense,
  removeDuplicates,
} from "@jpfulton/license-auditor-common";
import { licenseFiles, licenseMap, readmeFiles, templates } from "../util";

// find the path of the current directory
export const findDirPath = () =>
  new Promise((resolve, reject) => {
    // pwd is a unix command to print the current working directory
    // run in child process to get the path of the current directory
    exec("pwd", async (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      if (stderr) {
        console.error(stderr);
      }
      resolve(stdout.replace(/\n/, "")); // remove trailing newline
    });
  });

// find the path of a file given a filename and a directory path
export const findFile = (filename: string, dirPath: string) =>
  new Promise((resolve, reject) => {
    // find is a unix command to find files in a directory
    // -iwholename is used to match the whole path with case insensitivity
    // may return multiple results
    const cmd = "find";
    const args = [dirPath, "-iwholename", `${dirPath}/${filename}`];

    execFile(cmd, args, async (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      if (stderr) {
        console.error(stderr);
      }
      // remove trailing newline
      resolve(stdout.replace(/\n/gm, ""));
    });
  });

// find the license of a package given the parsed content of its package.json file
export const findLicense = async (
  item: any,
  dirPath: string
): Promise<DependencyLicense[]> => {
  // create a retriever object for use in identifying licenses that are not identified
  // in the package.json file using the license field
  const retriever = Retriever(licenseMap, templates);

  // first, we check the "license" field which can be a string, an array or an object
  if (typeof item.license === "object") {
    // if the license field is an array, map it to an array DependencyLicense objects
    if (Array.isArray(item.license)) {
      const depLicenses: DependencyLicense[] = [];
      item.license.forEach((licenseName: string) => {
        depLicenses.push({
          license: licenseName,
          path: item.path,
        });
      });

      return depLicenses;
    }

    // if the license field is an object but not an array, return the type property
    return [{ license: item.license.type, path: item.path }];
  }

  // if the license field is a string, check if it is in the license map
  if (item.license && item.license !== "SEE LICENSE IN LICENSE") {
    return [
      {
        license: licenseMap[item.license] || item.license,
        path: item.path,
      },
    ];
  }

  // if the license field is absent, check the "licenses" field
  if (item.licenses && typeof item.licenses === "object") {
    // if the licenses field is an array, map its contents to an array DependencyLicense objects
    if (Array.isArray(item.licenses)) {
      const depLicenses: DependencyLicense[] = [];
      item.licenses.forEach((licenseObj: any) => {
        depLicenses.push({
          license: licenseObj.type || licenseObj,
          path: item.path,
        });
      });
      return depLicenses;
    }

    // if the licenses field is an object but not an array, return the type property
    return [{ license: item.licenses.type, path: item.path }];
  }

  // options below this point exist to identify licenses that are not found in
  // the package.json file using the license or licenses field

  // check for license files in the root of the package
  // the licenseFiles array contains the names of common license file names and
  // common misspellings of those names
  for (const licenseFile of licenseFiles) {
    try {
      // find the license file in the root of the package
      const basicPath = item.path.replace(/package\.json$/, licenseFile);

      // find the path of the license file, if it exists
      // an empty string is returned if the file does not exist
      const licensePath = (await findFile(basicPath, dirPath)) as string;

      // retrieve the license from the license file
      const licenses = retriever.retrieveLicenseFromLicenseFile(licensePath);
      if (licenses) {
        return [{ license: licenses, path: licensePath }];
      }
    } catch (error) {
      console.error(error);
    }
  }

  // check for readme files in the root of the package
  // the readmeFiles array contains the names of common readme file names and
  // common misspellings of those names
  for (const readmeFile of readmeFiles) {
    try {
      // find the readme file in the root of the package
      const basicPath = item.path.replace(/package\.json$/, readmeFile);

      // find the path of the readme file, if it exists
      // an empty string is returned if the file does not exist
      const licensePath = (await findFile(basicPath, dirPath)) as string;

      // retrieve the license from the readme file
      const licenses = retriever.retrieveLicenseFromReadme(licensePath);
      if (licenses) {
        return [{ license: licenses, path: licensePath }];
      }
    } catch (error) {
      console.error(error);
    }
  }

  // if no license is found, return "UNKNOWN"
  return [{ license: "UNKNOWN", path: "UNKNOWN" }];
};

// Find all dependencies in a project based on a path to the project
export const findAllDependencies = (projectPath: string) =>
  new Promise<Dependency[]>((resolve, reject) => {
    // get the name of the root project from its package.json
    const rootProject = JSON.parse(
      readFileSync(`${projectPath}/package.json`).toString()
    );
    const rootProjectName = rootProject?.name ?? "UNKNOWN"; // if name is not found, set it to "UNKNOWN"

    // find all package.json files in the node_modules directory
    const cmd = "find";
    const args = [`${projectPath}/node_modules`, "-name", "package.json"];
    execFile(cmd, args, async (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      if (stderr) {
        console.error(stderr);
      }

      // get the path of the current directory
      const dirPath = (await findDirPath()) as string;

      // split stdout from the command into lines
      const packages = splitAndFilterPackages(stdout);

      // get the content of each package.json file and parse it
      // add it to an array of objects where each object contains the path and parsed
      // content of a package.json file as an object
      const data = packages
        .map((path) => ({
          path,
          ...JSON.parse(readFileSync(path).toString()),
        }))
        .filter((item) => item.name); // filter out packages without a name

      // get the license data for each package
      let dependencies: Dependency[] = await mapSeries(data, async (item) => ({
        licenses: await findLicense(item, dirPath), // returns the licenses and the path of the license file
        path: item.path,
        name: item.name,
        repository: get(item, "repository.url"),
        publisher: get(item, "author.name", item.author),
        email: get(item, "author.email"),
        version: item.version,
        rootProjectName: rootProjectName,
      }));

      // remove duplicates based on common name, version and licenses array
      dependencies = removeDuplicates(dependencies);

      // sort by name
      dependencies.sort((a, b) => a.name.localeCompare(b.name));

      // resolve the promise with the license data
      resolve(dependencies);
    });
  });

export function splitAndFilterPackages(stdout: string): string[] {
  return stdout
    .split("\n")
    .filter((x) => x) // filter out empty lines
    .filter((x) => !/.*test.*/.test(x)) // filter out paths with "test" to eliminate test fixtures
    .filter(
      (x) =>
        // filter out paths that do not end with node_modules/PACKAGE_NAME/package.json
        // or node_modules/@SCOPE/PACKAGE_NAME/package.json
        /node_modules\/[0-9A-Za-z-]*\/package\.json$/.test(x) ||
        /node_modules\/@[0-9A-Za-z-]*\/[0-9A-Za-z-]*\/package\.json$/.test(x)
    );
}

export default findAllDependencies;
