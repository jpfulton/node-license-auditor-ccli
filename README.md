# node-license-auditor-cli

[![ci](https://github.com/jpfulton/node-license-auditor-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/jpfulton/node-license-auditor-cli/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40jpfulton%2Fnode-license-auditor-cli.svg)](https://www.npmjs.com/package/@jpfulton/node-license-auditor-cli)
![License](https://img.shields.io/badge/License-MIT-blue)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=jpfulton.node-license-auditor-cli)

A CLI designed to list and audit licenses in project dependencies in node projects. The CLI
can output both markdown reports and CSV files and is designed to run in CI workflows.
Included in the package is a [DangerJS](https://danger.systems/js) plugin that can be
used to audit licenses in the PR process.

## Installation of the CLI

You can install this tool globally, using the following yarn command:

```bash
yarn global add @jpfulton/node-license-auditor-cli
```

## Local Configuration

To override the default configuration, which is extremely minimal, place a `.license-checker.json` file in the
root directory of your project with the following format:

```json
{
  "blackList": ["blacklisted-license"],
  "whiteList": ["whitelisted-license"]
}
```

Licenses in the blackList array will generate errors in the report. Licenses in the
whiteList array will generate information lines and licenses types that exist in neither
array generate warnings for further investigation.

### License Identification Algorithm

The license identification algorithm uses a series of sources to identify the license type
for each dependency. The algorithm uses the following sources in order:

1. The `license` field in the dependency's `package.json` file
2. The `licenses` field in the dependency's `package.json` file
3. A LICENSE file (or variation of that filename) in the dependency's root directory
4. A README file (or variation of that filename) in the dependency's root directory

Parsing of the `package.json` `license` and `licenses` fields respects the
various formats in which those fields can be specified. For example, the `license` field
can be specified as a string, an array of strings, or an object with a `type` field. Similarly,
the `licenses` field can be specified as an array of strings or an array of objects with a
`type` field. For more information on the `license` and `licenses` fields, see the
[package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#license) documentation.

If the license type cannot be identified using the above sources, the license type will be
listed as `UNKNOWN`. The mechanism for identifying the license type is most accurate when
the `license` or `licenses` field is present in the `package.json` file. Parsing of the
LICENSE and README files is done using regular expressions and is not guaranteed to be
as reliable as the `package.json` file.

For an understanding of the file name variations that are supported for LICENSE and README
files, see the [constants.ts](./src/util/constants.ts) file.

### Licenses that cannot be identified

When a license for a dependency cannot
be identified by the project, the license will be listed as `UNKNOWN`. It is useful to
blacklist `UNKNOWN` licenses to ensure that all licenses are identified through a manual process.
In some cases, `UNKOWN` licenses indicate that the project has no license and _may_ be
in the public domain. In other cases, `UNKNOWN` licenses indicate that the license simply could
not be identified by the tool. In either case, it is useful to investigate the license and
be selective about which dependencies are used in the project.

## Remote Configurations

Remote configurations can be used to override the default configuration. To use a remote
configuration, specify the URL to the configuration file using the `--remote-config` flag.
Remote configurations are useful when applying the same configuration to multiple projects
to avoid the need to copy the configuration file to each project and maintain the configurations
in multiple places.

```bash
node-license-auditor-cli csv --remote-config https://raw.githubusercontent.com/jpfulton/node-license-auditor-cli/main/.license-checker.json . > report.csv
```

```bash
node-license-auditor-cli markdown --remote-config https://raw.githubusercontent.com/jpfulton/node-license-auditor-cli/main/.license-checker.json . > report.md
```

## Usage as a DangerJS Plugin

This project can be used as a [DangerJS](https://danger.systems/js/) plugin. To use the
plugin, install the plugin using the following command:

```bash
yarn add -D danger @jpfulton/node-license-auditor-cli
```

Then, add the following to your `dangerfile.ts`:

```typescript
import { licenseAuditor } from "@jpfulton/node-license-auditor-cli";

export default async () => {
  // Run the license auditor plugin
  await licenseAuditor({
    // optionally choose to fail the build if a blacklisted license is found
    failOnBlacklistedLicense: false,
    // specify the path to the project's package.json file, useful in a monorepo
    // defaults to the current working directory
    projectPath: ".",
    // optionally specify a remote configuration file
    // useful when applying the same configuration to multiple projects
    // defaults to usage of a local configuration file found at the root of the project repo
    remoteConfigurationUrl:
      "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json",
    // show a summary of the license audit in the PR comment
    // includes the number of unique dependencies and counts for each category of license found
    showMarkdownSummary: true,
    // show details of the license audit in the PR comment
    // includes a table with the name, version and license of each dependency
    // that was discovered that was not explicitly whitelisted in the configuration
    showMarkdownDetails: true,
  });
};
```
