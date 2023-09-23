import { License } from "../models/license";

export type LicenseOutputter = (license: License) => string;
export type MetadataOutputter = (
  uniqueCount: number,
  whitelistedCount: number,
  warnCount: number,
  blacklistedCount: number
) => void;
