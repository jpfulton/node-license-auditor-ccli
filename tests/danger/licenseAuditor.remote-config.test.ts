/* eslint-disable @typescript-eslint/no-var-requires */
import { IPluginConfig } from "../../src/danger/danger-plugin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;
declare let licenseAuditor:
  | ((config: Partial<IPluginConfig>) => Promise<void>)
  | undefined;

const validConfigurationUrl =
  "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json";
const invalidConfigurationUrl =
  "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/non-existent-file.json";

// tests for licenseAuditor DangerJS plugin module with remote configuration
describe("licenseAuditor DangerJS plugin module with remote configuration", () => {
  beforeEach(() => {
    // mock the danger functions warn, fail, and markdown and attach them to the global object
    global.warn = jest.fn();
    global.fail = jest.fn();
    global.markdown = jest.fn();

    // mock the parseLicense function with a function that returns
    // values that include a blacklisted license so that it will be used
    // within the licenseAuditor function called within the tests
    jest.doMock("../../src/auditor/parseLicenses", () => {
      return jest.fn().mockImplementation(() => {
        return () => {
          return {
            uniqueCount: 3,
            whitelistedCount: 1,
            warnCount: 1,
            blacklistedCount: 1,
            outputs: ["test"],
          };
        };
      });
    });
  });

  afterEach(() => {
    // set the global object back to its original state
    global.warn = undefined;
    global.fail = undefined;
    global.markdown = undefined;

    // reset the mock for parseLicenseFactory
    jest.unmock("../../src/auditor/parseLicenses");

    // reset the licenseAuditor function
    licenseAuditor = undefined;

    // reset modules
    jest.resetModules();
  });

  it("should succeed using a valid remote configuration", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
      remoteConfigurationUrl: validConfigurationUrl,
    };

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.fail).not.toHaveBeenCalled();
  });

  it("should fail using an invalid remote configuration", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
      remoteConfigurationUrl: invalidConfigurationUrl,
    };
    const message = `[node-license-auditor] Failed to audit licenses with error: Unable to load configuration from URL: ${invalidConfigurationUrl} Status: 404 was returned.`;

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.fail).toHaveBeenCalledWith(message);
  });
});
