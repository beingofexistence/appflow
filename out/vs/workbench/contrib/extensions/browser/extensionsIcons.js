/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.activationTimeIcon = exports.trustIcon = exports.infoIcon = exports.warningIcon = exports.errorIcon = exports.starEmptyIcon = exports.starHalfIcon = exports.starFullIcon = exports.sponsorIcon = exports.preReleaseIcon = exports.verifiedPublisherIcon = exports.ratingIcon = exports.installCountIcon = exports.remoteIcon = exports.syncIgnoredIcon = exports.syncEnabledIcon = exports.configureRecommendedIcon = exports.installWorkspaceRecommendedIcon = exports.installLocalInRemoteIcon = exports.filterIcon = exports.refreshIcon = exports.clearSearchResultsIcon = exports.manageExtensionIcon = exports.extensionsViewIcon = void 0;
    exports.extensionsViewIcon = (0, iconRegistry_1.registerIcon)('extensions-view-icon', codicons_1.Codicon.extensions, (0, nls_1.localize)('extensionsViewIcon', 'View icon of the extensions view.'));
    exports.manageExtensionIcon = (0, iconRegistry_1.registerIcon)('extensions-manage', codicons_1.Codicon.gear, (0, nls_1.localize)('manageExtensionIcon', 'Icon for the \'Manage\' action in the extensions view.'));
    exports.clearSearchResultsIcon = (0, iconRegistry_1.registerIcon)('extensions-clear-search-results', codicons_1.Codicon.clearAll, (0, nls_1.localize)('clearSearchResultsIcon', 'Icon for the \'Clear Search Result\' action in the extensions view.'));
    exports.refreshIcon = (0, iconRegistry_1.registerIcon)('extensions-refresh', codicons_1.Codicon.refresh, (0, nls_1.localize)('refreshIcon', 'Icon for the \'Refresh\' action in the extensions view.'));
    exports.filterIcon = (0, iconRegistry_1.registerIcon)('extensions-filter', codicons_1.Codicon.filter, (0, nls_1.localize)('filterIcon', 'Icon for the \'Filter\' action in the extensions view.'));
    exports.installLocalInRemoteIcon = (0, iconRegistry_1.registerIcon)('extensions-install-local-in-remote', codicons_1.Codicon.cloudDownload, (0, nls_1.localize)('installLocalInRemoteIcon', 'Icon for the \'Install Local Extension in Remote\' action in the extensions view.'));
    exports.installWorkspaceRecommendedIcon = (0, iconRegistry_1.registerIcon)('extensions-install-workspace-recommended', codicons_1.Codicon.cloudDownload, (0, nls_1.localize)('installWorkspaceRecommendedIcon', 'Icon for the \'Install Workspace Recommended Extensions\' action in the extensions view.'));
    exports.configureRecommendedIcon = (0, iconRegistry_1.registerIcon)('extensions-configure-recommended', codicons_1.Codicon.pencil, (0, nls_1.localize)('configureRecommendedIcon', 'Icon for the \'Configure Recommended Extensions\' action in the extensions view.'));
    exports.syncEnabledIcon = (0, iconRegistry_1.registerIcon)('extensions-sync-enabled', codicons_1.Codicon.sync, (0, nls_1.localize)('syncEnabledIcon', 'Icon to indicate that an extension is synced.'));
    exports.syncIgnoredIcon = (0, iconRegistry_1.registerIcon)('extensions-sync-ignored', codicons_1.Codicon.syncIgnored, (0, nls_1.localize)('syncIgnoredIcon', 'Icon to indicate that an extension is ignored when syncing.'));
    exports.remoteIcon = (0, iconRegistry_1.registerIcon)('extensions-remote', codicons_1.Codicon.remote, (0, nls_1.localize)('remoteIcon', 'Icon to indicate that an extension is remote in the extensions view and editor.'));
    exports.installCountIcon = (0, iconRegistry_1.registerIcon)('extensions-install-count', codicons_1.Codicon.cloudDownload, (0, nls_1.localize)('installCountIcon', 'Icon shown along with the install count in the extensions view and editor.'));
    exports.ratingIcon = (0, iconRegistry_1.registerIcon)('extensions-rating', codicons_1.Codicon.star, (0, nls_1.localize)('ratingIcon', 'Icon shown along with the rating in the extensions view and editor.'));
    exports.verifiedPublisherIcon = (0, iconRegistry_1.registerIcon)('extensions-verified-publisher', codicons_1.Codicon.verifiedFilled, (0, nls_1.localize)('verifiedPublisher', 'Icon used for the verified extension publisher in the extensions view and editor.'));
    exports.preReleaseIcon = (0, iconRegistry_1.registerIcon)('extensions-pre-release', codicons_1.Codicon.versions, (0, nls_1.localize)('preReleaseIcon', 'Icon shown for extensions having pre-release versions in extensions view and editor.'));
    exports.sponsorIcon = (0, iconRegistry_1.registerIcon)('extensions-sponsor', codicons_1.Codicon.heartFilled, (0, nls_1.localize)('sponsorIcon', 'Icon used for sponsoring extensions in the extensions view and editor.'));
    exports.starFullIcon = (0, iconRegistry_1.registerIcon)('extensions-star-full', codicons_1.Codicon.starFull, (0, nls_1.localize)('starFullIcon', 'Full star icon used for the rating in the extensions editor.'));
    exports.starHalfIcon = (0, iconRegistry_1.registerIcon)('extensions-star-half', codicons_1.Codicon.starHalf, (0, nls_1.localize)('starHalfIcon', 'Half star icon used for the rating in the extensions editor.'));
    exports.starEmptyIcon = (0, iconRegistry_1.registerIcon)('extensions-star-empty', codicons_1.Codicon.starEmpty, (0, nls_1.localize)('starEmptyIcon', 'Empty star icon used for the rating in the extensions editor.'));
    exports.errorIcon = (0, iconRegistry_1.registerIcon)('extensions-error-message', codicons_1.Codicon.error, (0, nls_1.localize)('errorIcon', 'Icon shown with a error message in the extensions editor.'));
    exports.warningIcon = (0, iconRegistry_1.registerIcon)('extensions-warning-message', codicons_1.Codicon.warning, (0, nls_1.localize)('warningIcon', 'Icon shown with a warning message in the extensions editor.'));
    exports.infoIcon = (0, iconRegistry_1.registerIcon)('extensions-info-message', codicons_1.Codicon.info, (0, nls_1.localize)('infoIcon', 'Icon shown with an info message in the extensions editor.'));
    exports.trustIcon = (0, iconRegistry_1.registerIcon)('extension-workspace-trust', codicons_1.Codicon.shield, (0, nls_1.localize)('trustIcon', 'Icon shown with a workspace trust message in the extension editor.'));
    exports.activationTimeIcon = (0, iconRegistry_1.registerIcon)('extension-activation-time', codicons_1.Codicon.history, (0, nls_1.localize)('activationtimeIcon', 'Icon shown with a activation time message in the extension editor.'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0ljb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbnNJY29ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFNbkYsUUFBQSxrQkFBa0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsc0JBQXNCLEVBQUUsa0JBQU8sQ0FBQyxVQUFVLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsbUNBQW1DLENBQUMsQ0FBQyxDQUFDO0lBRW5KLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLHdEQUF3RCxDQUFDLENBQUMsQ0FBQztJQUVqSyxRQUFBLHNCQUFzQixHQUFHLElBQUEsMkJBQVksRUFBQyxpQ0FBaUMsRUFBRSxrQkFBTyxDQUFDLFFBQVEsRUFBRSxJQUFBLGNBQVEsRUFBQyx3QkFBd0IsRUFBRSxxRUFBcUUsQ0FBQyxDQUFDLENBQUM7SUFDdE0sUUFBQSxXQUFXLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG9CQUFvQixFQUFFLGtCQUFPLENBQUMsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSx5REFBeUQsQ0FBQyxDQUFDLENBQUM7SUFDdEosUUFBQSxVQUFVLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsTUFBTSxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSx3REFBd0QsQ0FBQyxDQUFDLENBQUM7SUFFakosUUFBQSx3QkFBd0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsb0NBQW9DLEVBQUUsa0JBQU8sQ0FBQyxhQUFhLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsbUZB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