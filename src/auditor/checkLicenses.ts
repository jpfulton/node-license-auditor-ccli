import { License } from "../models/license.js";
import { findAllLicenses } from "./license-checker/licenseChecker.js";
import { noLicenses, noPathSpecified } from "./messages.js";
import parseLicensesFactory from "./parseLicenses.js";

const checkLicenses = async (
  whitelistedLicenses: string[],
  blacklistedLicenses: string[],
  // whitelistedModules = {},
  projectPath: string,
  warnOutputter: (license: License) => void,
  errorOutputter: (license: License) => void
) => {
  if (!projectPath) {
    return console.error(noPathSpecified);
  }

  try {
    const licenses = await findAllLicenses(projectPath);

    if (!licenses || licenses.length <= 0) {
      return console.error(noLicenses);
    }

    const parse = parseLicensesFactory(
      whitelistedLicenses,
      blacklistedLicenses,
      warnOutputter,
      errorOutputter
    );

    parse(licenses);
  } catch (err) {
    console.error((err as Error).message);
  }
};

export default checkLicenses;
