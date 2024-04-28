"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePodfile = exports.withCocoaPods = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const path_1 = __importDefault(require("path"));
const resolve_from_1 = __importDefault(require("resolve-from"));
const fs_1 = __importDefault(require("fs"));
const fs = fs_1.default.promises;
function isWatermelonDBInstalled(projectRoot) {
    const resolved = resolve_from_1.default.silent(projectRoot, "@nozbe/watermelondb/package.json");
    return resolved ? path_1.default.dirname(resolved) : null;
}
const withCocoaPods = (config) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const filePath = path_1.default.join(config.modRequest.platformProjectRoot, "Podfile");
            const contents = await fs.readFile(filePath, "utf-8");
            const watermelonPath = isWatermelonDBInstalled(config.modRequest.projectRoot);
            if (watermelonPath) {
                await fs.writeFile(filePath, updatePodfile(contents));
            }
            else {
                throw new Error("Please make sure you have watermelondb installed");
            }
            return config;
        },
    ]);
};
exports.withCocoaPods = withCocoaPods;
function updatePodfile(contents) {
    let newContent = contents;
    if (!contents.includes("pod 'simdjson'")) {
        const patchKey = "post_install";
        const slicedContent = contents.split(patchKey);
        slicedContent[0] += `\n
  pod 'simdjson', path: File.join(File.dirname(\`node --print "require.resolve('@nozbe/simdjson/package.json')"\`)), :modular_headers => true \n\n  `;
        newContent = slicedContent.join(patchKey);
    }
    return newContent;
}
exports.updatePodfile = updatePodfile;
