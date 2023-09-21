/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/editor/common/core/position", "vs/editor/common/model"], function (require, exports, assert_1, position_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HU = exports.$GU = exports.$FU = void 0;
    /**
     * *input*:
     * ```
     * xxxxxxxxxxxxxxxxxxxxxxxxxxx
     * ```
     *
     * -> Applying injections `[i...i]`, *inputWithInjections*:
     * ```
     * xxxxxx[iiiiiiiiii]xxxxxxxxxxxxxxxxx[ii]xxxx
     * ```
     *
     * -> breaking at offsets `|` in `xxxxxx[iiiiiii|iii]xxxxxxxxxxx|xxxxxx[ii]xxxx|`:
     * ```
     * xxxxxx[iiiiiii
     * iii]xxxxxxxxxxx
     * xxxxxx[ii]xxxx
     * ```
     *
     * -> applying wrappedTextIndentLength, *output*:
     * ```
     * xxxxxx[iiiiiii
     *    iii]xxxxxxxxxxx
     *    xxxxxx[ii]xxxx
     * ```
     */
    class $FU {
        constructor(injectionOffsets, 
        /**
         * `injectionOptions.length` must equal `injectionOffsets.length`
         */
        injectionOptions, 
        /**
         * Refers to offsets after applying injections to the source.
         * The last break offset indicates the length of the source after applying injections.
         */
        breakOffsets, 
        /**
         * Refers to offsets after applying injections
         */
        breakOffsetsVisibleColumn, wrappedTextIndentLength) {
            this.injectionOffsets = injectionOffsets;
            this.injectionOptions = injectionOptions;
            this.breakOffsets = breakOffsets;
            this.breakOffsetsVisibleColumn = breakOffsetsVisibleColumn;
            this.wrappedTextIndentLength = wrappedTextIndentLength;
        }
        getOutputLineCount() {
            return this.breakOffsets.length;
        }
        getMinOutputOffset(outputLineIndex) {
            if (outputLineIndex > 0) {
                return this.wrappedTextIndentLength;
            }
            return 0;
        }
        getLineLength(outputLineIndex) {
            // These offsets refer to model text with injected text.
            const startOffset = outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0;
            const endOffset = this.breakOffsets[outputLineIndex];
            let lineLength = endOffset - startOffset;
            if (outputLineIndex > 0) {
                lineLength += this.wrappedTextIndentLength;
            }
            return lineLength;
        }
        getMaxOutputOffset(outputLineIndex) {
            return this.getLineLength(outputLineIndex);
        }
        translateToInputOffset(outputLineIndex, outputOffset) {
            if (outputLineIndex > 0) {
                outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
            }
            const offsetInInputWithInjection = outputLineIndex === 0 ? outputOffset : this.breakOffsets[outputLineIndex - 1] + outputOffset;
            let offsetInInput = offsetInInputWithInjection;
            if (this.injectionOffsets !== null) {
                for (let i = 0; i < this.injectionOffsets.length; i++) {
                    if (offsetInInput > this.injectionOffsets[i]) {
                        if (offsetInInput < this.injectionOffsets[i] + this.injectionOptions[i].content.length) {
                            // `inputOffset` is within injected text
                            offsetInInput = this.injectionOffsets[i];
                        }
                        else {
                            offsetInInput -= this.injectionOptions[i].content.length;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return offsetInInput;
        }
        translateToOutputPosition(inputOffset, affinity = 2 /* PositionAffinity.None */) {
            let inputOffsetInInputWithInjection = inputOffset;
            if (this.injectionOffsets !== null) {
                for (let i = 0; i < this.injectionOffsets.length; i++) {
                    if (inputOffset < this.injectionOffsets[i]) {
                        break;
                    }
                    if (affinity !== 1 /* PositionAffinity.Right */ && inputOffset === this.injectionOffsets[i]) {
                        break;
                    }
                    inputOffsetInInputWithInjection += this.injectionOptions[i].content.length;
                }
            }
            return this.a(inputOffsetInInputWithInjection, affinity);
        }
        a(offsetInInputWithInjections, affinity = 2 /* PositionAffinity.None */) {
            let low = 0;
            let high = this.breakOffsets.length - 1;
            let mid = 0;
            let midStart = 0;
            while (low <= high) {
                mid = low + ((high - low) / 2) | 0;
                const midStop = this.breakOffsets[mid];
                midStart = mid > 0 ? this.breakOffsets[mid - 1] : 0;
                if (affinity === 0 /* PositionAffinity.Left */) {
                    if (offsetInInputWithInjections <= midStart) {
                        high = mid - 1;
                    }
                    else if (offsetInInputWithInjections > midStop) {
                        low = mid + 1;
                    }
                    else {
                        break;
                    }
                }
                else {
                    if (offsetInInputWithInjections < midStart) {
                        high = mid - 1;
                    }
                    else if (offsetInInputWithInjections >= midStop) {
                        low = mid + 1;
                    }
                    else {
                        break;
                    }
                }
            }
            let outputOffset = offsetInInputWithInjections - midStart;
            if (mid > 0) {
                outputOffset += this.wrappedTextIndentLength;
            }
            return new $HU(mid, outputOffset);
        }
        normalizeOutputPosition(outputLineIndex, outputOffset, affinity) {
            if (this.injectionOffsets !== null) {
                const offsetInInputWithInjections = this.b(outputLineIndex, outputOffset);
                const normalizedOffsetInUnwrappedLine = this.c(offsetInInputWithInjections, affinity);
                if (normalizedOffsetInUnwrappedLine !== offsetInInputWithInjections) {
                    // injected text caused a change
                    return this.a(normalizedOffsetInUnwrappedLine, affinity);
                }
            }
            if (affinity === 0 /* PositionAffinity.Left */) {
                if (outputLineIndex > 0 && outputOffset === this.getMinOutputOffset(outputLineIndex)) {
                    return new $HU(outputLineIndex - 1, this.getMaxOutputOffset(outputLineIndex - 1));
                }
            }
            else if (affinity === 1 /* PositionAffinity.Right */) {
                const maxOutputLineIndex = this.getOutputLineCount() - 1;
                if (outputLineIndex < maxOutputLineIndex && outputOffset === this.getMaxOutputOffset(outputLineIndex)) {
                    return new $HU(outputLineIndex + 1, this.getMinOutputOffset(outputLineIndex + 1));
                }
            }
            return new $HU(outputLineIndex, outputOffset);
        }
        b(outputLineIndex, outputOffset) {
            if (outputLineIndex > 0) {
                outputOffset = Math.max(0, outputOffset - this.wrappedTextIndentLength);
            }
            const result = (outputLineIndex > 0 ? this.breakOffsets[outputLineIndex - 1] : 0) + outputOffset;
            return result;
        }
        c(offsetInInputWithInjections, affinity) {
            const injectedText = this.d(offsetInInputWithInjections);
            if (!injectedText) {
                return offsetInInputWithInjections;
            }
            if (affinity === 2 /* PositionAffinity.None */) {
                if (offsetInInputWithInjections === injectedText.offsetInInputWithInjections + injectedText.length
                    && hasRightCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
                    return injectedText.offsetInInputWithInjections + injectedText.length;
                }
                else {
                    let result = injectedText.offsetInInputWithInjections;
                    if (hasLeftCursorStop(this.injectionOptions[injectedText.injectedTextIndex].cursorStops)) {
                        return result;
                    }
                    let index = injectedText.injectedTextIndex - 1;
                    while (index >= 0 && this.injectionOffsets[index] === this.injectionOffsets[injectedText.injectedTextIndex]) {
                        if (hasRightCursorStop(this.injectionOptions[index].cursorStops)) {
                            break;
                        }
                        result -= this.injectionOptions[index].content.length;
                        if (hasLeftCursorStop(this.injectionOptions[index].cursorStops)) {
                            break;
                        }
                        index--;
                    }
                    return result;
                }
            }
            else if (affinity === 1 /* PositionAffinity.Right */ || affinity === 4 /* PositionAffinity.RightOfInjectedText */) {
                let result = injectedText.offsetInInputWithInjections + injectedText.length;
                let index = injectedText.injectedTextIndex;
                // traverse all injected text that touch each other
                while (index + 1 < this.injectionOffsets.length && this.injectionOffsets[index + 1] === this.injectionOffsets[index]) {
                    result += this.injectionOptions[index + 1].content.length;
                    index++;
                }
                return result;
            }
            else if (affinity === 0 /* PositionAffinity.Left */ || affinity === 3 /* PositionAffinity.LeftOfInjectedText */) {
                // affinity is left
                let result = injectedText.offsetInInputWithInjections;
                let index = injectedText.injectedTextIndex;
                // traverse all injected text that touch each other
                while (index - 1 >= 0 && this.injectionOffsets[index - 1] === this.injectionOffsets[index]) {
                    result -= this.injectionOptions[index - 1].content.length;
                    index--;
                }
                return result;
            }
            (0, assert_1.$vc)(affinity);
        }
        getInjectedText(outputLineIndex, outputOffset) {
            const offset = this.b(outputLineIndex, outputOffset);
            const injectedText = this.d(offset);
            if (!injectedText) {
                return null;
            }
            return {
                options: this.injectionOptions[injectedText.injectedTextIndex]
            };
        }
        d(offsetInInputWithInjections) {
            const injectionOffsets = this.injectionOffsets;
            const injectionOptions = this.injectionOptions;
            if (injectionOffsets !== null) {
                let totalInjectedTextLengthBefore = 0;
                for (let i = 0; i < injectionOffsets.length; i++) {
                    const length = injectionOptions[i].content.length;
                    const injectedTextStartOffsetInInputWithInjections = injectionOffsets[i] + totalInjectedTextLengthBefore;
                    const injectedTextEndOffsetInInputWithInjections = injectionOffsets[i] + totalInjectedTextLengthBefore + length;
                    if (injectedTextStartOffsetInInputWithInjections > offsetInInputWithInjections) {
                        // Injected text starts later.
                        break; // All later injected texts have an even larger offset.
                    }
                    if (offsetInInputWithInjections <= injectedTextEndOffsetInInputWithInjections) {
                        // Injected text ends after or with the given position (but also starts with or before it).
                        return {
                            injectedTextIndex: i,
                            offsetInInputWithInjections: injectedTextStartOffsetInInputWithInjections,
                            length
                        };
                    }
                    totalInjectedTextLengthBefore += length;
                }
            }
            return undefined;
        }
    }
    exports.$FU = $FU;
    function hasRightCursorStop(cursorStop) {
        if (cursorStop === null || cursorStop === undefined) {
            return true;
        }
        return cursorStop === model_1.InjectedTextCursorStops.Right || cursorStop === model_1.InjectedTextCursorStops.Both;
    }
    function hasLeftCursorStop(cursorStop) {
        if (cursorStop === null || cursorStop === undefined) {
            return true;
        }
        return cursorStop === model_1.InjectedTextCursorStops.Left || cursorStop === model_1.InjectedTextCursorStops.Both;
    }
    class $GU {
        constructor(options) {
            this.options = options;
        }
    }
    exports.$GU = $GU;
    class $HU {
        constructor(outputLineIndex, outputOffset) {
            this.outputLineIndex = outputLineIndex;
            this.outputOffset = outputOffset;
        }
        toString() {
            return `${this.outputLineIndex}:${this.outputOffset}`;
        }
        toPosition(baseLineNumber) {
            return new position_1.$js(baseLineNumber + this.outputLineIndex, this.outputOffset + 1);
        }
    }
    exports.$HU = $HU;
});
//# sourceMappingURL=modelLineProjectionData.js.map