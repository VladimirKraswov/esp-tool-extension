import * as vscode from 'vscode';
import runCommand from '../utils/runCommand';

export async function eraseFlash() {
    const outputChannel = vscode.window.createOutputChannel('ESP Tool');
    outputChannel.show();
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');
    try {
        await runCommand(`esptool.py --port ${port} erase_flash`, outputChannel);
        vscode.window.showInformationMessage('Флеш микроконтроллера успешно стерт.');
    } catch (error) {
        vscode.window.showErrorMessage('Ошибка при стирании флеша микроконтроллера.');
    }
}
