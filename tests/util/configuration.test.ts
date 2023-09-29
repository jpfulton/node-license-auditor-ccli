import blacklist from "../../src/default-configuration/blacklist.js";
import whitelist from "../../src/default-configuration/whitelist.js";
import { Configuration } from "../../src/models/configuration.js";
import {
  getConfiguration,
  getConfigurationFromUrl,
} from "../../src/util/configuration.js";

describe("getConfiguration", () => {
  it("should return the default configuration if the file does not exist", async () => {
    const result = await getConfiguration("non-existent-file.json");

    expect(result).toEqual({
      blackList: blacklist,
      whiteList: whitelist,
      configurationSource: "default",
    } as Configuration);
  });

  it("should return the configuration from the file if the file exists", async () => {
    const result = await getConfiguration("tests/util/.license-checker.json");

    expect(result).toEqual({
      blackList: ["blacklisted-license"],
      whiteList: ["whitelisted-license"],
      configurationFileName: "tests/util/.license-checker.json",
      configurationSource: "file",
    } as Configuration);
  });
});

describe("getConfigurationFromUrl", () => {
  it("should return the configuration from the URL", async () => {
    const url =
      "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json";

    const result = await getConfigurationFromUrl(url);

    expect(result.blackList.length).toBeGreaterThan(0);
    expect(result.whiteList.length).toBeGreaterThan(0);
    expect(result.configurationFileName).toEqual(url);
    expect(result.configurationSource).toEqual("remote");
  });

  it("should throw an error if the URL does not exist", async () => {
    const url =
      "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/non-existent-file.json";

    await expect(getConfigurationFromUrl(url)).rejects.toThrow(
      `Unable to load configuration from URL: ${url} Status: 404 was returned.`
    );
  });
});
