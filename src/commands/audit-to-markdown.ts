import { readFileSync } from "fs";
import licenseAuditor from "../auditor/checkLicenses.js";

import blacklist from "../default-license-configurations/blacklist.js";
import whitelist from "../default-license-configurations/whitelist.js";
import { License } from "../models/license.js";

export function auditToMarkdown(pathToProject: string): void {
  const rootProject = JSON.parse(
    readFileSync(`${pathToProject}/package.json`).toString()
  );
  const rootProjectName = rootProject?.name ?? "UNKNOWN";

  console.log(`# Package Dependencies Audit Report: ${rootProjectName}`);
  console.log("");

  console.log(`> Generated at ${new Date().toUTCString()}`);
  console.log("");

  markdownTableHeader();

  licenseAuditor(
    whitelist,
    blacklist,
    pathToProject,
    warnMarkdown,
    errorMarkdown
  );

  console.log("");
}

const warnMarkdown = (licenseObj: License) => {
  markdown(":yellow_circle:", licenseObj);
};

const errorMarkdown = (licenseObj: License) => {
  markdown(":red_circle", licenseObj);
};

const markdown = (icon: string, licenseItem: License) => {
  console.log(
    `| ${icon} 
| ${licenseItem.name} 
| ${licenseItem.version} 
| ${licenseItem.licenses} 
| ${licenseItem.path} 
| ${licenseItem.licensePath} 
| ${licenseItem.repository} 
| ${licenseItem.publisher} 
| ${licenseItem.email ?? ""} |`.replaceAll("\n", "")
  );
};

const markdownTableHeader = () => {
  console.log(
    "|  | NAME | VERSION | LICENSE | MODULE PATH | LICENSE PATH | REPOSITORY | PUBLISHER | EMAIL |"
  );
  console.log("|---|---|---|---|---|---|---|---|---|");
};
