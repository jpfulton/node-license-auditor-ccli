import { readFileSync } from "fs";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates: Record<string, string> = {
  [readFileSync(`${__dirname}/templates/BSD-2-Clause.txt`).toString()]:
    "BSD 2-Clause",
  [readFileSync(`${__dirname}/templates/MIT.txt`).toString()]: "MIT",
};

const licenseMap: Record<string, string> = {
  "(The MIT License)": "MIT",
  "Apache License": "Apache",
  "ISC License": "MIT",
  "MIT License": "MIT",
  "The ISC License": "ISC",
  "The MIT License (MIT)": "MIT",
  "The MIT License (MIT)^M": "MIT",
  "The MIT License": "MIT",
  "This software is released under the MIT license:": "MIT",
};

const licenseFiles = [
  "LICENSE",
  "LICENCE",
  "LICENSE.md",
  "LICENCE.md",
  "LICENSE.txt",
  "LICENSE-MIT",
  "LICENSE.BSD",
];

const readmeFiles = ["README", "README.md", "README.markdown"];

export default {
  templates,
  licenseMap,
  licenseFiles,
  readmeFiles,
};
