define(["require", "exports", "assert", "vs/workbench/services/telemetry/browser/workbenchCommonProperties", "vs/platform/storage/common/storage"], function (require, exports, assert, workbenchCommonProperties_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Browser Telemetry - common properties', function () {
        const commit = (undefined);
        const version = (undefined);
        let testStorageService;
        setup(() => {
            testStorageService = new storage_1.$Zo();
        });
        test('mixes in additional properties', async function () {
            const resolveCommonTelemetryProperties = () => {
                return {
                    'userId': '1'
                };
            };
            const props = (0, workbenchCommonProperties_1.$53b)(testStorageService, commit, version, false, undefined, undefined, false, resolveCommonTelemetryProperties);
            assert.ok('commitHash' in props);
            assert.ok('sessionID' in props);
            assert.ok('timestamp' in props);
            assert.ok('common.platform' in props);
            assert.ok('common.timesincesessionstart' in props);
            assert.ok('common.sequence' in props);
            assert.ok('version' in props);
            assert.ok('common.firstSessionDate' in props, 'firstSessionDate');
            assert.ok('common.lastSessionDate' in props, 'lastSessionDate');
            assert.ok('common.isNewSession' in props, 'isNewSession');
            assert.ok('common.machineId' in props, 'machineId');
            assert.strictEqual(props['userId'], '1');
        });
        test('mixes in additional dyanmic properties', async function () {
            let i = 1;
            const resolveCommonTelemetryProperties = () => {
                return Object.defineProperties({}, {
                    'userId': {
                        get: () => {
                            return i++;
                        },
                        enumerable: true
                    }
                });
            };
            const props = (0, workbenchCommonProperties_1.$53b)(testStorageService, commit, version, false, undefined, undefined, false, resolveCommonTelemetryProperties);
            assert.strictEqual(props['userId'], 1);
            const props2 = (0, workbenchCommonProperties_1.$53b)(testStorageService, commit, version, false, undefined, undefined, false, resolveCommonTelemetryProperties);
            assert.strictEqual(props2['userId'], 2);
        });
    });
});
//# sourceMappingURL=commonProperties.test.js.map