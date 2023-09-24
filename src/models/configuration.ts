export interface Configuration {
  whiteList: string[];
  blackList: string[];
  configurationSource?: "default" | "file";
}

export default Configuration;
