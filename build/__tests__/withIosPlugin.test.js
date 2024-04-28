"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const withCocoaPods_1 = require("../withCocoaPods");
describe('iOS plugin', () => {
    let PodfileContents;
    beforeAll(async () => {
        PodfileContents = await promises_1.default.readFile(path_1.default.resolve(__dirname, './fixtures/Podfile'), 'utf-8');
    });
    it('should update the Podfile with simdjson', async () => {
        const updatedPodfile = (0, withCocoaPods_1.updatePodfile)(PodfileContents);
        expect(updatedPodfile).toMatchSnapshot();
    });
});
