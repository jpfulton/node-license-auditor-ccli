import { License } from "../models";
import { LicenseOutputter } from "../util";

const parseLicenses =
  (
    whitelistedLicenses: string[],
    blacklistedLicenses: string[],
    infoOutputter: LicenseOutputter,
    warnOutputter: LicenseOutputter,
    errorOutputter: LicenseOutputter
  ) =>
  (
    licenses: License[]
  ): {
    uniqueCount: number;
    whitelistedCount: number;
    warnCount: number;
    blacklistedCount: number;
    allOutputs: string[];
    whiteListOutputs: string[];
    warnOutputs: string[];
    blackListOutputs: string[];
  } => {
    let whitelistedCount = 0;
    let warnCount = 0;
    let blacklistedCount = 0;

    const allOutputs: string[] = [];
    const whiteListOutputs: string[] = [];
    const warnOutputs: string[] = [];
    const blackListOutputs: string[] = [];

    licenses.forEach((licenseObj) => {
      const isWhitelisted = Array.isArray(licenseObj.licenses)
        ? licenseObj.licenses.every((license) =>
            whitelistedLicenses.includes(license)
          )
        : whitelistedLicenses.includes(licenseObj.licenses);

      if (isWhitelisted) {
        whitelistedCount++;
        const result = infoOutputter(licenseObj);
        if (result !== "") {
          allOutputs.push(result);
          whiteListOutputs.push(result);
        }
      }

      const isBlacklisted = Array.isArray(licenseObj.licenses)
        ? licenseObj.licenses.some((license) =>
            blacklistedLicenses.includes(license)
          )
        : blacklistedLicenses.includes(licenseObj.licenses);

      if (!isWhitelisted && !isBlacklisted) {
        warnCount++;
        const result = warnOutputter(licenseObj);
        if (result !== "") {
          allOutputs.push(result);
          warnOutputs.push(result);
        }
      }

      if (isBlacklisted) {
        blacklistedCount++;
        const result = errorOutputter(licenseObj);
        if (result !== "") {
          allOutputs.push(result);
          blackListOutputs.push(result);
        }
      }
    });

    return {
      uniqueCount: licenses.length,
      whitelistedCount: whitelistedCount,
      warnCount: warnCount,
      blacklistedCount: blacklistedCount,
      allOutputs: allOutputs,
      whiteListOutputs: whiteListOutputs,
      warnOutputs: warnOutputs,
      blackListOutputs: blackListOutputs,
    };
  };

export default parseLicenses;
