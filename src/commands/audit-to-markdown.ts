import licenseAuditor from "../auditor/checkLicenses.js";

import blacklist from "../default-license-configurations/blacklist.js";
import whitelist from "../default-license-configurations/whitelist.js";
import { License } from "../models/license.js";
import {
  getCurrentVersionString,
  getRootProjectName,
} from "../util/root-project.js";

export function auditToMarkdown(pathToProject: string): void {
  const rootProjectName = getRootProjectName(pathToProject);
  const version = getCurrentVersionString();

  console.log(`# Package Dependencies Audit Report: ${rootProjectName}`);
  console.log("");

  console.log(`> Generated at ${new Date().toUTCString()} <br />`);
  console.log(
    `> Generated using version ${version} of node-license-auditor-cli.`
  );
  console.log("");

  markdownTableHeader();

  licenseAuditor(
    whitelist,
    blacklist,
    pathToProject,
    infoMarkdown,
    warnMarkdown,
    errorMarkdown
  ).then(() => console.log(""));
}

const infoMarkdown = (licenseObj: License) => {
  markdown(":green_circle:", licenseObj);
};

const warnMarkdown = (licenseObj: License) => {
  markdown(":yellow_circle:", licenseObj);
};

const errorMarkdown = (licenseObj: License) => {
  markdown(":red_circle:", licenseObj);
};

const markdown = (icon: string, licenseItem: License) => {
  console.log(
    `| ${icon} 
| ${licenseItem.name} 
| ${licenseItem.version} 
| ${licenseItem.licenses} 
| ${licenseItem.publisher ?? ""} 
| ${licenseItem.email ?? ""} 
| ${licenseItem.repository ?? ""} 
| ${licenseItem.path} 
| ${licenseItem.licensePath} |`.replaceAll("\n", "")
  );
};

const markdownTableHeader = () => {
  console.log(
    "|  | NAME | VERSION | LICENSE | PUBLISHER | EMAIL | REPOSITORY | MODULE PATH | LICENSE PATH |"
  );
  console.log("|---|---|---|---|---|---|---|---|---|");
};
