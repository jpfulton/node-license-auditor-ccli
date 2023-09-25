import {
  findDirPath,
  findFile,
  findLicense,
  removeDuplicates,
} from "../../src/auditor/licenseChecker";
import { License } from "../../src/models/license";

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
    expect(result).toBe("LICENSE-test.txt");
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
    expect(result).toBe("README");
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

    expect(result.licenses).toBe("MIT");
  });

  it("should return the license of a package from package.json using the license field as an array", async () => {
    const item = {
      license: ["MIT"],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result.licenses).toStrictEqual(["MIT"]);
  });

  it("should return the license of a package from package.json using the licenses field as an array with multiple values", async () => {
    const item = {
      licenses: ["MIT", "Apache-2.0"],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result.licenses).toStrictEqual(["MIT", "Apache-2.0"]);
  });

  it("should return the license of a package from package.json using the license field as an object", async () => {
    const item = {
      license: { type: "MIT" },
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result.licenses).toBe("MIT");
  });

  it("should return the license of a package from package.json using the licenses field as an object", async () => {
    const item = {
      licenses: { type: "MIT" },
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result.licenses).toBe("MIT");
  });

  it("should return the license of a package from package.json using the licenses field as an array with a single value", async () => {
    const item = {
      licenses: [{ type: "MIT" }],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result.licenses).toStrictEqual(["MIT"]);
  });

  it("should return the license of a package from package.json using the licenses field as an array with multiple values", async () => {
    const item = {
      licenses: [{ type: "MIT" }, { type: "Apache-2.0" }],
      path: "test",
    };

    const result = await findLicense(item, `${process.cwd()}/tests/auditor`);

    expect(result.licenses).toStrictEqual(["MIT", "Apache-2.0"]);
  });

  it("should return the license of a package from a license file in the root of the package", async () => {
    const item = {
      path: "package.json",
    };

    const result = await findLicense(
      item,
      `${process.cwd()}/tests/auditor/package-with-only-license-file`
    );

    expect(result.licenses).toBe("MIT");
  });

  it("should return the license of a package from a readme file in the root of the package", async () => {
    const item = {
      path: "package.json",
    };

    const result = await findLicense(
      item,
      `${process.cwd()}/tests/auditor/package-with-only-readme-file`
    );

    expect(result.licenses).toBe("MIT");
  });
});

// removeDuplicates should remove duplicate licenses based on common name,
// version and licenses array
describe("removeDuplicates", () => {
  // test based on licenses property when used a string
  it("should remove duplicate licenses based on common name, version and licenses property when licenses properties are both strings", () => {
    const licenseData: License[] = [
      {
        name: "test",
        version: "1.0.0",
        licenses: "MIT",
        path: "test",
        licensePath: "test",
        repository: "test",
        publisher: "test",
        email: "test",
        rootProjectName: "test",
      },
      {
        name: "test",
        version: "1.0.0",
        licenses: "MIT",
        path: "test-2",
        licensePath: "test-2",
        repository: "test-2",
        publisher: "test-2",
        email: "test-2",
        rootProjectName: "test",
      },
    ];

    const result = removeDuplicates(licenseData);

    expect(result.length).toBe(1);
  });

  // test based on licenses property when used an array
  it("should remove duplicate licenses based on common name, version and licenses array", () => {
    const licenseData: License[] = [
      {
        name: "test",
        version: "1.0.0",
        licenses: ["MIT"],
        path: "test",
        licensePath: "test",
        repository: "test",
        publisher: "test",
        email: "test",
        rootProjectName: "test",
      },
      {
        name: "test",
        version: "1.0.0",
        licenses: ["MIT"],
        path: "test-2",
        licensePath: "test-2",
        repository: "test-2",
        publisher: "test-2",
        email: "test-2",
        rootProjectName: "test",
      },
    ];

    const result = removeDuplicates(licenseData);

    expect(result.length).toBe(1);
  });

  // test based on licenses property when used an array with different values
  it("should remove duplicate licenses based on common name, version and licenses arrays have different values", () => {
    const licenseData: License[] = [
      {
        name: "test",
        version: "1.0.0",
        licenses: ["MIT", "Apache-2.0"],
        path: "test",
        licensePath: "test",
        repository: "test",
        publisher: "test",
        email: "test",
        rootProjectName: "test",
      },
      {
        name: "test",
        version: "1.0.0",
        licenses: ["MIT"],
        path: "test-2",
        licensePath: "test-2",
        repository: "test-2",
        publisher: "test-2",
        email: "test-2",
        rootProjectName: "test",
      },
    ];

    const result = removeDuplicates(licenseData);

    expect(result.length).toBe(2);
  });

  // test based on licenses property when some objects have a string and others an array
  it("should remove duplicate licenses based on common name, version and licenses property when some are strings and others are arrays", () => {
    const licenseData: License[] = [
      {
        name: "test",
        version: "1.0.0",
        licenses: "MIT",
        path: "test",
        licensePath: "test",
        repository: "test",
        publisher: "test",
        email: "test",
        rootProjectName: "test",
      },
      {
        name: "test",
        version: "1.0.0",
        licenses: ["MIT"],
        path: "test-2",
        licensePath: "test-2",
        repository: "test-2",
        publisher: "test-2",
        email: "test-2",
        rootProjectName: "test",
      },
    ];

    const result = removeDuplicates(licenseData);

    expect(result.length).toBe(1);
  });

  // test based on licenses property when some objects have a string and others an array with different values
  it("should remove duplicate licenses based on common name, version and licenses property when some are arrays and others are strings", () => {
    const licenseData: License[] = [
      {
        name: "test",
        version: "1.0.0",
        licenses: "MIT",
        path: "test",
        licensePath: "test",
        repository: "test",
        publisher: "test",
        email: "test",
        rootProjectName: "test",
      },
      {
        name: "test",
        version: "1.0.0",
        licenses: ["MIT", "Apache-2.0"],
        path: "test-2",
        licensePath: "test-2",
        repository: "test-2",
        publisher: "test-2",
        email: "test-2",
        rootProjectName: "test",
      },
    ];

    const result = removeDuplicates(licenseData);

    expect(result.length).toBe(2);
  });
});
