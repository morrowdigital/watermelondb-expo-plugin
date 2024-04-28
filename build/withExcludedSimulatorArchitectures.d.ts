import { ExpoConfig } from "@expo/config-types";
/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
export declare function setExcludedArchitectures(project: any): any;
export declare const withExcludedSimulatorArchitectures: (c: ExpoConfig) => ExpoConfig;
