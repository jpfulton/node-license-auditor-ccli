import blacklist from "../../src/default-license-configurations/blacklist.js";
import whitelist from "../../src/default-license-configurations/whitelist.js";
import { Configuration } from "../../src/models/configuration.js";
import getConfiguration from "../../src/util/configuration.js";

describe("getConfiguration", () => {
  it("should return the default configuration if the file does not exist", async () => {
    const result = await getConfiguration("non-existent-file.json");

    expect(result).toEqual({
      blackList: blacklist,
      whiteList: whitelist,
    } as Configuration);
  });

  it("should return the configuration from the file if the file exists", async () => {
    const result = await getConfiguration("tests/util/license-checker.json");

    expect(result).toEqual({
      blackList: ["blacklisted-license"],
      whiteList: ["whitelisted-license"],
    } as Configuration);
  });
});
