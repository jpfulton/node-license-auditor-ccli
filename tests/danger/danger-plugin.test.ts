/* eslint-disable @typescript-eslint/no-var-requires */
import { IPluginConfig } from "../../src/danger/danger-plugin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;
declare let licenseAuditor:
  | ((config: Partial<IPluginConfig>) => Promise<void>)
  | undefined;

// licenseAuditor is a function that takes a config object and returns a promise
describe("licenseAuditor", () => {
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

  it("should call fail if failOnBlacklistedLicense is true and there are blacklisted licenses", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: true,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.fail).toHaveBeenCalled();
  });

  it("should call warn if failOnBlacklistedLicense is false and there are blacklisted licenses", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.warn).toHaveBeenCalled();
  });

  it("should call markdown if showMarkdownSummary is true", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: true,
    };

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.markdown).toHaveBeenCalled();
  });

  it("should not call markdown if showMarkdownSummary is false", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.markdown).not.toHaveBeenCalled();
  });

  it("should call warn if there are licenses that are neither whitelisted nor blacklisted", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };
    const message = `Found 1 licenses that we neither whitelisted nor blacklisted by the configuration.`;

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.warn).toBeCalledWith(message);
  });

  it("should call fail if there are blacklisted licenses and failOnBlacklistedLicense is true", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: true,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };
    const message = `Found 1 blacklisted licenses.`;

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.fail).toBeCalledWith(message);
  });

  it("should call warn if there are blacklisted licenses and failOnBlacklistedLicense is false", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };
    const message = `Found 1 blacklisted licenses.`;

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.warn).toBeCalledWith(message);
  });

  describe("licenseAuditor when there are internal errors", () => {
    beforeEach(() => {
      // mock the danger functions warn, fail, and markdown and attach them to the global object
      global.warn = jest.fn();
      global.fail = jest.fn();
      global.markdown = jest.fn();
    });

    afterEach(() => {
      // set the global object back to its original state
      global.warn = undefined;
      global.fail = undefined;
      global.markdown = undefined;

      // reset the licenseAuditor function
      licenseAuditor = undefined;
    });

    it("should call fail if there is an error in parseLicenses", async () => {
      // arrange
      jest.doMock("../../src/auditor/parseLicenses", () => {
        // mock the parseLicenseFactory function to throw an error
        return jest.fn().mockImplementation(() => {
          return () => {
            throw new Error("test error");
          };
        });
      });
      licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
      const config = {
        failOnBlacklistedLicense: false,
        projectPath: process.cwd(),
        showMarkdownSummary: false,
      };
      const message = `[node-license-auditor] Failed to audit licenses with error: test error`;

      // act
      await licenseAuditor!(config);

      // assert
      expect(global.fail).toBeCalledWith(message);
    });
  });
});
