// configuration source type is either "file" or "default"
// "file" means the configuration was loaded from a file
// "default" means the configuration was loaded from the default configuration
declare type ConfigurationSourceType = "remote" | "file" | "default";

export interface Configuration {
  whiteList: string[];
  blackList: string[];
  configurationSource: ConfigurationSourceType;
  configurationFileName?: string;
}
