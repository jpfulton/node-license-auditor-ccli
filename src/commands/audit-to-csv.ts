import { checkLicenses } from "../auditor";
import { License } from "../models";
import {
  getConfiguration,
  getConfigurationFromUrl,
} from "../util/configuration.js";

export async function auditToCsv(
  pathToProject: string,
  options: { headers: boolean; data: boolean; remote: string }
): Promise<void> {
  const configuration = options.remote
    ? await getConfigurationFromUrl(options.remote)
    : await getConfiguration();

  if (options.headers) {
    console.log(
      `Project Name,Audit Status,Package Name,Package Version,Package License,Package Publisher,Package Publisher Email,Package Repository,Package Module Path,Package License Path`
    );
  }

  if (options.data) {
    checkLicenses(
      configuration.whiteList,
      configuration.blackList,
      pathToProject,
      metadataCsv,
      infoCsv,
      warnCsv,
      errorCsv
    );
  }
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
