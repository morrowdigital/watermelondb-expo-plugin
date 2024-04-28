"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMainApplication = exports.mainApplication = void 0;
const config_plugins_1 = require("@expo/config-plugins");
function mainApplication(config) {
    return (0, config_plugins_1.withMainApplication)(config, (mod) => {
        mod.modResults.contents = updateMainApplication(mod.modResults.contents);
        return mod;
    });
}
exports.mainApplication = mainApplication;
function updateMainApplication(content) {
    let newContent = content;
    if (!content.includes("import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage")) {
        newContent = content.replace('import android.app.Application', `
import android.app.Application
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;
import com.facebook.react.bridge.JSIModulePackage;        
`);
    }
    if (!content.includes("override fun getJSIModulePackage(): JSIModulePackage")) {
        newContent = newContent.replace('override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED', `
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        override fun getJSIModulePackage(): JSIModulePackage {
        return WatermelonDBJSIPackage()
        }`);
    }
    return newContent;
}
exports.updateMainApplication = updateMainApplication;
