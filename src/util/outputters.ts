import { Dependency } from "@jpfulton/license-auditor-common";

export type LicenseOutputter = (license: Dependency) => string;
export type MetadataOutputter = (
  uniqueCount: number,
  whitelistedCount: number,
  warnCount: number,
  blacklistedCount: number
) => void;
