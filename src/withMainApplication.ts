import {ExpoConfig} from "@expo/config-types";
import {withMainApplication} from "@expo/config-plugins";

export function mainApplication(config: ExpoConfig): ExpoConfig {
    return withMainApplication(config, (mod) => {
        mod.modResults.contents = updateMainApplication(mod.modResults.contents);

        return mod;
    }) as ExpoConfig;
}

export function updateMainApplication(content: string): string {
    let newContent = content;
    if (!content.includes("import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage")) {
        newContent = content.replace('import android.app.Application', `
import android.app.Application
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage;
import com.facebook.react.bridge.JSIModulePackage;        
`);
    }

    if (!content.includes("override fun getJSIModulePackage(): JSIModulePackage")) {
        newContent = newContent.replace(
            'override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED',
            `
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        override fun getJSIModulePackage(): JSIModulePackage {
        return WatermelonDBJSIPackage()
        }`
        )
    }

    return newContent
}
