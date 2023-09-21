/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/resources", "vs/editor/common/languages/modesRegistry", "vs/platform/files/common/files"], function (require, exports, network_1, resources_1, modesRegistry_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y6 = exports.$x6 = void 0;
    const fileIconDirectoryRegex = /(?:\/|^)(?:([^\/]+)\/)?([^\/]+)$/;
    function $x6(modelService, languageService, resource, fileKind) {
        // we always set these base classes even if we do not have a path
        const classes = fileKind === files_1.FileKind.ROOT_FOLDER ? ['rootfolder-icon'] : fileKind === files_1.FileKind.FOLDER ? ['folder-icon'] : ['file-icon'];
        if (resource) {
            // Get the path and name of the resource. For data-URIs, we need to parse specially
            let name;
            if (resource.scheme === network_1.Schemas.data) {
                const metadata = resources_1.DataUri.parseMetaData(resource);
                name = metadata.get(resources_1.DataUri.META_DATA_LABEL);
            }
            else {
                const match = resource.path.match(fileIconDirectoryRegex);
                if (match) {
                    name = cssEscape(match[2].toLowerCase());
                    if (match[1]) {
                        classes.push(`${cssEscape(match[1].toLowerCase())}-name-dir-icon`); // parent directory
                    }
                }
                else {
                    name = cssEscape(resource.authority.toLowerCase());
                }
            }
            // Folders
            if (fileKind === files_1.FileKind.FOLDER) {
                classes.push(`${name}-name-folder-icon`);
            }
            // Files
            else {
                // Name & Extension(s)
                if (name) {
                    classes.push(`${name}-name-file-icon`);
                    classes.push(`name-file-icon`); // extra segment to increase file-name score
                    // Avoid doing an explosive combination of extensions for very long filenames
                    // (most file systems do not allow files > 255 length) with lots of `.` characters
                    // https://github.com/microsoft/vscode/issues/116199
                    if (name.length <= 255) {
                        const dotSegments = name.split('.');
                        for (let i = 1; i < dotSegments.length; i++) {
                            classes.push(`${dotSegments.slice(i).join('.')}-ext-file-icon`); // add each combination of all found extensions if more than one
                        }
                    }
                    classes.push(`ext-file-icon`); // extra segment to increase file-ext score
                }
                // Detected Mode
                const detectedLanguageId = detectLanguageId(modelService, languageService, resource);
                if (detectedLanguageId) {
                    classes.push(`${cssEscape(detectedLanguageId)}-lang-file-icon`);
                }
            }
        }
        return classes;
    }
    exports.$x6 = $x6;
    function $y6(languageId) {
        return ['file-icon', `${cssEscape(languageId)}-lang-file-icon`];
    }
    exports.$y6 = $y6;
    function detectLanguageId(modelService, languageService, resource) {
        if (!resource) {
            return null; // we need a resource at least
        }
        let languageId = null;
        // Data URI: check for encoded metadata
        if (resource.scheme === network_1.Schemas.data) {
            const metadata = resources_1.DataUri.parseMetaData(resource);
            const mime = metadata.get(resources_1.DataUri.META_DATA_MIME);
            if (mime) {
                languageId = languageService.getLanguageIdByMimeType(mime);
            }
        }
        // Any other URI: check for model if existing
        else {
            const model = modelService.getModel(resource);
            if (model) {
                languageId = model.getLanguageId();
            }
        }
        // only take if the language id is specific (aka no just plain text)
        if (languageId && languageId !== modesRegistry_1.$Yt) {
            return languageId;
        }
        // otherwise fallback to path based detection
        return languageService.guessLanguageIdByFilepathOrFirstLine(resource);
    }
    function cssEscape(str) {
        return str.replace(/[\11\12\14\15\40]/g, '/'); // HTML class names can not contain certain whitespace characters, use / instead, which doesn't exist in file names.
    }
});
//# sourceMappingURL=getIconClasses.js.map