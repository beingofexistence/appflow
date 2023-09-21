/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/colorRegistry"], function (require, exports, editorColorRegistry_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hc_light = exports.hc_black = exports.vs_dark = exports.vs = void 0;
    /* -------------------------------- Begin vs theme -------------------------------- */
    exports.vs = {
        base: 'vs',
        inherit: false,
        rules: [
            { token: '', foreground: '000000', background: 'fffffe' },
            { token: 'invalid', foreground: 'cd3131' },
            { token: 'emphasis', fontStyle: 'italic' },
            { token: 'strong', fontStyle: 'bold' },
            { token: 'variable', foreground: '001188' },
            { token: 'variable.predefined', foreground: '4864AA' },
            { token: 'constant', foreground: 'dd0000' },
            { token: 'comment', foreground: '008000' },
            { token: 'number', foreground: '098658' },
            { token: 'number.hex', foreground: '3030c0' },
            { token: 'regexp', foreground: '800000' },
            { token: 'annotation', foreground: '808080' },
            { token: 'type', foreground: '008080' },
            { token: 'delimiter', foreground: '000000' },
            { token: 'delimiter.html', foreground: '383838' },
            { token: 'delimiter.xml', foreground: '0000FF' },
            { token: 'tag', foreground: '800000' },
            { token: 'tag.id.pug', foreground: '4F76AC' },
            { token: 'tag.class.pug', foreground: '4F76AC' },
            { token: 'meta.scss', foreground: '800000' },
            { token: 'metatag', foreground: 'e00000' },
            { token: 'metatag.content.html', foreground: 'FF0000' },
            { token: 'metatag.html', foreground: '808080' },
            { token: 'metatag.xml', foreground: '808080' },
            { token: 'metatag.php', fontStyle: 'bold' },
            { token: 'key', foreground: '863B00' },
            { token: 'string.key.json', foreground: 'A31515' },
            { token: 'string.value.json', foreground: '0451A5' },
            { token: 'attribute.name', foreground: 'FF0000' },
            { token: 'attribute.value', foreground: '0451A5' },
            { token: 'attribute.value.number', foreground: '098658' },
            { token: 'attribute.value.unit', foreground: '098658' },
            { token: 'attribute.value.html', foreground: '0000FF' },
            { token: 'attribute.value.xml', foreground: '0000FF' },
            { token: 'string', foreground: 'A31515' },
            { token: 'string.html', foreground: '0000FF' },
            { token: 'string.sql', foreground: 'FF0000' },
            { token: 'string.yaml', foreground: '0451A5' },
            { token: 'keyword', foreground: '0000FF' },
            { token: 'keyword.json', foreground: '0451A5' },
            { token: 'keyword.flow', foreground: 'AF00DB' },
            { token: 'keyword.flow.scss', foreground: '0000FF' },
            { token: 'operator.scss', foreground: '666666' },
            { token: 'operator.sql', foreground: '778899' },
            { token: 'operator.swift', foreground: '666666' },
            { token: 'predefined.sql', foreground: 'C700C7' },
        ],
        colors: {
            [colorRegistry_1.editorBackground]: '#FFFFFE',
            [colorRegistry_1.editorForeground]: '#000000',
            [colorRegistry_1.editorInactiveSelection]: '#E5EBF1',
            [editorColorRegistry_1.editorIndentGuide1]: '#D3D3D3',
            [editorColorRegistry_1.editorActiveIndentGuide1]: '#939393',
            [colorRegistry_1.editorSelectionHighlight]: '#ADD6FF4D'
        }
    };
    /* -------------------------------- End vs theme -------------------------------- */
    /* -------------------------------- Begin vs-dark theme -------------------------------- */
    exports.vs_dark = {
        base: 'vs-dark',
        inherit: false,
        rules: [
            { token: '', foreground: 'D4D4D4', background: '1E1E1E' },
            { token: 'invalid', foreground: 'f44747' },
            { token: 'emphasis', fontStyle: 'italic' },
            { token: 'strong', fontStyle: 'bold' },
            { token: 'variable', foreground: '74B0DF' },
            { token: 'variable.predefined', foreground: '4864AA' },
            { token: 'variable.parameter', foreground: '9CDCFE' },
            { token: 'constant', foreground: '569CD6' },
            { token: 'comment', foreground: '608B4E' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'number.hex', foreground: '5BB498' },
            { token: 'regexp', foreground: 'B46695' },
            { token: 'annotation', foreground: 'cc6666' },
            { token: 'type', foreground: '3DC9B0' },
            { token: 'delimiter', foreground: 'DCDCDC' },
            { token: 'delimiter.html', foreground: '808080' },
            { token: 'delimiter.xml', foreground: '808080' },
            { token: 'tag', foreground: '569CD6' },
            { token: 'tag.id.pug', foreground: '4F76AC' },
            { token: 'tag.class.pug', foreground: '4F76AC' },
            { token: 'meta.scss', foreground: 'A79873' },
            { token: 'meta.tag', foreground: 'CE9178' },
            { token: 'metatag', foreground: 'DD6A6F' },
            { token: 'metatag.content.html', foreground: '9CDCFE' },
            { token: 'metatag.html', foreground: '569CD6' },
            { token: 'metatag.xml', foreground: '569CD6' },
            { token: 'metatag.php', fontStyle: 'bold' },
            { token: 'key', foreground: '9CDCFE' },
            { token: 'string.key.json', foreground: '9CDCFE' },
            { token: 'string.value.json', foreground: 'CE9178' },
            { token: 'attribute.name', foreground: '9CDCFE' },
            { token: 'attribute.value', foreground: 'CE9178' },
            { token: 'attribute.value.number.css', foreground: 'B5CEA8' },
            { token: 'attribute.value.unit.css', foreground: 'B5CEA8' },
            { token: 'attribute.value.hex.css', foreground: 'D4D4D4' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'string.sql', foreground: 'FF0000' },
            { token: 'keyword', foreground: '569CD6' },
            { token: 'keyword.flow', foreground: 'C586C0' },
            { token: 'keyword.json', foreground: 'CE9178' },
            { token: 'keyword.flow.scss', foreground: '569CD6' },
            { token: 'operator.scss', foreground: '909090' },
            { token: 'operator.sql', foreground: '778899' },
            { token: 'operator.swift', foreground: '909090' },
            { token: 'predefined.sql', foreground: 'FF00FF' },
        ],
        colors: {
            [colorRegistry_1.editorBackground]: '#1E1E1E',
            [colorRegistry_1.editorForeground]: '#D4D4D4',
            [colorRegistry_1.editorInactiveSelection]: '#3A3D41',
            [editorColorRegistry_1.editorIndentGuide1]: '#404040',
            [editorColorRegistry_1.editorActiveIndentGuide1]: '#707070',
            [colorRegistry_1.editorSelectionHighlight]: '#ADD6FF26'
        }
    };
    /* -------------------------------- End vs-dark theme -------------------------------- */
    /* -------------------------------- Begin hc-black theme -------------------------------- */
    exports.hc_black = {
        base: 'hc-black',
        inherit: false,
        rules: [
            { token: '', foreground: 'FFFFFF', background: '000000' },
            { token: 'invalid', foreground: 'f44747' },
            { token: 'emphasis', fontStyle: 'italic' },
            { token: 'strong', fontStyle: 'bold' },
            { token: 'variable', foreground: '1AEBFF' },
            { token: 'variable.parameter', foreground: '9CDCFE' },
            { token: 'constant', foreground: '569CD6' },
            { token: 'comment', foreground: '608B4E' },
            { token: 'number', foreground: 'FFFFFF' },
            { token: 'regexp', foreground: 'C0C0C0' },
            { token: 'annotation', foreground: '569CD6' },
            { token: 'type', foreground: '3DC9B0' },
            { token: 'delimiter', foreground: 'FFFF00' },
            { token: 'delimiter.html', foreground: 'FFFF00' },
            { token: 'tag', foreground: '569CD6' },
            { token: 'tag.id.pug', foreground: '4F76AC' },
            { token: 'tag.class.pug', foreground: '4F76AC' },
            { token: 'meta', foreground: 'D4D4D4' },
            { token: 'meta.tag', foreground: 'CE9178' },
            { token: 'metatag', foreground: '569CD6' },
            { token: 'metatag.content.html', foreground: '1AEBFF' },
            { token: 'metatag.html', foreground: '569CD6' },
            { token: 'metatag.xml', foreground: '569CD6' },
            { token: 'metatag.php', fontStyle: 'bold' },
            { token: 'key', foreground: '9CDCFE' },
            { token: 'string.key', foreground: '9CDCFE' },
            { token: 'string.value', foreground: 'CE9178' },
            { token: 'attribute.name', foreground: '569CD6' },
            { token: 'attribute.value', foreground: '3FF23F' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'string.sql', foreground: 'FF0000' },
            { token: 'keyword', foreground: '569CD6' },
            { token: 'keyword.flow', foreground: 'C586C0' },
            { token: 'operator.sql', foreground: '778899' },
            { token: 'operator.swift', foreground: '909090' },
            { token: 'predefined.sql', foreground: 'FF00FF' },
        ],
        colors: {
            [colorRegistry_1.editorBackground]: '#000000',
            [colorRegistry_1.editorForeground]: '#FFFFFF',
            [editorColorRegistry_1.editorIndentGuide1]: '#FFFFFF',
            [editorColorRegistry_1.editorActiveIndentGuide1]: '#FFFFFF',
        }
    };
    /* -------------------------------- End hc-black theme -------------------------------- */
    /* -------------------------------- Begin hc-light theme -------------------------------- */
    exports.hc_light = {
        base: 'hc-light',
        inherit: false,
        rules: [
            { token: '', foreground: '292929', background: 'FFFFFF' },
            { token: 'invalid', foreground: 'B5200D' },
            { token: 'emphasis', fontStyle: 'italic' },
            { token: 'strong', fontStyle: 'bold' },
            { token: 'variable', foreground: '264F70' },
            { token: 'variable.predefined', foreground: '4864AA' },
            { token: 'constant', foreground: 'dd0000' },
            { token: 'comment', foreground: '008000' },
            { token: 'number', foreground: '098658' },
            { token: 'number.hex', foreground: '3030c0' },
            { token: 'regexp', foreground: '800000' },
            { token: 'annotation', foreground: '808080' },
            { token: 'type', foreground: '008080' },
            { token: 'delimiter', foreground: '000000' },
            { token: 'delimiter.html', foreground: '383838' },
            { token: 'tag', foreground: '800000' },
            { token: 'tag.id.pug', foreground: '4F76AC' },
            { token: 'tag.class.pug', foreground: '4F76AC' },
            { token: 'meta.scss', foreground: '800000' },
            { token: 'metatag', foreground: 'e00000' },
            { token: 'metatag.content.html', foreground: 'B5200D' },
            { token: 'metatag.html', foreground: '808080' },
            { token: 'metatag.xml', foreground: '808080' },
            { token: 'metatag.php', fontStyle: 'bold' },
            { token: 'key', foreground: '863B00' },
            { token: 'string.key.json', foreground: 'A31515' },
            { token: 'string.value.json', foreground: '0451A5' },
            { token: 'attribute.name', foreground: '264F78' },
            { token: 'attribute.value', foreground: '0451A5' },
            { token: 'string', foreground: 'A31515' },
            { token: 'string.sql', foreground: 'B5200D' },
            { token: 'keyword', foreground: '0000FF' },
            { token: 'keyword.flow', foreground: 'AF00DB' },
            { token: 'operator.sql', foreground: '778899' },
            { token: 'operator.swift', foreground: '666666' },
            { token: 'predefined.sql', foreground: 'C700C7' },
        ],
        colors: {
            [colorRegistry_1.editorBackground]: '#FFFFFF',
            [colorRegistry_1.editorForeground]: '#292929',
            [editorColorRegistry_1.editorIndentGuide1]: '#292929',
            [editorColorRegistry_1.editorActiveIndentGuide1]: '#292929',
        }
    };
});
/* -------------------------------- End hc-light theme -------------------------------- */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3N0YW5kYWxvbmUvY29tbW9uL3RoZW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNaEcsc0ZBQXNGO0lBQ3pFLFFBQUEsRUFBRSxHQUF5QjtRQUN2QyxJQUFJLEVBQUUsSUFBSTtRQUNWLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFO1lBQ04sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtZQUN6RCxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtZQUMxQyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRTtZQUMxQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtZQUV0QyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtZQUMzQyxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO1lBQ3RELEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO1lBQzNDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO1lBQzFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO1lBQ3pDLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO1lBQzdDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO1lBQ3pDLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO1lBQzdD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