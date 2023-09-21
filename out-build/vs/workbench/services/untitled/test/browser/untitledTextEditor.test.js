/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/path", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/languages/modesRegistry", "vs/editor/common/core/range", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/stream", "vs/base/common/buffer", "vs/workbench/services/languageDetection/common/languageDetectionWorkerService", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, path_1, workbenchTestServices_1, textfiles_1, modesRegistry_1, range_1, untitledTextEditorInput_1, cancellation_1, lifecycle_1, stream_1, buffer_1, languageDetectionWorkerService_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Untitled text editors', () => {
        const disposables = new lifecycle_1.$jc();
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.$lec)(undefined, disposables);
            accessor = instantiationService.createInstance(workbenchTestServices_1.$mec);
            disposables.add(accessor.untitledTextEditorService);
        });
        teardown(() => {
            disposables.clear();
        });
        test('basics', async () => {
            const service = accessor.untitledTextEditorService;
            const workingCopyService = accessor.workingCopyService;
            const input1 = instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create());
            await input1.resolve();
            assert.strictEqual(service.get(input1.resource), input1.model);
            assert.ok(!accessor.untitledTextEditorService.isUntitledWithAssociatedResource(input1.resource));
            assert.ok(service.get(input1.resource));
            assert.ok(!service.get(uri_1.URI.file('testing')));
            assert.ok(input1.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            assert.ok(!input1.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            assert.ok(!input1.isReadonly());
            assert.ok(!input1.hasCapability(8 /* EditorInputCapabilities.Singleton */));
            assert.ok(!input1.hasCapability(16 /* EditorInputCapabilities.RequiresTrust */));
            assert.ok(!input1.hasCapability(512 /* EditorInputCapabilities.Scratchpad */));
            const input2 = instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create());
            assert.strictEqual(service.get(input2.resource), input2.model);
            // toUntyped()
            const untypedInput = input1.toUntyped({ preserveViewState: 0 });
            assert.strictEqual(untypedInput.forceUntitled, true);
            // get()
            assert.strictEqual(service.get(input1.resource), input1.model);
            assert.strictEqual(service.get(input2.resource), input2.model);
            // revert()
            await input1.revert(0);
            assert.ok(input1.isDisposed());
            assert.ok(!service.get(input1.resource));
            // dirty
            const model = await input2.resolve();
            assert.strictEqual(await service.resolve({ untitledResource: input2.resource }), model);
            assert.ok(service.get(model.resource));
            assert.ok(!input2.isDirty());
            const resourcePromise = awaitDidChangeDirty(accessor.untitledTextEditorService);
            model.textEditorModel?.setValue('foo bar');
            const resource = await resourcePromise;
            assert.strictEqual(resource.toString(), input2.resource.toString());
            assert.ok(input2.isDirty());
            const dirtyUntypedInput = input2.toUntyped({ preserveViewState: 0 });
            assert.strictEqual(dirtyUntypedInput.contents, 'foo bar');
            assert.strictEqual(dirtyUntypedInput.resource, undefined);
            const dirtyUntypedInputWithoutContent = input2.toUntyped();
            assert.strictEqual(dirtyUntypedInputWithoutContent.resource?.toString(), input2.resource.toString());
            assert.strictEqual(dirtyUntypedInputWithoutContent.contents, undefined);
            assert.ok(workingCopyService.isDirty(input2.resource));
            assert.strictEqual(workingCopyService.dirtyCount, 1);
            await input1.revert(0);
            await input2.revert(0);
            assert.ok(!service.get(input1.resource));
            assert.ok(!service.get(input2.resource));
            assert.ok(!input2.isDirty());
            assert.ok(!model.isDirty());
            assert.ok(!workingCopyService.isDirty(input2.resource));
            assert.strictEqual(workingCopyService.dirtyCount, 0);
            await input1.revert(0);
            assert.ok(input1.isDisposed());
            assert.ok(!service.get(input1.resource));
            input2.dispose();
            assert.ok(!service.get(input2.resource));
        });
        function awaitDidChangeDirty(service) {
            return new Promise(resolve => {
                const listener = service.onDidChangeDirty(async (model) => {
                    listener.dispose();
                    resolve(model.resource);
                });
            });
        }
        test('associated resource is dirty', async () => {
            const service = accessor.untitledTextEditorService;
            const file = uri_1.URI.file((0, path_1.$9d)('C:\\', '/foo/file.txt'));
            let onDidChangeDirtyModel = undefined;
            disposables.add(service.onDidChangeDirty(model => {
                onDidChangeDirtyModel = model;
            }));
            const model = disposables.add(service.create({ associatedResource: file }));
            assert.ok(accessor.untitledTextEditorService.isUntitledWithAssociatedResource(model.resource));
            const untitled = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, model));
            assert.ok(untitled.isDirty());
            assert.strictEqual(model, onDidChangeDirtyModel);
            const resolvedModel = await untitled.resolve();
            assert.ok(resolvedModel.hasAssociatedFilePath);
            assert.strictEqual(untitled.isDirty(), true);
        });
        test('no longer dirty when content gets empty (not with associated resource)', async () => {
            const service = accessor.untitledTextEditorService;
            const workingCopyService = accessor.workingCopyService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            // dirty
            const model = disposables.add(await input.resolve());
            model.textEditorModel?.setValue('foo bar');
            assert.ok(model.isDirty());
            assert.ok(workingCopyService.isDirty(model.resource, model.typeId));
            model.textEditorModel?.setValue('');
            assert.ok(!model.isDirty());
            assert.ok(!workingCopyService.isDirty(model.resource, model.typeId));
        });
        test('via create options', async () => {
            const service = accessor.untitledTextEditorService;
            const input1 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            const model1 = disposables.add(await input1.resolve());
            model1.textEditorModel.setValue('foo bar');
            assert.ok(model1.isDirty());
            model1.textEditorModel.setValue('');
            assert.ok(!model1.isDirty());
            const input2 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create({ initialValue: 'Hello World' })));
            const model2 = disposables.add(await input2.resolve());
            assert.strictEqual((0, textfiles_1.$MD)(model2.createSnapshot()), 'Hello World');
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, disposables.add(service.create())));
            const input3 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create({ untitledResource: input.resource })));
            const model3 = disposables.add(await input3.resolve());
            assert.strictEqual(model3.resource.toString(), input.resource.toString());
            const file = uri_1.URI.file((0, path_1.$9d)('C:\\', '/foo/file44.txt'));
            const input4 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create({ associatedResource: file })));
            const model4 = disposables.add(await input4.resolve());
            assert.ok(model4.hasAssociatedFilePath);
            assert.ok(model4.isDirty());
        });
        test('associated path remains dirty when content gets empty', async () => {
            const service = accessor.untitledTextEditorService;
            const file = uri_1.URI.file((0, path_1.$9d)('C:\\', '/foo/file.txt'));
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create({ associatedResource: file })));
            // dirty
            const model = disposables.add(await input.resolve());
            model.textEditorModel?.setValue('foo bar');
            assert.ok(model.isDirty());
            model.textEditorModel?.setValue('');
            assert.ok(model.isDirty());
        });
        test('initial content is dirty', async () => {
            const service = accessor.untitledTextEditorService;
            const workingCopyService = accessor.workingCopyService;
            const untitled = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create({ initialValue: 'Hello World' })));
            assert.ok(untitled.isDirty());
            const backup = (await untitled.model.backup(cancellation_1.CancellationToken.None)).content;
            if ((0, stream_1.$rd)(backup)) {
                const value = await (0, buffer_1.$Rd)(backup);
                assert.strictEqual(value.toString(), 'Hello World');
            }
            else if ((0, stream_1.$qd)(backup)) {
                const value = (0, buffer_1.$Pd)(backup);
                assert.strictEqual(value.toString(), 'Hello World');
            }
            else {
                assert.fail('Missing untitled backup');
            }
            // dirty
            const model = disposables.add(await untitled.resolve());
            assert.ok(model.isDirty());
            assert.strictEqual(workingCopyService.dirtyCount, 1);
        });
        test('created with files.defaultLanguage setting', () => {
            const defaultLanguage = 'javascript';
            const config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': defaultLanguage });
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(service.create());
            assert.strictEqual(input.getLanguageId(), defaultLanguage);
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
        });
        test('created with files.defaultLanguage setting (${activeEditorLanguage})', async () => {
            const config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': '${activeEditorLanguage}' });
            accessor.editorService.activeTextEditorLanguageId = 'typescript';
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            assert.strictEqual(model.getLanguageId(), 'typescript');
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
            accessor.editorService.activeTextEditorLanguageId = undefined;
        });
        test('created with language overrides files.defaultLanguage setting', () => {
            const language = 'typescript';
            const defaultLanguage = 'javascript';
            const config = accessor.testConfigurationService;
            config.setUserConfiguration('files', { 'defaultLanguage': defaultLanguage });
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(service.create({ languageId: language }));
            assert.strictEqual(input.getLanguageId(), language);
            config.setUserConfiguration('files', { 'defaultLanguage': undefined });
        });
        test('can change language afterwards', async () => {
            const languageId = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: languageId,
            }));
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create({ languageId: languageId })));
            assert.strictEqual(input.getLanguageId(), languageId);
            const model = disposables.add(await input.resolve());
            assert.strictEqual(model.getLanguageId(), languageId);
            input.setLanguageId(modesRegistry_1.$Yt);
            assert.strictEqual(input.getLanguageId(), modesRegistry_1.$Yt);
        });
        test('remembers that language was set explicitly', async () => {
            const language = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: language,
            }));
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, model));
            assert.ok(!input.model.hasLanguageSetExplicitly);
            input.setLanguageId(modesRegistry_1.$Yt);
            assert.ok(input.model.hasLanguageSetExplicitly);
            assert.strictEqual(input.getLanguageId(), modesRegistry_1.$Yt);
        });
        // Issue #159202
        test('remembers that language was set explicitly if set by another source (i.e. ModelService)', async () => {
            const language = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: language,
            }));
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, model));
            disposables.add(await input.resolve());
            assert.ok(!input.model.hasLanguageSetExplicitly);
            model.textEditorModel.setLanguage(accessor.languageService.createById(language));
            assert.ok(input.model.hasLanguageSetExplicitly);
            assert.strictEqual(model.getLanguageId(), language);
        });
        test('Language is not set explicitly if set by language detection source', async () => {
            const language = 'untitled-input-test';
            disposables.add(accessor.languageService.registerLanguage({
                id: language,
            }));
            const service = accessor.untitledTextEditorService;
            const model = disposables.add(service.create());
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, model));
            await input.resolve();
            assert.ok(!input.model.hasLanguageSetExplicitly);
            model.textEditorModel.setLanguage(accessor.languageService.createById(language), 
            // This is really what this is testing
            languageDetectionWorkerService_1.$AA);
            assert.ok(!input.model.hasLanguageSetExplicitly);
            assert.strictEqual(model.getLanguageId(), language);
        });
        test('service#onDidChangeEncoding', async () => {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            disposables.add(service.onDidChangeEncoding(model => {
                counter++;
                assert.strictEqual(model.resource.toString(), input.resource.toString());
            }));
            // encoding
            const model = disposables.add(await input.resolve());
            await model.setEncoding('utf16');
            assert.strictEqual(counter, 1);
        });
        test('service#onDidChangeLabel', async () => {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            disposables.add(service.onDidChangeLabel(model => {
                counter++;
                assert.strictEqual(model.resource.toString(), input.resource.toString());
            }));
            // label
            const model = disposables.add(await input.resolve());
            model.textEditorModel?.setValue('Foo Bar');
            assert.strictEqual(counter, 1);
        });
        test('service#onWillDispose', async () => {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            disposables.add(service.onWillDispose(model => {
                counter++;
                assert.strictEqual(model.resource.toString(), input.resource.toString());
            }));
            const model = disposables.add(await input.resolve());
            assert.strictEqual(counter, 0);
            model.dispose();
            assert.strictEqual(counter, 1);
        });
        test('service#getValue', async () => {
            const service = accessor.untitledTextEditorService;
            const input1 = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            const model1 = disposables.add(await input1.resolve());
            model1.textEditorModel.setValue('foo bar');
            assert.strictEqual(service.getValue(model1.resource), 'foo bar');
            model1.dispose();
            // When a model doesn't exist, it should return undefined
            assert.strictEqual(service.getValue(uri_1.URI.parse('https://www.microsoft.com')), undefined);
        });
        test('model#onDidChangeContent', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeContent(() => counter++));
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(counter, 1, 'Dirty model should trigger event');
            model.textEditorModel?.setValue('bar');
            assert.strictEqual(counter, 2, 'Content change when dirty should trigger event');
            model.textEditorModel?.setValue('');
            assert.strictEqual(counter, 3, 'Manual revert should trigger event');
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(counter, 4, 'Dirty model should trigger event');
        });
        test('model#onDidRevert and input disposed when reverted', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidRevert(() => counter++));
            model.textEditorModel?.setValue('foo');
            await model.revert();
            assert.ok(input.isDisposed());
            assert.ok(counter === 1);
        });
        test('model#onDidChangeName and input name', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            let model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeName(() => counter++));
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(input.getName(), 'foo');
            assert.strictEqual(model.name, 'foo');
            assert.strictEqual(counter, 1);
            model.textEditorModel?.setValue('bar');
            assert.strictEqual(input.getName(), 'bar');
            assert.strictEqual(model.name, 'bar');
            assert.strictEqual(counter, 2);
            model.textEditorModel?.setValue('');
            assert.strictEqual(input.getName(), 'Untitled-1');
            assert.strictEqual(model.name, 'Untitled-1');
            model.textEditorModel?.setValue('        ');
            assert.strictEqual(input.getName(), 'Untitled-1');
            assert.strictEqual(model.name, 'Untitled-1');
            model.textEditorModel?.setValue('([]}'); // require actual words
            assert.strictEqual(input.getName(), 'Untitled-1');
            assert.strictEqual(model.name, 'Untitled-1');
            model.textEditorModel?.setValue('([]}hello   '); // require actual words
            assert.strictEqual(input.getName(), '([]}hello');
            assert.strictEqual(model.name, '([]}hello');
            model.textEditorModel?.setValue('12345678901234567890123456789012345678901234567890'); // trimmed at 40chars max
            assert.strictEqual(input.getName(), '1234567890123456789012345678901234567890');
            assert.strictEqual(model.name, '1234567890123456789012345678901234567890');
            model.textEditorModel?.setValue('123456789012345678901234567890123456789🌞'); // do not break grapehems (#111235)
            assert.strictEqual(input.getName(), '123456789012345678901234567890123456789');
            assert.strictEqual(model.name, '123456789012345678901234567890123456789');
            model.textEditorModel?.setValue('hello\u202Eworld'); // do not allow RTL in names (#190133)
            assert.strictEqual(input.getName(), 'helloworld');
            assert.strictEqual(model.name, 'helloworld');
            assert.strictEqual(counter, 7);
            model.textEditorModel?.setValue('Hello\nWorld');
            assert.strictEqual(counter, 8);
            function createSingleEditOp(text, positionLineNumber, positionColumn, selectionLineNumber = positionLineNumber, selectionColumn = positionColumn) {
                const range = new range_1.$ks(selectionLineNumber, selectionColumn, positionLineNumber, positionColumn);
                return {
                    range,
                    text,
                    forceMoveMarkers: false
                };
            }
            model.textEditorModel?.applyEdits([createSingleEditOp('hello', 2, 2)]);
            assert.strictEqual(counter, 8); // change was not on first line
            input.dispose();
            model.dispose();
            const inputWithContents = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create({ initialValue: 'Foo' })));
            model = disposables.add(await inputWithContents.resolve());
            assert.strictEqual(inputWithContents.getName(), 'Foo');
        });
        test('model#onDidChangeDirty', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeDirty(() => counter++));
            model.textEditorModel?.setValue('foo');
            assert.strictEqual(counter, 1, 'Dirty model should trigger event');
            model.textEditorModel?.setValue('bar');
            assert.strictEqual(counter, 1, 'Another change does not fire event');
        });
        test('model#onDidChangeEncoding', async function () {
            const service = accessor.untitledTextEditorService;
            const input = disposables.add(instantiationService.createInstance(untitledTextEditorInput_1.$Bvb, service.create()));
            let counter = 0;
            const model = disposables.add(await input.resolve());
            disposables.add(model.onDidChangeEncoding(() => counter++));
            await model.setEncoding('utf16');
            assert.strictEqual(counter, 1, 'Dirty model should trigger event');
            await model.setEncoding('utf16');
            assert.strictEqual(counter, 1, 'Another change to same encoding does not fire event');
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=untitledTextEditor.test.js.map