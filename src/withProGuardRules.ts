import {ExpoConfig} from "@expo/config-types";
import {withDangerousMod} from "@expo/config-plugins";
import fs from 'fs/promises'

export function proGuardRules(config: ExpoConfig): ExpoConfig {
    return withDangerousMod(config, ['android', async (config) => {
        const contents = await fs.readFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, 'utf-8');
        const newContents = updateProGuardRules(contents);
        await fs.writeFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, newContents);

        return config;
    }]) as ExpoConfig;
}

export function updateProGuardRules(content: string): string {
    let newContent = content;
    if (!content.includes("-keep class com.nozbe.watermelondb.** { *; }")) {
        newContent = `
      ${content}
      -keep class com.nozbe.watermelondb.** { *; }
      `
    }

    return newContent
}
