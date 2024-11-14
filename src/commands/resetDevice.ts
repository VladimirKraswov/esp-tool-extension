import * as vscode from 'vscode';
import runCommand from '../utils/runCommand';

export async function resetDevice() {
    const outputChannel = vscode.window.createOutputChannel('ESP Tool');
    outputChannel.show();
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');

    try {
        await runCommand(`ampy --port ${port} reset`, outputChannel);
        vscode.window.showInformationMessage('Микроконтроллер перезагружен.');
    } catch (error) {
        vscode.window.showErrorMessage('Ошибка при перезагрузке микроконтроллера.');
    }
}
