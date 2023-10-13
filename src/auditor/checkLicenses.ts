import {
  DependencyOutputter,
  MetadataOutputter,
} from "@jpfulton/license-auditor-common";
import { findAllLicenses } from "./licenseChecker";
import { noLicenses, noPathSpecified } from "./messages";
import dependencyProcessorFactory from "./processDependencies";

const checkLicenses = async (
  whitelistedLicenses: string[],
  blacklistedLicenses: string[],
  projectPath: string,
  metadataOutputter: MetadataOutputter,
  infoOutputter: DependencyOutputter,
  warnOutputter: DependencyOutputter,
  errorOutputter: DependencyOutputter
) => {
  if (!projectPath) {
    return console.error(noPathSpecified);
  }

  try {
    const licenses = await findAllLicenses(projectPath);

    if (!licenses || licenses.length <= 0) {
      return console.error(noLicenses);
    }

    const process = dependencyProcessorFactory(
      whitelistedLicenses,
      blacklistedLicenses,
      infoOutputter,
      warnOutputter,
      errorOutputter
    );

    const result = process(licenses);
    const {
      uniqueCount,
      whitelistedCount,
      warnCount,
      blacklistedCount,
      blackListOutputs,
      warnOutputs,
      whiteListOutputs,
    } = result;

    metadataOutputter(
      uniqueCount,
      whitelistedCount,
      warnCount,
      blacklistedCount
    );

    const outputs = [...blackListOutputs, ...warnOutputs, ...whiteListOutputs];
    outputs.forEach((output) => console.log(output));
  } catch (err) {
    console.error((err as Error).message);
  }
};

export default checkLicenses;
