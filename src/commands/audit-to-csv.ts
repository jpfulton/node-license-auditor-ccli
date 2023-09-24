import licenseAuditor from "../auditor/checkLicenses.js";
import blacklist from "../default-license-configurations/blacklist.js";
import whitelist from "../default-license-configurations/whitelist.js";
import { License } from "../models/license.js";
import {
  getCurrentVersionString,
  getRootProjectName,
} from "../util/root-project.js";

export function auditToCsv(
  pathToProject: string,
  options: { writeHeaders: boolean; writeData: boolean }
): void {
  if (options.writeHeaders && options.writeData) {
    const rootProjectName = getRootProjectName(pathToProject);

    console.log(`Package Dependencies Audit Report: ${rootProjectName}`);
    console.log("");
  }

  if (options.writeHeaders) {
    const version = getCurrentVersionString();

    console.log(`Generated at ${new Date().toUTCString()}`);
    console.log(
      `Generated using version ${version} of node-license-auditor-cli`
    );
    console.log("");

    console.log(
      `Project Name,Audit Status,Package Name,Package Version,Package License,Package Publisher,Package Publisher Email,Package Repository,Package Module Path,Package License Path`
    );
  }

  licenseAuditor(
    whitelist,
    blacklist,
    pathToProject,
    metadataCsv,
    infoCsv,
    warnCsv,
    errorCsv
  );
}

const metadataCsv = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _uniqueCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _whitelistedCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _warnCount: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _blacklistedCount: number
  // eslint-disable-next-line @typescript-eslint/no-empty-function
) => {};

const infoCsv = (licenseObj: License) => {
  return csv("OK", licenseObj);
};

const warnCsv = (licenseObj: License) => {
  return csv("WARN", licenseObj);
};

const errorCsv = (licenseObj: License) => {
  return csv("ERROR", licenseObj);
};

function csv(status: string, licenseObj: License) {
  return `"${licenseObj.rootProjectName}",
"${status}",
"${licenseObj.name}",
"${licenseObj.version}",
"${licenseObj.licenses}",
"${licenseObj.publisher ?? ""}",
"${licenseObj.email ?? ""}",
"${licenseObj.repository ?? ""}",
"${licenseObj.path}",
"${licenseObj.licensePath}"`.replace(/\n/g, ""); // remove newlines
}
