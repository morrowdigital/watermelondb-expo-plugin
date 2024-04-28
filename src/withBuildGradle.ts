import {ExpoConfig} from "@expo/config-types";
import {withAppBuildGradle} from "@expo/config-plugins";

const replaceValue = `
dependencies {
     implementation project(':watermelondb-jsi') 
`
export function withBuildGradle(config: ExpoConfig): ExpoConfig {
    return withAppBuildGradle(config, (mod) => {
        mod.modResults.contents = updateBuildGradle(mod.modResults.contents)
        return mod;
    }) as ExpoConfig;
}

export function updateBuildGradle(content: string): string {
    let newContent = content;
    if (!content.includes("implementation project(':watermelondb-jsi')")) {
        newContent = content.replace('dependencies {', replaceValue)
    }

    return newContent;
}
