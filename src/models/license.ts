export interface License {
  rootProjectName: string;
  name: string;
  path: string;
  licenses: string[] | string;
  licensePath: string;
  repository: string;
  publisher: string;
  email?: string;
  version: string;
}
