/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/base/common/buffer", "vs/workbench/services/workingCopy/test/browser/storedFileWorkingCopy.test", "vs/base/common/network", "vs/workbench/services/workingCopy/common/fileWorkingCopyManager", "vs/workbench/services/workingCopy/test/browser/untitledFileWorkingCopy.test", "vs/workbench/services/workingCopy/common/untitledFileWorkingCopy", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, workbenchTestServices_1, storedFileWorkingCopy_1, buffer_1, storedFileWorkingCopy_test_1, network_1, fileWorkingCopyManager_1, untitledFileWorkingCopy_test_1, untitledFileWorkingCopy_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('FileWorkingCopyManager', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        let manager;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            accessor.fileService.registerProvider(network_1.Schemas.file, new workbenchTestServices_1.$Pec());
            accessor.fileService.registerProvider(network_1.Schemas.vscodeRemote, new workbenchTestServices_1.$Pec());
            manager = disposables.add(new fileWorkingCopyManager_1.$$rb('testFileWorkingCopyType', new storedFileWorkingCopy_test_1.$ogc(), new untitledFileWorkingCopy_test_1.$rgc(), accessor.fileService, accessor.lifecycleService, accessor.labelService, accessor.logService, accessor.workingCopyFileService, accessor.workingCopyBackupService, accessor.uriIdentityService, accessor.fileDialogService, accessor.filesConfigurationService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService, accessor.pathService, accessor.environmentService, accessor.dialogService, accessor.decorationsService));
        });
        teardown(() => {
            disposables.clear();
        });
        test('onDidCreate, get, workingCopies', async () => {
            let createCounter = 0;
            disposables.add(manager.onDidCreate(e => {
                createCounter++;
            }));
            const fileUri = uri_1.URI.file('/test.html');
            assert.strictEqual(manager.workingCopies.length, 0);
            assert.strictEqual(manager.get(fileUri), undefined);
            const fileWorkingCopy = await manager.resolve(fileUri);
            const untitledFileWorkingCopy = await manager.resolve();
            assert.strictEqual(manager.workingCopies.length, 2);
            assert.strictEqual(createCounter, 2);
            assert.strictEqual(manager.get(fileWorkingCopy.resource), fileWorkingCopy);
            assert.strictEqual(manager.get(untitledFileWorkingCopy.resource), untitledFileWorkingCopy);
            const sameFileWorkingCopy = disposables.add(await manager.resolve(fileUri));
            const sameUntitledFileWorkingCopy = disposables.add(await manager.resolve({ untitledResource: untitledFileWorkingCopy.resource }));
            assert.strictEqual(sameFileWorkingCopy, fileWorkingCopy);
            assert.strictEqual(sameUntitledFileWorkingCopy, untitledFileWorkingCopy);
            assert.strictEqual(manager.workingCopies.length, 2);
            assert.strictEqual(createCounter, 2);
        });
        test('resolve', async () => {
            const fileWorkingCopy = disposables.add(await manager.resolve(uri_1.URI.file('/test.html')));
            assert.ok(fileWorkingCopy instanceof storedFileWorkingCopy_1.$FD);
            assert.strictEqual(await manager.stored.resolve(fileWorkingCopy.resource), fileWorkingCopy);
            const untitledFileWorkingCopy = disposables.add(await manager.resolve());
            assert.ok(untitledFileWorkingCopy instanceof untitledFileWorkingCopy_1.$9rb);
            assert.strictEqual(await manager.untitled.resolve({ untitledResource: untitledFileWorkingCopy.resource }), untitledFileWorkingCopy);
            assert.strictEqual(await manager.resolve(untitledFileWorkingCopy.resource), untitledFileWorkingCopy);
        });
        test('destroy', async () => {
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
            await manager.resolve(uri_1.URI.file('/test.html'));
            await manager.resolve({ contents: { value: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('Hello Untitled')) } });
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 2);
            assert.strictEqual(manager.stored.workingCopies.length, 1);
            assert.strictEqual(manager.untitled.workingCopies.length, 1);
            await manager.destroy();
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
            assert.strictEqual(manager.stored.workingCopies.length, 0);
            assert.strictEqual(manager.untitled.workingCopies.length, 0);
        });
        test('saveAs - file (same target, unresolved source, unresolved target)', () => {
            const source = uri_1.URI.file('/path/source.txt');
            return testSaveAsFile(source, source, false, false);
        });
        test('saveAs - file (same target, different case, unresolved source, unresolved target)', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/SOURCE.txt');
            return testSaveAsFile(source, target, false, false);
        });
        test('saveAs - file (different target, unresolved source, unresolved target)', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/target.txt');
            return testSaveAsFile(source, target, false, false);
        });
        test('saveAs - file (same target, resolved source, unresolved target)', () => {
            const source = uri_1.URI.file('/path/source.txt');
            return testSaveAsFile(source, source, true, false);
        });
        test('saveAs - file (same target, different case, resolved source, unresolved target)', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/SOURCE.txt');
            return testSaveAsFile(source, target, true, false);
        });
        test('saveAs - file (different target, resolved source, unresolved target)', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/target.txt');
            return testSaveAsFile(source, target, true, false);
        });
        test('saveAs - file (same target, unresolved source, resolved target)', () => {
            const source = uri_1.URI.file('/path/source.txt');
            return testSaveAsFile(source, source, false, true);
        });
        test('saveAs - file (same target, different case, unresolved source, resolved target)', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/SOURCE.txt');
            return testSaveAsFile(source, target, false, true);
        });
        test('saveAs - file (different target, unresolved source, resolved target)', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/target.txt');
            return testSaveAsFile(source, target, false, true);
        });
        test('saveAs - file (same target, resolved source, resolved target)', () => {
            const source = uri_1.URI.file('/path/source.txt');
            return testSaveAsFile(source, source, true, true);
        });
        test('saveAs - file (different target, resolved source, resolved target)', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/target.txt');
            return testSaveAsFile(source, target, true, true);
        });
        async function testSaveAsFile(source, target, resolveSource, resolveTarget) {
            let sourceWorkingCopy = undefined;
            if (resolveSource) {
                sourceWorkingCopy = disposables.add(await manager.resolve(source));
                sourceWorkingCopy.model?.updateContents('hello world');
                assert.ok(sourceWorkingCopy.isDirty());
            }
            let targetWorkingCopy = undefined;
            if (resolveTarget) {
                targetWorkingCopy = disposables.add(await manager.resolve(target));
                targetWorkingCopy.model?.updateContents('hello world');
                assert.ok(targetWorkingCopy.isDirty());
            }
            const result = await manager.saveAs(source, target);
            if (accessor.uriIdentityService.extUri.isEqual(source, target) && resolveSource) {
                // if the uris are considered equal (different case on macOS/Windows)
                // and the source is to be resolved, the resulting working copy resource
                // will be the source resource because we consider file working copies
                // the same in that case
                assert.strictEqual(source.toString(), result?.resource.toString());
            }
            else {
                if (resolveSource || resolveTarget) {
                    assert.strictEqual(target.toString(), result?.resource.toString());
                }
                else {
                    if (accessor.uriIdentityService.extUri.isEqual(source, target)) {
                        assert.strictEqual(undefined, result);
                    }
                    else {
                        assert.strictEqual(target.toString(), result?.resource.toString());
                    }
                }
            }
            if (resolveSource) {
                assert.strictEqual(sourceWorkingCopy?.isDirty(), false);
            }
            if (resolveTarget) {
                assert.strictEqual(targetWorkingCopy?.isDirty(), false);
            }
            result?.dispose();
        }
        test('saveAs - untitled (without associated resource)', async () => {
            const workingCopy = disposables.add(await manager.resolve());
            workingCopy.model?.updateContents('Simple Save As');
            const target = uri_1.URI.file('simple/file.txt');
            accessor.fileDialogService.setPickFileToSave(target);
            const result = await manager.saveAs(workingCopy.resource, undefined);
            assert.strictEqual(result?.resource.toString(), target.toString());
            assert.strictEqual((result?.model).contents, 'Simple Save As');
            assert.strictEqual(manager.untitled.get(workingCopy.resource), undefined);
            result?.dispose();
        });
        test('saveAs - untitled (with associated resource)', async () => {
            const workingCopy = disposables.add(await manager.resolve({ associatedResource: { path: '/some/associated.txt' } }));
            workingCopy.model?.updateContents('Simple Save As with associated resource');
            const target = uri_1.URI.from({ scheme: network_1.Schemas.file, path: '/some/associated.txt' });
            accessor.fileService.notExistsSet.set(target, true);
            const result = await manager.saveAs(workingCopy.resource, undefined);
            assert.strictEqual(result?.resource.toString(), target.toString());
            assert.strictEqual((result?.model).contents, 'Simple Save As with associated resource');
            assert.strictEqual(manager.untitled.get(workingCopy.resource), undefined);
            result?.dispose();
        });
        test('saveAs - untitled (target exists and is resolved)', async () => {
            const workingCopy = disposables.add(await manager.resolve());
            workingCopy.model?.updateContents('Simple Save As');
            const target = uri_1.URI.file('simple/file.txt');
            const targetFileWorkingCopy = await manager.resolve(target);
            accessor.fileDialogService.setPickFileToSave(target);
            const result = await manager.saveAs(workingCopy.resource, undefined);
            assert.strictEqual(result, targetFileWorkingCopy);
            assert.strictEqual((result?.model).contents, 'Simple Save As');
            assert.strictEqual(manager.untitled.get(workingCopy.resource), undefined);
            result?.dispose();
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=fileWorkingCopyManager.test.js.map