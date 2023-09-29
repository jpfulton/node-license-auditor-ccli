import { auditToMarkdown } from "../../src/commands";

// auditToMarkdown is a command that outputs a Markdown file of the licenses of the packages in a project
describe("auditToMarkdown", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should succeed if the URL does exist", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await expect(
      auditToMarkdown(".", {
        remote:
          "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/.license-checker.json",
      })
    ).resolves.not.toThrow();

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should throw an error if the URL does not exist", async () => {
    await expect(
      auditToMarkdown(".", {
        remote:
          "https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/non-existent-file.json",
      })
    ).rejects.toThrow(
      `Unable to load configuration from URL: https://raw.githubusercontent.com/jpfulton/jpfulton-license-audits/main/non-existent-file.json Status: 404 was returned.`
    );
  });
});
