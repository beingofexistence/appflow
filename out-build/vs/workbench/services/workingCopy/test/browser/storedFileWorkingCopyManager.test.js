/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager", "vs/base/common/buffer", "vs/platform/files/common/files", "vs/base/common/async", "vs/workbench/services/workingCopy/test/browser/storedFileWorkingCopy.test", "vs/base/common/cancellation", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, workbenchTestServices_1, storedFileWorkingCopyManager_1, buffer_1, files_1, async_1, storedFileWorkingCopy_test_1, cancellation_1, inMemoryFilesystemProvider_1, lifecycle_1, platform_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StoredFileWorkingCopyManager', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        let manager;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            manager = disposables.add(new storedFileWorkingCopyManager_1.$8rb('testStoredFileWorkingCopyType', new storedFileWorkingCopy_test_1.$ogc(), accessor.fileService, accessor.lifecycleService, accessor.labelService, accessor.logService, accessor.workingCopyFileService, accessor.workingCopyBackupService, accessor.uriIdentityService, accessor.filesConfigurationService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService));
        });
        teardown(() => {
            for (const workingCopy of manager.workingCopies) {
                workingCopy.dispose();
            }
            disposables.clear();
        });
        test('resolve', async () => {
            const resource = uri_1.URI.file('/test.html');
            const events = [];
            const listener = manager.onDidCreate(workingCopy => {
                events.push(workingCopy);
            });
            const resolvePromise = manager.resolve(resource);
            assert.ok(manager.get(resource)); // working copy known even before resolved()
            assert.strictEqual(manager.workingCopies.length, 1);
            const workingCopy1 = await resolvePromise;
            assert.ok(workingCopy1);
            assert.ok(workingCopy1.model);
            assert.strictEqual(workingCopy1.typeId, 'testStoredFileWorkingCopyType');
            assert.strictEqual(workingCopy1.resource.toString(), resource.toString());
            assert.strictEqual(manager.get(resource), workingCopy1);
            const workingCopy2 = await manager.resolve(resource);
            assert.strictEqual(workingCopy2, workingCopy1);
            assert.strictEqual(manager.workingCopies.length, 1);
            workingCopy1.dispose();
            const workingCopy3 = await manager.resolve(resource);
            assert.notStrictEqual(workingCopy3, workingCopy2);
            assert.strictEqual(manager.workingCopies.length, 1);
            assert.strictEqual(manager.get(resource), workingCopy3);
            workingCopy3.dispose();
            assert.strictEqual(manager.workingCopies.length, 0);
            assert.strictEqual(events.length, 2);
            assert.strictEqual(events[0].resource.toString(), workingCopy1.resource.toString());
            assert.strictEqual(events[1].resource.toString(), workingCopy2.resource.toString());
            listener.dispose();
            workingCopy1.dispose();
            workingCopy2.dispose();
            workingCopy3.dispose();
        });
        test('resolve (async)', async () => {
            const resource = uri_1.URI.file('/path/index.txt');
            disposables.add(await manager.resolve(resource));
            let didResolve = false;
            let onDidResolve = new Promise(resolve => {
                disposables.add(manager.onDidResolve(({ model }) => {
                    if (model?.resource.toString() === resource.toString()) {
                        didResolve = true;
                        resolve();
                    }
                }));
            });
            const resolve = manager.resolve(resource, { reload: { async: true } });
            await onDidResolve;
            assert.strictEqual(didResolve, true);
            didResolve = false;
            onDidResolve = new Promise(resolve => {
                disposables.add(manager.onDidResolve(({ model }) => {
                    if (model?.resource.toString() === resource.toString()) {
                        didResolve = true;
                        resolve();
                    }
                }));
            });
            manager.resolve(resource, { reload: { async: true, force: true } });
            await onDidResolve;
            assert.strictEqual(didResolve, true);
            disposables.add(await resolve);
        });
        test('resolve (sync)', async () => {
            const resource = uri_1.URI.file('/path/index.txt');
            await manager.resolve(resource);
            let didResolve = false;
            disposables.add(manager.onDidResolve(({ model }) => {
                if (model?.resource.toString() === resource.toString()) {
                    didResolve = true;
                }
            }));
            disposables.add(await manager.resolve(resource, { reload: { async: false } }));
            assert.strictEqual(didResolve, true);
            didResolve = false;
            disposables.add(await manager.resolve(resource, { reload: { async: false, force: true } }));
            assert.strictEqual(didResolve, true);
        });
        test('resolve (sync) - model disposed when error and first call to resolve', async () => {
            const resource = uri_1.URI.file('/path/index.txt');
            accessor.fileService.readShouldThrowError = new files_1.$nk('fail', 10 /* FileOperationResult.FILE_OTHER_ERROR */);
            try {
                let error = undefined;
                try {
                    await manager.resolve(resource);
                }
                catch (e) {
                    error = e;
                }
                assert.ok(error);
                assert.strictEqual(manager.workingCopies.length, 0);
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
        });
        test('resolve (sync) - model not disposed when error and model existed before', async () => {
            const resource = uri_1.URI.file('/path/index.txt');
            disposables.add(await manager.resolve(resource));
            accessor.fileService.readShouldThrowError = new files_1.$nk('fail', 10 /* FileOperationResult.FILE_OTHER_ERROR */);
            try {
                let error = undefined;
                try {
                    await manager.resolve(resource, { reload: { async: false } });
                }
                catch (e) {
                    error = e;
                }
                assert.ok(error);
                assert.strictEqual(manager.workingCopies.length, 1);
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
        });
        test('resolve with initial contents', async () => {
            const resource = uri_1.URI.file('/test.html');
            const workingCopy = await manager.resolve(resource, { contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('Hello World')) });
            assert.strictEqual(workingCopy.model?.contents, 'Hello World');
            assert.strictEqual(workingCopy.isDirty(), true);
            await manager.resolve(resource, { contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('More Changes')) });
            assert.strictEqual(workingCopy.model?.contents, 'More Changes');
            assert.strictEqual(workingCopy.isDirty(), true);
            workingCopy.dispose();
        });
        test('multiple resolves execute in sequence (same resources)', async () => {
            const resource = uri_1.URI.file('/test.html');
            const firstPromise = manager.resolve(resource);
            const secondPromise = manager.resolve(resource, { contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('Hello World')) });
            const thirdPromise = manager.resolve(resource, { contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('More Changes')) });
            await firstPromise;
            await secondPromise;
            const workingCopy = await thirdPromise;
            assert.strictEqual(workingCopy.model?.contents, 'More Changes');
            assert.strictEqual(workingCopy.isDirty(), true);
            workingCopy.dispose();
        });
        test('multiple resolves execute in parallel (different resources)', async () => {
            const resource1 = uri_1.URI.file('/test1.html');
            const resource2 = uri_1.URI.file('/test2.html');
            const resource3 = uri_1.URI.file('/test3.html');
            const firstPromise = manager.resolve(resource1);
            const secondPromise = manager.resolve(resource2);
            const thirdPromise = manager.resolve(resource3);
            const [workingCopy1, workingCopy2, workingCopy3] = await Promise.all([firstPromise, secondPromise, thirdPromise]);
            assert.strictEqual(manager.workingCopies.length, 3);
            assert.strictEqual(workingCopy1.resource.toString(), resource1.toString());
            assert.strictEqual(workingCopy2.resource.toString(), resource2.toString());
            assert.strictEqual(workingCopy3.resource.toString(), resource3.toString());
            workingCopy1.dispose();
            workingCopy2.dispose();
            workingCopy3.dispose();
        });
        test('removed from cache when working copy or model gets disposed', async () => {
            const resource = uri_1.URI.file('/test.html');
            let workingCopy = await manager.resolve(resource, { contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('Hello World')) });
            assert.strictEqual(manager.get(uri_1.URI.file('/test.html')), workingCopy);
            workingCopy.dispose();
            assert(!manager.get(uri_1.URI.file('/test.html')));
            workingCopy = await manager.resolve(resource, { contents: (0, buffer_1.$Td)(buffer_1.$Fd.fromString('Hello World')) });
            assert.strictEqual(manager.get(uri_1.URI.file('/test.html')), workingCopy);
            workingCopy.model?.dispose();
            assert(!manager.get(uri_1.URI.file('/test.html')));
        });
        test('events', async () => {
            const resource1 = uri_1.URI.file('/path/index.txt');
            const resource2 = uri_1.URI.file('/path/other.txt');
            let createdCounter = 0;
            let resolvedCounter = 0;
            let removedCounter = 0;
            let gotDirtyCounter = 0;
            let gotNonDirtyCounter = 0;
            let revertedCounter = 0;
            let savedCounter = 0;
            let saveErrorCounter = 0;
            disposables.add(manager.onDidCreate(() => {
                createdCounter++;
            }));
            disposables.add(manager.onDidRemove(resource => {
                if (resource.toString() === resource1.toString() || resource.toString() === resource2.toString()) {
                    removedCounter++;
                }
            }));
            disposables.add(manager.onDidResolve(workingCopy => {
                if (workingCopy.resource.toString() === resource1.toString()) {
                    resolvedCounter++;
                }
            }));
            disposables.add(manager.onDidChangeDirty(workingCopy => {
                if (workingCopy.resource.toString() === resource1.toString()) {
                    if (workingCopy.isDirty()) {
                        gotDirtyCounter++;
                    }
                    else {
                        gotNonDirtyCounter++;
                    }
                }
            }));
            disposables.add(manager.onDidRevert(workingCopy => {
                if (workingCopy.resource.toString() === resource1.toString()) {
                    revertedCounter++;
                }
            }));
            let lastSaveEvent = undefined;
            disposables.add(manager.onDidSave((e) => {
                if (e.workingCopy.resource.toString() === resource1.toString()) {
                    lastSaveEvent = e;
                    savedCounter++;
                }
            }));
            disposables.add(manager.onDidSaveError(workingCopy => {
                if (workingCopy.resource.toString() === resource1.toString()) {
                    saveErrorCounter++;
                }
            }));
            const workingCopy1 = disposables.add(await manager.resolve(resource1));
            assert.strictEqual(resolvedCounter, 1);
            assert.strictEqual(createdCounter, 1);
            accessor.fileService.fireFileChanges(new files_1.$lk([{ resource: resource1, type: 2 /* FileChangeType.DELETED */ }], false));
            accessor.fileService.fireFileChanges(new files_1.$lk([{ resource: resource1, type: 1 /* FileChangeType.ADDED */ }], false));
            const workingCopy2 = disposables.add(await manager.resolve(resource2));
            assert.strictEqual(resolvedCounter, 2);
            assert.strictEqual(createdCounter, 2);
            workingCopy1.model?.updateContents('changed');
            await workingCopy1.revert();
            workingCopy1.model?.updateContents('changed again');
            await workingCopy1.save();
            try {
                accessor.fileService.writeShouldThrowError = new files_1.$nk('write error', 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
                await workingCopy1.save({ force: true });
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            workingCopy1.dispose();
            workingCopy2.dispose();
            await workingCopy1.revert();
            assert.strictEqual(removedCounter, 2);
            assert.strictEqual(gotDirtyCounter, 3);
            assert.strictEqual(gotNonDirtyCounter, 2);
            assert.strictEqual(revertedCounter, 1);
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(lastSaveEvent.workingCopy, workingCopy1);
            assert.ok(lastSaveEvent.stat);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(createdCounter, 2);
            workingCopy1.dispose();
            workingCopy2.dispose();
        });
        test('resolve registers as working copy and dispose clears', async () => {
            const resource1 = uri_1.URI.file('/test1.html');
            const resource2 = uri_1.URI.file('/test2.html');
            const resource3 = uri_1.URI.file('/test3.html');
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
            const firstPromise = manager.resolve(resource1);
            const secondPromise = manager.resolve(resource2);
            const thirdPromise = manager.resolve(resource3);
            await Promise.all([firstPromise, secondPromise, thirdPromise]);
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 3);
            assert.strictEqual(manager.workingCopies.length, 3);
            manager.dispose();
            assert.strictEqual(manager.workingCopies.length, 0);
            // dispose does not remove from working copy service, only `destroy` should
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 3);
            disposables.add(await firstPromise);
            disposables.add(await secondPromise);
            disposables.add(await thirdPromise);
        });
        test('destroy', async () => {
            const resource1 = uri_1.URI.file('/test1.html');
            const resource2 = uri_1.URI.file('/test2.html');
            const resource3 = uri_1.URI.file('/test3.html');
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
            const firstPromise = manager.resolve(resource1);
            const secondPromise = manager.resolve(resource2);
            const thirdPromise = manager.resolve(resource3);
            await Promise.all([firstPromise, secondPromise, thirdPromise]);
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 3);
            assert.strictEqual(manager.workingCopies.length, 3);
            await manager.destroy();
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
            assert.strictEqual(manager.workingCopies.length, 0);
        });
        test('destroy saves dirty working copies', async () => {
            const resource = uri_1.URI.file('/path/source.txt');
            const workingCopy = await manager.resolve(resource);
            let saved = false;
            disposables.add(workingCopy.onDidSave(() => {
                saved = true;
            }));
            workingCopy.model?.updateContents('hello create');
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 1);
            assert.strictEqual(manager.workingCopies.length, 1);
            await manager.destroy();
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
            assert.strictEqual(manager.workingCopies.length, 0);
            assert.strictEqual(saved, true);
        });
        test('destroy falls back to using backup when save fails', async () => {
            const resource = uri_1.URI.file('/path/source.txt');
            const workingCopy = await manager.resolve(resource);
            workingCopy.model?.setThrowOnSnapshot();
            let unexpectedSave = false;
            disposables.add(workingCopy.onDidSave(() => {
                unexpectedSave = true;
            }));
            workingCopy.model?.updateContents('hello create');
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 1);
            assert.strictEqual(manager.workingCopies.length, 1);
            assert.strictEqual(accessor.workingCopyBackupService.resolved.has(workingCopy), true);
            await manager.destroy();
            assert.strictEqual(accessor.workingCopyService.workingCopies.length, 0);
            assert.strictEqual(manager.workingCopies.length, 0);
            assert.strictEqual(unexpectedSave, false);
        });
        test('file change event triggers working copy resolve', async () => {
            const resource = uri_1.URI.file('/path/index.txt');
            await manager.resolve(resource);
            let didResolve = false;
            const onDidResolve = new Promise(resolve => {
                disposables.add(manager.onDidResolve(({ model }) => {
                    if (model?.resource.toString() === resource.toString()) {
                        didResolve = true;
                        resolve();
                    }
                }));
            });
            accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 0 /* FileChangeType.UPDATED */ }], false));
            await onDidResolve;
            assert.strictEqual(didResolve, true);
        });
        test('file change event triggers working copy resolve (when working copy is pending to resolve)', async () => {
            const resource = uri_1.URI.file('/path/index.txt');
            manager.resolve(resource);
            let didResolve = false;
            let resolvedCounter = 0;
            const onDidResolve = new Promise(resolve => {
                disposables.add(manager.onDidResolve(({ model }) => {
                    if (model?.resource.toString() === resource.toString()) {
                        resolvedCounter++;
                        if (resolvedCounter === 2) {
                            didResolve = true;
                            resolve();
                        }
                    }
                }));
            });
            accessor.fileService.fireFileChanges(new files_1.$lk([{ resource, type: 0 /* FileChangeType.UPDATED */ }], false));
            await onDidResolve;
            assert.strictEqual(didResolve, true);
        });
        test('file system provider change triggers working copy resolve', async () => {
            const resource = uri_1.URI.file('/path/index.txt');
            disposables.add(await manager.resolve(resource));
            let didResolve = false;
            const onDidResolve = new Promise(resolve => {
                disposables.add(manager.onDidResolve(({ model }) => {
                    if (model?.resource.toString() === resource.toString()) {
                        didResolve = true;
                        resolve();
                    }
                }));
            });
            accessor.fileService.fireFileSystemProviderCapabilitiesChangeEvent({ provider: disposables.add(new inMemoryFilesystemProvider_1.$rAb()), scheme: resource.scheme });
            await onDidResolve;
            assert.strictEqual(didResolve, true);
        });
        test('working copy file event handling: create', async () => {
            const resource = uri_1.URI.file('/path/source.txt');
            const workingCopy = await manager.resolve(resource);
            workingCopy.model?.updateContents('hello create');
            assert.strictEqual(workingCopy.isDirty(), true);
            await accessor.workingCopyFileService.create([{ resource }], cancellation_1.CancellationToken.None);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('working copy file event handling: move', () => {
            return testMoveCopyFileWorkingCopy(true);
        });
        test('working copy file event handling: copy', () => {
            return testMoveCopyFileWorkingCopy(false);
        });
        async function testMoveCopyFileWorkingCopy(move) {
            const source = uri_1.URI.file('/path/source.txt');
            const target = uri_1.URI.file('/path/other.txt');
            const sourceWorkingCopy = await manager.resolve(source);
            sourceWorkingCopy.model?.updateContents('hello move or copy');
            assert.strictEqual(sourceWorkingCopy.isDirty(), true);
            if (move) {
                await accessor.workingCopyFileService.move([{ file: { source, target } }], cancellation_1.CancellationToken.None);
            }
            else {
                await accessor.workingCopyFileService.copy([{ file: { source, target } }], cancellation_1.CancellationToken.None);
            }
            const targetWorkingCopy = await manager.resolve(target);
            assert.strictEqual(targetWorkingCopy.isDirty(), true);
            assert.strictEqual(targetWorkingCopy.model?.contents, 'hello move or copy');
        }
        test('working copy file event handling: delete', async () => {
            const resource = uri_1.URI.file('/path/source.txt');
            const workingCopy = await manager.resolve(resource);
            workingCopy.model?.updateContents('hello delete');
            assert.strictEqual(workingCopy.isDirty(), true);
            await accessor.workingCopyFileService.delete([{ resource }], cancellation_1.CancellationToken.None);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('working copy file event handling: move to same resource', async () => {
            const source = uri_1.URI.file('/path/source.txt');
            const sourceWorkingCopy = await manager.resolve(source);
            sourceWorkingCopy.model?.updateContents('hello move');
            assert.strictEqual(sourceWorkingCopy.isDirty(), true);
            await accessor.workingCopyFileService.move([{ file: { source, target: source } }], cancellation_1.CancellationToken.None);
            assert.strictEqual(sourceWorkingCopy.isDirty(), true);
            assert.strictEqual(sourceWorkingCopy.model?.contents, 'hello move');
        });
        test('canDispose with dirty working copy', async () => {
            const resource = uri_1.URI.file('/path/index_something.txt');
            const workingCopy = await manager.resolve(resource);
            workingCopy.model?.updateContents('make dirty');
            const canDisposePromise = manager.canDispose(workingCopy);
            assert.ok(canDisposePromise instanceof Promise);
            let canDispose = false;
            (async () => {
                canDispose = await canDisposePromise;
            })();
            assert.strictEqual(canDispose, false);
            workingCopy.revert({ soft: true });
            await (0, async_1.$Hg)(0);
            assert.strictEqual(canDispose, true);
            const canDispose2 = manager.canDispose(workingCopy);
            assert.strictEqual(canDispose2, true);
        });
        (platform_1.$o ? test.skip : test)('pending saves join on shutdown', async () => {
            const resource1 = uri_1.URI.file('/path/index_something1.txt');
            const resource2 = uri_1.URI.file('/path/index_something2.txt');
            const workingCopy1 = disposables.add(await manager.resolve(resource1));
            workingCopy1.model?.updateContents('make dirty');
            const workingCopy2 = disposables.add(await manager.resolve(resource2));
            workingCopy2.model?.updateContents('make dirty');
            let saved1 = false;
            workingCopy1.save().then(() => {
                saved1 = true;
            });
            let saved2 = false;
            workingCopy2.save().then(() => {
                saved2 = true;
            });
            const event = new workbenchTestServices_1.$Mec();
            accessor.lifecycleService.fireWillShutdown(event);
            assert.ok(event.value.length > 0);
            await Promise.all(event.value);
            assert.strictEqual(saved1, true);
            assert.strictEqual(saved2, true);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=storedFileWorkingCopyManager.test.js.map