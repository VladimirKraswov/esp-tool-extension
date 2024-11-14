import * as vscode from 'vscode';
import { eraseFlash } from './commands/eraseFlash';
import { flashFirmware } from './commands/flashFirmware';
import { connectREPL } from './commands/connectREPL';
import { disconnectREPL } from './commands/disconnectREPL';
import { uploadFile } from './commands/uploadFile';
import { listFiles } from './commands/listFiles';
import { runCode } from './commands/runCode';
import { resetDevice } from './commands/resetDevice';
import { showControlPanel } from './commands/showControlPanel';
import { exec } from 'child_process';

// Проверка зависимости
async function checkDependency(command: string): Promise<boolean> {
    return new Promise((resolve) => {
        exec(command, (error) => {
            resolve(!error); // Если ошибка, значит зависимость не установлена
        });
    });
}

// Функция для выбора глобальной команды установки в зависимости от ОС
function getInstallCommand(tool: string): string {
    if (tool === 'python') {
        return process.platform === 'win32' ? 'choco install python' : 'brew install python';
    }
    if (tool === 'esptool.py') {
        return 'python -m pip install --user esptool';
    }
    if (tool === 'ampy') {
        return 'python -m pip install --user adafruit-ampy';
    }
    if (tool === 'picocom') {
        return process.platform === 'win32' ? 'winget install picocom' : 'sudo apt-get install -y picocom';
    }
    return '';
}

// Установка зависимости с запросом
async function promptToInstall(tool: string) {
    const installCommand = getInstallCommand(tool);
    if (!installCommand) {
        vscode.window.showErrorMessage(`Не удалось найти команду для установки ${tool} на вашей ОС.`);
        return;
    }

    const selection = await vscode.window.showInformationMessage(
        `${tool} не установлен. Хотите установить его глобально?`,
        'Да',
        'Нет'
    );

    if (selection === 'Да') {
        exec(installCommand, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Ошибка при установке ${tool}: ${stderr}`);
            } else {
                vscode.window.showInformationMessage(`${tool} успешно установлен глобально.`);
            }
        });
    }
}

// Проверка и установка зависимостей
export async function checkDependencies() {
    const dependencies = [
        { name: 'python', checkCommand: 'python --version' },
        { name: 'esptool.py', checkCommand: 'python -m esptool version' },
        { name: 'ampy', checkCommand: 'ampy --help' },
        { name: 'picocom', checkCommand: 'picocom --help' },
    ];

    for (const dep of dependencies) {
        const installed = await checkDependency(dep.checkCommand);
        if (!installed) {
            await promptToInstall(dep.name);
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('ESP Tool Extension is now active!');

    checkDependencies();

    context.subscriptions.push(
        vscode.commands.registerCommand('espTool.eraseFlash', eraseFlash),
        vscode.commands.registerCommand('espTool.flashFirmware', () => flashFirmware(context)),
        vscode.commands.registerCommand('espTool.connectREPL', connectREPL),
        vscode.commands.registerCommand('espTool.disconnectREPL', disconnectREPL),
        vscode.commands.registerCommand('espTool.uploadFile', uploadFile),
        vscode.commands.registerCommand('espTool.listFiles', listFiles),
        vscode.commands.registerCommand('espTool.runCode', runCode),
        vscode.commands.registerCommand('espTool.resetDevice', resetDevice),
        vscode.commands.registerCommand('espTool.showControlPanel', () => showControlPanel(context))
    );
}

export function deactivate() {}