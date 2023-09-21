/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Settings for code editors used in notebooks. This can be used to customize most editor.* settings.',
	"Notebook",
	"Priority list for output mime types",
	"Where the cell toolbar should be shown, or whether it should be hidden.",
	"Configure the cell toolbar position for for specific file types",
	"Whether the cell status bar should be shown.",
	"The cell Status bar is always hidden.",
	"The cell Status bar is always visible.",
	"The cell Status bar is hidden until the cell has executed. Then it becomes visible to show the execution status.",
	"Whether to use the enhanced text diff editor for notebook.",
	"Whether to render the overview ruler in the diff editor for notebook.",
	"Whether the cell toolbar should appear on hover or click.",
	"Whether to use separate undo/redo stack for each cell.",
	"Control whether the notebook editor should be rendered in a compact form. For example, when turned on, it will decrease the left margin width.",
	"Controls where the focus indicator is rendered, either along the cell borders or on the left gutter.",
	"Control where the insert cell actions should appear.",
	"A toolbar that appears on hover between cells.",
	"The toolbar at the top of the notebook editor.",
	"Both toolbars.",
	"The insert actions don't appear anywhere.",
	"Control whether to render a global toolbar inside the notebook editor.",
	"Experimental. Control whether to render notebook Sticky Scroll headers in the notebook editor.",
	"Control whether outputs action should be rendered in the output toolbar.",
	"Controls when the Markdown header folding arrow is shown.",
	"The folding controls are always visible.",
	"Never show the folding controls and reduce the gutter size.",
	"The folding controls are visible only on mouseover.",
	"Control whether the notebook editor should allow moving cells through drag and drop.",
	"Control whether extra actions are shown in a dropdown next to the run button.",
	"Control whether the actions on the notebook toolbar should render label or not.",
	"Controls how many lines of text are displayed in a text output. If {0} is enabled, this setting is used to determine the scroll height of the output.",
	"Controls the font size in pixels of rendered markup in notebooks. When set to {0}, 120% of {1} is used.",
	"Controls whether code cells in the interactive window are collapsed by default.",
	"Line height of the output text within notebook cells.\n - When set to 0, editor line height is used.\n - Values between 0 and 8 will be used as a multiplier with the font size.\n - Values greater than or equal to 8 will be used as effective values.",
	"Font size for the output text within notebook cells. When set to 0, {0} is used.",
	"The font family of the output text within notebook cells. When set to empty, the {0} is used.",
	"Initially render notebook outputs in a scrollable region when longer than the limit",
	"Controls whether the lines in output should wrap.",
	"Format a notebook on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down.",
	"Run a series of CodeActions for a notebook on save. CodeActions must be specified, the file must not be saved after delay, and the editor must not be shutting down. Example: `source.fixAll: true`",
	'Never triggers Code Actions on save.',
	'Triggers Code Actions only when explicitly saved.',
	"Format a notebook cell upon execution. A formatter must be available.",
	"Control whether a confirmation prompt is required to delete a running cell.",
	"Customize the Find Widget behavior for searching within notebook cells. When both markup source and markup preview are enabled, the Find Widget will search either the source code or preview based on the current state of the cell.",
	"Enables the incremental saving of notebooks in Remote environment. When enabled, only the changes to the notebook are sent to the extension host, improving performance for large notebooks and slow network connections.",
	"How far to scroll when revealing the next cell upon exectuting {0}.",
	'Scroll to fully reveal the next cell.',
	'Scroll to reveal the first line of the next cell.',
	'Do not scroll to reveal the next cell.'
]);