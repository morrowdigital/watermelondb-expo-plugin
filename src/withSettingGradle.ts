import {ExpoConfig} from "@expo/config-types";
import {withSettingsGradle} from "@expo/config-plugins";
const additionalContent = `
include ':watermelondb-jsi'
project(':watermelondb-jsi').projectDir = new File([
    "node", "--print", 
    "require.resolve('@nozbe/watermelondb/package.json')"
].execute(null, rootProject.projectDir).text.trim(), "../native/android-jsi")
`
export function withSettingGradle(gradleConfig: ExpoConfig): ExpoConfig {
    return withSettingsGradle(gradleConfig, (mod) => {
      mod.modResults.contents = updateSettingsGradle(mod.modResults.contents);
      return mod;
    }) as ExpoConfig;
}

export function updateSettingsGradle(content: string): string {
  let newContent = content;
  if (!content.includes(':watermelondb-jsi')) {
    newContent += additionalContent;
  }

  return newContent;
}
