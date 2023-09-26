declare const fail: (message: string) => void;
declare const warn: (message: string) => void;
declare const markdown: (message: string) => void;

import findAllLicenses from "../auditor/licenseChecker";
import { noLicenses } from "../auditor/messages.js";
import parseLicensesFactory from "../auditor/parseLicenses.js";
import { License } from "../models/license.js";
import getConfiguration from "../util/configuration.js";
import { LicenseOutputter } from "../util/outputters";

export interface IPluginConfig {
  failOnBlacklistedLicense: boolean;
  projectPath: string;
  showMarkdownSummary: boolean;
}

export const licenseAuditor = async (
  config: Partial<IPluginConfig> = {}
): Promise<void> => {
  const {
    failOnBlacklistedLicense = false,
    projectPath = ".",
    showMarkdownSummary = true,
  } = config;

  try {
    const auditorConfig = await getConfiguration();
    const licenses = await findAllLicenses(projectPath);

    if (!licenses || licenses.length <= 0) {
      return warn(noLicenses);
    }

    const parse = parseLicensesFactory(
      auditorConfig.whiteList,
      auditorConfig.blackList,
      emptyOutputter,
      emptyOutputter,
      emptyOutputter
    );

    const result = parse(licenses);
    const { uniqueCount, whitelistedCount, warnCount, blacklistedCount } =
      result;

    if (showMarkdownSummary) {
      metadataOutputter(
        uniqueCount,
        whitelistedCount,
        warnCount,
        blacklistedCount
      );
    }

    if (warnCount > 0) {
      warn(
        `Found ${warnCount} licenses that we neither whitelisted nor blacklisted by the configuration.`
      );
    }

    if (failOnBlacklistedLicense && blacklistedCount > 0) {
      fail(`Found ${blacklistedCount} blacklisted licenses.`);
    } else if (blacklistedCount > 0) {
      warn(`Found ${blacklistedCount} blacklisted licenses.`);
    }
  } catch (err) {
    console.error(err);
    fail(
      `[node-license-auditor] Failed to audit licenses with error: ${
        (err as Error).message
      }`
    );
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emptyOutputter: LicenseOutputter = (_license: License) => {
  return "";
};

const metadataOutputter = (
  uniqueCount: number,
  whitelistedCount: number,
  warnCount: number,
  blacklistedCount: number
) => {
  markdown(
    `| :hash: Unique Licenses | :green_circle: Whitelisted Licenses | :yellow_circle: Warned Licenses | :red_circle: Blacklisted Licenses |`
  );
  markdown(`|---|---|---|---|`);
  markdown(
    `| ${uniqueCount} | ${whitelistedCount} | ${warnCount} | ${blacklistedCount} |`
  );
};

export default licenseAuditor;
