import * as vscode from 'vscode';
import { exec } from 'child_process';
import { getIgnoredFiles, getProjectFiles } from '../utils/files';
import path from 'path';

// Универсальная функция выполнения команд
function executeCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || error.message);
            } else {
                resolve();
            }
        });
    });
}

// Проверка и создание директории
async function ensureDirectoryExists(directory: string, port: string): Promise<void> {
    const listDirCommand = `ampy --port ${port} ls "${directory}"`;
    try {
        await executeCommand(listDirCommand);
        console.log(`Директория ${directory} уже существует на контроллере.`);
    } catch {
        const mkdirCommand = `ampy --port ${port} mkdir "${directory}"`;
        try {
            await executeCommand(mkdirCommand);
        } catch (error) {
            console.warn(`Ошибка создания директории ${directory}: ${error}`);
            throw error;
        }
    }
}

// Загрузка файла на контроллер
async function uploadFileToController(filePath: string, relativePath: string, port: string): Promise<void> {
    const command = `ampy --port ${port} put "${filePath}" "${relativePath}"`;
    await executeCommand(command);
}

// Основная функция загрузки проекта
export async function uploadProjectToController() {
    const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath;
    const config = vscode.workspace.getConfiguration('espTool');
    const port = config.get<string>('port', '/dev/ttyUSB0');

    const ignoredFiles = getIgnoredFiles(rootPath);
    const files = getProjectFiles(rootPath, ignoredFiles);

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Загрузка проекта на контроллер',
        cancellable: false
    }, async (progress) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(rootPath, file);
            const directory = path.dirname(file);

            progress.report({ message: `Загрузка: ${file} (${i + 1} из ${files.length})`, increment: (1 / files.length) * 100 });

            if (directory !== '.') {
                try {
                    await ensureDirectoryExists(directory, port);
                } catch (error) {
                    vscode.window.showWarningMessage(`Не удалось создать директорию ${directory}. Пропуск.`);
                    continue; // Пропуск файла, если директория не создана
                }
            }

            try {
                await uploadFileToController(filePath, file, port);
                console.log(`Загружен файл: ${file}`);
            } catch (error) {
                vscode.window.showWarningMessage(`Ошибка загрузки файла ${file}. Пропуск.`);
                console.warn(`Ошибка загрузки файла ${file}: ${error}`);
                continue; // Пропуск файла при ошибке
            }
        }
        vscode.window.showInformationMessage('Проект успешно загружен на контроллер (с учетом пропущенных файлов).');
    });
}