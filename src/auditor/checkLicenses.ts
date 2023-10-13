import {
  Configuration,
  DependencyOutputter,
  MetadataOutputter,
} from "@jpfulton/license-auditor-common";
import { findAllDependencies } from "./findDependencies";
import { noDependencies, noPathSpecified } from "./messages";
import dependencyProcessorFactory from "./processDependencies";

const checkLicenses = async (
  configuration: Configuration,
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
    const dependencies = await findAllDependencies(projectPath);

    if (!dependencies || dependencies.length <= 0) {
      return console.error(noDependencies);
    }

    const process = dependencyProcessorFactory(
      configuration,
      infoOutputter,
      warnOutputter,
      errorOutputter
    );

    const result = process(dependencies);
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
