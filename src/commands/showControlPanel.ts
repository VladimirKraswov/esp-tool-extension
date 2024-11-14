import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { disconnectREPL } from './disconnectREPL';
import { connectREPL } from './connectREPL';
import { uploadFile } from './uploadFile';
import { runCode } from './runCode';
import { resetDevice } from './resetDevice';

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

    // Путь к HTML-файлу
    const webviewPath = path.join(context.extensionPath, 'src', 'webview', 'index.html');
    
    // Проверка существования HTML-файла
    if (!fs.existsSync(webviewPath)) {
        vscode.window.showErrorMessage('Не удалось найти файл index.html для панели управления.');
        return;
    }

    // Чтение HTML-файла
    let htmlContent = fs.readFileSync(webviewPath, 'utf-8');

    // Обновляем пути для ресурсов, если они есть
    htmlContent = htmlContent.replace(
        /(<head>)/,
        `$1<base href="${panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview')))}">`
    );

    // Установка HTML-контента для webview
    panel.webview.html = htmlContent;

    // Обработка сообщений от webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'run':
                vscode.window.showInformationMessage('Запуск загрузки файлов и main.py');
                await disconnectREPL(); // Отключаем REPL перед загрузкой
                await uploadFile(); // Загружаем необходимые файлы на контроллер
                await runCode(); // Запускаем main.py
                break;

            case 'stop':
                vscode.window.showInformationMessage('Остановка main.py');
                await resetDevice(); // Перезагружаем устройство, чтобы остановить выполнение main.py
                break;

            case 'connect':
                vscode.window.showInformationMessage('Подключение к REPL');
                await connectREPL(); // Подключаемся к REPL
                break;

            case 'disconnect':
                vscode.window.showInformationMessage('Отключение от REPL');
                await disconnectREPL(); // Отключаемся от REPL
                break;

            default:
                vscode.window.showWarningMessage(`Неизвестная команда: ${message.command}`);
                break;
        }
    });
}
