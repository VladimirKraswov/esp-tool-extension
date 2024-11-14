import * as vscode from 'vscode';
import runCommand from '../utils/runCommand';

export async function listFiles() {
    const outputChannel = vscode.window.createOutputChannel('ESP Tool');
    outputChannel.show();
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');

    try {
        await runCommand(`ampy --port ${port} ls`, outputChannel);
    } catch (error) {
        vscode.window.showErrorMessage('Ошибка при получении списка файлов с микроконтроллера.');
    }
}
