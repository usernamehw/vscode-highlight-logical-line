import vscode, { Disposable, TextEditor, window, workspace } from 'vscode';

export function activate() {
	const decorationOptions = {
		isWholeLine: true,
		backgroundColor: new vscode.ThemeColor('highlightLogicalLine.background'),
	};
	let decorationType: vscode.TextEditorDecorationType;
	let activeEditor = window.activeTextEditor;
	let lastPositionLine = 999999;
	let selectionChangeDisposable: Disposable | undefined;
	let isActive = false;

	wordWrapCheck(vscode.window.activeTextEditor);

	workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('editor.wordWrap')) {
			wordWrapCheck(vscode.window.activeTextEditor);
		}
	});
	window.onDidChangeActiveTextEditor(textEditor => {
		lastPositionLine = 999999;

		wordWrapCheck(textEditor);
		activeEditor = textEditor;

		if (!activeEditor) {
			return;
		}

		lastPositionLine = activeEditor.selection.active.line;
	});

	function updateAllEditorDecorations() {
		window.visibleTextEditors.forEach(editor => {
			const activePosition = editor.selection.active;
			editor.setDecorations(decorationType, [{
				range: new vscode.Range(activePosition, activePosition),
			}]);
		});
	}

	function onDidChangeTextEditorSelection(e: vscode.TextEditorSelectionChangeEvent) {
		if (!activeEditor) {
			return;
		}
		const activePosition = activeEditor.selection.active;

		if (lastPositionLine !== activePosition.line) {
			activeEditor.setDecorations(decorationType, [{
				range: new vscode.Range(activePosition, activePosition),
			}]);
		}

		lastPositionLine = activePosition.line;
	}

	/**
	 * Update events listeners and decorations in 2 cases:
	 * - Setting 'editor.wordWrap' changed
	 * - Active text editor/tab changed
	 */
	function wordWrapCheck(editor: TextEditor | undefined) {
		const editorWordWrap = workspace.getConfiguration('editor', editor?.document).get('wordWrap');

		if (editorWordWrap === 'off') {
			disposeAll([selectionChangeDisposable, decorationType]);
			isActive = false;
		} else {
			if (isActive) {
				return;
			}
			decorationType = window.createTextEditorDecorationType(decorationOptions);
			selectionChangeDisposable = window.onDidChangeTextEditorSelection(onDidChangeTextEditorSelection);

			updateAllEditorDecorations();
			isActive = true;
		}
	}
}

function disposeAll(disposables: (Disposable | undefined)[]) {
	for (const disposable of disposables) {
		if (disposable) {
			disposable.dispose();
		}
	}
}

export function deactivate() {}
