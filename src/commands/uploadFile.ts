import * as vscode from 'vscode';
import runCommand from '../utils/runCommand';

export async function uploadFile() {
    const outputChannel = vscode.window.createOutputChannel('ESP Tool');
    outputChannel.show();

    await vscode.commands.executeCommand('espTool.disconnectREPL');

    const fileUri = await vscode.window.showOpenDialog({ canSelectMany: false, openLabel: 'Выбрать файл для загрузки' });
    if (!fileUri || fileUri.length === 0) {
        vscode.window.showWarningMessage('Файл не выбран.');
        return;
    }

    const filePath = fileUri[0].fsPath;
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');

    try {
        await runCommand(`ampy --port ${port} put ${filePath}`, outputChannel);
        vscode.window.showInformationMessage('Файл успешно загружен на микроконтроллер.');
    } catch (error) {
        vscode.window.showErrorMessage('Ошибка при загрузке файла на микроконтроллер.');
    }
}
