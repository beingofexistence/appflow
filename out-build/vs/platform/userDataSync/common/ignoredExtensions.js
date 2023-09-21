/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/arrays", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation"], function (require, exports, arrays_1, configuration_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$QBb = exports.$PBb = void 0;
    exports.$PBb = (0, instantiation_1.$Bh)('IIgnoredExtensionsManagementService');
    let $QBb = class $QBb {
        constructor(a) {
            this.a = a;
        }
        hasToNeverSyncExtension(extensionId) {
            const configuredIgnoredExtensions = this.b();
            return configuredIgnoredExtensions.includes(extensionId.toLowerCase());
        }
        hasToAlwaysSyncExtension(extensionId) {
            const configuredIgnoredExtensions = this.b();
            return configuredIgnoredExtensions.includes(`-${extensionId.toLowerCase()}`);
        }
        updateIgnoredExtensions(ignoredExtensionId, ignore) {
            // first remove the extension completely from ignored extensions
            let currentValue = [...this.a.getValue('settingsSync.ignoredExtensions')].map(id => id.toLowerCase());
            currentValue = currentValue.filter(v => v !== ignoredExtensionId && v !== `-${ignoredExtensionId}`);
            // Add only if ignored
            if (ignore) {
                currentValue.push(ignoredExtensionId.toLowerCase());
            }
            return this.a.updateValue('settingsSync.ignoredExtensions', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
        }
        updateSynchronizedExtensions(extensionId, sync) {
            // first remove the extension completely from ignored extensions
            let currentValue = [...this.a.getValue('settingsSync.ignoredExtensions')].map(id => id.toLowerCase());
            currentValue = currentValue.filter(v => v !== extensionId && v !== `-${extensionId}`);
            // Add only if synced
            if (sync) {
                currentValue.push(`-${extensionId.toLowerCase()}`);
            }
            return this.a.updateValue('settingsSync.ignoredExtensions', currentValue.length ? currentValue : undefined, 2 /* ConfigurationTarget.USER */);
        }
        getIgnoredExtensions(installed) {
            const defaultIgnoredExtensions = installed.filter(i => i.isMachineScoped).map(i => i.identifier.id.toLowerCase());
            const value = this.b().map(id => id.toLowerCase());
            const added = [], removed = [];
            if (Array.isArray(value)) {
                for (const key of value) {
                    if (key.startsWith('-')) {
                        removed.push(key.substring(1));
                    }
                    else {
                        added.push(key);
                    }
                }
            }
            return (0, arrays_1.$Kb)([...defaultIgnoredExtensions, ...added,].filter(setting => !removed.includes(setting)));
        }
        b() {
            let userValue = this.a.inspect('settingsSync.ignoredExtensions').userValue;
            if (userValue !== undefined) {
                return userValue;
            }
            userValue = this.a.inspect('sync.ignoredExtensions').userValue;
            if (userValue !== undefined) {
                return userValue;
            }
            return (this.a.getValue('settingsSync.ignoredExtensions') || []).map(id => id.toLowerCase());
        }
    };
    exports.$QBb = $QBb;
    exports.$QBb = $QBb = __decorate([
        __param(0, configuration_1.$8h)
    ], $QBb);
});
//# sourceMappingURL=ignoredExtensions.js.map