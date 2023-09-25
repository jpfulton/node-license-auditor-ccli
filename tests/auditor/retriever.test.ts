import Retriever from "../../src/auditor/retriever.js";
import constants from "../../src/util/constants.js";

const { templates, licenseMap } = constants;

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
