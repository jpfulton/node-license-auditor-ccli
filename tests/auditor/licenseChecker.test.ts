import {
  findDirPath,
  findFile,
  findLicense,
  splitAndFilterPackages,
} from "../../src/auditor/licenseChecker";

// findDirPath should return the path of the current working directory
describe("findDirPath", () => {
  it("should return the path of the current working directory", async () => {
    const result = await findDirPath();
    expect(result).toBe(process.cwd());
  });
});

// findFile should return the path of a file given a filename and a directory path
describe("findFile", () => {
  it("should return the path of a file given a filename and a directory path", async () => {
    const result = await findFile(
      "LICENSE-test.txt",
      `${process.cwd()}/tests/auditor`
    );
    expect(result).toBe(`${process.cwd()}/tests/auditor/LICENSE-test.txt`);
  });

  it("should return an empty string if the file does not exist", async () => {
    const result = await findFile(
      "LICENSE-test-2.txt",
      `${process.cwd()}/tests/auditor`
    );
    expect(result).toBe("");
  });

  it("should return the path of a readme file given a filename and a directory path", async () => {
    const result = await findFile(
      "README",
      `${process.cwd()}/tests/auditor/package-with-only-readme-file`
    );
    expect(result).toBe(
      `${process.cwd()}/tests/auditor/package-with-only-readme-file/README`
    );
  });
});

// findLicense should return the license of a package given the parsed content of its package.json file
// or the contents of either a license file or a readme file if license data cannot be
// found in the package.json file
describe("findLicense", () => {
  it("should return the license of a package from package.json using the license field as a string", async () => {
    const item = {
      license: "MIT",
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result[0].license).toBe("MIT");
  });

  it("should return the license of a package from package.json using the license field as an array", async () => {
    const item = {
      license: ["MIT"],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result[0].license).toStrictEqual("MIT");
  });

  it("should return the license of a package from package.json using the licenses field as an array with multiple values", async () => {
    const item = {
      licenses: ["MIT", "Apache-2.0"],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result).toStrictEqual([
      { license: "MIT", path: "test" },
      { license: "Apache-2.0", path: "test" },
    ]);
  });

  it("should return the license of a package from package.json using the license field as an object", async () => {
    const item = {
      license: { type: "MIT" },
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result[0].license).toBe("MIT");
  });

  it("should return the license of a package from package.json using the licenses field as an object", async () => {
    const item = {
      licenses: { type: "MIT" },
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result[0].license).toBe("MIT");
  });

  it("should return the license of a package from package.json using the licenses field as an array with a single value", async () => {
    const item = {
      licenses: [{ type: "MIT" }],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result[0].license).toStrictEqual("MIT");
  });

  it("should return the license of a package from package.json using the licenses field as an array with multiple values", async () => {
    const item = {
      licenses: [{ type: "MIT" }, { type: "Apache-2.0" }],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result).toStrictEqual([
      { license: "MIT", path: "test" },
      { license: "Apache-2.0", path: "test" },
    ]);
  });

  it("should return the license of a package from a license file in the root of the package", async () => {
    const item = {
      path: "package.json",
    };

    const result = await findLicense(
      item,
      `${process.cwd()}/tests/auditor/package-with-only-license-file`
    );

    expect(result[0].license).toBe("MIT");
  });

  it("should return the license of a package from a readme file in the root of the package", async () => {
    const item = {
      path: "package.json",
    };

    const result = await findLicense(
      item,
      `${process.cwd()}/tests/auditor/package-with-only-readme-file`
    );

    expect(result[0].license).toBe("MIT");
  });
});

// splitAndFilterPackages should split the packages into an array of packages
// and remove any empty lines
// and filter out paths with "test" to eliminate test fixtures
// and filter out paths that do not include node_modules/PACKAGE_NAME/package.json or
// node_modules/@SCOPE/PACKAGE_NAME/package.json
describe("splitAndFilterPackages", () => {
  it("should split the packages into an array of packages", () => {
    const stdout = `node_modules/@types/node/package.json
node_modules/@types/node/LICENSE
node_modules/@types/node/README.md
node_modules/sample/package.json
node_modules/sample/LICENSE
node_modules/sample/README.md
node_modules/sample/node_modules/@types/node/package.json
node_modules/sample/node_modules/@types/node/LICENSE
node_modules/sample/node_modules/@types/node/README.md
node_modules/sample/node_modules/test/package.json
node_modules/sample/node_modules/test/LICENSE
node_modules/sample/node_modules/test/README.md`;

    const result = splitAndFilterPackages(stdout);

    expect(result.length).toBe(3);
  });
});
