'use strict'
import { window, Range, Position, ThemeColor, workspace, Disposable } from 'vscode'

export function activate() {
    const disposableEvents: Array<Disposable> = [];
    const decorationOptions = {
        isWholeLine: true,
        backgroundColor: new ThemeColor('highlightLogicalLine.background'),
    }
    let decorationType = window.createTextEditorDecorationType(decorationOptions);
    const editorWordWrap = workspace.getConfiguration('editor').get('wordWrap');

    let activeEditor = window.activeTextEditor;
    let isLineChanged: boolean;
    let lastActivePosition: Position | undefined;
    updateDecorations(true);

    disposableEvents.push(onEditorChange(), onCursorChange());

    if (editorWordWrap === 'off') {
        decorationType.dispose();
        disposeEventListeners(disposableEvents);
    }

    function updateDecorations(updateAllVisibleEditors = false) {
        if (updateAllVisibleEditors) {
            window.visibleTextEditors.forEach((editor) => {
                const currentPosition = editor.selection.active;
                const newDecoration = { range: new Range(currentPosition, currentPosition) };
                editor.setDecorations(decorationType, [newDecoration]);
            });
        } else {
            if (!activeEditor) return;
            const activePosition = activeEditor.selection.active;
            if (lastActivePosition) {
                isLineChanged = lastActivePosition.line !== activePosition.line;
            }

            const newDecoration = { range: new Range(activePosition, activePosition) }

            if (lastActivePosition === undefined || isLineChanged) {
                activeEditor.setDecorations(decorationType, [newDecoration])
            }
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
                console.log(editorWordWrap);
                return;
            } else {
                decorationType = window.createTextEditorDecorationType(decorationOptions);
                updateDecorations(true);
                disposableEvents.push(onEditorChange(), onCursorChange());
            }
        }
    });

    function onEditorChange() {
        return window.onDidChangeActiveTextEditor(() => {
            lastActivePosition = undefined;

            activeEditor = window.activeTextEditor
            updateDecorations(true)

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

function disposeEventListeners(disposables: Array<Disposable>) {
    disposables.forEach((disposable: Disposable) => {
        disposable.dispose();
    });
}

export function deactivate() { }