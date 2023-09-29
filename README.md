# node-license-auditor-cli

[![ci](https://github.com/jpfulton/node-license-auditor-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/jpfulton/node-license-auditor-cli/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/License-MIT-blue)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=jpfulton.node-license-auditor-cli)

A CLI designed to list and audit licenses in project dependencies in node projects. The CLI
can output both markdown reports and CSV files and is designed to run in CI workflows.

## Installation

You can install this tool globally, using the following yarn command:

```bash
yarn global add @jpfulton/node-license-auditor-cli
```

## Configuration

To override the default configuration, place a `.license-checker.json` file in the
root directory of your project with the following format:

```json
{
  "blackList": ["blacklisted-license"],
  "whiteList": ["whitelisted-license"]
}
```

Licenses in the blackList array will generate errors in the report. Licenses in the
whiteList array will generate information lines and licenses types that exist in neither
array generate warnings for further investigation. When a license for a dependency cannot
be identified it generates an error.

## Remote Configurations

Remote configurations can be used to override the default configuration. To use a remote
configuration, specify the URL to the configuration file using the `--remote-config` flag.

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
