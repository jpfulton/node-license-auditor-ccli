import { removeDuplicates } from "../../../src/auditor/license-checker/licenseChecker";
import { License } from "../../../src/models/license";

// removeDuplicates should remove duplicate licenses based on common name,
// version and licenses array
describe("removeDuplicates", () => {
  it("should remove duplicate licenses based on common name, version and licenses array", () => {
    const licenseData: License[] = [
      {
        name: "test",
        version: "1.0.0",
        licenses: "MIT",
        path: "test",
        licensePath: "test",
        repository: "test",
        publisher: "test",
        email: "test",
        rootProjectName: "test",
      },
      {
        name: "test",
        version: "1.0.0",
        licenses: "MIT",
        path: "test-2",
        licensePath: "test-2",
        repository: "test-2",
        publisher: "test-2",
        email: "test-2",
        rootProjectName: "test",
      },
    ];

    const result = removeDuplicates(licenseData);

    expect(result.length).toBe(1);
  });
});
