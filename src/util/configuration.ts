import { readFile } from "fs/promises";
import blacklist from "../default-configuration/blacklist.js";
import whitelist from "../default-configuration/whitelist.js";
import { Configuration } from "../models/configuration.js";

const DEFAULT_CONFIG_FILE_NAME = ".license-checker.json";

const defaultConfiguration: Configuration = {
  whiteList: whitelist,
  blackList: blacklist,
  configurationSource: "default",
};

// return a configuration object from a file
// if the file does not exist, return the default configuration
export default async function getConfiguration(
  configFileName: string = DEFAULT_CONFIG_FILE_NAME
): Promise<Configuration> {
  try {
    // read the configuration JSON file into a Configuration object
    // pull the file from the current working directory with the file name
    // provided by the configFileName parameter
    const configuration = JSON.parse(
      await readFile(`${process.cwd()}/${configFileName}`, "utf8")
    ) as Configuration;
    configuration.configurationSource = "file";

    return configuration;
  } catch (e) {
    return defaultConfiguration;
  }
}
