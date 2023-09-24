import blacklist from "../default-configuration/blacklist.js";
import whitelist from "../default-configuration/whitelist.js";
import { Configuration } from "../models/configuration.js";

const DEFAULT_CONFIG_FILE_NAME = ".license-checker.json";

const defaultConfiguration: Configuration = {
  whiteList: whitelist,
  blackList: blacklist,
};

// return a configuration object from a file
// if the file does not exist, return the default configuration
export default async function getConfiguration(
  configFileName: string = DEFAULT_CONFIG_FILE_NAME
): Promise<Configuration> {
  try {
    const configurationFile = await import(`../../${configFileName}`);
    return configurationFile.default;
  } catch (e) {
    return defaultConfiguration;
  }
}
