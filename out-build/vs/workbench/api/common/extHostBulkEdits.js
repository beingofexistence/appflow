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
define(["require", "exports", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTypeConverters"], function (require, exports, extHost_protocol_1, extHostRpcService_1, extHostTypeConverters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ncc = void 0;
    let $Ncc = class $Ncc {
        constructor(extHostRpc, extHostDocumentsAndEditors) {
            this.a = extHostRpc.getProxy(extHost_protocol_1.$1J.MainThreadBulkEdits);
            this.b = {
                getTextDocumentVersion: uri => extHostDocumentsAndEditors.getDocument(uri)?.version,
                getNotebookDocumentVersion: () => undefined
            };
        }
        applyWorkspaceEdit(edit, extension, metadata) {
            const dto = extHostTypeConverters_1.WorkspaceEdit.from(edit, this.b);
            return this.a.$tryApplyWorkspaceEdit(dto, undefined, metadata?.isRefactoring ?? false);
        }
    };
    exports.$Ncc = $Ncc;
    exports.$Ncc = $Ncc = __decorate([
        __param(0, extHostRpcService_1.$2L)
    ], $Ncc);
});
//# sourceMappingURL=extHostBulkEdits.js.map