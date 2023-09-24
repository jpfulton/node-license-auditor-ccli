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
