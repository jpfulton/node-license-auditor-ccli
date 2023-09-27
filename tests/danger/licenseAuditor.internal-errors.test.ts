/* eslint-disable @typescript-eslint/no-var-requires */
import { IPluginConfig } from "../../src/danger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;
declare let licenseAuditor:
  | ((config: Partial<IPluginConfig>) => Promise<void>)
  | undefined;

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

    // reset the mock for parseLicenseFactory
    jest.unmock("../../src/auditor/parseLicenses");

    // reset the licenseAuditor function
    licenseAuditor = undefined;

    // reset modules
    jest.resetModules();
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
