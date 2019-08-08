'use strict';
import { window, workspace } from 'vscode';
import * as vscode from 'vscode';

export function activate() {
	const disposables: vscode.Disposable[] = [];
	const decorationOptions = {
		isWholeLine: true,
		backgroundColor: new vscode.ThemeColor('highlightLogicalLine.background'),
	};
	let decorationType: vscode.TextEditorDecorationType;
	let activeEditor = window.activeTextEditor;
	let lastActivePosition: vscode.Position | undefined;

	wordWrapCheck();
	workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('editor.wordWrap')) {
			wordWrapCheck();
		}
	});

	function updateAllEditorDecorations() {
		window.visibleTextEditors.forEach(editor => {
			const currentPosition = editor.selection.active;
			const newDecoration = { range: new vscode.Range(currentPosition, currentPosition) };
			editor.setDecorations(decorationType, [newDecoration]);
		});
	}
	function updateDecorations() {
		if (!activeEditor) return;
		const activePosition = activeEditor.selection.active;
		let isLineChanged = false;
		if (lastActivePosition) {
			isLineChanged = lastActivePosition.line !== activePosition.line;
		}

		if (lastActivePosition === undefined || isLineChanged) {
			activeEditor.setDecorations(decorationType, [{
				range: new vscode.Range(activePosition, activePosition),
			}]);
		}

		lastActivePosition = activePosition;
	}

	function onActiveEditorChange() {
		return window.onDidChangeActiveTextEditor(textEditor => {
			lastActivePosition = undefined;

			activeEditor = textEditor;
			updateAllEditorDecorations();

			if (!activeEditor) return;

			lastActivePosition = activeEditor.selection.active;
		});
	}
	function onCursorChange() {
		return window.onDidChangeTextEditorSelection(() => {
			updateDecorations();
		});
	}
	function wordWrapCheck() {
		if (decorationType) {
			decorationType.dispose();
		}
		const editorWordWrap = workspace.getConfiguration('editor', null).get('wordWrap');
		if (editorWordWrap === 'off') {
			disposeAllEventListeners(disposables);
		} else {
			decorationType = window.createTextEditorDecorationType(decorationOptions);
			updateAllEditorDecorations();
			disposables.push(onActiveEditorChange(), onCursorChange());
		}
	}
}

function disposeAllEventListeners(disposables: vscode.Disposable[]) {
	disposables.forEach(disposable => {
		if (disposable) {
			disposable.dispose();
		}
	});
}

export function deactivate() { }
