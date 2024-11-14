import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { disconnectREPL } from './disconnectREPL';
import { connectREPL } from './connectREPL';
import { uploadFile } from './uploadFile';
import { runCode } from './runCode';
import { resetDevice } from './resetDevice';
import { rescanPorts } from '../utils/serialPorts';

export function showControlPanel(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'espControlPanel',
        'ESP Control Panel',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview'))]
        }
    );

    const webviewPath = path.join(context.extensionPath, 'src', 'webview', 'index.html');
    
    if (!fs.existsSync(webviewPath)) {
        vscode.window.showErrorMessage('Не удалось найти файл index.html для панели управления.');
        return;
    }

    const stylePath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'style.css')));
    const scriptPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview', 'script.js')));
    
    let htmlContent = fs.readFileSync(webviewPath, 'utf-8');

    // Вставляем пути к CSS и JS в HTML
    htmlContent = htmlContent.replace('${stylePath}', stylePath.toString());
    htmlContent = htmlContent.replace('${scriptPath}', scriptPath.toString());

    // Устанавливаем базовый URI для webview
    htmlContent = htmlContent.replace(
        /(<head>)/,
        `$1<base href="${panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview')))}">`
    );

    panel.webview.html = htmlContent;

    // Получаем сохранённый порт из настроек
    const savedPort = vscode.workspace.getConfiguration().get<string>('espTool.port', '');

    // Инициализация списка портов при загрузке панели, включая передачу сохранённого порта
    rescanPorts(panel, savedPort);

    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'run':
                vscode.window.showInformationMessage('Запуск загрузки файлов и main.py');
                await disconnectREPL();
                await uploadFile();
                await runCode();
                break;

            case 'stop':
                vscode.window.showInformationMessage('Остановка main.py');
                await resetDevice();
                break;

            case 'connect':
                vscode.window.showInformationMessage('Подключение к REPL');
                await connectREPL();
                break;

            case 'disconnect':
                vscode.window.showInformationMessage('Отключение от REPL');
                await disconnectREPL();
                break;

            case 'rescanPorts':
                rescanPorts(panel, savedPort);
                break;

            case 'changePort':
                updatePortSetting(message.port);
                break;

            case 'error':
                vscode.window.showErrorMessage(`Ошибка: ${message.message}`);
                break;

            default:
                vscode.window.showWarningMessage(`Неизвестная команда: ${message.command}`);
                break;
        }
    });
}

// Функция для обновления выбранного порта в настройках
async function updatePortSetting(port: string) {
    try {
        await vscode.workspace.getConfiguration().update('espTool.port', port, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Порт ${port} сохранен в настройках.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Ошибка сохранения порта: ${error}`);
    }
}