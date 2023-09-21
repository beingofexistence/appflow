/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"The default size.",
	"Increases the size, so it can be grabbed more easily with the mouse.",
	"Controls the height of the scrollbars used for tabs and breadcrumbs in the editor title area.",
	"Controls whether opened editors should show in tabs or not.",
	"Controls whether tabs should be wrapped over multiple lines when exceeding available space or whether a scrollbar should appear instead. This value is ignored when `#workbench.editor.showTabs#` is disabled.",
	"Controls whether scrolling over tabs will open them or not. By default tabs will only reveal upon scrolling, but not open. You can press and hold the Shift-key while scrolling to change this behavior for that duration. This value is ignored when `#workbench.editor.showTabs#` is disabled.",
	"Controls whether a top border is drawn on tabs for editors that have unsaved changes. This value is ignored when `#workbench.editor.showTabs#` is disabled.",
	"Controls whether editor file decorations should use badges.",
	"Controls whether editor file decorations should use colors.",
	"Show the name of the file. When tabs are enabled and two files have the same name in one group the distinguishing sections of each file's path are added. When tabs are disabled, the path relative to the workspace folder is shown if the editor is active.",
	"Show the name of the file followed by its directory name.",
	"Show the name of the file followed by its path relative to the workspace folder.",
	"Show the name of the file followed by its absolute path.",
	"Controls the format of the label for an editor.",
	"The name of the untitled file is derived from the contents of its first line unless it has an associated file path. It will fallback to the name in case the line is empty or contains no word characters.",
	"The name of the untitled file is not derived from the contents of the file.",
	"Controls the format of the label for an untitled editor.",
	"Controls if the empty editor text hint should be visible in the editor.",
	"Controls whether the language in a text editor is automatically detected unless the language has been explicitly set by the language picker. This can also be scoped by language so you can specify which languages you do not want to be switched off of. This is useful for languages like Markdown that often contain other languages that might trick language detection into thinking it's the embedded language and not Markdown.",
	"Enables use of editor history in language detection. This causes automatic language detection to favor languages that have been recently opened and allows for automatic language detection to operate with smaller inputs.",
	"When enabled, a language detection model that takes into account editor history will be given higher precedence.",
	"When enabled, shows a Status bar Quick Fix when the editor language doesn't match detected content language.",
	"Show in untitled text editors",
	"Show in notebook editors",
	"Controls the position of the editor's tabs close buttons, or disables them when set to 'off'. This value is ignored when `#workbench.editor.showTabs#` is disabled.",
	"Always keep tabs large enough to show the full editor label.",
	"Allow tabs to get smaller when the available space is not enough to show all tabs at once.",
	"Make all tabs the same size, while allowing them to get smaller when the available space is not enough to show all tabs at once.",
	"Controls the size of editor tabs. This value is ignored when `#workbench.editor.showTabs#` is disabled.",
	"Controls the minimum width of tabs when `#workbench.editor.tabSizing#` size is set to `fixed`.",
	"Controls the maximum width of tabs when `#workbench.editor.tabSizing#` size is set to `fixed`.",
	"Controls the height of editor tabs. Also applies to the title control bar when `#workbench.editor.showTabs#` is disabled.",
	"A pinned tab inherits the look of non pinned tabs.",
	"A pinned tab will show in a compact form with only icon or first letter of the editor name.",
	"A pinned tab shrinks to a compact fixed size showing parts of the editor name.",
	"Controls the size of pinned editor tabs. Pinned tabs are sorted to the beginning of all opened tabs and typically do not close until unpinned. This value is ignored when `#workbench.editor.showTabs#` is disabled.",
	"Always prevent closing the pinned editor when using mouse middle click or keyboard.",
	"Prevent closing the pinned editor when using the keyboard.",
	"Prevent closing the pinned editor when using mouse middle click.",
	"Never prevent closing a pinned editor.",
	"Controls whether pinned editors should close when keyboard or middle mouse click is used for closing.",
	"Splits the active editor group to equal parts, unless all editor groups are already in equal parts. In that case, splits all the editor groups to equal parts.",
	"Splits all the editor groups to equal parts.",
	"Splits the active editor group to equal parts.",
	"Controls the size of editor groups when splitting them.",
	"Controls if editor groups can be split from drag and drop operations by dropping an editor or file on the edges of the editor area.",
	"Controls whether editors are closed in most recently used order or from left to right.",
	"Controls whether opened editors should show with an icon or not. This requires a file icon theme to be enabled as well.",
	"Controls whether opened editors show as preview editors. Preview editors do not stay open, are reused until explicitly set to be kept open (via double-click or editing), and show file names in italics.",
	"Controls whether editors opened from Quick Open show as preview editors. Preview editors do not stay open, and are reused until explicitly set to be kept open (via double-click or editing). When enabled, hold Ctrl before selection to open an editor as a non-preview. This value is ignored when `#workbench.editor.enablePreview#` is disabled.",
	"Controls whether editors remain in preview when a code navigation is started from them. Preview editors do not stay open, and are reused until explicitly set to be kept open (via double-click or editing). This value is ignored when `#workbench.editor.enablePreview#` is disabled.",
	"Controls whether editors showing a file that was opened during the session should close automatically when getting deleted or renamed by some other process. Disabling this will keep the editor open  on such an event. Note that deleting from within the application will always close the editor and that editors with unsaved changes will never close to preserve your data.",
	"Controls where editors open. Select `left` or `right` to open editors to the left or right of the currently active one. Select `first` or `last` to open editors independently from the currently active one.",
	"Controls the default direction of editors that are opened side by side (for example, from the Explorer). By default, editors will open on the right hand side of the currently active one. If changed to `down`, the editors will open below the currently active one.",
	"Controls the behavior of empty editor groups when the last tab in the group is closed. When enabled, empty groups will automatically close. When disabled, empty groups will remain part of the grid.",
	"Controls whether an editor is revealed in any of the visible groups if opened. If disabled, an editor will prefer to open in the currently active editor group. If enabled, an already opened editor will be revealed instead of opened again in the currently active editor group. Note that there are some cases where this setting is ignored, such as when forcing an editor to open in a specific group or to the side of the currently active group.",
	"Enables the use of mouse buttons four and five for commands 'Go Back' and 'Go Forward'.",
	"Controls the scope of history navigation in editors for commands such as 'Go Back' and 'Go Forward'.",
	"Navigate across all opened editors and editor groups.",
	"Navigate only in editors of the active editor group.",
	"Navigate only in the active editor.",
	"Restores the last editor view state (such as scroll position) when re-opening editors after they have been closed. Editor view state is stored per editor group and discarded when a group closes. Use the {0} setting to use the last known view state across all editor groups in case no previous view state was found for a editor group.",
	"Preserves the most recent editor view state (such as scroll position) across all editor groups and restores that if no specific editor view state is found for the editor group.",
	"Controls the layout for when an editor is split in an editor group to be either vertical or horizontal.",
	"Editors are positioned from top to bottom.",
	"Editors are positioned from left to right.",
	"Controls if the centered layout should automatically resize to maximum width when more than one group is open. Once only one group is open it will resize back to the original centered width.",
	"Controls whether the centered layout tries to maintain constant width when the window is resized.",
	"Controls whether to maximize/restore the editor group when double clicking on a tab. This value is ignored when `#workbench.editor.showTabs#` is disabled.",
	"Controls if the number of opened editors should be limited or not. When enabled, less recently used editors will close to make space for newly opening editors.",
	"Controls the maximum number of opened editors. Use the {0} setting to control this limit per editor group or across all groups.",
	"Controls if the maximum number of opened editors should exclude dirty editors for counting towards the configured limit.",
	"Controls if the limit of maximum opened editors should apply per editor group or across all editor groups.",
	"Controls whether local file history is enabled. When enabled, the file contents of an editor that is saved will be stored to a backup location to be able to restore or review the contents later. Changing this setting has no effect on existing local file history entries.",
	"Controls the maximum size of a file (in KB) to be considered for local file history. Files that are larger will not be added to the local file history. Changing this setting has no effect on existing local file history entries.",
	"Controls the maximum number of local file history entries per file. When the number of local file history entries exceeds this number for a file, the oldest entries will be discarded.",
	"Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) for excluding files from the local file history. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths. Changing this setting has no effect on existing local file history entries.",
	"Configure an interval in seconds during which the last entry in local file history is replaced with the entry that is being added. This helps reduce the overall number of entries that are added, for example when auto save is enabled. This setting is only applied to entries that have the same source of origin. Changing this setting has no effect on existing local file history entries.",
	"Controls the number of recently used commands to keep in history for the command palette. Set to 0 to disable command history.",
	"Controls whether the last typed input to the command palette should be restored when opening it the next time.",
	"Controls whether the command palette should have a list of commonly used commands.",
	"Controls where the command palette should ask chat questions.",
	"Ask chat questions in the Chat view.",
	"Ask chat questions in Quick Chat.",
	"Controls whether the command palette should include similar commands. You must have an extension installed that provides Natural Language support.",
	"Controls whether Quick Open should close automatically once it loses focus.",
	"Controls whether the last typed input to Quick Open should be restored when opening it the next time.",
	"Controls whether opening settings also opens an editor showing all default settings.",
	"Controls whether to use the split JSON editor when editing settings as JSON.",
	"Controls whether opening keybinding settings also opens an editor showing all default keybindings.",
	"Controls the location of the primary side bar and activity bar. They can either show on the left or right of the workbench. The secondary side bar will show on the opposite side of the workbench.",
	"Controls the default location of the panel (Terminal, Debug Console, Output, Problems) in a new workspace. It can either show at the bottom, right, or left of the editor area.",
	"Controls whether the panel opens maximized. It can either always open maximized, never open maximized, or open to the last state it was in before being closed.",
	"Always maximize the panel when opening it.",
	"Never maximize the panel when opening it. The panel will open un-maximized.",
	"Open the panel to the state that it was in, before it was closed.",
	"Controls the visibility of the status bar at the bottom of the workbench.",
	"Controls the visibility of the activity bar in the workbench.",
	"Controls the behavior of clicking an activity bar icon in the workbench.",
	"Hide the side bar if the clicked item is already visible.",
	"Focus side bar if the clicked item is already visible.",
	"Controls the visibility of view header actions. View header actions may either be always visible, or only visible when that view is focused or hovered over.",
	"Controls font aliasing method in the workbench.",
	"Sub-pixel font smoothing. On most non-retina displays this will give the sharpest text.",
	"Smooth the font on the level of the pixel, as opposed to the subpixel. Can make the font appear lighter overall.",
	"Disables font smoothing. Text will show with jagged sharp edges.",
	"Applies `default` or `antialiased` automatically based on the DPI of displays.",
	"Use the settings UI editor.",
	"Use the JSON file editor.",
	"Determines which settings editor to use by default.",
	"Controls the delay in milliseconds after which the hover is shown for workbench items (ex. some extension provided tree view items). Already visible items may require a refresh before reflecting this setting change.",
	"Controls whether the workbench should render with fewer animations.",
	"Always render with reduced motion.",
	"Do not render with reduced motion",
	"Render with reduced motion based on OS configuration.",
	"Controls whether the layout control in the title bar is shown.",
	"Controls whether the layout control is shown in the custom title bar. This setting only has an effect when {0} is set to {1}.",
	"Shows a single button with a dropdown of layout options.",
	"Shows several buttons for toggling the visibility of the panels and side bar.",
	"Shows both the dropdown and toggle buttons.",
	"Controls whether the layout control in the custom title bar is displayed as a single menu button or with multiple UI toggles.",
	"When enabled, will show the watermark tips when no editor is open.",
	"Controls the window title based on the current context such as the opened workspace or active editor. Variables are substituted based on the context:",
	"`${activeEditorShort}`: the file name (e.g. myFile.txt).",
	"`${activeEditorMedium}`: the path of the file relative to the workspace folder (e.g. myFolder/myFileFolder/myFile.txt).",
	"`${activeEditorLong}`: the full path of the file (e.g. /Users/Development/myFolder/myFileFolder/myFile.txt).",
	"`${activeFolderShort}`: the name of the folder the file is contained in (e.g. myFileFolder).",
	"`${activeFolderMedium}`: the path of the folder the file is contained in, relative to the workspace folder (e.g. myFolder/myFileFolder).",
	"`${activeFolderLong}`: the full path of the folder the file is contained in (e.g. /Users/Development/myFolder/myFileFolder).",
	"`${folderName}`: name of the workspace folder the file is contained in (e.g. myFolder).",
	"`${folderPath}`: file path of the workspace folder the file is contained in (e.g. /Users/Development/myFolder).",
	"`${rootName}`: name of the workspace with optional remote name and workspace indicator if applicable (e.g. myFolder, myRemoteFolder [SSH] or myWorkspace (Workspace)).",
	"`${rootNameShort}`: shortened name of the workspace without suffixes (e.g. myFolder, myRemoteFolder or myWorkspace).",
	"`${rootPath}`: file path of the opened workspace or folder (e.g. /Users/Development/myWorkspace).",
	"`${profileName}`: name of the profile in which the workspace is opened (e.g. Data Science (Profile)). Ignored if default profile is used.",
	"`${appName}`: e.g. VS Code.",
	"`${remoteName}`: e.g. SSH",
	"`${dirty}`: an indicator for when the active editor has unsaved changes.",
	"`${focusedView}`: the name of the view that is currently focused.",
	"`${separator}`: a conditional separator (\" - \") that only shows when surrounded by variables with values or static text.",
	"Window",
	"Separator used by {0}.",
	"Show command launcher together with the window title.",
	"Show command launcher together with the window title. This setting only has an effect when {0} is set to {1}.",
	"Menu is displayed at the top of the window and only hidden in full screen mode.",
	"Menu is always visible at the top of the window even in full screen mode.",
	"Menu is hidden but can be displayed at the top of the window by executing the `Focus Application Menu` command.",
	"Menu is hidden but can be displayed at the top of the window via the Alt key.",
	"Menu is always hidden.",
	"Menu is displayed as a compact button in the side bar.",
	"Menu is displayed as a compact button in the side bar. This value is ignored when {0} is {1}.",
	"Control the visibility of the menu bar. A setting of 'toggle' means that the menu bar is hidden and executing `Focus Application Menu` will show it. A setting of 'compact' will move the menu into the side bar.",
	"Control the visibility of the menu bar. A setting of 'toggle' means that the menu bar is hidden and a single press of the Alt key will show it. A setting of 'compact' will move the menu into the side bar.",
	"Controls whether the main menus can be opened via Alt-key shortcuts. Disabling mnemonics allows to bind these Alt-key shortcuts to editor commands instead.",
	"Controls whether the menu bar will be focused by pressing the Alt-key. This setting has no effect on toggling the menu bar with the Alt-key.",
	"Files will open in a new window.",
	"Files will open in the window with the files' folder open or the last active window.",
	"Files will open in the window with the files' folder open or the last active window unless opened via the Dock or from Finder.",
	"Files will open in a new window unless picked from within the application (e.g. via the File menu).",
	"Controls whether files should open in a new window when using a command line or file dialog.\nNote that there can still be cases where this setting is ignored (e.g. when using the `--new-window` or `--reuse-window` command line option).",
	"Controls whether files should open in a new window when using a command line or file dialog.\nNote that there can still be cases where this setting is ignored (e.g. when using the `--new-window` or `--reuse-window` command line option).",
	"Folders will open in a new window.",
	"Folders will replace the last active window.",
	"Folders will open in a new window unless a folder is picked from within the application (e.g. via the File menu).",
	"Controls whether folders should open in a new window or replace the last active window.\nNote that there can still be cases where this setting is ignored (e.g. when using the `--new-window` or `--reuse-window` command line option).",
	"Always try to ask for confirmation. Note that browsers may still decide to close a tab or window without confirmation.",
	"Always ask for confirmation.",
	"Only ask for confirmation if a keybinding was used to close the window. Note that detection may not be possible in some cases.",
	"Only ask for confirmation if a keybinding was used.",
	"Never explicitly ask for confirmation unless data loss is imminent.",
	"Never explicitly ask for confirmation.",
	"Controls whether to show a confirmation dialog before closing the browser tab or window. Note that even if enabled, browsers may still decide to close a tab or window without confirmation and that this setting is only a hint that may not work in all cases.",
	"Controls whether to show a confirmation dialog before closing the window or quitting the application.",
	"Zen Mode",
	"Controls whether turning on Zen Mode also puts the workbench into full screen mode.",
	"Controls whether turning on Zen Mode also centers the layout.",
	"Controls whether turning on Zen Mode also hides workbench tabs.",
	"Controls whether turning on Zen Mode also hides the status bar at the bottom of the workbench.",
	"Controls whether turning on Zen Mode also hides the activity bar either at the left or right of the workbench.",
	"Controls whether turning on Zen Mode also hides the editor line numbers.",
	"Controls whether a window should restore to Zen Mode if it was exited in Zen Mode.",
	"Controls whether notifications do not disturb mode should be enabled while in Zen Mode. If true, only error notifications will pop out."
]);