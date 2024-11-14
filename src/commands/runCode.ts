import * as vscode from 'vscode';
import runCommand from '../utils/runCommand';

export async function runCode() {
    const outputChannel = vscode.window.createOutputChannel('ESP Tool');
    outputChannel.show();
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');

    try {
        await runCommand(`ampy --port ${port} run main.py`, outputChannel);
        vscode.window.showInformationMessage('Код успешно запущен на микроконтроллере.');
    } catch (error) {
        vscode.window.showErrorMessage('Ошибка при запуске кода на микроконтроллере.');
    }
}
