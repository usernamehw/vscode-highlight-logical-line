'use strict';
import { window, workspace } from 'vscode';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const decorationOptions = {
		isWholeLine: true,
		backgroundColor: new vscode.ThemeColor('highlightLogicalLine.background'),
	};
	let decorationType: vscode.TextEditorDecorationType;
	let activeEditor = window.activeTextEditor;
	let lastPositionLine = 999999;

	wordWrapCheck();
	workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('editor.wordWrap')) {
			wordWrapCheck();
		}
	});

	function updateAllEditorDecorations() {
		window.visibleTextEditors.forEach(editor => {
			const activePosition = editor.selection.active;
			editor.setDecorations(decorationType, [{
				range: new vscode.Range(activePosition, activePosition),
			}]);
		});
	}
	function updateDecorations() {
		if (!activeEditor) return;
		const activePosition = activeEditor.selection.active;

		if (lastPositionLine !== activePosition.line) {
			activeEditor.setDecorations(decorationType, [{
				range: new vscode.Range(activePosition, activePosition),
			}]);
		}

		lastPositionLine = activePosition.line;
	}

	function onActiveEditorChange() {
		return window.onDidChangeActiveTextEditor(textEditor => {
			lastPositionLine = 999999;

			activeEditor = textEditor;
			updateAllEditorDecorations();

			if (!activeEditor) return;

			lastPositionLine = activeEditor.selection.active.line;
		});
	}
	function onCursorChange() {
		return window.onDidChangeTextEditorSelection(updateDecorations);
	}
	function wordWrapCheck() {
		if (decorationType) {
			decorationType.dispose();
		}
		const editorWordWrap = workspace.getConfiguration('editor', null).get('wordWrap');
		if (editorWordWrap === 'off') {
			disposeAllEventListeners(context.subscriptions);
		} else {
			decorationType = window.createTextEditorDecorationType(decorationOptions);
			updateAllEditorDecorations();
			context.subscriptions.push(onActiveEditorChange(), onCursorChange());
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
