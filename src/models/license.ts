export interface License {
  path: string;
  licenses: string[] | string;
  licensePath: string;
  repository: string;
  publisher: string;
  email?: string;
  version: string;
}
