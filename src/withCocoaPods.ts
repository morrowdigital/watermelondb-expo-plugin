import {ExpoConfig} from "@expo/config-types";
import {withDangerousMod} from "@expo/config-plugins";
import path from "path";
import resolveFrom from "resolve-from";
import filesys from "fs";

const fs = filesys.promises;

function isWatermelonDBInstalled(projectRoot: string) {
    const resolved = resolveFrom.silent(
        projectRoot,
        "@nozbe/watermelondb/package.json"
    );
    return resolved ? path.dirname(resolved) : null;
}

export const withCocoaPods = (config: ExpoConfig): ExpoConfig => {
    return withDangerousMod(config, [
        "ios",
        async (config) => {
            const filePath = path.join(
                config.modRequest.platformProjectRoot,
                "Podfile"
            );

            const contents = await fs.readFile(filePath, "utf-8");

            const watermelonPath = isWatermelonDBInstalled(
                config.modRequest.projectRoot
            );

            if (watermelonPath) {
                await fs.writeFile(filePath, updatePodfile(contents));
            } else {
                throw new Error("Please make sure you have watermelondb installed");
            }
            return config;
        },
    ]) as ExpoConfig;
};

export function updatePodfile(contents: string): string {
    let newContent = contents;
    if (!contents.includes("pod 'simdjson'")) {
        const patchKey = "post_install";
        const slicedContent = contents.split(patchKey);
        slicedContent[0] += `\n
  pod 'simdjson', path: File.join(File.dirname(\`node --print "require.resolve('@nozbe/simdjson/package.json')"\`)), :modular_headers => true \n\n  `;
        newContent = slicedContent.join(patchKey);
    }

    return newContent
}
