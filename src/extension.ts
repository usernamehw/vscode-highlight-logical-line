'use strict';
import { Disposable, Position, Range, ThemeColor, window, workspace } from 'vscode';

export function activate() {
	const disposableEvents: Disposable[] = [];
	const decorationOptions = {
		isWholeLine: true,
		backgroundColor: new ThemeColor('highlightLogicalLine.background'),
	};
	let decorationType = window.createTextEditorDecorationType(decorationOptions);
	const editorWordWrap = workspace.getConfiguration('editor').get('wordWrap');

	let activeEditor = window.activeTextEditor;
	let isLineChanged: boolean;
	let lastActivePosition: Position | undefined;
	updateAllEditorDecorations();

	disposableEvents.push(onEditorChange(), onCursorChange());

	if (editorWordWrap === 'off') {
		decorationType.dispose();
		disposeEventListeners(disposableEvents);
	}

	function updateAllEditorDecorations() {
		window.visibleTextEditors.forEach(editor => {

			const currentPosition = editor.selection.active;
			const newDecoration = { range: new Range(currentPosition, currentPosition) };
			editor.setDecorations(decorationType, [newDecoration]);
		});
	}
	function updateDecorations() {
		if (!activeEditor) return;
		const activePosition = activeEditor.selection.active;
		if (lastActivePosition) {
			isLineChanged = lastActivePosition.line !== activePosition.line;
		}

		const newDecoration = { range: new Range(activePosition, activePosition) };

		if (lastActivePosition === undefined || isLineChanged) {
			activeEditor.setDecorations(decorationType, [newDecoration]);
		}

		if (!activeEditor) return;
		lastActivePosition = new Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
	}

	workspace.onDidChangeConfiguration(event => {
		if (event.affectsConfiguration('editor.wordWrap')) {
			const editorWordWrap = workspace.getConfiguration('editor').get('wordWrap');
			if (editorWordWrap === 'off') {
				disposeEventListeners(disposableEvents);
				decorationType.dispose();
				return;
			} else {
				decorationType = window.createTextEditorDecorationType(decorationOptions);
				updateAllEditorDecorations();
				disposableEvents.push(onEditorChange(), onCursorChange());
			}
		}
	});

	function onEditorChange() {
		return window.onDidChangeActiveTextEditor(textEditor => {
			lastActivePosition = undefined;

			activeEditor = textEditor;
			updateAllEditorDecorations();

			if (!activeEditor) return;
			lastActivePosition = new Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
		});
	}
	function onCursorChange() {
		return window.onDidChangeTextEditorSelection(() => {
			updateDecorations();
		});
	}
}

function disposeEventListeners(disposables: Disposable[]) {
	disposables.forEach((disposable: Disposable) => {
		disposable.dispose();
	});
}

export function deactivate() { }