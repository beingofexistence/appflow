/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/testing/browser/theme"], function (require, exports, codicons_1, nls_1, iconRegistry_1, themeService_1, themables_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testingStatesToIcons = exports.testingCancelRefreshTests = exports.testingContinuousIsOn = exports.testingTurnContinuousRunOff = exports.testingTurnContinuousRunOn = exports.testingRefreshTests = exports.testingUpdateProfiles = exports.testingShowAsTree = exports.testingShowAsList = exports.testingHiddenIcon = exports.testingFilterIcon = exports.testingCancelIcon = exports.testingDebugIcon = exports.testingDebugAllIcon = exports.testingRunAllIcon = exports.testingRerunIcon = exports.testingRunIcon = exports.testingResultsIcon = exports.testingViewIcon = void 0;
    exports.testingViewIcon = (0, iconRegistry_1.registerIcon)('test-view-icon', codicons_1.Codicon.beaker, (0, nls_1.localize)('testViewIcon', 'View icon of the test view.'));
    exports.testingResultsIcon = (0, iconRegistry_1.registerIcon)('test-results-icon', codicons_1.Codicon.checklist, (0, nls_1.localize)('testingResultsIcon', 'Icons for test results.'));
    exports.testingRunIcon = (0, iconRegistry_1.registerIcon)('testing-run-icon', codicons_1.Codicon.run, (0, nls_1.localize)('testingRunIcon', 'Icon of the "run test" action.'));
    exports.testingRerunIcon = (0, iconRegistry_1.registerIcon)('testing-rerun-icon', codicons_1.Codicon.refresh, (0, nls_1.localize)('testingRerunIcon', 'Icon of the "rerun tests" action.'));
    exports.testingRunAllIcon = (0, iconRegistry_1.registerIcon)('testing-run-all-icon', codicons_1.Codicon.runAll, (0, nls_1.localize)('testingRunAllIcon', 'Icon of the "run all tests" action.'));
    // todo: https://github.com/microsoft/vscode-codicons/issues/72
    exports.testingDebugAllIcon = (0, iconRegistry_1.registerIcon)('testing-debug-all-icon', codicons_1.Codicon.debugAltSmall, (0, nls_1.localize)('testingDebugAllIcon', 'Icon of the "debug all tests" action.'));
    exports.testingDebugIcon = (0, iconRegistry_1.registerIcon)('testing-debug-icon', codicons_1.Codicon.debugAltSmall, (0, nls_1.localize)('testingDebugIcon', 'Icon of the "debug test" action.'));
    exports.testingCancelIcon = (0, iconRegistry_1.registerIcon)('testing-cancel-icon', codicons_1.Codicon.debugStop, (0, nls_1.localize)('testingCancelIcon', 'Icon to cancel ongoing test runs.'));
    exports.testingFilterIcon = (0, iconRegistry_1.registerIcon)('testing-filter', codicons_1.Codicon.filter, (0, nls_1.localize)('filterIcon', 'Icon for the \'Filter\' action in the testing view.'));
    exports.testingHiddenIcon = (0, iconRegistry_1.registerIcon)('testing-hidden', codicons_1.Codicon.eyeClosed, (0, nls_1.localize)('hiddenIcon', 'Icon shown beside hidden tests, when they\'ve been shown.'));
    exports.testingShowAsList = (0, iconRegistry_1.registerIcon)('testing-show-as-list-icon', codicons_1.Codicon.listTree, (0, nls_1.localize)('testingShowAsList', 'Icon shown when the test explorer is disabled as a tree.'));
    exports.testingShowAsTree = (0, iconRegistry_1.registerIcon)('testing-show-as-list-icon', codicons_1.Codicon.listFlat, (0, nls_1.localize)('testingShowAsTree', 'Icon shown when the test explorer is disabled as a list.'));
    exports.testingUpdateProfiles = (0, iconRegistry_1.registerIcon)('testing-update-profiles', codicons_1.Codicon.gear, (0, nls_1.localize)('testingUpdateProfiles', 'Icon shown to update test profiles.'));
    exports.testingRefreshTests = (0, iconRegistry_1.registerIcon)('testing-refresh-tests', codicons_1.Codicon.refresh, (0, nls_1.localize)('testingRefreshTests', 'Icon on the button to refresh tests.'));
    exports.testingTurnContinuousRunOn = (0, iconRegistry_1.registerIcon)('testing-turn-continuous-run-on', codicons_1.Codicon.eye, (0, nls_1.localize)('testingTurnContinuousRunOn', 'Icon to turn continuous test runs on.'));
    exports.testingTurnContinuousRunOff = (0, iconRegistry_1.registerIcon)('testing-turn-continuous-run-off', codicons_1.Codicon.eyeClosed, (0, nls_1.localize)('testingTurnContinuousRunOff', 'Icon to turn continuous test runs off.'));
    exports.testingContinuousIsOn = (0, iconRegistry_1.registerIcon)('testing-continuous-is-on', codicons_1.Codicon.eye, (0, nls_1.localize)('testingTurnContinuousRunIsOn', 'Icon when continuous run is on for a test ite,.'));
    exports.testingCancelRefreshTests = (0, iconRegistry_1.registerIcon)('testing-cancel-refresh-tests', codicons_1.Codicon.stop, (0, nls_1.localize)('testingCancelRefreshTests', 'Icon on the button to cancel refreshing tests.'));
    exports.testingStatesToIcons = new Map([
        [6 /* TestResultState.Errored */, (0, iconRegistry_1.registerIcon)('testing-error-icon', codicons_1.Codicon.issues, (0, nls_1.localize)('testingErrorIcon', 'Icon shown for tests that have an error.'))],
        [4 /* TestResultState.Failed */, (0, iconRegistry_1.registerIcon)('testing-failed-icon', codicons_1.Codicon.error, (0, nls_1.localize)('testingFailedIcon', 'Icon shown for tests that failed.'))],
        [3 /* TestResultState.Passed */, (0, iconRegistry_1.registerIcon)('testing-passed-icon', codicons_1.Codicon.pass, (0, nls_1.localize)('testingPassedIcon', 'Icon shown for tests that passed.'))],
        [1 /* TestResultState.Queued */, (0, iconRegistry_1.registerIcon)('testing-queued-icon', codicons_1.Codicon.history, (0, nls_1.localize)('testingQueuedIcon', 'Icon shown for tests that are queued.'))],
        [2 /* TestResultState.Running */, iconRegistry_1.spinningLoading],
        [5 /* TestResultState.Skipped */, (0, iconRegistry_1.registerIcon)('testing-skipped-icon', codicons_1.Codicon.debugStepOver, (0, nls_1.localize)('testingSkippedIcon', 'Icon shown for tests that are skipped.'))],
        [0 /* TestResultState.Unset */, (0, iconRegistry_1.registerIcon)('testing-unset-icon', codicons_1.Codicon.circleOutline, (0, nls_1.localize)('testingUnsetIcon', 'Icon shown for tests that are in an unset state.'))],
    ]);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        for (const [state, icon] of exports.testingStatesToIcons.entries()) {
            const color = theme_1.testStatesToIconColors[state];
            if (!color) {
                continue;
            }
            collector.addRule(`.monaco-workbench ${themables_1.ThemeIcon.asCSSSelector(icon)} {
			color: ${theme.getColor(color)} !important;
		}`);
        }
        collector.addRule(`
		.monaco-editor ${themables_1.ThemeIcon.asCSSSelector(exports.testingRunIcon)},
		.monaco-editor ${themables_1.ThemeIcon.asCSSSelector(exports.testingRunAllIcon)} {
			color: ${theme.getColor(theme_1.testingColorRunAction)};
		}
	`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2Jyb3dzZXIvaWNvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVW5GLFFBQUEsZUFBZSxHQUFHLElBQUEsMkJBQVksRUFBQyxnQkFBZ0IsRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO0lBQzFILFFBQUEsa0JBQWtCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG1CQUFtQixFQUFFLGtCQUFPLENBQUMsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQztJQUNySSxRQUFBLGNBQWMsR0FBRyxJQUFBLDJCQUFZLEVBQUMsa0JBQWtCLEVBQUUsa0JBQU8sQ0FBQyxHQUFHLEVBQUUsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO0lBQzdILFFBQUEsZ0JBQWdCLEdBQUcsSUFBQSwyQkFBWSxFQUFDLG9CQUFvQixFQUFFLGtCQUFPLENBQUMsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLGtCQUFrQixFQUFFLG1DQUFtQyxDQUFDLENBQUMsQ0FBQztJQUMxSSxRQUFBLGlCQUFpQixHQUFHLElBQUEsMkJBQVksRUFBQyxzQkFBc0IsRUFBRSxrQkFBTyxDQUFDLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDLENBQUM7SUFDNUosK0RBQStEO0lBQ2xELFFBQUEsbUJBQW1CLEdBQUcsSUFBQSwyQkFBWSxFQUFDLHdCQUF3QixFQUFFLGtCQUFPLENBQUMsYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLHVDQUF1QyxDQUFD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