'use strict'
import { window, Range, Position, ThemeColor } from 'vscode'

export function activate() {
    let bg = new ThemeColor('highlightLogicalLine.background');
    const decorationType = window.createTextEditorDecorationType({
        isWholeLine: true,
        backgroundColor: bg || 'rgba(65, 166, 217, 0.3)',
    });

    let activeEditor = window.activeTextEditor;
    let isLineChanged: boolean;
    let lastActivePosition: Position | undefined;
    updateDecorations(true);

    window.onDidChangeActiveTextEditor(() => {
        lastActivePosition = undefined;

        activeEditor = window.activeTextEditor
        updateDecorations(true)

        if (!activeEditor) return;
        lastActivePosition = new Position(activeEditor.selection.active.line, activeEditor.selection.active.character);
    });

    window.onDidChangeTextEditorSelection(() => {
        updateDecorations();
    });

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
}

export function deactivate() { }