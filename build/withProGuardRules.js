"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProGuardRules = exports.proGuardRules = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const promises_1 = __importDefault(require("fs/promises"));
function proGuardRules(config) {
    return (0, config_plugins_1.withDangerousMod)(config, ['android', async (config) => {
            const contents = await promises_1.default.readFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, 'utf-8');
            const newContents = updateProGuardRules(contents);
            await promises_1.default.writeFile(`${config.modRequest.platformProjectRoot}/app/proguard-rules.pro`, newContents);
            return config;
        }]);
}
exports.proGuardRules = proGuardRules;
function updateProGuardRules(content) {
    let newContent = content;
    if (!content.includes("-keep class com.nozbe.watermelondb.** { *; }")) {
        newContent = `
      ${content}
      -keep class com.nozbe.watermelondb.** { *; }
      `;
    }
    return newContent;
}
exports.updateProGuardRules = updateProGuardRules;
