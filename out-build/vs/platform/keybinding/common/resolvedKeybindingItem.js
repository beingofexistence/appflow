/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$YD = exports.$XD = void 0;
    class $XD {
        constructor(resolvedKeybinding, command, commandArgs, when, isDefault, extensionId, isBuiltinExtension) {
            this._resolvedKeybindingItemBrand = undefined;
            this.resolvedKeybinding = resolvedKeybinding;
            this.chords = resolvedKeybinding ? $YD(resolvedKeybinding.getDispatchChords()) : [];
            if (resolvedKeybinding && this.chords.length === 0) {
                // handle possible single modifier chord keybindings
                this.chords = $YD(resolvedKeybinding.getSingleModifierDispatchChords());
            }
            this.bubble = (command ? command.charCodeAt(0) === 94 /* CharCode.Caret */ : false);
            this.command = this.bubble ? command.substr(1) : command;
            this.commandArgs = commandArgs;
            this.when = when;
            this.isDefault = isDefault;
            this.extensionId = extensionId;
            this.isBuiltinExtension = isBuiltinExtension;
        }
    }
    exports.$XD = $XD;
    function $YD(arr) {
        const result = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            const element = arr[i];
            if (!element) {
                return [];
            }
            result.push(element);
        }
        return result;
    }
    exports.$YD = $YD;
});
//# sourceMappingURL=resolvedKeybindingItem.js.map