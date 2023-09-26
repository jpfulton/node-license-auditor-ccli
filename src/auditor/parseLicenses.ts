import { License } from "../models/license.js";
import { LicenseOutputter } from "../util/outputters.js";

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
    outputs: string[];
  } => {
    let whitelistedCount = 0;
    let warnCount = 0;
    let blacklistedCount = 0;

    const outputs: string[] = [];

    licenses.forEach((licenseObj) => {
      const isWhitelisted = Array.isArray(licenseObj.licenses)
        ? licenseObj.licenses.every((license) =>
            whitelistedLicenses.includes(license)
          )
        : whitelistedLicenses.includes(licenseObj.licenses);

      if (isWhitelisted) {
        whitelistedCount++;
        const result = infoOutputter(licenseObj);
        if (result !== "") outputs.push(result);
      }

      const isBlacklisted = Array.isArray(licenseObj.licenses)
        ? licenseObj.licenses.some((license) =>
            blacklistedLicenses.includes(license)
          )
        : blacklistedLicenses.includes(licenseObj.licenses);

      if (!isWhitelisted && !isBlacklisted) {
        warnCount++;
        const result = warnOutputter(licenseObj);
        if (result !== "") outputs.push(result);
      }

      if (isBlacklisted) {
        blacklistedCount++;
        const result = errorOutputter(licenseObj);
        if (result !== "") outputs.push(result);
      }
    });

    return {
      uniqueCount: licenses.length,
      whitelistedCount: whitelistedCount,
      warnCount: warnCount,
      blacklistedCount: blacklistedCount,
      outputs: outputs,
    };
  };

export default parseLicenses;
