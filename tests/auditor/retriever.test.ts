import Retriever from "../../src/auditor/retriever.js";
import constants from "../../src/util/constants.js";

const { templates, licenseMap } = constants;

// retrieveLicenseFromLicenseFile should return the license from the content of a license file
describe("retrieveLicenseFromLicenseFile", () => {
  it("should return the license from the content of a license file", () => {
    const result = Retriever(
      licenseMap,
      templates
    ).retrieveLicenseFromLicenseFile(
      `${process.cwd()}/tests/auditor/package-with-only-license-file/LICENSE`
    );

    expect(result).toBe("MIT");
  });

  it("should return an empty string if the file does not exist", () => {
    const result = Retriever(
      licenseMap,
      templates
    ).retrieveLicenseFromLicenseFile(
      `${process.cwd()}/tests/auditor/package-with-only-license-file/LICENSE-does-not-exist`
    );

    expect(result).toBe("");
  });

  it("should return the license from the content of a license file in the current working directory", () => {
    const cwd = process.cwd();
    process.chdir(`${cwd}/tests/auditor/package-with-only-license-file`);

    const result = Retriever(
      licenseMap,
      templates
    ).retrieveLicenseFromLicenseFile("LICENSE");

    process.chdir(cwd);

    expect(result).toBe("MIT");
  });
});

// retrieveLicenseFromLicenseFileContent should return the license from the content of a license file
describe("retrieveLicenseFromLicenseFileContent", () => {
  it("should return the license from the content of a license file", () => {
    const content = `MIT License

    This is the content of the license file.`;

    const result = Retriever(
      licenseMap,
      templates
    ).retrieveLicenseFromLicenseFileContent(content);

    expect(result).toBe("MIT");
  });

  it("should return the license from the content of a license file where the license is prepended with a #", () => {
    const content = `# MIT License

    This is the content of the license file.`;

    const result = Retriever(
      licenseMap,
      templates
    ).retrieveLicenseFromLicenseFileContent(content);

    expect(result).toBe("MIT");
  });
});

// retrieveLicenseFromReadme should return the license from the content of a readme file
describe("retrieveLicenseFromReadme", () => {
  it("should return the license from the content of a readme file", () => {
    const result = Retriever(licenseMap, templates).retrieveLicenseFromReadme(
      `${process.cwd()}/tests/auditor/package-with-only-readme-file/README`
    );

    expect(result).toBe("MIT");
  });

  it("should return an empty string if the file does not exist", () => {
    const result = Retriever(licenseMap, templates).retrieveLicenseFromReadme(
      `${process.cwd()}/tests/auditor/package-with-only-readme-file/README-does-not-exist`
    );

    expect(result).toBe("");
  });

  it("should return the license from the content of a readme file in the current working directory", () => {
    const cwd = process.cwd();
    process.chdir(`${cwd}/tests/auditor/package-with-only-readme-file`);

    const result = Retriever(licenseMap, templates).retrieveLicenseFromReadme(
      "README"
    );

    process.chdir(cwd);

    expect(result).toBe("MIT");
  });
});
