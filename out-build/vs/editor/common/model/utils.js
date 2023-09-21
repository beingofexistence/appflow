/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$XB = void 0;
    /**
     * Returns:
     *  - -1 => the line consists of whitespace
     *  - otherwise => the indent level is returned value
     */
    function $XB(line, tabSize) {
        let indent = 0;
        let i = 0;
        const len = line.length;
        while (i < len) {
            const chCode = line.charCodeAt(i);
            if (chCode === 32 /* CharCode.Space */) {
                indent++;
            }
            else if (chCode === 9 /* CharCode.Tab */) {
                indent = indent - indent % tabSize + tabSize;
            }
            else {
                break;
            }
            i++;
        }
        if (i === len) {
            return -1; // line only consists of whitespace
        }
        return indent;
    }
    exports.$XB = $XB;
});
//# sourceMappingURL=utils.js.map