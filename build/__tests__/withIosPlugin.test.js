"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const withCocoaPods_1 = require("../withCocoaPods");
const withExcludedSimulatorArchitectures_1 = require("../withExcludedSimulatorArchitectures");
describe('iOS plugin', () => {
    let PodfileContents;
    // TODO: Can this be typed better?
    let XCodeProject;
    // TODO: Can this be typed better?
    let XCodeProjectConfigurations;
    let XCodeProjectConfigurationsFixture;
    beforeAll(async () => {
        PodfileContents = await promises_1.default.readFile(path_1.default.resolve(__dirname, './fixtures/Podfile'), 'utf-8');
        XCodeProjectConfigurationsFixture = await promises_1.default.readFile(
        // Contents of this json file were obtained from a vanilla expo project
        path_1.default.resolve(__dirname, './fixtures/xcodeproject.config.json'), 'utf-8');
    });
    beforeEach(async () => {
        XCodeProjectConfigurations = JSON.parse(XCodeProjectConfigurationsFixture);
        XCodeProject = {
            pbxXCBuildConfigurationSection() {
                return XCodeProjectConfigurations;
            }
        };
    });
    it('should update the Podfile with simdjson', async () => {
        const updatedPodfile = (0, withCocoaPods_1.updatePodfile)(PodfileContents);
        expect(updatedPodfile).toMatchSnapshot();
    });
    it('should update the Podfile with simdjson only once on multiple prebuilds', async () => {
        let updatedPodfile = (0, withCocoaPods_1.updatePodfile)(PodfileContents);
        (0, withCocoaPods_1.updatePodfile)(PodfileContents);
        expect(updatedPodfile).toMatchSnapshot();
    });
    it('should be able to update the XCode project with excluded architectures', async () => {
        (0, withExcludedSimulatorArchitectures_1.setExcludedArchitectures)(XCodeProject);
        expect(XCodeProject.pbxXCBuildConfigurationSection()).toMatchSnapshot();
    });
    it('should be able to update the XCode project even if run twice', async () => {
        (0, withExcludedSimulatorArchitectures_1.setExcludedArchitectures)(XCodeProject);
        (0, withExcludedSimulatorArchitectures_1.setExcludedArchitectures)(XCodeProject);
        expect(XCodeProject.pbxXCBuildConfigurationSection()).toMatchSnapshot();
    });
});
