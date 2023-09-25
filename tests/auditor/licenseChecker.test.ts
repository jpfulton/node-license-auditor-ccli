import {
  findDirPath,
  findFile,
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
