import { ExpoConfig } from "@expo/config-types";
type Options = {
    disableJsi?: boolean;
    databases?: string[];
    excludeSimArch?: boolean;
};
export declare function withSDK50(options: Options): (config: ExpoConfig) => ExpoConfig;
declare const _default: (config: any, options: any) => any;
export default _default;
