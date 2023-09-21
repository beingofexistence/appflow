/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$BU = exports.$AU = void 0;
    class $AU {
        static { this.items = []; }
        constructor(key, migrate) {
            this.key = key;
            this.migrate = migrate;
        }
        apply(options) {
            const value = $AU.a(options, this.key);
            const read = (key) => $AU.a(options, key);
            const write = (key, value) => $AU.b(options, key, value);
            this.migrate(value, read, write);
        }
        static a(source, key) {
            if (typeof source === 'undefined') {
                return undefined;
            }
            const firstDotIndex = key.indexOf('.');
            if (firstDotIndex >= 0) {
                const firstSegment = key.substring(0, firstDotIndex);
                return this.a(source[firstSegment], key.substring(firstDotIndex + 1));
            }
            return source[key];
        }
        static b(target, key, value) {
            const firstDotIndex = key.indexOf('.');
            if (firstDotIndex >= 0) {
                const firstSegment = key.substring(0, firstDotIndex);
                target[firstSegment] = target[firstSegment] || {};
                this.b(target[firstSegment], key.substring(firstDotIndex + 1), value);
                return;
            }
            target[key] = value;
        }
    }
    exports.$AU = $AU;
    function registerEditorSettingMigration(key, migrate) {
        $AU.items.push(new $AU(key, migrate));
    }
    function registerSimpleEditorSettingMigration(key, values) {
        registerEditorSettingMigration(key, (value, read, write) => {
            if (typeof value !== 'undefined') {
                for (const [oldValue, newValue] of values) {
                    if (value === oldValue) {
                        write(key, newValue);
                        return;
                    }
                }
            }
        });
    }
    /**
     * Compatibility with old options
     */
    function $BU(options) {
        $AU.items.forEach(migration => migration.apply(options));
    }
    exports.$BU = $BU;
    registerSimpleEditorSettingMigration('wordWrap', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('lineNumbers', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('cursorBlinking', [['visible', 'solid']]);
    registerSimpleEditorSettingMigration('renderWhitespace', [[true, 'boundary'], [false, 'none']]);
    registerSimpleEditorSettingMigration('renderLineHighlight', [[true, 'line'], [false, 'none']]);
    registerSimpleEditorSettingMigration('acceptSuggestionOnEnter', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('tabCompletion', [[false, 'off'], [true, 'onlySnippets']]);
    registerSimpleEditorSettingMigration('hover', [[true, { enabled: true }], [false, { enabled: false }]]);
    registerSimpleEditorSettingMigration('parameterHints', [[true, { enabled: true }], [false, { enabled: false }]]);
    registerSimpleEditorSettingMigration('autoIndent', [[false, 'advanced'], [true, 'full']]);
    registerSimpleEditorSettingMigration('matchBrackets', [[true, 'always'], [false, 'never']]);
    registerSimpleEditorSettingMigration('renderFinalNewline', [[true, 'on'], [false, 'off']]);
    registerSimpleEditorSettingMigration('cursorSmoothCaretAnimation', [[true, 'on'], [false, 'off']]);
    registerEditorSettingMigration('autoClosingBrackets', (value, read, write) => {
        if (value === false) {
            write('autoClosingBrackets', 'never');
            if (typeof read('autoClosingQuotes') === 'undefined') {
                write('autoClosingQuotes', 'never');
            }
            if (typeof read('autoSurround') === 'undefined') {
                write('autoSurround', 'never');
            }
        }
    });
    registerEditorSettingMigration('renderIndentGuides', (value, read, write) => {
        if (typeof value !== 'undefined') {
            write('renderIndentGuides', undefined);
            if (typeof read('guides.indentation') === 'undefined') {
                write('guides.indentation', !!value);
            }
        }
    });
    registerEditorSettingMigration('highlightActiveIndentGuide', (value, read, write) => {
        if (typeof value !== 'undefined') {
            write('highlightActiveIndentGuide', undefined);
            if (typeof read('guides.highlightActiveIndentation') === 'undefined') {
                write('guides.highlightActiveIndentation', !!value);
            }
        }
    });
    const suggestFilteredTypesMapping = {
        method: 'showMethods',
        function: 'showFunctions',
        constructor: 'showConstructors',
        deprecated: 'showDeprecated',
        field: 'showFields',
        variable: 'showVariables',
        class: 'showClasses',
        struct: 'showStructs',
        interface: 'showInterfaces',
        module: 'showModules',
        property: 'showProperties',
        event: 'showEvents',
        operator: 'showOperators',
        unit: 'showUnits',
        value: 'showValues',
        constant: 'showConstants',
        enum: 'showEnums',
        enumMember: 'showEnumMembers',
        keyword: 'showKeywords',
        text: 'showWords',
        color: 'showColors',
        file: 'showFiles',
        reference: 'showReferences',
        folder: 'showFolders',
        typeParameter: 'showTypeParameters',
        snippet: 'showSnippets',
    };
    registerEditorSettingMigration('suggest.filteredTypes', (value, read, write) => {
        if (value && typeof value === 'object') {
            for (const entry of Object.entries(suggestFilteredTypesMapping)) {
                const v = value[entry[0]];
                if (v === false) {
                    if (typeof read(`suggest.${entry[1]}`) === 'undefined') {
                        write(`suggest.${entry[1]}`, false);
                    }
                }
            }
            write('suggest.filteredTypes', undefined);
        }
    });
    registerEditorSettingMigration('quickSuggestions', (input, read, write) => {
        if (typeof input === 'boolean') {
            const value = input ? 'on' : 'off';
            const newValue = { comments: value, strings: value, other: value };
            write('quickSuggestions', newValue);
        }
    });
    // Sticky Scroll
    registerEditorSettingMigration('experimental.stickyScroll.enabled', (value, read, write) => {
        if (typeof value === 'boolean') {
            write('experimental.stickyScroll.enabled', undefined);
            if (typeof read('stickyScroll.enabled') === 'undefined') {
                write('stickyScroll.enabled', value);
            }
        }
    });
    registerEditorSettingMigration('experimental.stickyScroll.maxLineCount', (value, read, write) => {
        if (typeof value === 'number') {
            write('experimental.stickyScroll.maxLineCount', undefined);
            if (typeof read('stickyScroll.maxLineCount') === 'undefined') {
                write('stickyScroll.maxLineCount', value);
            }
        }
    });
});
//# sourceMappingURL=migrateOptions.js.map