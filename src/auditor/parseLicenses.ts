import { License } from "../models/license.js";
// import messages from "./messages.js";

const parseLicenses =
  (
    whitelistedLicenses: string[],
    blacklistedLicenses: string[],
    infoOutputter: (license: License) => void,
    warnOutputter: (license: License) => void,
    errorOutputter: (license: License) => void
  ) =>
  (licenses: License[]) => {
    licenses.forEach((licenseObj) => {
      // const whitelistedLicenseForModule = whitelistedModules[licenseObj.name];
      // if (whitelistedLicenseForModule === 'any') {
      //  return;
      // }

      // const whitelistedLicensesForModule = Array.isArray(whitelistedLicenseForModule)
      //   ? whitelistedLicenseForModule
      //  : [whitelistedLicenseForModule];
      const whitelistedLicensesForModule: string[] = [];

      const isWhitelisted = Array.isArray(licenseObj.licenses)
        ? licenseObj.licenses.every((license) =>
            [...whitelistedLicenses, ...whitelistedLicensesForModule].includes(
              license
            )
          )
        : [...whitelistedLicenses, ...whitelistedLicensesForModule].includes(
            licenseObj.licenses
          );

      if (isWhitelisted) {
        return infoOutputter(licenseObj);
      }

      const isBlacklisted = Array.isArray(licenseObj.licenses)
        ? licenseObj.licenses.some((license) =>
            blacklistedLicenses.includes(license)
          )
        : blacklistedLicenses.includes(licenseObj.licenses);

      if (!isWhitelisted && !isBlacklisted) {
        return warnOutputter(licenseObj);
      }

      if (isBlacklisted) {
        return errorOutputter(licenseObj);
      }
    });
  };

export default parseLicenses;
