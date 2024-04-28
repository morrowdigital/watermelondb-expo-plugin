"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsGradle = exports.withSettingGradle = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const additionalContent = `
include ':watermelondb-jsi'
project(':watermelondb-jsi').projectDir = new File([
    "node", "--print", 
    "require.resolve('@nozbe/watermelondb/package.json')"
].execute(null, rootProject.projectDir).text.trim(), "../native/android-jsi")
`;
function withSettingGradle(gradleConfig) {
    return (0, config_plugins_1.withSettingsGradle)(gradleConfig, (mod) => {
        mod.modResults.contents = updateSettingsGradle(mod.modResults.contents);
        return mod;
    });
}
exports.withSettingGradle = withSettingGradle;
function updateSettingsGradle(content) {
    let newContent = content;
    if (!content.includes(':watermelondb-jsi')) {
        newContent += additionalContent;
    }
    return newContent;
}
exports.updateSettingsGradle = updateSettingsGradle;
