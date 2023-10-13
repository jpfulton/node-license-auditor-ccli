import {
  Configuration,
  Dependency,
  DependencyOutputter,
  mapLicenseByGroupings,
} from "@jpfulton/license-auditor-common";

/**
 * Factory function that returns a function to process an array of dependencies
 * and outputs information about them.
 * @param whitelistedLicenses - An array of licenses to whitelist.
 * @param blacklistedLicenses - An array of licenses to blacklist.
 * @param infoOutputter - A function that outputs information about a dependency.
 * @param warnOutputter - A function that outputs a warning about a dependency.
 * @param errorOutputter - A function that outputs an error about a dependency.
 * @returns A function that takes an array of dependencies and returns an object with information about the processed dependencies.
 */
const dependencyProcessorFactory =
  (
    configuration: Configuration,
    infoOutputter: DependencyOutputter,
    warnOutputter: DependencyOutputter,
    errorOutputter: DependencyOutputter
  ) =>
  (
    dependencies: Dependency[]
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
    const whitelistedLicenses = configuration.whiteList;
    const blacklistedLicenses = configuration.blackList;

    let whitelistedCount = 0;
    let warnCount = 0;
    let blacklistedCount = 0;

    const allOutputs: string[] = [];
    const whiteListOutputs: string[] = [];
    const warnOutputs: string[] = [];
    const blackListOutputs: string[] = [];

    dependencies.forEach((dependency) => {
      // test for whitelisted licenses
      // a white listed license is one whose license property is in the whitelist
      const isWhitelisted = dependency.licenses.some((depLicense) =>
        whitelistedLicenses.includes(
          mapLicenseByGroupings(configuration, depLicense.license)
        )
      );

      if (isWhitelisted) {
        whitelistedCount++;
        const result = infoOutputter(dependency);
        if (result !== "") {
          allOutputs.push(result);
          whiteListOutputs.push(result);
        }
      }

      // a dependency is blacklisted if it has a license that is in the blacklist
      // and does not include a license that is in the whitelist
      const isBlacklisted =
        dependency.licenses.some((depLicense) =>
          blacklistedLicenses.includes(
            mapLicenseByGroupings(configuration, depLicense.license)
          )
        ) && !isWhitelisted;

      if (!isWhitelisted && !isBlacklisted) {
        warnCount++;
        const result = warnOutputter(dependency);
        if (result !== "") {
          allOutputs.push(result);
          warnOutputs.push(result);
        }
      }

      if (isBlacklisted) {
        blacklistedCount++;
        const result = errorOutputter(dependency);
        if (result !== "") {
          allOutputs.push(result);
          blackListOutputs.push(result);
        }
      }
    });

    return {
      uniqueCount: dependencies.length,
      whitelistedCount: whitelistedCount,
      warnCount: warnCount,
      blacklistedCount: blacklistedCount,
      allOutputs: allOutputs,
      whiteListOutputs: whiteListOutputs,
      warnOutputs: warnOutputs,
      blackListOutputs: blackListOutputs,
    };
  };

export default dependencyProcessorFactory;
