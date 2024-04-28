import {ExpoConfig} from "@expo/config-types";
import {withXcodeProject} from "@expo/config-plugins";

/**
 * Exclude building for arm64 on simulator devices in the pbxproj project.
 * Without this, production builds targeting simulators will fail.
 */
// @ts-ignore
export function setExcludedArchitectures(project) {

    const configurations = project.pbxXCBuildConfigurationSection();
    // @ts-ignore
    for (const {buildSettings} of Object.values(configurations || {})) {
        // Guessing that this is the best way to emulate Xcode.
        // Using `project.addToBuildSettings` modifies too many targets.
        if (
            typeof (buildSettings === null || buildSettings === void 0
                ? void 0
                : buildSettings.PRODUCT_NAME) !== "undefined"
        ) {
            buildSettings['"EXCLUDED_ARCHS[sdk=iphonesimulator*]"'] = '"arm64"';
        }
    }

    return project;
}

function logToFile(content: string, file = 'log.txt') {
    const fs = require('fs');
    fs.writeFileSync(file, content);
}

export const withExcludedSimulatorArchitectures = (c: ExpoConfig): ExpoConfig => {
    return withXcodeProject(c, (config) => {
        config.modResults = setExcludedArchitectures(config.modResults);
        return config;
    }) as ExpoConfig;
};
