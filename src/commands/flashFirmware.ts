import * as vscode from 'vscode';
import runCommand from '../utils/runCommand';

export async function flashFirmware(context: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('ESP Tool');
    outputChannel.show();
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');
    const baudRate = config.get<number>('baudRate', 460800);
    const chipType = config.get<string>('chipType', 'esp32');
    let firmwarePath = config.get<string>('firmwarePath', '');

    if (!firmwarePath) {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectMany: false,
            openLabel: 'Выбрать файл прошивки'
        });
        if (!fileUri || fileUri.length === 0) {
            vscode.window.showWarningMessage('Файл прошивки не выбран.');
            return;
        }
        firmwarePath = fileUri[0].fsPath;
    }

    const command = `esptool.py --chip ${chipType} --port ${port} --baud ${baudRate} write_flash -z 0x1000 ${firmwarePath}`;
    try {
        await runCommand(command, outputChannel);
        vscode.window.showInformationMessage('Прошивка успешно залита на микроконтроллер.');
    } catch (error) {
        vscode.window.showErrorMessage('Ошибка при заливке прошивки на микроконтроллер.');
    }
}
