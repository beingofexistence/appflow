/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/range", "vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/contrib/search/browser/searchModel", "vs/workbench/services/textfile/common/textfiles", "vs/css!./media/searchEditor"], function (require, exports, arrays_1, range_1, nls_1, searchModel_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$VOb = exports.$UOb = exports.$TOb = exports.$SOb = exports.$ROb = exports.$QOb = exports.$POb = void 0;
    // Using \r\n on Windows inserts an extra newline between results.
    const lineDelimiter = '\n';
    const translateRangeLines = (n) => (range) => new range_1.$ks(range.startLineNumber + n, range.startColumn, range.endLineNumber + n, range.endColumn);
    const matchToSearchResultFormat = (match, longestLineNumber) => {
        const getLinePrefix = (i) => `${match.range().startLineNumber + i}`;
        const fullMatchLines = match.fullPreviewLines();
        const results = [];
        fullMatchLines
            .forEach((sourceLine, i) => {
            const lineNumber = getLinePrefix(i);
            const paddingStr = ' '.repeat(longestLineNumber - lineNumber.length);
            const prefix = `  ${paddingStr}${lineNumber}: `;
            const prefixOffset = prefix.length;
            // split instead of replace to avoid creating a new string object
            const line = prefix + (sourceLine.split(/\r?\n?$/, 1)[0] || '');
            const rangeOnThisLine = ({ start, end }) => new range_1.$ks(1, (start ?? 1) + prefixOffset, 1, (end ?? sourceLine.length + 1) + prefixOffset);
            const matchRange = match.rangeInPreview();
            const matchIsSingleLine = matchRange.startLineNumber === matchRange.endLineNumber;
            let lineRange;
            if (matchIsSingleLine) {
                lineRange = (rangeOnThisLine({ start: matchRange.startColumn, end: matchRange.endColumn }));
            }
            else if (i === 0) {
                lineRange = (rangeOnThisLine({ start: matchRange.startColumn }));
            }
            else if (i === fullMatchLines.length - 1) {
                lineRange = (rangeOnThisLine({ end: matchRange.endColumn }));
            }
            else {
                lineRange = (rangeOnThisLine({}));
            }
            results.push({ lineNumber: lineNumber, line, ranges: [lineRange] });
        });
        return results;
    };
    function fileMatchToSearchResultFormat(fileMatch, labelFormatter) {
        const textSerializations = fileMatch.textMatches().length > 0 ? matchesToSearchResultFormat(fileMatch.resource, fileMatch.textMatches().sort(searchModel_1.$XMb), fileMatch.context, labelFormatter) : undefined;
        const cellSerializations = fileMatch.cellMatches().sort((a, b) => a.cellIndex - b.cellIndex).sort().filter(cellMatch => cellMatch.contentMatches.length > 0).map((cellMatch, index) => cellMatchToSearchResultFormat(cellMatch, labelFormatter, index === 0));
        return [textSerializations, ...cellSerializations].filter(x => !!x);
    }
    function matchesToSearchResultFormat(resource, sortedMatches, matchContext, labelFormatter, shouldUseHeader = true) {
        const longestLineNumber = sortedMatches[sortedMatches.length - 1].range().endLineNumber.toString().length;
        const text = shouldUseHeader ? [`${labelFormatter(resource)}:`] : [];
        const matchRanges = [];
        const targetLineNumberToOffset = {};
        const context = [];
        matchContext.forEach((line, lineNumber) => context.push({ line, lineNumber }));
        context.sort((a, b) => a.lineNumber - b.lineNumber);
        let lastLine = undefined;
        const seenLines = new Set();
        sortedMatches.forEach(match => {
            matchToSearchResultFormat(match, longestLineNumber).forEach(match => {
                if (!seenLines.has(match.lineNumber)) {
                    while (context.length && context[0].lineNumber < +match.lineNumber) {
                        const { line, lineNumber } = context.shift();
                        if (lastLine !== undefined && lineNumber !== lastLine + 1) {
                            text.push('');
                        }
                        text.push(`  ${' '.repeat(longestLineNumber - `${lineNumber}`.length)}${lineNumber}  ${line}`);
                        lastLine = lineNumber;
                    }
                    targetLineNumberToOffset[match.lineNumber] = text.length;
                    seenLines.add(match.lineNumber);
                    text.push(match.line);
                    lastLine = +match.lineNumber;
                }
                matchRanges.push(...match.ranges.map(translateRangeLines(targetLineNumberToOffset[match.lineNumber])));
            });
        });
        while (context.length) {
            const { line, lineNumber } = context.shift();
            text.push(`  ${lineNumber}  ${line}`);
        }
        return { text, matchRanges };
    }
    function cellMatchToSearchResultFormat(cellMatch, labelFormatter, shouldUseHeader) {
        return matchesToSearchResultFormat(cellMatch.cell.uri, cellMatch.contentMatches.sort(searchModel_1.$XMb), cellMatch.context, labelFormatter, shouldUseHeader);
    }
    const contentPatternToSearchConfiguration = (pattern, includes, excludes, contextLines) => {
        return {
            query: pattern.contentPattern.pattern,
            isRegexp: !!pattern.contentPattern.isRegExp,
            isCaseSensitive: !!pattern.contentPattern.isCaseSensitive,
            matchWholeWord: !!pattern.contentPattern.isWordMatch,
            filesToExclude: excludes, filesToInclude: includes,
            showIncludesExcludes: !!(includes || excludes || pattern?.userDisabledExcludesAndIgnoreFiles),
            useExcludeSettingsAndIgnoreFiles: (pattern?.userDisabledExcludesAndIgnoreFiles === undefined ? true : !pattern.userDisabledExcludesAndIgnoreFiles),
            contextLines,
            onlyOpenEditors: !!pattern.onlyOpenEditors,
            notebookSearchConfig: {
                includeMarkupInput: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownInput,
                includeMarkupPreview: !!pattern.contentPattern.notebookInfo?.isInNotebookMarkdownPreview,
                includeCodeInput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellInput,
                includeOutput: !!pattern.contentPattern.notebookInfo?.isInNotebookCellOutput,
            }
        };
    };
    const $POb = (config) => {
        const removeNullFalseAndUndefined = (a) => a.filter(a => a !== false && a !== null && a !== undefined);
        const escapeNewlines = (str) => str.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
        return removeNullFalseAndUndefined([
            `# Query: ${escapeNewlines(config.query ?? '')}`,
            (config.isCaseSensitive || config.matchWholeWord || config.isRegexp || config.useExcludeSettingsAndIgnoreFiles === false)
                && `# Flags: ${(0, arrays_1.$Fb)([
                    config.isCaseSensitive && 'CaseSensitive',
                    config.matchWholeWord && 'WordMatch',
                    config.isRegexp && 'RegExp',
                    config.onlyOpenEditors && 'OpenEditors',
                    (config.useExcludeSettingsAndIgnoreFiles === false) && 'IgnoreExcludeSettings'
                ]).join(' ')}`,
            config.filesToInclude ? `# Including: ${config.filesToInclude}` : undefined,
            config.filesToExclude ? `# Excluding: ${config.filesToExclude}` : undefined,
            config.contextLines ? `# ContextLines: ${config.contextLines}` : undefined,
            ''
        ]).join(lineDelimiter);
    };
    exports.$POb = $POb;
    const $QOb = (model) => (0, exports.$SOb)(model.getValueInRange(new range_1.$ks(1, 1, 6, 1)).split(lineDelimiter));
    exports.$QOb = $QOb;
    const $ROb = () => ({
        query: '',
        filesToInclude: '',
        filesToExclude: '',
        isRegexp: false,
        isCaseSensitive: false,
        useExcludeSettingsAndIgnoreFiles: true,
        matchWholeWord: false,
        contextLines: 0,
        showIncludesExcludes: false,
        onlyOpenEditors: false,
        notebookSearchConfig: {
            includeMarkupInput: true,
            includeMarkupPreview: false,
            includeCodeInput: true,
            includeOutput: true,
        }
    });
    exports.$ROb = $ROb;
    const $SOb = (lines) => {
        const query = (0, exports.$ROb)();
        const unescapeNewlines = (str) => {
            let out = '';
            for (let i = 0; i < str.length; i++) {
                if (str[i] === '\\') {
                    i++;
                    const escaped = str[i];
                    if (escaped === 'n') {
                        out += '\n';
                    }
                    else if (escaped === '\\') {
                        out += '\\';
                    }
                    else {
                        throw Error((0, nls_1.localize)(0, null));
                    }
                }
                else {
                    out += str[i];
                }
            }
            return out;
        };
        const parseYML = /^# ([^:]*): (.*)$/;
        for (const line of lines) {
            const parsed = parseYML.exec(line);
            if (!parsed) {
                continue;
            }
            const [, key, value] = parsed;
            switch (key) {
                case 'Query':
                    query.query = unescapeNewlines(value);
                    break;
                case 'Including':
                    query.filesToInclude = value;
                    break;
                case 'Excluding':
                    query.filesToExclude = value;
                    break;
                case 'ContextLines':
                    query.contextLines = +value;
                    break;
                case 'Flags': {
                    query.isRegexp = value.indexOf('RegExp') !== -1;
                    query.isCaseSensitive = value.indexOf('CaseSensitive') !== -1;
                    query.useExcludeSettingsAndIgnoreFiles = value.indexOf('IgnoreExcludeSettings') === -1;
                    query.matchWholeWord = value.indexOf('WordMatch') !== -1;
                    query.onlyOpenEditors = value.indexOf('OpenEditors') !== -1;
                }
            }
        }
        query.showIncludesExcludes = !!(query.filesToInclude || query.filesToExclude || !query.useExcludeSettingsAndIgnoreFiles);
        return query;
    };
    exports.$SOb = $SOb;
    const $TOb = (searchResult, rawIncludePattern, rawExcludePattern, contextLines, labelFormatter, sortOrder, limitHit) => {
        if (!searchResult.query) {
            throw Error('Internal Error: Expected query, got null');
        }
        const config = contentPatternToSearchConfiguration(searchResult.query, rawIncludePattern, rawExcludePattern, contextLines);
        const filecount = searchResult.fileCount() > 1 ? (0, nls_1.localize)(1, null, searchResult.fileCount()) : (0, nls_1.localize)(2, null);
        const resultcount = searchResult.count() > 1 ? (0, nls_1.localize)(3, null, searchResult.count()) : (0, nls_1.localize)(4, null);
        const info = [
            searchResult.count()
                ? `${resultcount} - ${filecount}`
                : (0, nls_1.localize)(5, null),
        ];
        if (limitHit) {
            info.push((0, nls_1.localize)(6, null));
        }
        info.push('');
        const matchComparer = (a, b) => (0, searchModel_1.$XMb)(a, b, sortOrder);
        const allResults = flattenSearchResultSerializations((0, arrays_1.$Pb)(searchResult.folderMatches().sort(matchComparer)
            .map(folderMatch => folderMatch.allDownstreamFileMatches().sort(matchComparer)
            .flatMap(fileMatch => fileMatchToSearchResultFormat(fileMatch, labelFormatter)))));
        return {
            matchRanges: allResults.matchRanges.map(translateRangeLines(info.length)),
            text: info.concat(allResults.text).join(lineDelimiter),
            config
        };
    };
    exports.$TOb = $TOb;
    const flattenSearchResultSerializations = (serializations) => {
        const text = [];
        const matchRanges = [];
        serializations.forEach(serialized => {
            serialized.matchRanges.map(translateRangeLines(text.length)).forEach(range => matchRanges.push(range));
            serialized.text.forEach(line => text.push(line));
            text.push(''); // new line
        });
        return { text, matchRanges };
    };
    const $UOb = async (accessor, resource) => {
        const textFileService = accessor.get(textfiles_1.$JD);
        const text = (await textFileService.read(resource)).value;
        return (0, exports.$VOb)(text);
    };
    exports.$UOb = $UOb;
    const $VOb = (text) => {
        const headerlines = [];
        const bodylines = [];
        let inHeader = true;
        for (const line of text.split(/\r?\n/g)) {
            if (inHeader) {
                headerlines.push(line);
                if (line === '') {
                    inHeader = false;
                }
            }
            else {
                bodylines.push(line);
            }
        }
        return { config: (0, exports.$SOb)(headerlines), text: bodylines.join('\n') };
    };
    exports.$VOb = $VOb;
});
//# sourceMappingURL=searchEditorSerialization.js.map