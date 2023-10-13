/* eslint-disable @typescript-eslint/no-var-requires */
import { IPluginConfig } from "../../src/danger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;
declare let licenseAuditor:
  | ((config: Partial<IPluginConfig>) => Promise<void>)
  | undefined;

describe("licenseAuditor when there are no dependencies", () => {
  beforeAll(() => {
    // mock the danger functions warn, fail, and markdown and attach them to the global object
    global.warn = jest.fn();
    global.fail = jest.fn();
    global.markdown = jest.fn();

    // mock the findAllDependencies function to return an empty array
    // based on an import from the auditor module
    jest.doMock("../../src/auditor", () => {
      return {
        findAllDependencies: jest.fn().mockImplementation(() => {
          return [];
        }),
        noDependencies: "There are no dependencies to check.",
      };
    });
  });

  afterAll(() => {
    // set the global object back to its original state
    global.warn = undefined;
    global.fail = undefined;
    global.markdown = undefined;

    // un-mock the findAllDependencies function
    jest.unmock("../../src/auditor");

    // reset the licenseAuditor function
    licenseAuditor = undefined;

    // reset modules
    jest.resetModules();
  });

  it("should call warn if there are no dependencies", async () => {
    // arrange
    licenseAuditor = require("../../src/danger/danger-plugin").licenseAuditor;
    const config = {
      failOnBlacklistedLicense: false,
      projectPath: process.cwd(),
      showMarkdownSummary: false,
    };
    const message = `There are no dependencies to check.`;

    // act
    await licenseAuditor!(config);

    // assert
    expect(global.warn).toBeCalledWith(message);
  });
});
