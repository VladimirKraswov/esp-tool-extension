import * as vscode from 'vscode';

export function connectREPL() {
    const terminal = vscode.window.createTerminal('ESP REPL');
    terminal.show();
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');
    const baudRate = config.get<number>('baudRate', 115200);
    terminal.sendText(`picocom ${port} -b ${baudRate}`);
}
