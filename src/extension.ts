import vscode, { DecorationRenderOptions, Disposable, Range, Selection, TextEditor, window, workspace } from 'vscode';

const decorationOptions: DecorationRenderOptions = {
	isWholeLine: true,
	backgroundColor: new vscode.ThemeColor('highlightLogicalLine.background'),
};
let decorationType: vscode.TextEditorDecorationType;
/**
 * Keep last decoration line numbers (to not update decorations when cursor moves (often)).
 */
let lastCursorLines: Set<number> = new Set();

export function activate() {
	let selectionChangeDisposable: Disposable | undefined;
	let isActive = false;

	wordWrapCheck(vscode.window.activeTextEditor);

	workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('editor.wordWrap')) {
			wordWrapCheck(vscode.window.activeTextEditor);
		}
	});
	window.onDidChangeActiveTextEditor(textEditor => {
		wordWrapCheck(textEditor);
	});

	function updateAllEditorDecorations() {
		for (const editor of window.visibleTextEditors) {
			updateDecorationsForEditor(editor);
		}
	}

	function onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
		const newCursorLines = selectionsToCursorLineNumbers(e.textEditor.selections);

		if (!isSetTheSame(lastCursorLines, newCursorLines)) {
			updateDecorationsForEditor(e.textEditor);
		}
	}

	/**
	 * Update events listeners and decorations in 2 additional cases (on top of main case when editor selection changes):
	 * - Setting 'editor.wordWrap' changed
	 * - Active text editor/tab changed
	 */
	function wordWrapCheck(editor: TextEditor | undefined) {
		const editorWordWrap = workspace.getConfiguration('editor', editor?.document).get('wordWrap');

		if (editorWordWrap === 'off') {
			disposeAll([selectionChangeDisposable, decorationType]);
			isActive = false;
		} else {
			if (!isActive) {
				decorationType = window.createTextEditorDecorationType(decorationOptions);
				selectionChangeDisposable = window.onDidChangeTextEditorSelection(onDidChangeTextEditorSelection);
			}

			updateAllEditorDecorations();
			isActive = true;
		}
	}
}

function updateDecorationsForEditor(editor: TextEditor) {
	// When at least 1 selection (not empty selection) - do not show any decorations (same as VSCode)
	if (editor.selections.some(selection => !selection.isEmpty)) {
		lastCursorLines = new Set();
		editor.setDecorations(decorationType, []);
		return;
	}

	lastCursorLines = selectionsToCursorLineNumbers(editor.selections);

	editor.setDecorations(decorationType, Array.from(lastCursorLines, (lineNumber => new Range(lineNumber, 0, lineNumber, 0))));
}

function selectionsToCursorLineNumbers(selections: Selection[]): Set<number> {
	return new Set(selections.filter(selection => selection.isEmpty)
		.map(selection => selection.start.line));
}

/**
 * Return true if 2 sets are identical.
 */
function isSetTheSame(set1: Set<number>, set2: Set<number>): boolean {
	return set1.size === set2.size && Array.from(set1).every(lineNumber => set2.has(lineNumber));
}

function disposeAll(disposables: (Disposable | undefined)[]) {
	for (const disposable of disposables) {
		disposable?.dispose();
	}
}

export function deactivate() {}
