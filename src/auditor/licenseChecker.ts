/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import { exec } from "child_process";
import { readFileSync } from "fs";

import bluebird from "bluebird";
import lodash from "lodash";
const { mapSeries } = bluebird;
const { get } = lodash; // used to access properties of an object given a path

import Retriever from "./retriever.js";

import { License } from "../models/license.js";
import constants from "../util/constants.js";
const { templates, licenseMap, licenseFiles, readmeFiles } = constants;

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
    // -iwholename is used to match the whole path
    // may return multiple results
    exec(
      `find ${dirPath} -iwholename ${dirPath}/${filename}`,
      async (err, stdout, stderr) => {
        if (err) {
          reject(err);
        }
        if (stderr) {
          console.error(stderr);
        }
        // remove trailing newline
        resolve(stdout.replace(`${dirPath}/`, "").replace(/\n/gm, ""));
      }
    );
  });

const findLicense = async (item: any, dirPath: string) => {
  const retriever = Retriever(licenseMap, templates);
  // first, we check the "license" field which can be a string, an array or an object
  // if the "license" field does not exist, we check the "licenses" field
  if (typeof item.license === "object") {
    if (Array.isArray(item.license)) {
      return {
        licenses: item.license.map((x: { type: any }) => x.type || x),
        licensePath: item.path,
      };
    }
    return { licenses: item.license.type, licensePath: item.path };
  }
  if (item.license && item.license !== "SEE LICENSE IN LICENSE") {
    return {
      licenses: licenseMap[item.license] || item.license,
      licensePath: item.path,
    };
  }
  if (item.licenses && typeof item.licenses === "object") {
    if (Array.isArray(item.licenses)) {
      return {
        licenses: item.licenses.map((x: { type: any }) => x.type || x),
        licensePath: item.path,
      };
    }
    return { licenses: item.licenses.type, licensePath: item.path };
  }
  for (const licenseFile of licenseFiles) {
    try {
      const basicPath = item.path.replace(/package\.json$/, licenseFile);
      const licensePath = (await findFile(basicPath, dirPath)) as string;
      const licenses = retriever.retrieveLicenseFromLicenseFile(licensePath);
      if (licenses) {
        return { licenses, licensePath };
      }
    } catch (error) {
      console.error(error);
    }
  }
  for (const readmeFile of readmeFiles) {
    try {
      const basicPath = item.path.replace(/package\.json$/, readmeFile);
      const licensePath = (await findFile(basicPath, dirPath)) as string;
      const licenses = retriever.retrieveLicenseFromReadme(licensePath);
      if (licenses) {
        return { licenses, licensePath };
      }
    } catch (error) {
      console.error(error);
    }
  }
  return { licenses: "UNKNOWN", licensePath: "UNKNOWN" };
};

export const findAllLicenses = (projectPath: string) =>
  new Promise<License[]>((resolve, reject) => {
    const rootProject = JSON.parse(
      readFileSync(`${projectPath}/package.json`).toString()
    );
    const rootProjectName = rootProject?.name ?? "UNKNOWN";

    exec(
      `find ${projectPath}/node_modules -name "package.json"`,
      async (err, stdout, stderr) => {
        if (err) {
          reject(err);
        }
        if (stderr) {
          console.error(stderr);
        }
        const dirPath = (await findDirPath()) as string;
        const packages = stdout
          .split("\n")
          .filter((x) => x)
          .filter(
            (x) =>
              // edit out paths with "test" to eliminate test fixtures
              !/.*test.*/.test(x) &&
              (/node_modules\/[0-9A-Za-z-]*\/package\.json$/.test(x) ||
                /node_modules\/@[0-9A-Za-z-]*\/[0-9A-Za-z-]*\/package\.json$/.test(
                  x
                ))
          );

        const data = packages
          .map((path) => ({
            path,
            ...JSON.parse(readFileSync(path).toString()),
          }))
          .filter((item) => item.name);

        let licenseData: License[] = await mapSeries(data, async (item) => ({
          ...(await findLicense(item, dirPath)),
          path: item.path,
          name: item.name,
          repository: get(item, "repository.url"),
          publisher: get(item, "author.name", item.author),
          email: get(item, "author.email"),
          version: item.version,
          rootProjectName: rootProjectName,
        }));

        licenseData = removeDuplicates(licenseData);

        // sort by name
        licenseData.sort((a, b) => a.name.localeCompare(b.name));

        resolve(licenseData);
      }
    );
  });

// remove duplicates based on common name, version and licenses array
export const removeDuplicates = (licenseData: License[]): License[] => {
  const result: License[] = [];
  licenseData.forEach((license) => {
    if (
      !result.some((l) => {
        let licensesMatch = false;

        if (Array.isArray(l.licenses) && Array.isArray(license.licenses)) {
          // if both licenses are arrays, check if all licenses in l.licenses
          // are included in license.licenses
          licensesMatch = l.licenses.every((x) => license.licenses.includes(x));
        } else if (
          !Array.isArray(l.licenses) &&
          !Array.isArray(license.licenses)
        ) {
          // if both licenses are not arrays, check if they are equal
          licensesMatch = l.licenses === license.licenses;
        } else {
          // if one of the licenses is an array and the other is not
          if (
            Array.isArray(l.licenses) &&
            l.licenses.length == 1 &&
            !Array.isArray(license.licenses)
          ) {
            // if l.licenses is an array with one element, check if license.licenses
            // is included in l.licenses
            licensesMatch = l.licenses.includes(license.licenses);
          } else if (
            !Array.isArray(l.licenses) &&
            Array.isArray(license.licenses) &&
            license.licenses.length == 1
          ) {
            // if license.licenses is an array with one element, check if l.licenses
            // is included in license.licenses
            licensesMatch = license.licenses.includes(l.licenses);
          }
        }

        // check if name, version and licenses match
        return (
          l.name === license.name &&
          l.version === license.version &&
          licensesMatch
        );
      })
    ) {
      result.push(license);
    }
  });

  return result;
};

export default findAllLicenses;
