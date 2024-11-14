import * as vscode from 'vscode';

export function disconnectREPL() {
    const terminals = vscode.window.terminals;
    for (let terminal of terminals) {
        if (terminal.name === "ESP REPL") {
            terminal.dispose();
            vscode.window.showInformationMessage("Отключено от REPL для загрузки файла.");
        }
    }
}
