/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/strings", "vs/base/test/common/utils", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/test/common/core/testLineToken"], function (require, exports, assert, strings, utils_1, lineDecorations_1, viewLineRenderer_1, testLineToken_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createViewLineTokens(viewLineTokens) {
        return new testLineToken_1.TestLineTokens(viewLineTokens);
    }
    function createPart(endIndex, foreground) {
        return new testLineToken_1.TestLineToken(endIndex, (foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */) >>> 0);
    }
    function inflateRenderLineOutput(renderLineOutput) {
        // remove encompassing <span> to simplify test writing.
        let html = renderLineOutput.html;
        if (html.startsWith('<span>')) {
            html = html.replace(/^<span>/, '');
        }
        html = html.replace(/<\/span>$/, '');
        const spans = [];
        let lastIndex = 0;
        do {
            const newIndex = html.indexOf('<span', lastIndex + 1);
            if (newIndex === -1) {
                break;
            }
            spans.push(html.substring(lastIndex, newIndex));
            lastIndex = newIndex;
        } while (true);
        spans.push(html.substring(lastIndex));
        return {
            html: spans,
            mapping: renderLineOutput.characterMapping.inflate(),
        };
    }
    suite('viewLineRenderer.renderLine', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function assertCharacterReplacement(lineContent, tabSize, expected, expectedCharOffsetInPart) {
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineContent, false, strings.isBasicASCII(lineContent), false, 0, createViewLineTokens([new testLineToken_1.TestLineToken(lineContent.length, 0)]), [], tabSize, 0, 0, 0, 0, -1, 'none', false, false, null));
            assert.strictEqual(_actual.html, '<span><span class="mtk0">' + expected + '</span></span>');
            const info = expectedCharOffsetInPart.map((absoluteOffset) => [absoluteOffset, [0, absoluteOffset]]);
            assertCharacterMapping3(_actual.characterMapping, info);
        }
        test('replaces spaces', () => {
            assertCharacterReplacement(' ', 4, '\u00a0', [0, 1]);
            assertCharacterReplacement('  ', 4, '\u00a0\u00a0', [0, 1, 2]);
            assertCharacterReplacement('a  b', 4, 'a\u00a0\u00a0b', [0, 1, 2, 3, 4]);
        });
        test('escapes HTML markup', () => {
            assertCharacterReplacement('a<b', 4, 'a&lt;b', [0, 1, 2, 3]);
            assertCharacterReplacement('a>b', 4, 'a&gt;b', [0, 1, 2, 3]);
            assertCharacterReplacement('a&b', 4, 'a&amp;b', [0, 1, 2, 3]);
        });
        test('replaces some bad characters', () => {
            assertCharacterReplacement('a\0b', 4, 'a&#00;b', [0, 1, 2, 3]);
            assertCharacterReplacement('a' + String.fromCharCode(65279 /* CharCode.UTF8_BOM */) + 'b', 4, 'a\ufffdb', [0, 1, 2, 3]);
            assertCharacterReplacement('a\u2028b', 4, 'a\ufffdb', [0, 1, 2, 3]);
        });
        test('handles tabs', () => {
            assertCharacterReplacement('\t', 4, '\u00a0\u00a0\u00a0\u00a0', [0, 4]);
            assertCharacterReplacement('x\t', 4, 'x\u00a0\u00a0\u00a0', [0, 1, 4]);
            assertCharacterReplacement('xx\t', 4, 'xx\u00a0\u00a0', [0, 1, 2, 4]);
            assertCharacterReplacement('xxx\t', 4, 'xxx\u00a0', [0, 1, 2, 3, 4]);
            assertCharacterReplacement('xxxx\t', 4, 'xxxx\u00a0\u00a0\u00a0\u00a0', [0, 1, 2, 3, 4, 8]);
        });
        function assertParts(lineContent, tabSize, parts, expected, info) {
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineContent, false, true, false, 0, createViewLineTokens(parts), [], tabSize, 0, 0, 0, 0, -1, 'none', false, false, null));
            assert.strictEqual(_actual.html, '<span>' + expected + '</span>');
            assertCharacterMapping3(_actual.characterMapping, info);
        }
        test('empty line', () => {
            assertParts('', 4, [], '<span></span>', []);
        });
        test('uses part type', () => {
            assertParts('x', 4, [createPart(1, 10)], '<span class="mtk10">x</span>', [[0, [0, 0]], [1, [0, 1]]]);
            assertParts('x', 4, [createPart(1, 20)], '<span class="mtk20">x</span>', [[0, [0, 0]], [1, [0, 1]]]);
            assertParts('x', 4, [createPart(1, 30)], '<span class="mtk30">x</span>', [[0, [0, 0]], [1, [0, 1]]]);
        });
        test('two parts', () => {
            assertParts('xy', 4, [createPart(1, 1), createPart(2, 2)], '<span class="mtk1">x</span><span class="mtk2">y</span>', [[0, [0, 0]], [1, [1, 0]], [2, [1, 1]]]);
            assertParts('xyz', 4, [createPart(1, 1), createPart(3, 2)], '<span class="mtk1">x</span><span class="mtk2">yz</span>', [[0, [0, 0]], [1, [1, 0]], [2, [1, 1]], [3, [1, 2]]]);
            assertParts('xyz', 4, [createPart(2, 1), createPart(3, 2)], '<span class="mtk1">xy</span><span class="mtk2">z</span>', [[0, [0, 0]], [1, [0, 1]], [2, [1, 0]], [3, [1, 1]]]);
        });
        test('overflow', () => {
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, 'Hello world!', false, true, false, 0, createViewLineTokens([
                createPart(1, 0),
                createPart(2, 1),
                createPart(3, 2),
                createPart(4, 3),
                createPart(5, 4),
                createPart(6, 5),
                createPart(7, 6),
                createPart(8, 7),
                createPart(9, 8),
                createPart(10, 9),
                createPart(11, 10),
                createPart(12, 11),
            ]), [], 4, 0, 10, 10, 10, 6, 'boundary', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), {
                html: [
                    '<span class="mtk0">H</span>',
                    '<span class="mtk1">e</span>',
                    '<span class="mtk2">l</span>',
                    '<span class="mtk3">l</span>',
                    '<span class="mtk4">o</span>',
                    '<span class="mtk5">\u00a0</span>',
                    '<span class="mtkoverflow">Show more (6 chars)</span>'
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1],
                    [2, 0, 2],
                    [3, 0, 3],
                    [4, 0, 4],
                    [5, 0, 5],
                    [5, 1, 6],
                ]
            });
        });
        test('typical line', () => {
            const lineText = '\t    export class Game { // http://test.com     ';
            const lineParts = createViewLineTokens([
                createPart(5, 1),
                createPart(11, 2),
                createPart(12, 3),
                createPart(17, 4),
                createPart(18, 5),
                createPart(22, 6),
                createPart(23, 7),
                createPart(24, 8),
                createPart(25, 9),
                createPart(28, 10),
                createPart(43, 11),
                createPart(48, 12),
            ]);
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, true, false, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'boundary', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), {
                html: [
                    '<span class="mtkz" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">export</span>',
                    '<span class="mtk3">\u00a0</span>',
                    '<span class="mtk4">class</span>',
                    '<span class="mtk5">\u00a0</span>',
                    '<span class="mtk6">Game</span>',
                    '<span class="mtk7">\u00a0</span>',
                    '<span class="mtk8">{</span>',
                    '<span class="mtk9">\u00a0</span>',
                    '<span class="mtk10">//\u00a0</span>',
                    '<span class="mtk11">http://test.com</span>',
                    '<span class="mtkz" style="width:20px">\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:30px">\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>'
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 4], [1, 2, 5], [1, 4, 6], [1, 6, 7],
                    [2, 0, 8], [2, 1, 9], [2, 2, 10], [2, 3, 11], [2, 4, 12], [2, 5, 13],
                    [3, 0, 14],
                    [4, 0, 15], [4, 1, 16], [4, 2, 17], [4, 3, 18], [4, 4, 19],
                    [5, 0, 20],
                    [6, 0, 21], [6, 1, 22], [6, 2, 23], [6, 3, 24],
                    [7, 0, 25],
                    [8, 0, 26],
                    [9, 0, 27],
                    [10, 0, 28], [10, 1, 29], [10, 2, 30],
                    [11, 0, 31], [11, 1, 32], [11, 2, 33], [11, 3, 34], [11, 4, 35], [11, 5, 36], [11, 6, 37], [11, 7, 38], [11, 8, 39], [11, 9, 40], [11, 10, 41], [11, 11, 42], [11, 12, 43], [11, 13, 44], [11, 14, 45],
                    [12, 0, 46], [12, 2, 47],
                    [13, 0, 48], [13, 2, 49], [13, 4, 50], [13, 6, 51],
                ]
            });
        });
        test('issue #2255: Weird line rendering part 1', () => {
            const lineText = '\t\t\tcursorStyle:\t\t\t\t\t\t(prevOpts.cursorStyle !== newOpts.cursorStyle),';
            const lineParts = createViewLineTokens([
                createPart(3, 1),
                createPart(15, 2),
                createPart(21, 3),
                createPart(22, 4),
                createPart(43, 5),
                createPart(45, 6),
                createPart(46, 7),
                createPart(66, 8),
                createPart(67, 9),
                createPart(68, 10), // 2 chars
            ]);
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, true, false, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), {
                html: [
                    '<span class="mtk1">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk2">cursorStyle:</span>',
                    '<span class="mtk3">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk4">(</span>',
                    '<span class="mtk5">prevOpts.cursorStyle\u00a0</span>',
                    '<span class="mtk6">!=</span>',
                    '<span class="mtk7">=</span>',
                    '<span class="mtk8">\u00a0newOpts.cursorStyle</span>',
                    '<span class="mtk9">)</span>',
                    '<span class="mtk10">,</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 4, 4], [0, 8, 8],
                    [1, 0, 12], [1, 1, 13], [1, 2, 14], [1, 3, 15], [1, 4, 16], [1, 5, 17], [1, 6, 18], [1, 7, 19], [1, 8, 20], [1, 9, 21], [1, 10, 22], [1, 11, 23],
                    [2, 0, 24], [2, 4, 28], [2, 8, 32], [2, 12, 36], [2, 16, 40], [2, 20, 44],
                    [3, 0, 48],
                    [4, 0, 49], [4, 1, 50], [4, 2, 51], [4, 3, 52], [4, 4, 53], [4, 5, 54], [4, 6, 55], [4, 7, 56], [4, 8, 57], [4, 9, 58], [4, 10, 59], [4, 11, 60], [4, 12, 61], [4, 13, 62], [4, 14, 63], [4, 15, 64], [4, 16, 65], [4, 17, 66], [4, 18, 67], [4, 19, 68], [4, 20, 69],
                    [5, 0, 70], [5, 1, 71],
                    [6, 0, 72],
                    [7, 0, 73], [7, 1, 74], [7, 2, 75], [7, 3, 76], [7, 4, 77], [7, 5, 78], [7, 6, 79], [7, 7, 80], [7, 8, 81], [7, 9, 82], [7, 10, 83], [7, 11, 84], [7, 12, 85], [7, 13, 86], [7, 14, 87], [7, 15, 88], [7, 16, 89], [7, 17, 90], [7, 18, 91], [7, 19, 92],
                    [8, 0, 93],
                    [9, 0, 94], [9, 1, 95],
                ]
            });
        });
        test('issue #2255: Weird line rendering part 2', () => {
            const lineText = ' \t\t\tcursorStyle:\t\t\t\t\t\t(prevOpts.cursorStyle !== newOpts.cursorStyle),';
            const lineParts = createViewLineTokens([
                createPart(4, 1),
                createPart(16, 2),
                createPart(22, 3),
                createPart(23, 4),
                createPart(44, 5),
                createPart(46, 6),
                createPart(47, 7),
                createPart(67, 8),
                createPart(68, 9),
                createPart(69, 10), // 2 chars
            ]);
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, true, false, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), {
                html: [
                    '<span class="mtk1">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk2">cursorStyle:</span>',
                    '<span class="mtk3">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk4">(</span>',
                    '<span class="mtk5">prevOpts.cursorStyle\u00a0</span>',
                    '<span class="mtk6">!=</span>',
                    '<span class="mtk7">=</span>',
                    '<span class="mtk8">\u00a0newOpts.cursorStyle</span>',
                    '<span class="mtk9">)</span>',
                    '<span class="mtk10">,</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 4, 4], [0, 8, 8],
                    [1, 0, 12], [1, 1, 13], [1, 2, 14], [1, 3, 15], [1, 4, 16], [1, 5, 17], [1, 6, 18], [1, 7, 19], [1, 8, 20], [1, 9, 21], [1, 10, 22], [1, 11, 23],
                    [2, 0, 24], [2, 4, 28], [2, 8, 32], [2, 12, 36], [2, 16, 40], [2, 20, 44],
                    [3, 0, 48], [4, 0, 49], [4, 1, 50], [4, 2, 51], [4, 3, 52], [4, 4, 53], [4, 5, 54], [4, 6, 55], [4, 7, 56], [4, 8, 57], [4, 9, 58], [4, 10, 59], [4, 11, 60], [4, 12, 61], [4, 13, 62], [4, 14, 63], [4, 15, 64], [4, 16, 65], [4, 17, 66], [4, 18, 67], [4, 19, 68], [4, 20, 69],
                    [5, 0, 70], [5, 1, 71],
                    [6, 0, 72],
                    [7, 0, 73], [7, 1, 74], [7, 2, 75], [7, 3, 76], [7, 4, 77], [7, 5, 78], [7, 6, 79], [7, 7, 80], [7, 8, 81], [7, 9, 82], [7, 10, 83], [7, 11, 84], [7, 12, 85], [7, 13, 86], [7, 14, 87], [7, 15, 88], [7, 16, 89], [7, 17, 90], [7, 18, 91], [7, 19, 92],
                    [8, 0, 93],
                    [9, 0, 94], [9, 1, 95],
                ],
            });
        });
        test('issue #91178: after decoration type shown before cursor', () => {
            const lineText = '//just a comment';
            const lineParts = createViewLineTokens([
                createPart(16, 1)
            ]);
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, false, lineText, false, true, false, 0, lineParts, [
                new lineDecorations_1.LineDecoration(13, 13, 'dec1', 2 /* InlineDecorationType.After */),
                new lineDecorations_1.LineDecoration(13, 13, 'dec2', 1 /* InlineDecorationType.Before */),
            ], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), ({
                html: [
                    '<span class="mtk1">//just\u00a0a\u00a0com</span>',
                    '<span class="mtk1 dec2"></span>',
                    '<span class="mtk1 dec1"></span>',
                    '<span class="mtk1">ment</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7], [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11],
                    [2, 0, 12],
                    [3, 1, 13], [3, 2, 14], [3, 3, 15], [3, 4, 16]
                ]
            }));
        });
        test('issue microsoft/monaco-editor#280: Improved source code rendering for RTL languages', () => {
            const lineText = 'var קודמות = \"מיותר קודמות צ\'ט של, אם לשון העברית שינויים ויש, אם\";';
            const lineParts = createViewLineTokens([
                createPart(3, 6),
                createPart(13, 1),
                createPart(66, 20),
                createPart(67, 1),
            ]);
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, false, true, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), ({
                html: [
                    '<span dir="ltr">',
                    '<span class="mtk6">var</span>',
                    '<span style="unicode-bidi:isolate" class="mtk1">\u00a0קודמות\u00a0=\u00a0</span>',
                    '<span style="unicode-bidi:isolate" class="mtk20">"מיותר\u00a0קודמות\u00a0צ\'ט\u00a0של,\u00a0אם\u00a0לשון\u00a0העברית\u00a0שינויים\u00a0ויש,\u00a0אם"</span>',
                    '<span class="mtk1">;</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2],
                    [1, 0, 3], [1, 1, 4], [1, 2, 5], [1, 3, 6], [1, 4, 7], [1, 5, 8], [1, 6, 9], [1, 7, 10], [1, 8, 11], [1, 9, 12],
                    [2, 0, 13], [2, 1, 14], [2, 2, 15], [2, 3, 16], [2, 4, 17], [2, 5, 18], [2, 6, 19], [2, 7, 20], [2, 8, 21], [2, 9, 22], [2, 10, 23], [2, 11, 24], [2, 12, 25], [2, 13, 26], [2, 14, 27], [2, 15, 28], [2, 16, 29], [2, 17, 30], [2, 18, 31], [2, 19, 32], [2, 20, 33], [2, 21, 34], [2, 22, 35], [2, 23, 36], [2, 24, 37], [2, 25, 38], [2, 26, 39], [2, 27, 40], [2, 28, 41], [2, 29, 42], [2, 30, 43], [2, 31, 44], [2, 32, 45], [2, 33, 46], [2, 34, 47], [2, 35, 48], [2, 36, 49], [2, 37, 50], [2, 38, 51], [2, 39, 52], [2, 40, 53], [2, 41, 54], [2, 42, 55], [2, 43, 56], [2, 44, 57], [2, 45, 58], [2, 46, 59], [2, 47, 60], [2, 48, 61], [2, 49, 62], [2, 50, 63], [2, 51, 64], [2, 52, 65],
                    [3, 0, 66], [3, 1, 67]
                ]
            }));
            assert.strictEqual(_actual.containsRTL, true);
        });
        test('issue #137036: Issue in RTL languages in recent versions', () => {
            const lineText = '<option value=\"العربية\">العربية</option>';
            const lineParts = createViewLineTokens([
                createPart(1, 2),
                createPart(7, 3),
                createPart(8, 4),
                createPart(13, 5),
                createPart(14, 4),
                createPart(23, 6),
                createPart(24, 2),
                createPart(31, 4),
                createPart(33, 2),
                createPart(39, 3),
                createPart(40, 2),
            ]);
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, false, true, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), ({
                html: [
                    '<span dir="ltr">',
                    '<span class="mtk2">&lt;</span>',
                    '<span class="mtk3">option</span>',
                    '<span class="mtk4">\u00a0</span>',
                    '<span class="mtk5">value</span>',
                    '<span class="mtk4">=</span>',
                    '<span style="unicode-bidi:isolate" class="mtk6">"العربية"</span>',
                    '<span class="mtk2">&gt;</span>',
                    '<span style="unicode-bidi:isolate" class="mtk4">العربية</span>',
                    '<span class="mtk2">&lt;/</span>',
                    '<span class="mtk3">option</span>',
                    '<span class="mtk2">&gt;</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1], [1, 1, 2], [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 6],
                    [2, 0, 7],
                    [3, 0, 8], [3, 1, 9], [3, 2, 10], [3, 3, 11], [3, 4, 12],
                    [4, 0, 13],
                    [5, 0, 14], [5, 1, 15], [5, 2, 16], [5, 3, 17], [5, 4, 18], [5, 5, 19], [5, 6, 20], [5, 7, 21], [5, 8, 22],
                    [6, 0, 23],
                    [7, 0, 24], [7, 1, 25], [7, 2, 26], [7, 3, 27], [7, 4, 28], [7, 5, 29], [7, 6, 30],
                    [8, 0, 31], [8, 1, 32],
                    [9, 0, 33], [9, 1, 34], [9, 2, 35], [9, 3, 36], [9, 4, 37], [9, 5, 38],
                    [10, 0, 39], [10, 1, 40]
                ]
            }));
            assert.strictEqual(_actual.containsRTL, true);
        });
        test('issue #99589: Rendering whitespace influences bidi layout', () => {
            const lineText = '    [\"🖨️ چاپ فاکتور\",\"🎨 تنظیمات\"]';
            const lineParts = createViewLineTokens([
                createPart(5, 2),
                createPart(21, 3),
                createPart(22, 2),
                createPart(34, 3),
                createPart(35, 2),
            ]);
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, lineText, false, false, true, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'all', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), ({
                html: [
                    '<span dir="ltr">',
                    '<span class="mtkw">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">[</span>',
                    '<span style="unicode-bidi:isolate" class="mtk3">"🖨️\u00a0چاپ\u00a0فاکتور"</span>',
                    '<span class="mtk2">,</span>',
                    '<span style="unicode-bidi:isolate" class="mtk3">"🎨\u00a0تنظیمات"</span>',
                    '<span class="mtk2">]</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 2, 1], [0, 4, 2], [0, 6, 3],
                    [1, 0, 4],
                    [2, 0, 5], [2, 1, 6], [2, 2, 7], [2, 3, 8], [2, 4, 9], [2, 5, 10], [2, 6, 11], [2, 7, 12], [2, 8, 13], [2, 9, 14], [2, 10, 15], [2, 11, 16], [2, 12, 17], [2, 13, 18], [2, 14, 19], [2, 15, 20],
                    [3, 0, 21],
                    [4, 0, 22], [4, 1, 23], [4, 2, 24], [4, 3, 25], [4, 4, 26], [4, 5, 27], [4, 6, 28], [4, 7, 29], [4, 8, 30], [4, 9, 31], [4, 10, 32], [4, 11, 33],
                    [5, 0, 34], [5, 1, 35]
                ]
            }));
            assert.strictEqual(_actual.containsRTL, true);
        });
        test('issue #6885: Splits large tokens', () => {
            //                                                                                                                  1         1         1
            //                        1         2         3         4         5         6         7         8         9         0         1         2
            //               1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
            const _lineText = 'This is just a long line that contains very interesting text. This is just a long line that contains very interesting text.';
            function assertSplitsTokens(message, lineText, expectedOutput) {
                const lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
                const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, true, false, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
                assert.strictEqual(actual.html, '<span>' + expectedOutput.join('') + '</span>', message);
            }
            // A token with 49 chars
            {
                assertSplitsTokens('49 chars', _lineText.substr(0, 49), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0inter</span>',
                ]);
            }
            // A token with 50 chars
            {
                assertSplitsTokens('50 chars', _lineText.substr(0, 50), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                ]);
            }
            // A token with 51 chars
            {
                assertSplitsTokens('51 chars', _lineText.substr(0, 51), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">s</span>',
                ]);
            }
            // A token with 99 chars
            {
                assertSplitsTokens('99 chars', _lineText.substr(0, 99), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">sting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contain</span>',
                ]);
            }
            // A token with 100 chars
            {
                assertSplitsTokens('100 chars', _lineText.substr(0, 100), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">sting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains</span>',
                ]);
            }
            // A token with 101 chars
            {
                assertSplitsTokens('101 chars', _lineText.substr(0, 101), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0intere</span>',
                    '<span class="mtk1">sting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains</span>',
                    '<span class="mtk1">\u00a0</span>',
                ]);
            }
        });
        test('issue #21476: Does not split large tokens when ligatures are on', () => {
            //                                                                                                                  1         1         1
            //                        1         2         3         4         5         6         7         8         9         0         1         2
            //               1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234
            const _lineText = 'This is just a long line that contains very interesting text. This is just a long line that contains very interesting text.';
            function assertSplitsTokens(message, lineText, expectedOutput) {
                const lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
                const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, true, false, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, true, null));
                assert.strictEqual(actual.html, '<span>' + expectedOutput.join('') + '</span>', message);
            }
            // A token with 101 chars
            {
                assertSplitsTokens('101 chars', _lineText.substr(0, 101), [
                    '<span class="mtk1">This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0contains\u00a0very\u00a0</span>',
                    '<span class="mtk1">interesting\u00a0text.\u00a0This\u00a0is\u00a0just\u00a0a\u00a0long\u00a0line\u00a0that\u00a0</span>',
                    '<span class="mtk1">contains\u00a0</span>',
                ]);
            }
        });
        test('issue #20624: Unaligned surrogate pairs are corrupted at multiples of 50 columns', () => {
            const lineText = 'a𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷';
            const lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, false, false, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual).html, [
                '<span class="mtk1">a𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷𠮷</span>',
            ]);
        });
        test('issue #6885: Does not split large tokens in RTL text', () => {
            const lineText = 'את גרמנית בהתייחסות שמו, שנתי המשפט אל חפש, אם כתב אחרים ולחבר. של התוכן אודות בויקיפדיה כלל, של עזרה כימיה היא. על עמוד יוצרים מיתולוגיה סדר, אם שכל שתפו לעברית שינויים, אם שאלות אנגלית עזה. שמות בקלות מה סדר.';
            const lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, false, true, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(actual.html, [
                '<span dir="ltr">',
                '<span style="unicode-bidi:isolate" class="mtk1">את\u00a0גרמנית\u00a0בהתייחסות\u00a0שמו,\u00a0שנתי\u00a0המשפט\u00a0אל\u00a0חפש,\u00a0אם\u00a0כתב\u00a0אחרים\u00a0ולחבר.\u00a0של\u00a0התוכן\u00a0אודות\u00a0בויקיפדיה\u00a0כלל,\u00a0של\u00a0עזרה\u00a0כימיה\u00a0היא.\u00a0על\u00a0עמוד\u00a0יוצרים\u00a0מיתולוגיה\u00a0סדר,\u00a0אם\u00a0שכל\u00a0שתפו\u00a0לעברית\u00a0שינויים,\u00a0אם\u00a0שאלות\u00a0אנגלית\u00a0עזה.\u00a0שמות\u00a0בקלות\u00a0מה\u00a0סדר.</span>',
                '</span>'
            ].join(''));
            assert.strictEqual(actual.containsRTL, true);
        });
        test('issue #95685: Uses unicode replacement character for Paragraph Separator', () => {
            const lineText = 'var ftext = [\u2029"Und", "dann", "eines"];';
            const lineParts = createViewLineTokens([createPart(lineText.length, 1)]);
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineText, false, false, false, 0, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), ({
                html: [
                    '<span class="mtk1">var\u00a0ftext\u00a0=\u00a0[\uFFFD"Und",\u00a0"dann",\u00a0"eines"];</span>'
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21],
                    [0, 22, 22], [0, 23, 23], [0, 24, 24], [0, 25, 25], [0, 26, 26], [0, 27, 27], [0, 28, 28],
                    [0, 29, 29], [0, 30, 30], [0, 31, 31], [0, 32, 32], [0, 33, 33], [0, 34, 34], [0, 35, 35],
                    [0, 36, 36], [0, 37, 37], [0, 38, 38]
                ]
            }));
        });
        test('issue #19673: Monokai Theme bad-highlighting in line wrap', () => {
            const lineText = '    MongoCallback<string>): void {';
            const lineParts = createViewLineTokens([
                createPart(17, 1),
                createPart(18, 2),
                createPart(24, 3),
                createPart(26, 4),
                createPart(27, 5),
                createPart(28, 6),
                createPart(32, 7),
                createPart(34, 8),
            ]);
            const _actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, lineText, false, true, false, 4, lineParts, [], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(_actual), ({
                html: [
                    '<span class="">\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk1">MongoCallback</span>',
                    '<span class="mtk2">&lt;</span>',
                    '<span class="mtk3">string</span>',
                    '<span class="mtk4">&gt;)</span>',
                    '<span class="mtk5">:</span>',
                    '<span class="mtk6">\u00a0</span>',
                    '<span class="mtk7">void</span>',
                    '<span class="mtk8">\u00a0{</span>'
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3],
                    [1, 0, 4], [1, 1, 5], [1, 2, 6], [1, 3, 7], [1, 4, 8], [1, 5, 9], [1, 6, 10], [1, 7, 11], [1, 8, 12], [1, 9, 13], [1, 10, 14], [1, 11, 15], [1, 12, 16],
                    [2, 0, 17],
                    [3, 0, 18], [3, 1, 19], [3, 2, 20], [3, 3, 21], [3, 4, 22], [3, 5, 23],
                    [4, 0, 24], [4, 1, 25],
                    [5, 0, 26],
                    [6, 0, 27],
                    [7, 0, 28], [7, 1, 29], [7, 2, 30], [7, 3, 31],
                    [8, 0, 32], [8, 1, 33], [8, 2, 34]
                ]
            }));
        });
    });
    function assertCharacterMapping3(actual, expectedInfo) {
        for (let i = 0; i < expectedInfo.length; i++) {
            const [horizontalOffset, [partIndex, charIndex]] = expectedInfo[i];
            const actualDomPosition = actual.getDomPosition(i + 1);
            assert.deepStrictEqual(actualDomPosition, new viewLineRenderer_1.DomPosition(partIndex, charIndex), `getDomPosition(${i + 1})`);
            let partLength = charIndex + 1;
            for (let j = i + 1; j < expectedInfo.length; j++) {
                const [, [nextPartIndex, nextCharIndex]] = expectedInfo[j];
                if (nextPartIndex === partIndex) {
                    partLength = nextCharIndex + 1;
                }
                else {
                    break;
                }
            }
            const actualColumn = actual.getColumn(new viewLineRenderer_1.DomPosition(partIndex, charIndex), partLength);
            assert.strictEqual(actualColumn, i + 1, `actual.getColumn(${partIndex}, ${charIndex})`);
            const actualHorizontalOffset = actual.getHorizontalOffset(i + 1);
            assert.strictEqual(actualHorizontalOffset, horizontalOffset, `actual.getHorizontalOffset(${i + 1})`);
        }
        assert.strictEqual(actual.length, expectedInfo.length, `length mismatch`);
    }
    suite('viewLineRenderer.renderLine 2', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        function testCreateLineParts(fontIsMonospace, lineContent, tokens, fauxIndentLength, renderWhitespace, selections) {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(fontIsMonospace, true, lineContent, false, true, false, fauxIndentLength, createViewLineTokens(tokens), [], 4, 0, 10, 10, 10, -1, renderWhitespace, false, false, selections));
            return inflateRenderLineOutput(actual);
        }
        test('issue #18616: Inline decorations ending at the text length are no longer rendered', () => {
            const lineContent = 'https://microsoft.com';
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineContent, false, true, false, 0, createViewLineTokens([createPart(21, 3)]), [new lineDecorations_1.LineDecoration(1, 22, 'link', 0 /* InlineDecorationType.Regular */)], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), ({
                html: [
                    '<span class="mtk3 link">https://microsoft.com</span>'
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21]
                ]
            }));
        });
        test('issue #19207: Link in Monokai is not rendered correctly', () => {
            const lineContent = '\'let url = `http://***/_api/web/lists/GetByTitle(\\\'Teambuildingaanvragen\\\')/items`;\'';
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, lineContent, false, true, false, 0, createViewLineTokens([
                createPart(49, 6),
                createPart(51, 4),
                createPart(72, 6),
                createPart(74, 4),
                createPart(84, 6),
            ]), [
                new lineDecorations_1.LineDecoration(13, 51, 'detected-link', 0 /* InlineDecorationType.Regular */)
            ], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), ({
                html: [
                    '<span class="mtk6">\'let\u00a0url\u00a0=\u00a0`</span>',
                    '<span class="mtk6 detected-link">http://***/_api/web/lists/GetByTitle(</span>',
                    '<span class="mtk4 detected-link">\\</span>',
                    '<span class="mtk4">\'</span>',
                    '<span class="mtk6">Teambuildingaanvragen</span>',
                    '<span class="mtk4">\\\'</span>',
                    '<span class="mtk6">)/items`;\'</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7], [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11],
                    [1, 0, 12], [1, 1, 13], [1, 2, 14], [1, 3, 15], [1, 4, 16], [1, 5, 17], [1, 6, 18], [1, 7, 19], [1, 8, 20], [1, 9, 21], [1, 10, 22], [1, 11, 23], [1, 12, 24], [1, 13, 25], [1, 14, 26], [1, 15, 27], [1, 16, 28], [1, 17, 29], [1, 18, 30], [1, 19, 31], [1, 20, 32], [1, 21, 33], [1, 22, 34], [1, 23, 35], [1, 24, 36], [1, 25, 37], [1, 26, 38], [1, 27, 39], [1, 28, 40], [1, 29, 41], [1, 30, 42], [1, 31, 43], [1, 32, 44], [1, 33, 45], [1, 34, 46], [1, 35, 47], [1, 36, 48],
                    [2, 0, 49],
                    [3, 0, 50],
                    [4, 0, 51], [4, 1, 52], [4, 2, 53], [4, 3, 54], [4, 4, 55], [4, 5, 56], [4, 6, 57], [4, 7, 58], [4, 8, 59], [4, 9, 60], [4, 10, 61], [4, 11, 62], [4, 12, 63], [4, 13, 64], [4, 14, 65], [4, 15, 66], [4, 16, 67], [4, 17, 68], [4, 18, 69], [4, 19, 70], [4, 20, 71],
                    [5, 0, 72], [5, 1, 73],
                    [6, 0, 74], [6, 1, 75], [6, 2, 76], [6, 3, 77], [6, 4, 78], [6, 5, 79], [6, 6, 80], [6, 7, 81], [6, 8, 82], [6, 9, 83], [6, 10, 84]
                ]
            }));
        });
        test('createLineParts simple', () => {
            assert.deepStrictEqual(testCreateLineParts(false, 'Hello world!', [
                createPart(12, 1)
            ], 0, 'none', null), {
                html: [
                    '<span class="mtk1">Hello\u00a0world!</span>'
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7], [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12]
                ]
            });
        });
        test('createLineParts simple two tokens', () => {
            assert.deepStrictEqual(testCreateLineParts(false, 'Hello world!', [
                createPart(6, 1),
                createPart(12, 2)
            ], 0, 'none', null), {
                html: [
                    '<span class="mtk1">Hello\u00a0</span>',
                    '<span class="mtk2">world!</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5],
                    [1, 0, 6], [1, 1, 7], [1, 2, 8], [1, 3, 9], [1, 4, 10], [1, 5, 11], [1, 6, 12]
                ]
            });
        });
        test('createLineParts render whitespace - 4 leading spaces', () => {
            assert.deepStrictEqual(testCreateLineParts(false, '    Hello world!    ', [
                createPart(4, 1),
                createPart(6, 2),
                createPart(20, 3)
            ], 0, 'boundary', null), {
                html: [
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">He</span>',
                    '<span class="mtk3">llo\u00a0world!</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 2, 1], [0, 4, 2], [0, 6, 3],
                    [1, 0, 4], [1, 1, 5],
                    [2, 0, 6], [2, 1, 7], [2, 2, 8], [2, 3, 9], [2, 4, 10], [2, 5, 11], [2, 6, 12], [2, 7, 13], [2, 8, 14], [2, 9, 15],
                    [3, 0, 16], [3, 2, 17], [3, 4, 18], [3, 6, 19], [3, 8, 20]
                ]
            });
        });
        test('createLineParts render whitespace - 8 leading spaces', () => {
            assert.deepStrictEqual(testCreateLineParts(false, '        Hello world!        ', [
                createPart(8, 1),
                createPart(10, 2),
                createPart(28, 3)
            ], 0, 'boundary', null), {
                html: [
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">He</span>',
                    '<span class="mtk3">llo\u00a0world!</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 2, 1], [0, 4, 2], [0, 6, 3],
                    [1, 0, 4], [1, 2, 5], [1, 4, 6], [1, 6, 7],
                    [2, 0, 8], [2, 1, 9],
                    [3, 0, 10], [3, 1, 11], [3, 2, 12], [3, 3, 13], [3, 4, 14], [3, 5, 15], [3, 6, 16], [3, 7, 17], [3, 8, 18], [3, 9, 19],
                    [4, 0, 20], [4, 2, 21], [4, 4, 22], [4, 6, 23],
                    [5, 0, 24], [5, 2, 25], [5, 4, 26], [5, 6, 27], [5, 8, 28]
                ]
            });
        });
        test('createLineParts render whitespace - 2 leading tabs', () => {
            assert.deepStrictEqual(testCreateLineParts(false, '\t\tHello world!\t', [
                createPart(2, 1),
                createPart(4, 2),
                createPart(15, 3)
            ], 0, 'boundary', null), {
                html: [
                    '<span class="mtkz" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                    '<span class="mtkz" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk2">He</span>',
                    '<span class="mtk3">llo\u00a0world!</span>',
                    '<span class="mtkz" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 4],
                    [2, 0, 8], [2, 1, 9],
                    [3, 0, 10], [3, 1, 11], [3, 2, 12], [3, 3, 13], [3, 4, 14], [3, 5, 15], [3, 6, 16], [3, 7, 17], [3, 8, 18], [3, 9, 19],
                    [4, 0, 20], [4, 4, 24]
                ]
            });
        });
        test('createLineParts render whitespace - mixed leading spaces and tabs', () => {
            assert.deepStrictEqual(testCreateLineParts(false, '  \t\t  Hello world! \t  \t   \t    ', [
                createPart(6, 1),
                createPart(8, 2),
                createPart(31, 3)
            ], 0, 'boundary', null), {
                html: [
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u2192\u00a0</span>',
                    '<span class="mtkz" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                    '<span class="mtkz" style="width:20px">\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">He</span>',
                    '<span class="mtk3">llo\u00a0world!</span>',
                    '<span class="mtkz" style="width:20px">\u00b7\u200c\uffeb</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u2192\u00a0</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\uffeb</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 2, 1], [0, 4, 2],
                    [1, 0, 4],
                    [2, 0, 8], [2, 2, 9],
                    [3, 0, 10], [3, 1, 11],
                    [4, 0, 12], [4, 1, 13], [4, 2, 14], [4, 3, 15], [4, 4, 16], [4, 5, 17], [4, 6, 18], [4, 7, 19], [4, 8, 20], [4, 9, 21],
                    [5, 0, 22], [5, 2, 23],
                    [6, 0, 24], [6, 2, 25], [6, 4, 26],
                    [7, 0, 28], [7, 2, 29], [7, 4, 30], [7, 6, 31],
                    [8, 0, 32], [8, 2, 33], [8, 4, 34], [8, 6, 35], [8, 8, 36]
                ]
            });
        });
        test('createLineParts render whitespace skips faux indent', () => {
            assert.deepStrictEqual(testCreateLineParts(false, '\t\t  Hello world! \t  \t   \t    ', [
                createPart(4, 1),
                createPart(6, 2),
                createPart(29, 3)
            ], 2, 'boundary', null), {
                html: [
                    '<span class="">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtkz" style="width:20px">\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">He</span>',
                    '<span class="mtk3">llo\u00a0world!</span>',
                    '<span class="mtkz" style="width:20px">\u00b7\u200c\uffeb</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u2192\u00a0</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\uffeb</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 4, 4],
                    [1, 0, 8], [1, 2, 9],
                    [2, 0, 10], [2, 1, 11],
                    [3, 0, 12], [3, 1, 13], [3, 2, 14], [3, 3, 15], [3, 4, 16], [3, 5, 17], [3, 6, 18], [3, 7, 19], [3, 8, 20], [3, 9, 21],
                    [4, 0, 22], [4, 2, 23],
                    [5, 0, 24], [5, 2, 25], [5, 4, 26],
                    [6, 0, 28], [6, 2, 29], [6, 4, 30], [6, 6, 31],
                    [7, 0, 32], [7, 2, 33], [7, 4, 34], [7, 6, 35], [7, 8, 36]
                ]
            });
        });
        test('createLineParts does not emit width for monospace fonts', () => {
            assert.deepStrictEqual(testCreateLineParts(true, '\t\t  Hello world! \t  \t   \t    ', [
                createPart(4, 1),
                createPart(6, 2),
                createPart(29, 3)
            ], 2, 'boundary', null), {
                html: [
                    '<span class="">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtkw">\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">He</span>',
                    '<span class="mtk3">llo\u00a0world!</span>',
                    '<span class="mtkw">\u00b7\u200c\uffeb\u00b7\u200c\u00b7\u200c\u2192\u00a0\u00b7\u200c\u00b7\u200c\u00b7\u200c\uffeb\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 4, 4],
                    [1, 0, 8], [1, 2, 9],
                    [2, 0, 10], [2, 1, 11],
                    [3, 0, 12], [3, 1, 13], [3, 2, 14], [3, 3, 15], [3, 4, 16], [3, 5, 17], [3, 6, 18], [3, 7, 19], [3, 8, 20], [3, 9, 21],
                    [4, 0, 22], [4, 2, 23], [4, 3, 24], [4, 5, 25], [4, 7, 26], [4, 9, 28], [4, 11, 29], [4, 13, 30], [4, 15, 31], [4, 16, 32], [4, 18, 33], [4, 20, 34], [4, 22, 35], [4, 24, 36]
                ]
            });
        });
        test('createLineParts render whitespace in middle but not for one space', () => {
            assert.deepStrictEqual(testCreateLineParts(false, 'it  it it  it', [
                createPart(6, 1),
                createPart(7, 2),
                createPart(13, 3)
            ], 0, 'boundary', null), {
                html: [
                    '<span class="mtk1">it</span>',
                    '<span class="mtkz" style="width:20px">\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk1">it</span>',
                    '<span class="mtk2">\u00a0</span>',
                    '<span class="mtk3">it</span>',
                    '<span class="mtkz" style="width:20px">\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk3">it</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1],
                    [1, 0, 2], [1, 2, 3],
                    [2, 0, 4], [2, 1, 5],
                    [3, 0, 6],
                    [4, 0, 7], [4, 1, 8],
                    [5, 0, 9], [5, 2, 10],
                    [6, 0, 11], [6, 1, 12], [6, 2, 13]
                ]
            });
        });
        test('createLineParts render whitespace for all in middle', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world!\t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'all', null), {
                html: [
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk0">Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk2">world!</span>',
                    '<span class="mtkz" style="width:30px">\u2192\u00a0\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1], [1, 1, 2], [1, 2, 3],
                    [2, 0, 4], [2, 1, 5],
                    [3, 0, 6],
                    [4, 0, 7], [4, 1, 8], [4, 2, 9], [4, 3, 10], [4, 4, 11], [4, 5, 12],
                    [5, 0, 13], [5, 3, 16]
                ]
            });
        });
        test('createLineParts render whitespace for selection with no selections', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world!\t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'selection', null), {
                html: [
                    '<span class="mtk0">\u00a0Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtk2">\u00a0world!\u00a0\u00a0\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3],
                    [1, 0, 4], [1, 1, 5],
                    [2, 0, 6], [2, 1, 7], [2, 2, 8], [2, 3, 9], [2, 4, 10], [2, 5, 11], [2, 6, 12], [2, 7, 13], [2, 10, 16]
                ]
            });
        });
        test('createLineParts render whitespace for selection with whole line selection', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world!\t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'selection', [new viewLineRenderer_1.LineRange(0, 14)]), {
                html: [
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk0">Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk2">world!</span>',
                    '<span class="mtkz" style="width:30px">\u2192\u00a0\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1], [1, 1, 2], [1, 2, 3],
                    [2, 0, 4], [2, 1, 5],
                    [3, 0, 6],
                    [4, 0, 7], [4, 1, 8], [4, 2, 9], [4, 3, 10], [4, 4, 11], [4, 5, 12],
                    [5, 0, 13], [5, 3, 16]
                ]
            });
        });
        test('createLineParts render whitespace for selection with selection spanning part of whitespace', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world!\t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'selection', [new viewLineRenderer_1.LineRange(0, 5)]), {
                html: [
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk0">Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtk2">\u00a0world!\u00a0\u00a0\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1], [1, 1, 2], [1, 2, 3],
                    [2, 0, 4], [2, 1, 5],
                    [3, 0, 6], [3, 1, 7], [3, 2, 8], [3, 3, 9], [3, 4, 10], [3, 5, 11], [3, 6, 12], [3, 7, 13], [3, 10, 16]
                ]
            });
        });
        test('createLineParts render whitespace for selection with multiple selections', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world!\t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'selection', [new viewLineRenderer_1.LineRange(0, 5), new viewLineRenderer_1.LineRange(9, 14)]), {
                html: [
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk0">Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtk2">\u00a0world!</span>',
                    '<span class="mtkz" style="width:30px">\u2192\u00a0\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1], [1, 1, 2], [1, 2, 3],
                    [2, 0, 4], [2, 1, 5],
                    [3, 0, 6], [3, 1, 7], [3, 2, 8], [3, 3, 9], [3, 4, 10], [3, 5, 11], [3, 6, 12],
                    [4, 0, 13], [4, 3, 16]
                ]
            });
        });
        test('createLineParts render whitespace for selection with multiple, initially unsorted selections', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world!\t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'selection', [new viewLineRenderer_1.LineRange(9, 14), new viewLineRenderer_1.LineRange(0, 5)]), {
                html: [
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk0">Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtk2">\u00a0world!</span>',
                    '<span class="mtkz" style="width:30px">\u2192\u00a0\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1], [1, 1, 2], [1, 2, 3],
                    [2, 0, 4], [2, 1, 5],
                    [3, 0, 6], [3, 1, 7], [3, 2, 8], [3, 3, 9], [3, 4, 10], [3, 5, 11], [3, 6, 12],
                    [4, 0, 13], [4, 3, 16]
                ]
            });
        });
        test('createLineParts render whitespace for selection with selections next to each other', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' * S', [
                createPart(4, 0)
            ], 0, 'selection', [new viewLineRenderer_1.LineRange(0, 1), new viewLineRenderer_1.LineRange(1, 2), new viewLineRenderer_1.LineRange(2, 3)]), {
                html: [
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk0">*</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk0">S</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1],
                    [2, 0, 2],
                    [3, 0, 3], [3, 1, 4]
                ]
            });
        });
        test('createLineParts render whitespace for trailing with leading, inner, and without trailing whitespace', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world!', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(14, 2)
            ], 0, 'trailing', null), {
                html: [
                    '<span class="mtk0">\u00a0Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtk2">\u00a0world!</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3],
                    [1, 0, 4], [1, 1, 5],
                    [2, 0, 6], [2, 1, 7], [2, 2, 8], [2, 3, 9], [2, 4, 10], [2, 5, 11], [2, 6, 12], [2, 7, 13]
                ]
            });
        });
        test('createLineParts render whitespace for trailing with leading, inner, and trailing whitespace', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' Hello world! \t', [
                createPart(4, 0),
                createPart(6, 1),
                createPart(15, 2)
            ], 0, 'trailing', null), {
                html: [
                    '<span class="mtk0">\u00a0Hel</span>',
                    '<span class="mtk1">lo</span>',
                    '<span class="mtk2">\u00a0world!</span>',
                    '<span class="mtkz" style="width:30px">\u00b7\u200c\u2192\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3],
                    [1, 0, 4], [1, 1, 5],
                    [2, 0, 6], [2, 1, 7], [2, 2, 8], [2, 3, 9], [2, 4, 10], [2, 5, 11], [2, 6, 12],
                    [3, 0, 13], [3, 2, 14], [3, 4, 16]
                ]
            });
        });
        test('createLineParts render whitespace for trailing with 8 leading and 8 trailing whitespaces', () => {
            assert.deepStrictEqual(testCreateLineParts(false, '        Hello world!        ', [
                createPart(8, 1),
                createPart(10, 2),
                createPart(28, 3)
            ], 0, 'trailing', null), {
                html: [
                    '<span class="mtk1">\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk2">He</span>',
                    '<span class="mtk3">llo\u00a0world!</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [1, 0, 8], [1, 1, 9],
                    [2, 0, 10], [2, 1, 11], [2, 2, 12], [2, 3, 13], [2, 4, 14], [2, 5, 15], [2, 6, 16], [2, 7, 17], [2, 8, 18], [2, 9, 19],
                    [3, 0, 20], [3, 2, 21], [3, 4, 22], [3, 6, 23],
                    [4, 0, 24], [4, 2, 25], [4, 4, 26], [4, 6, 27], [4, 8, 28]
                ]
            });
        });
        test('createLineParts render whitespace for trailing with line containing only whitespaces', () => {
            assert.deepStrictEqual(testCreateLineParts(false, ' \t ', [
                createPart(2, 0),
                createPart(3, 1),
            ], 0, 'trailing', null), {
                html: [
                    '<span class="mtkz" style="width:40px">\u00b7\u200c\u2192\u00a0\u00a0</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 2, 1],
                    [1, 0, 4], [1, 2, 5]
                ]
            });
        });
        test('createLineParts can handle unsorted inline decorations', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, 'Hello world', false, true, false, 0, createViewLineTokens([createPart(11, 0)]), [
                new lineDecorations_1.LineDecoration(5, 7, 'a', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(1, 3, 'b', 0 /* InlineDecorationType.Regular */),
                new lineDecorations_1.LineDecoration(2, 8, 'c', 0 /* InlineDecorationType.Regular */),
            ], 4, 0, 10, 10, 10, -1, 'none', false, false, null));
            // 01234567890
            // Hello world
            // ----aa-----
            // bb---------
            // -cccccc----
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk0 b">H</span>',
                    '<span class="mtk0 b c">e</span>',
                    '<span class="mtk0 c">ll</span>',
                    '<span class="mtk0 a c">o\u00a0</span>',
                    '<span class="mtk0 c">w</span>',
                    '<span class="mtk0">orld</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1],
                    [2, 0, 2], [2, 1, 3],
                    [3, 0, 4], [3, 1, 5],
                    [4, 0, 6],
                    [5, 0, 7], [5, 1, 8], [5, 2, 9], [5, 3, 10], [5, 4, 11]
                ]
            });
        });
        test('issue #11485: Visible whitespace conflicts with before decorator attachment', () => {
            const lineContent = '\tbla';
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineContent, false, true, false, 0, createViewLineTokens([createPart(4, 3)]), [new lineDecorations_1.LineDecoration(1, 2, 'before', 1 /* InlineDecorationType.Before */)], 4, 0, 10, 10, 10, -1, 'all', false, true, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtkw before">\u2192\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk3">bla</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 4], [1, 1, 5], [1, 2, 6], [1, 3, 7]
                ]
            });
        });
        test('issue #32436: Non-monospace font + visible whitespace + After decorator causes line to "jump"', () => {
            const lineContent = '\tbla';
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineContent, false, true, false, 0, createViewLineTokens([createPart(4, 3)]), [new lineDecorations_1.LineDecoration(2, 3, 'before', 1 /* InlineDecorationType.Before */)], 4, 0, 10, 10, 10, -1, 'all', false, true, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtkz" style="width:40px">\u2192\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk3 before">b</span>',
                    '<span class="mtk3">la</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 4],
                    [2, 0, 5], [2, 1, 6], [2, 2, 7]
                ]
            });
        });
        test('issue #30133: Empty lines don\'t render inline decorations', () => {
            const lineContent = '';
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineContent, false, true, false, 0, createViewLineTokens([createPart(0, 3)]), [new lineDecorations_1.LineDecoration(1, 2, 'before', 1 /* InlineDecorationType.Before */)], 4, 0, 10, 10, 10, -1, 'all', false, true, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="before"></span>',
                ],
                mapping: [
                    [1, 0, 0]
                ]
            });
        });
        test('issue #37208: Collapsing bullet point containing emoji in Markdown document results in [??] character', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, '  1. 🙏', false, false, false, 0, createViewLineTokens([createPart(7, 3)]), [new lineDecorations_1.LineDecoration(7, 8, 'inline-folded', 2 /* InlineDecorationType.After */)], 2, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">\u00a0\u00a01.\u00a0</span>',
                    '<span class="mtk3 inline-folded">🙏</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4],
                    [1, 0, 5], [1, 1, 6], [1, 2, 7]
                ]
            });
        });
        test('issue #37401 #40127: Allow both before and after decorations on empty line', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, '', false, true, false, 0, createViewLineTokens([createPart(0, 3)]), [
                new lineDecorations_1.LineDecoration(1, 1, 'before', 1 /* InlineDecorationType.Before */),
                new lineDecorations_1.LineDecoration(1, 1, 'after', 2 /* InlineDecorationType.After */),
            ], 2, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="before"></span>',
                    '<span class="after"></span>',
                ],
                mapping: [
                    [1, 0, 0]
                ]
            });
        });
        test('issue #118759: enable multiple text editor decorations in empty lines', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, '', false, true, false, 0, createViewLineTokens([createPart(0, 3)]), [
                new lineDecorations_1.LineDecoration(1, 1, 'after1', 2 /* InlineDecorationType.After */),
                new lineDecorations_1.LineDecoration(1, 1, 'after2', 2 /* InlineDecorationType.After */),
                new lineDecorations_1.LineDecoration(1, 1, 'before1', 1 /* InlineDecorationType.Before */),
                new lineDecorations_1.LineDecoration(1, 1, 'before2', 1 /* InlineDecorationType.Before */),
            ], 2, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="before1"></span>',
                    '<span class="before2"></span>',
                    '<span class="after1"></span>',
                    '<span class="after2"></span>',
                ],
                mapping: [
                    [2, 0, 0]
                ]
            });
        });
        test('issue #38935: GitLens end-of-line blame no longer rendering', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, '\t}', false, true, false, 0, createViewLineTokens([createPart(2, 3)]), [
                new lineDecorations_1.LineDecoration(3, 3, 'ced-TextEditorDecorationType2-5e9b9b3f-3 ced-TextEditorDecorationType2-3', 1 /* InlineDecorationType.Before */),
                new lineDecorations_1.LineDecoration(3, 3, 'ced-TextEditorDecorationType2-5e9b9b3f-4 ced-TextEditorDecorationType2-4', 2 /* InlineDecorationType.After */),
            ], 4, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">\u00a0\u00a0\u00a0\u00a0}</span>',
                    '<span class="ced-TextEditorDecorationType2-5e9b9b3f-3 ced-TextEditorDecorationType2-3"></span>',
                    '<span class="ced-TextEditorDecorationType2-5e9b9b3f-4 ced-TextEditorDecorationType2-4"></span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 4, 4],
                    [2, 0, 5]
                ]
            });
        });
        test('issue #136622: Inline decorations are not rendering on non-ASCII lines when renderControlCharacters is on', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, 'some text £', false, false, false, 0, createViewLineTokens([createPart(11, 3)]), [
                new lineDecorations_1.LineDecoration(5, 5, 'inlineDec1', 2 /* InlineDecorationType.After */),
                new lineDecorations_1.LineDecoration(6, 6, 'inlineDec2', 1 /* InlineDecorationType.Before */),
            ], 4, 0, 10, 10, 10, 10000, 'none', true, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">some</span>',
                    '<span class="mtk3 inlineDec1"></span>',
                    '<span class="mtk3">\u00a0</span>',
                    '<span class="mtk3 inlineDec2"></span>',
                    '<span class="mtk3">text\u00a0£</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3],
                    [1, 0, 4],
                    [4, 0, 5], [4, 1, 6], [4, 2, 7], [4, 3, 8], [4, 4, 9], [4, 5, 10], [4, 6, 11]
                ]
            });
        });
        test('issue #22832: Consider fullwidth characters when rendering tabs', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, 'asd = "擦"\t\t#asd', false, false, false, 0, createViewLineTokens([createPart(15, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">asd\u00a0=\u00a0"擦"\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0#asd</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7], [0, 8, 9],
                    [0, 9, 10], [0, 11, 12], [0, 15, 16], [0, 16, 17], [0, 17, 18], [0, 18, 19], [0, 19, 20]
                ]
            });
        });
        test('issue #22832: Consider fullwidth characters when rendering tabs (render whitespace)', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, 'asd = "擦"\t\t#asd', false, false, false, 0, createViewLineTokens([createPart(15, 3)]), [], 4, 0, 10, 10, 10, 10000, 'all', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">asd</span>',
                    '<span class="mtkw">\u00b7\u200c</span>',
                    '<span class="mtk3">=</span>',
                    '<span class="mtkw">\u00b7\u200c</span>',
                    '<span class="mtk3">"擦"</span>',
                    '<span class="mtkw">\u2192\u00a0\u2192\u00a0\u00a0\u00a0</span>',
                    '<span class="mtk3">#asd</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2],
                    [1, 0, 3],
                    [2, 0, 4],
                    [3, 0, 5],
                    [4, 0, 6], [4, 1, 7], [4, 2, 9],
                    [5, 0, 10], [5, 2, 12],
                    [6, 0, 16], [6, 1, 17], [6, 2, 18], [6, 3, 19], [6, 4, 20]
                ]
            });
        });
        test('issue #22352: COMBINING ACUTE ACCENT (U+0301)', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, '12345689012345678901234568901234567890123456890abába', false, false, false, 0, createViewLineTokens([createPart(53, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">12345689012345678901234568901234567890123456890abába</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21],
                    [0, 22, 22], [0, 23, 23], [0, 24, 24], [0, 25, 25], [0, 26, 26], [0, 27, 27], [0, 28, 28],
                    [0, 29, 29], [0, 30, 30], [0, 31, 31], [0, 32, 32], [0, 33, 33], [0, 34, 34], [0, 35, 35],
                    [0, 36, 36], [0, 37, 37], [0, 38, 38], [0, 39, 39], [0, 40, 40], [0, 41, 41], [0, 42, 42],
                    [0, 43, 43], [0, 44, 44], [0, 45, 45], [0, 46, 46], [0, 47, 47], [0, 48, 48], [0, 49, 49],
                    [0, 50, 50], [0, 51, 51], [0, 52, 52], [0, 53, 53]
                ]
            });
        });
        test('issue #22352: Partially Broken Complex Script Rendering of Tamil', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, ' JoyShareல் பின்தொடர்ந்து, விடீயோ, ஜோக்குகள், அனிமேசன், நகைச்சுவை படங்கள் மற்றும் செய்திகளை பெறுவீர்', false, false, false, 0, createViewLineTokens([createPart(100, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">\u00a0JoyShareல்\u00a0பின்தொடர்ந்து,\u00a0விடீயோ,\u00a0ஜோக்குகள்,\u00a0</span>',
                    '<span class="mtk3">அனிமேசன்,\u00a0நகைச்சுவை\u00a0படங்கள்\u00a0மற்றும்\u00a0செய்திகளை\u00a0</span>',
                    '<span class="mtk3">பெறுவீர்</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21],
                    [0, 22, 22], [0, 23, 23], [0, 24, 24], [0, 25, 25], [0, 26, 26], [0, 27, 27], [0, 28, 28],
                    [0, 29, 29], [0, 30, 30], [0, 31, 31], [0, 32, 32], [0, 33, 33], [0, 34, 34], [0, 35, 35],
                    [0, 36, 36], [0, 37, 37], [0, 38, 38], [0, 39, 39], [0, 40, 40], [0, 41, 41], [0, 42, 42],
                    [0, 43, 43], [0, 44, 44], [0, 45, 45],
                    [1, 0, 46], [1, 1, 47], [1, 2, 48], [1, 3, 49], [1, 4, 50], [1, 5, 51], [1, 6, 52], [1, 7, 53],
                    [1, 8, 54], [1, 9, 55], [1, 10, 56], [1, 11, 57], [1, 12, 58], [1, 13, 59], [1, 14, 60], [1, 15, 61],
                    [1, 16, 62], [1, 17, 63], [1, 18, 64], [1, 19, 65], [1, 20, 66], [1, 21, 67], [1, 22, 68], [1, 23, 69],
                    [1, 24, 70], [1, 25, 71], [1, 26, 72], [1, 27, 73], [1, 28, 74], [1, 29, 75], [1, 30, 76], [1, 31, 77],
                    [1, 32, 78], [1, 33, 79], [1, 34, 80], [1, 35, 81], [1, 36, 82], [1, 37, 83], [1, 38, 84], [1, 39, 85],
                    [1, 40, 86], [1, 41, 87], [1, 42, 88], [1, 43, 89], [1, 44, 90], [1, 45, 91],
                    [2, 0, 92], [2, 1, 93], [2, 2, 94], [2, 3, 95], [2, 4, 96], [2, 5, 97], [2, 6, 98], [2, 7, 99], [2, 8, 100]
                ]
            });
        });
        test('issue #42700: Hindi characters are not being rendered properly', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, ' वो ऐसा क्या है जो हमारे अंदर भी है और बाहर भी है। जिसकी वजह से हम सब हैं। जिसने इस सृष्टि की रचना की है।', false, false, false, 0, createViewLineTokens([createPart(105, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">\u00a0वो\u00a0ऐसा\u00a0क्या\u00a0है\u00a0जो\u00a0हमारे\u00a0अंदर\u00a0भी\u00a0है\u00a0और\u00a0बाहर\u00a0भी\u00a0है।\u00a0</span>',
                    '<span class="mtk3">जिसकी\u00a0वजह\u00a0से\u00a0हम\u00a0सब\u00a0हैं।\u00a0जिसने\u00a0इस\u00a0सृष्टि\u00a0की\u00a0रचना\u00a0की\u00a0</span>',
                    '<span class="mtk3">है।</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21],
                    [0, 22, 22], [0, 23, 23], [0, 24, 24], [0, 25, 25], [0, 26, 26], [0, 27, 27], [0, 28, 28],
                    [0, 29, 29], [0, 30, 30], [0, 31, 31], [0, 32, 32], [0, 33, 33], [0, 34, 34], [0, 35, 35],
                    [0, 36, 36], [0, 37, 37], [0, 38, 38], [0, 39, 39], [0, 40, 40], [0, 41, 41], [0, 42, 42],
                    [0, 43, 43], [0, 44, 44], [0, 45, 45], [0, 46, 46], [0, 47, 47], [0, 48, 48], [0, 49, 49],
                    [0, 50, 50],
                    [1, 0, 51], [1, 1, 52], [1, 2, 53], [1, 3, 54], [1, 4, 55], [1, 5, 56], [1, 6, 57], [1, 7, 58],
                    [1, 8, 59], [1, 9, 60], [1, 10, 61], [1, 11, 62], [1, 12, 63], [1, 13, 64], [1, 14, 65],
                    [1, 15, 66], [1, 16, 67], [1, 17, 68], [1, 18, 69], [1, 19, 70], [1, 20, 71], [1, 21, 72],
                    [1, 22, 73], [1, 23, 74], [1, 24, 75], [1, 25, 76], [1, 26, 77], [1, 27, 78], [1, 28, 79],
                    [1, 29, 80], [1, 30, 81], [1, 31, 82], [1, 32, 83], [1, 33, 84], [1, 34, 85], [1, 35, 86],
                    [1, 36, 87], [1, 37, 88], [1, 38, 89], [1, 39, 90], [1, 40, 91], [1, 41, 92], [1, 42, 93],
                    [1, 43, 94], [1, 44, 95], [1, 45, 96], [1, 46, 97], [1, 47, 98], [1, 48, 99], [1, 49, 100],
                    [1, 50, 101], [2, 0, 102], [2, 1, 103], [2, 2, 104], [2, 3, 105]
                ]
            });
        });
        test('issue #38123: editor.renderWhitespace: "boundary" renders whitespace at line wrap point when line is wrapped', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, true, 'This is a long line which never uses more than two spaces. ', true, true, false, 0, createViewLineTokens([createPart(59, 3)]), [], 4, 0, 10, 10, 10, 10000, 'boundary', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">This\u00a0is\u00a0a\u00a0long\u00a0line\u00a0which\u00a0never\u00a0uses\u00a0more\u00a0than\u00a0two</span>',
                    '<span class="mtk3">\u00a0spaces.</span>',
                    '<span class="mtk3">\u00a0</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21],
                    [0, 22, 22], [0, 23, 23], [0, 24, 24], [0, 25, 25], [0, 26, 26], [0, 27, 27], [0, 28, 28],
                    [0, 29, 29], [0, 30, 30], [0, 31, 31], [0, 32, 32], [0, 33, 33], [0, 34, 34], [0, 35, 35],
                    [0, 36, 36], [0, 37, 37], [0, 38, 38], [0, 39, 39], [0, 40, 40], [0, 41, 41], [0, 42, 42],
                    [0, 43, 43], [0, 44, 44], [0, 45, 45], [0, 46, 46], [0, 47, 47], [0, 48, 48], [0, 49, 49],
                    [1, 0, 50], [1, 1, 51], [1, 2, 52], [1, 3, 53], [1, 4, 54], [1, 5, 55], [1, 6, 56], [1, 7, 57],
                    [2, 0, 58], [2, 1, 59]
                ]
            });
        });
        test('issue #33525: Long line with ligatures takes a long time to paint decorations', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, false, 'append data to append data to append data to append data to append data to append data to append data to append data to append data to append data to append data to append data to append data to', false, true, false, 0, createViewLineTokens([createPart(194, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', false, true, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0</span>',
                    '<span class="mtk3">append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0</span>',
                    '<span class="mtk3">append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0</span>',
                    '<span class="mtk3">append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0append\u00a0data\u00a0to\u00a0</span>',
                    '<span class="mtk3">append\u00a0data\u00a0to</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21],
                    [0, 22, 22], [0, 23, 23], [0, 24, 24], [0, 25, 25], [0, 26, 26], [0, 27, 27], [0, 28, 28],
                    [0, 29, 29], [0, 30, 30], [0, 31, 31], [0, 32, 32], [0, 33, 33], [0, 34, 34], [0, 35, 35],
                    [0, 36, 36], [0, 37, 37], [0, 38, 38], [0, 39, 39], [0, 40, 40], [0, 41, 41], [0, 42, 42],
                    [0, 43, 43], [0, 44, 44],
                    [1, 0, 45], [1, 1, 46], [1, 2, 47], [1, 3, 48], [1, 4, 49], [1, 5, 50], [1, 6, 51],
                    [1, 7, 52], [1, 8, 53], [1, 9, 54], [1, 10, 55], [1, 11, 56], [1, 12, 57], [1, 13, 58],
                    [1, 14, 59], [1, 15, 60], [1, 16, 61], [1, 17, 62], [1, 18, 63], [1, 19, 64], [1, 20, 65],
                    [1, 21, 66], [1, 22, 67], [1, 23, 68], [1, 24, 69], [1, 25, 70], [1, 26, 71], [1, 27, 72],
                    [1, 28, 73], [1, 29, 74], [1, 30, 75], [1, 31, 76], [1, 32, 77], [1, 33, 78], [1, 34, 79],
                    [1, 35, 80], [1, 36, 81], [1, 37, 82], [1, 38, 83], [1, 39, 84], [1, 40, 85], [1, 41, 86],
                    [1, 42, 87], [1, 43, 88], [1, 44, 89],
                    [2, 0, 90], [2, 1, 91], [2, 2, 92], [2, 3, 93], [2, 4, 94], [2, 5, 95], [2, 6, 96],
                    [2, 7, 97], [2, 8, 98], [2, 9, 99], [2, 10, 100], [2, 11, 101], [2, 12, 102],
                    [2, 13, 103], [2, 14, 104], [2, 15, 105], [2, 16, 106], [2, 17, 107], [2, 18, 108],
                    [2, 19, 109], [2, 20, 110], [2, 21, 111], [2, 22, 112], [2, 23, 113], [2, 24, 114],
                    [2, 25, 115], [2, 26, 116], [2, 27, 117], [2, 28, 118], [2, 29, 119], [2, 30, 120],
                    [2, 31, 121], [2, 32, 122], [2, 33, 123], [2, 34, 124], [2, 35, 125], [2, 36, 126],
                    [2, 37, 127], [2, 38, 128], [2, 39, 129], [2, 40, 130], [2, 41, 131], [2, 42, 132],
                    [2, 43, 133], [2, 44, 134],
                    [3, 0, 135], [3, 1, 136], [3, 2, 137], [3, 3, 138], [3, 4, 139], [3, 5, 140], [3, 6, 141],
                    [3, 7, 142], [3, 8, 143], [3, 9, 144], [3, 10, 145], [3, 11, 146], [3, 12, 147], [3, 13, 148],
                    [3, 14, 149], [3, 15, 150], [3, 16, 151], [3, 17, 152], [3, 18, 153], [3, 19, 154], [3, 20, 155],
                    [3, 21, 156], [3, 22, 157], [3, 23, 158], [3, 24, 159], [3, 25, 160], [3, 26, 161], [3, 27, 162],
                    [3, 28, 163], [3, 29, 164], [3, 30, 165], [3, 31, 166], [3, 32, 167], [3, 33, 168], [3, 34, 169],
                    [3, 35, 170], [3, 36, 171], [3, 37, 172], [3, 38, 173], [3, 39, 174], [3, 40, 175], [3, 41, 176],
                    [3, 42, 177], [3, 43, 178], [3, 44, 179],
                    [4, 0, 180], [4, 1, 181], [4, 2, 182], [4, 3, 183], [4, 4, 184], [4, 5, 185], [4, 6, 186],
                    [4, 7, 187], [4, 8, 188], [4, 9, 189], [4, 10, 190], [4, 11, 191], [4, 12, 192], [4, 13, 193],
                    [4, 14, 194]
                ]
            });
        });
        test('issue #33525: Long line with ligatures takes a long time to paint decorations - not possible', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, false, 'appenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatato', false, true, false, 0, createViewLineTokens([createPart(194, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', false, true, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">appenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatatoappenddatato</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20], [0, 21, 21],
                    [0, 22, 22], [0, 23, 23], [0, 24, 24], [0, 25, 25], [0, 26, 26], [0, 27, 27], [0, 28, 28],
                    [0, 29, 29], [0, 30, 30], [0, 31, 31], [0, 32, 32], [0, 33, 33], [0, 34, 34], [0, 35, 35],
                    [0, 36, 36], [0, 37, 37], [0, 38, 38], [0, 39, 39], [0, 40, 40], [0, 41, 41], [0, 42, 42],
                    [0, 43, 43], [0, 44, 44], [0, 45, 45], [0, 46, 46], [0, 47, 47], [0, 48, 48], [0, 49, 49],
                    [0, 50, 50], [0, 51, 51], [0, 52, 52], [0, 53, 53], [0, 54, 54], [0, 55, 55], [0, 56, 56],
                    [0, 57, 57], [0, 58, 58], [0, 59, 59], [0, 60, 60], [0, 61, 61], [0, 62, 62], [0, 63, 63],
                    [0, 64, 64], [0, 65, 65], [0, 66, 66], [0, 67, 67], [0, 68, 68], [0, 69, 69], [0, 70, 70],
                    [0, 71, 71], [0, 72, 72], [0, 73, 73], [0, 74, 74], [0, 75, 75], [0, 76, 76], [0, 77, 77],
                    [0, 78, 78], [0, 79, 79], [0, 80, 80], [0, 81, 81], [0, 82, 82], [0, 83, 83], [0, 84, 84],
                    [0, 85, 85], [0, 86, 86], [0, 87, 87], [0, 88, 88], [0, 89, 89], [0, 90, 90], [0, 91, 91],
                    [0, 92, 92], [0, 93, 93], [0, 94, 94], [0, 95, 95], [0, 96, 96], [0, 97, 97], [0, 98, 98],
                    [0, 99, 99], [0, 100, 100], [0, 101, 101], [0, 102, 102], [0, 103, 103], [0, 104, 104],
                    [0, 105, 105], [0, 106, 106], [0, 107, 107], [0, 108, 108], [0, 109, 109], [0, 110, 110],
                    [0, 111, 111], [0, 112, 112], [0, 113, 113], [0, 114, 114], [0, 115, 115], [0, 116, 116],
                    [0, 117, 117], [0, 118, 118], [0, 119, 119], [0, 120, 120], [0, 121, 121], [0, 122, 122],
                    [0, 123, 123], [0, 124, 124], [0, 125, 125], [0, 126, 126], [0, 127, 127], [0, 128, 128],
                    [0, 129, 129], [0, 130, 130], [0, 131, 131], [0, 132, 132], [0, 133, 133], [0, 134, 134],
                    [0, 135, 135], [0, 136, 136], [0, 137, 137], [0, 138, 138], [0, 139, 139], [0, 140, 140],
                    [0, 141, 141], [0, 142, 142], [0, 143, 143], [0, 144, 144], [0, 145, 145], [0, 146, 146],
                    [0, 147, 147], [0, 148, 148], [0, 149, 149], [0, 150, 150], [0, 151, 151], [0, 152, 152],
                    [0, 153, 153], [0, 154, 154], [0, 155, 155], [0, 156, 156]
                ]
            });
        });
        test('issue #91936: Semantic token color highlighting fails on line with selected text', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, '                    else if ($s = 08) then \'\\b\'', false, true, false, 0, createViewLineTokens([
                createPart(20, 1),
                createPart(24, 15),
                createPart(25, 1),
                createPart(27, 15),
                createPart(28, 1),
                createPart(29, 1),
                createPart(29, 1),
                createPart(31, 16),
                createPart(32, 1),
                createPart(33, 1),
                createPart(34, 1),
                createPart(36, 6),
                createPart(36, 1),
                createPart(37, 1),
                createPart(38, 1),
                createPart(42, 15),
                createPart(43, 1),
                createPart(47, 11)
            ]), [], 4, 0, 10, 11, 11, 10000, 'selection', false, false, [new viewLineRenderer_1.LineRange(0, 47)]));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk15">else</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk15">if</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk1">(</span>',
                    '<span class="mtk16">$s</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk1">=</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk6">08</span>',
                    '<span class="mtk1">)</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk15">then</span>',
                    '<span class="mtkz" style="width:10px">\u00b7\u200c</span>',
                    '<span class="mtk11">\'\\b\'</span>',
                ],
                mapping: [
                    [0, 0, 0],
                    [1, 0, 1],
                    [2, 0, 2],
                    [3, 0, 3],
                    [4, 0, 4],
                    [5, 0, 5],
                    [6, 0, 6],
                    [7, 0, 7],
                    [8, 0, 8],
                    [9, 0, 9],
                    [10, 0, 10],
                    [11, 0, 11],
                    [12, 0, 12],
                    [13, 0, 13],
                    [14, 0, 14],
                    [15, 0, 15],
                    [16, 0, 16],
                    [17, 0, 17],
                    [18, 0, 18],
                    [19, 0, 19],
                    [20, 0, 20], [20, 1, 21], [20, 2, 22], [20, 3, 23],
                    [21, 0, 24],
                    [22, 0, 25], [22, 1, 26],
                    [23, 0, 27],
                    [24, 0, 28],
                    [25, 0, 29], [25, 1, 30],
                    [26, 0, 31],
                    [27, 0, 32],
                    [28, 0, 33],
                    [29, 0, 34], [29, 1, 35],
                    [30, 0, 36],
                    [31, 0, 37],
                    [32, 0, 38], [32, 1, 39], [32, 2, 40], [32, 3, 41],
                    [33, 0, 42],
                    [34, 0, 43], [34, 1, 44], [34, 2, 45], [34, 3, 46], [34, 4, 47]
                ]
            });
        });
        test('issue #119416: Delete Control Character (U+007F / &#127;) displayed as space', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, false, '[' + String.fromCharCode(127) + '] [' + String.fromCharCode(0) + ']', false, true, false, 0, createViewLineTokens([createPart(7, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', true, true, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">[\u2421]\u00a0[\u2400]</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7]
                ]
            });
        });
        test('issue #116939: Important control characters aren\'t rendered', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, false, `transferBalance(5678,${String.fromCharCode(0x202E)}6776,4321${String.fromCharCode(0x202C)},"USD");`, false, false, false, 0, createViewLineTokens([createPart(42, 3)]), [], 4, 0, 10, 10, 10, 10000, 'none', true, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtk3">transferBalance(5678,</span>',
                    '<span class="mtkcontrol">[U+202E]</span>',
                    '<span class="mtk3">6776,4321</span>',
                    '<span class="mtkcontrol">[U+202C]</span>',
                    '<span class="mtk3">,"USD");</span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 1, 1], [0, 2, 2], [0, 3, 3], [0, 4, 4], [0, 5, 5], [0, 6, 6], [0, 7, 7],
                    [0, 8, 8], [0, 9, 9], [0, 10, 10], [0, 11, 11], [0, 12, 12], [0, 13, 13], [0, 14, 14],
                    [0, 15, 15], [0, 16, 16], [0, 17, 17], [0, 18, 18], [0, 19, 19], [0, 20, 20],
                    [1, 0, 21],
                    [2, 0, 29], [2, 1, 30], [2, 2, 31], [2, 3, 32], [2, 4, 33], [2, 5, 34], [2, 6, 35],
                    [2, 7, 36], [2, 8, 37],
                    [3, 0, 38],
                    [4, 0, 46], [4, 1, 47], [4, 2, 48], [4, 3, 49], [4, 4, 50], [4, 5, 51], [4, 6, 52], [4, 7, 53], [4, 8, 54]
                ]
            });
        });
        test('issue #124038: Multiple end-of-line text decorations get merged', () => {
            const actual = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(true, false, '    if', false, true, false, 0, createViewLineTokens([createPart(4, 1), createPart(6, 2)]), [
                new lineDecorations_1.LineDecoration(7, 7, 'ced-1-TextEditorDecorationType2-17c14d98-3 ced-1-TextEditorDecorationType2-3', 1 /* InlineDecorationType.Before */),
                new lineDecorations_1.LineDecoration(7, 7, 'ced-1-TextEditorDecorationType2-17c14d98-4 ced-1-TextEditorDecorationType2-4', 2 /* InlineDecorationType.After */),
                new lineDecorations_1.LineDecoration(7, 7, 'ced-ghost-text-1-4', 2 /* InlineDecorationType.After */),
            ], 4, 0, 10, 10, 10, 10000, 'all', false, false, null));
            assert.deepStrictEqual(inflateRenderLineOutput(actual), {
                html: [
                    '<span class="mtkw">\u00b7\u200c\u00b7\u200c\u00b7\u200c\u00b7\u200c</span>',
                    '<span class="mtk2">if</span>',
                    '<span class="ced-1-TextEditorDecorationType2-17c14d98-3 ced-1-TextEditorDecorationType2-3"></span>',
                    '<span class="ced-1-TextEditorDecorationType2-17c14d98-4 ced-1-TextEditorDecorationType2-4"></span>',
                    '<span class="ced-ghost-text-1-4"></span>',
                ],
                mapping: [
                    [0, 0, 0], [0, 2, 1], [0, 4, 2], [0, 6, 3],
                    [1, 0, 4], [1, 1, 5],
                    [3, 0, 6]
                ]
            });
        });
        function createTestGetColumnOfLinePartOffset(lineContent, tabSize, parts, expectedPartLengths) {
            const renderLineOutput = (0, viewLineRenderer_1.renderViewLine2)(new viewLineRenderer_1.RenderLineInput(false, true, lineContent, false, true, false, 0, createViewLineTokens(parts), [], tabSize, 0, 10, 10, 10, -1, 'none', false, false, null));
            return (partIndex, partLength, offset, expected) => {
                const actualColumn = renderLineOutput.characterMapping.getColumn(new viewLineRenderer_1.DomPosition(partIndex, offset), partLength);
                assert.strictEqual(actualColumn, expected, 'getColumn for ' + partIndex + ', ' + offset);
            };
        }
        test('getColumnOfLinePartOffset 1 - simple text', () => {
            const testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('hello world', 4, [
                createPart(11, 1)
            ], [11]);
            testGetColumnOfLinePartOffset(0, 11, 0, 1);
            testGetColumnOfLinePartOffset(0, 11, 1, 2);
            testGetColumnOfLinePartOffset(0, 11, 2, 3);
            testGetColumnOfLinePartOffset(0, 11, 3, 4);
            testGetColumnOfLinePartOffset(0, 11, 4, 5);
            testGetColumnOfLinePartOffset(0, 11, 5, 6);
            testGetColumnOfLinePartOffset(0, 11, 6, 7);
            testGetColumnOfLinePartOffset(0, 11, 7, 8);
            testGetColumnOfLinePartOffset(0, 11, 8, 9);
            testGetColumnOfLinePartOffset(0, 11, 9, 10);
            testGetColumnOfLinePartOffset(0, 11, 10, 11);
            testGetColumnOfLinePartOffset(0, 11, 11, 12);
        });
        test('getColumnOfLinePartOffset 2 - regular JS', () => {
            const testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('var x = 3;', 4, [
                createPart(3, 1),
                createPart(4, 2),
                createPart(5, 3),
                createPart(8, 4),
                createPart(9, 5),
                createPart(10, 6),
            ], [3, 1, 1, 3, 1, 1]);
            testGetColumnOfLinePartOffset(0, 3, 0, 1);
            testGetColumnOfLinePartOffset(0, 3, 1, 2);
            testGetColumnOfLinePartOffset(0, 3, 2, 3);
            testGetColumnOfLinePartOffset(0, 3, 3, 4);
            testGetColumnOfLinePartOffset(1, 1, 0, 4);
            testGetColumnOfLinePartOffset(1, 1, 1, 5);
            testGetColumnOfLinePartOffset(2, 1, 0, 5);
            testGetColumnOfLinePartOffset(2, 1, 1, 6);
            testGetColumnOfLinePartOffset(3, 3, 0, 6);
            testGetColumnOfLinePartOffset(3, 3, 1, 7);
            testGetColumnOfLinePartOffset(3, 3, 2, 8);
            testGetColumnOfLinePartOffset(3, 3, 3, 9);
            testGetColumnOfLinePartOffset(4, 1, 0, 9);
            testGetColumnOfLinePartOffset(4, 1, 1, 10);
            testGetColumnOfLinePartOffset(5, 1, 0, 10);
            testGetColumnOfLinePartOffset(5, 1, 1, 11);
        });
        test('getColumnOfLinePartOffset 3 - tab with tab size 6', () => {
            const testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('\t', 6, [
                createPart(1, 1)
            ], [6]);
            testGetColumnOfLinePartOffset(0, 6, 0, 1);
            testGetColumnOfLinePartOffset(0, 6, 1, 1);
            testGetColumnOfLinePartOffset(0, 6, 2, 1);
            testGetColumnOfLinePartOffset(0, 6, 3, 1);
            testGetColumnOfLinePartOffset(0, 6, 4, 2);
            testGetColumnOfLinePartOffset(0, 6, 5, 2);
            testGetColumnOfLinePartOffset(0, 6, 6, 2);
        });
        test('getColumnOfLinePartOffset 4 - once indented line, tab size 4', () => {
            const testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('\tfunction', 4, [
                createPart(1, 1),
                createPart(9, 2),
            ], [4, 8]);
            testGetColumnOfLinePartOffset(0, 4, 0, 1);
            testGetColumnOfLinePartOffset(0, 4, 1, 1);
            testGetColumnOfLinePartOffset(0, 4, 2, 1);
            testGetColumnOfLinePartOffset(0, 4, 3, 2);
            testGetColumnOfLinePartOffset(0, 4, 4, 2);
            testGetColumnOfLinePartOffset(1, 8, 0, 2);
            testGetColumnOfLinePartOffset(1, 8, 1, 3);
            testGetColumnOfLinePartOffset(1, 8, 2, 4);
            testGetColumnOfLinePartOffset(1, 8, 3, 5);
            testGetColumnOfLinePartOffset(1, 8, 4, 6);
            testGetColumnOfLinePartOffset(1, 8, 5, 7);
            testGetColumnOfLinePartOffset(1, 8, 6, 8);
            testGetColumnOfLinePartOffset(1, 8, 7, 9);
            testGetColumnOfLinePartOffset(1, 8, 8, 10);
        });
        test('getColumnOfLinePartOffset 5 - twice indented line, tab size 4', () => {
            const testGetColumnOfLinePartOffset = createTestGetColumnOfLinePartOffset('\t\tfunction', 4, [
                createPart(2, 1),
                createPart(10, 2),
            ], [8, 8]);
            testGetColumnOfLinePartOffset(0, 8, 0, 1);
            testGetColumnOfLinePartOffset(0, 8, 1, 1);
            testGetColumnOfLinePartOffset(0, 8, 2, 1);
            testGetColumnOfLinePartOffset(0, 8, 3, 2);
            testGetColumnOfLinePartOffset(0, 8, 4, 2);
            testGetColumnOfLinePartOffset(0, 8, 5, 2);
            testGetColumnOfLinePartOffset(0, 8, 6, 2);
            testGetColumnOfLinePartOffset(0, 8, 7, 3);
            testGetColumnOfLinePartOffset(0, 8, 8, 3);
            testGetColumnOfLinePartOffset(1, 8, 0, 3);
            testGetColumnOfLinePartOffset(1, 8, 1, 4);
            testGetColumnOfLinePartOffset(1, 8, 2, 5);
            testGetColumnOfLinePartOffset(1, 8, 3, 6);
            testGetColumnOfLinePartOffset(1, 8, 4, 7);
            testGetColumnOfLinePartOffset(1, 8, 5, 8);
            testGetColumnOfLinePartOffset(1, 8, 6, 9);
            testGetColumnOfLinePartOffset(1, 8, 7, 10);
            testGetColumnOfLinePartOffset(1, 8, 8, 11);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0xpbmVSZW5kZXJlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL3ZpZXdMYXlvdXQvdmlld0xpbmVSZW5kZXJlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBYWhHLFNBQVMsb0JBQW9CLENBQUMsY0FBK0I7UUFDNUQsT0FBTyxJQUFJLDhCQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELFNBQVMsVUFBVSxDQUFDLFFBQWdCLEVBQUUsVUFBa0I7UUFDdkQsT0FBTyxJQUFJLDZCQUFhLENBQUMsUUFBUSxFQUFFLENBQ2xDLFVBQVUsNkNBQW9DLENBQzlDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDVixDQUFDO0lBRUQsU0FBUyx1QkFBdUIsQ0FBQyxnQkFBbUM7UUFDbkUsdURBQXVEO1FBQ3ZELElBQUksSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztRQUNqQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDOUIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUMzQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDbEIsR0FBRztZQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLFFBQVEsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDcEIsTUFBTTthQUNOO1lBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJ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LEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSw4QkFBOEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEcsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtZQUN0QixXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLHdEQUF3RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlKLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUseURBQXlELEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENB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QUUsRUFBRSxDQUFDO29CQUMxRCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzlDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNWLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDckMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENB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RUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ2hKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3JRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN4UCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2lCQUN0QjthQUNELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtZQUNyRCxNQUFNLFFBQVEsR0FBRyxnRkFBZ0YsQ0FBQztZQUVsRyxNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQztnQkFDdEMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hCLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQixVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakIsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2pCLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQixVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakIsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2pCLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQixVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakIsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxVQUFVO2FBQzlCLENBQUMsQ0FBQztZQUNILE1BQU0sT0FBTyxHQUFHLElBQUEsa0NBQWMsRUFBQyxJQUFJLGtDQUFlLENBQ2pELEtBQUssRUFDTCxJQUFJLEVBQ0osUUFBUSxFQUNSLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLENBQUMsRUFDRCxTQUFTLEVBQ1QsRUFBRSxFQUNGLENBQUMsRUFDRCxDQUFDLEVBQ0QsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsQ0FBQyxDQUFDLEVBQ0YsTUFBTSxFQUNOLEtBQUssRUFDTCxLQUFLLEVBQ0wsSUFBSSxDQUNKLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxlQUFlLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ3hELElBQUksRUFBRTtvQkFDTCxvR0FBb0c7b0JBQ3BHLHdDQUF3QztvQkFDeEMsNEtBQTRLO29CQUM1Syw2QkFBNkI7b0JBQzdCLHNEQUFzRDtvQkFDdEQsOEJBQThCO29CQUM5Qiw2QkFBNkI7b0JBQzdCLHFEQUFxRDtvQkFDckQsNkJBQTZCO29CQUM3Qiw4QkFBOEI7aUJBQzlCO2dCQUNELE9BQU8sRUFBRTtvQkFDUixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMxQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ2hKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDalIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3RCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3hQLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7aUJBQ3RCO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7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QUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENB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LENBQUM7b0JBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3hELENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUMxRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENB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QyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDL0wsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ2hKLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFB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LENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFB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QUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDdkosQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3RFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDOUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2lCQUNs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LENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDcmQsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNWLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDclEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3RCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxF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Q0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDMUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDMUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3RILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzlDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMs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QUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3RCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3RILENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ2xDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzlDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2lCQUMxRDthQUNELENBQ0QsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHFEQUFxRCxFQUFFLEdBQUcsRUFBRTtZQUNoRSxNQUFNLENBQUMsZUFBZSxDQUNyQixtQkFBbUIsQ0FDbEIsS0FBSyxFQUNMLG9DQUFvQyxFQUNwQztnQkFDQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDaEIsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hCLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ2pCLEVBQ0QsQ0FBQyxFQUNELFVBQVUsRUFDVixJQUFJLENBQ0osRUFDRDtnQkFDQyxJQUFJLEVBQUU7b0JBQ0wsd0VBQXdFO29CQUN4RSx1RUFBdUU7b0JBQ3ZFLDhCQUE4QjtvQkFDOUIsMkNBQTJDO29CQUMzQyxpRUFBaUU7b0JBQ2pFLG1GQUFtRjtvQkFDbkYseUZBQXlGO29CQUN6RiwrRkFBK0Y7aUJBQy9GO2dCQUNELE9BQU8sRUFBRTtvQkFDUixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN0SCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNsQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUM5QyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztpQkFDMUQ7YUFDRCxDQUNELENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5REFBeUQsRUFBRSxHQUFHLEVBQUU7WUFDcEUsTUFBTSxDQUFDLGVBQWUsQ0FDckIsbUJBQW1CLENBQ2xCLElBQUksRUFDSixvQ0FBb0MsRUFDcEM7Z0JBQ0MsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hCLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQixVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUNqQixFQUNELENBQUMsRUFDRCxVQUFVLEVBQ1YsSUFBSSxDQUNKLEVBQ0Q7Z0JBQ0MsSUFBSSxFQUFFO29CQUNMLHdFQUF3RTtvQkFDeEUsb0RBQW9EO29CQUNwRCw4QkFBOEI7b0JBQzlCLDJDQUEyQztvQkFDM0MsNEtBQTRLO2lCQUM1SztnQkFDRCxPQUFPLEVBQUU7b0JBQ1IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNwQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdEgsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7aUJBQzlLO2FBQ0QsQ0FDRCxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUVBQW1FLEVB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QkFDakY7Z0JBQ0QsT0FBTyxFQUFFO29CQUNSLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0RixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO2lCQUNsRDthQUNELENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsRUFBRTtZQUU3RSxNQUFNLE1BQU0sR0FBRyxJQUFBLGtDQUFjLEVBQUMsSUFBSSxrQ0FBZSxDQUNoRCxJQUFJLEVBQ0osSUFBSSxFQUNKLHNHQUFzRyxFQUN0RyxLQUFLLEVBQ0wsS0FBSyxFQUNMLEtBQUssRUFDTCxDQUFDLEVBQ0Qsb0JBQW9CLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDMUMsRUFBRSxFQUNGLENBQUMsRUFDRCxDQUFDLEVBQ0QsRUFBRSxFQUNGLEVBQUUsRUFDRixFQUFFLEVBQ0YsS0FBSyxFQUNMLE1BQU0sRUFDTixLQUFLLEVBQ0wsS0FBSyxFQUNMLElBQUksQ0FDSixDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsZUFBZSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN2RCxJQUFJLEVBQUU7b0JBQ0wsbUdBQW1HO29CQUNuRyxtR0FBbUc7b0JBQ25HLG9DQUFvQztpQkFDcEM7Z0JBQ0QsT0FBTyxFQUFFO29CQUNSLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0RixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3JDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUM5RixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDcEcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3RHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN0RyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDdEcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxD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QUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3pGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3pGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3pGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3pGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3pGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzlGLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3ZGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3pGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQ3pGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFB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QUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDOUYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7aUJBQ3RCO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsK0VBQStFLEVBQUUsR0FBRyxFQUFFO1lBQzFGLE1BQU0sTUFBTSxHQUFHLElBQUEsa0NBQWMsRUFBQyxJQUFJLGtDQUFlLENBQ2hELEtBQUssRUFDTCxLQUFLLEVBQ0wsb01BQW9NLEVBQ3BNLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLENBQUMsRUFDRCxvQkFBb0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMxQyxFQUFFLEVBQ0YsQ0FBQyxFQUNELENBQUMsRUFDRCxFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixLQUFLLEVBQ0wsTUFBTSxFQUNOLEtBQUssRUFDTCxJQUFJLEVBQ0osSUFBSSxDQUNKLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxlQUFlLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZELElBQUksRUFBRTtvQkFDTCxzSEFBc0g7b0JBQ3RILHNIQUFzSDtvQkFDdEgsc0hBQXNIO29CQUN0SCxzSEFBc0g7b0JBQ3RILG9EQUFvRDtpQkFDcEQ7Z0JBQ0QsT0FBTyxFQUFFO29CQUNSLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0RixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDbEYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDdEYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNsRixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7b0JBQzVFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDbEYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO29CQUNsRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUM7b0JBQ2xGLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDbEYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO29CQUNsRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDMUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDN0YsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDaEcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDaEcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDaEcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQztvQkFDaEcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO29CQUN4QyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDO29CQUN6RixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO29CQUM3RixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDO2lCQUNaO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsOEZBQThGLEVBQUUsR0FBRyxFQUFFO1lBQ3pHLE1BQU0sTUFBTSxHQUFHLElBQUEsa0NBQWMsRUFBQyxJQUFJLGtDQUFlLENBQ2hELEtBQUssRUFDTCxLQUFLLEVBQ0wsOEpBQThKLEVBQzlKLEtBQUssRUFDTCxJQUFJLEVBQ0osS0FBSyxFQUNMLENBQUMsRUFDRCxvQkFBb0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUMxQyxFQUFFLEVBQ0YsQ0FBQyxFQUNELENBQUMsRUFDRCxFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixLQUFLLEVBQ0wsTUFBTSxFQUNOLEtBQUssRUFDTCxJQUFJLEVBQ0osSUFBSSxDQUNKLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxlQUFlLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3ZELElBQUksRUFBRTtvQkFDTCx3TEFBd0w7aUJBQ3hMO2dCQUNELE9BQU8sRUFBRTtvQkFDUixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEYsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDckYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDekYsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO29CQUN0RixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7b0JBQ3hGLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztvQkFDeEYsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO29CQUN4RixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7b0JBQ3hGLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztvQkFDeEYsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO29CQUN4RixDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7b0JBQ3hGLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztvQkFDeEYsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUs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LEVBQUUsQ0FBQyxDQUFDO29CQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ1QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNULENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ1QsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDWCxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNYLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDWCxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNYLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDWCxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNYLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDWCxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNsRCxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNYLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN4QixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNYLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3hCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDWCxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNYLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUN4QixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNYLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDbEQsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDWCxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVB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QyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0RixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNyRixDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7b0JBQzVFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxD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QyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMzQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7WUFDOUQsTUFBTSw2QkFBNkIsR0FBRyxtQ0FBbUMsQ0FDeEUsSUFBSSxFQUNKLENBQUMsRUFDRDtnQkFDQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNoQixFQUNELENBQUMsQ0FBQyxDQUFDLENBQ0gsQ0FBQztZQUNGLDZCQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLDZCQUE2QixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLDhEQUE4RCxFQUFFLEdBQUcsRUFBRTtZQUN6RSxNQUFNLDZCQUE2QixHQUFHLG1DQUFtQyxDQUN4RSxZQUFZLEVBQ1osQ0FBQyxFQUNEO2dCQUNDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQixVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNoQixFQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUNOLENBQUM7WUFDRiw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyw2QkFBNkIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQywrREFBK0QsRUFBRSxHQUFHLEVBQUU7WUFDMUUsTUFBTSw2QkFBNkIsR0FBRyxtQ0FBbUMsQ0FDeEUsY0FBYyxFQUNkLENBQUMsRUFDRDtnQkFDQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDaEIsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDakIsRUFDRCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDTixDQUFDO1lBQ0YsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUMsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0MsNkJBQTZCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQyJ9