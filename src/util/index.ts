import getConfiguration from "./configuration.js";
import {
  licenseFiles,
  licenseMap,
  readmeFiles,
  templates,
} from "./constants.js";
import { LicenseOutputter, MetadataOutputter } from "./outputters.js";
import { getCurrentVersionString, getRootProjectName } from "./root-project.js";

export type { LicenseOutputter, MetadataOutputter };

export {
  getConfiguration,
  getCurrentVersionString,
  getRootProjectName,
  licenseFiles,
  licenseMap,
  readmeFiles,
  templates,
};
