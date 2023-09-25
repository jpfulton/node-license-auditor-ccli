import { existsSync, readFileSync } from "fs";

// Collection of functions to retrieve license information from a package
// based on the package's license file or readme file.
const Retriever = (
  licenseMap: Record<string, string>,
  templates: Record<string, string>
) => {
  // Retrieve license from license file content based on the license map and templates content
  function retrieveLicenseFromLicenseFileContent(content: string): string {
    // split the content into lines
    const lines = content.split("\n");

    // find the first line that contains the word "license" (case insensitive)
    let license = lines.find((line) => /license/i.test(line));

    // remove the # from the license if it exists (markdown support)
    license = license?.replace("#", "").trim();

    // search for the license in the license map
    const mapped = licenseMap[(license || "").trim()];

    // if the license is in the map, return the mapped license
    if (mapped) {
      return mapped;
    }

    // slice the first line off and remove empty lines
    const withoutFirstLine = lines
      .slice(1)
      .filter((line) => line.length)
      .join("\n");

    // search for the license in the templates and return the template if found
    // otherwise, return the content
    return templates[withoutFirstLine] || content;
  }

  // Retrieve the license from the content of a license file
  function retrieveLicenseFromLicenseFile(filename: string): string {
    // if the file does not exist, return an empty string
    if (!existsSync(filename)) {
      return "";
    }

    // get the content of the file and retrieve the license from the content
    const content = readFileSync(filename).toString();
    return retrieveLicenseFromLicenseFileContent(content);
  }

  // Retrieve the license from the content of a readme file
  function retrieveLicenseFromReadme(filename: string): string {
    // if the file does not exist, return an empty string
    if (!existsSync(filename)) {
      console.log(`Current working directory: ${process.cwd()}`);
      console.log("File does not exist: %s", filename);
      return "";
    }

    // get the content of the file and split it into lines
    const lines = readFileSync(filename)
      .toString()
      .split("\n")
      .filter((line) => line); // remove empty lines

    // find the index of the line that contains the word "license"
    const licenseWordIndex = lines.findIndex((line) =>
      /#* *License *$/.test(line)
    );

    // if the license word is not found, return an empty string
    if (licenseWordIndex < 0) {
      return "";
    }

    // get the license from the next line
    const license = lines[licenseWordIndex + 1].trim();

    // return the license from the license map if found, otherwise return the license line
    return licenseMap[license] || license;
  }

  // return the interface of the retriever
  return {
    retrieveLicenseFromLicenseFileContent,
    retrieveLicenseFromReadme,
    retrieveLicenseFromLicenseFile,
  };
};

export default Retriever;
