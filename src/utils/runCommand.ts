import * as vscode from 'vscode';
import { exec } from 'child_process';

export default function runCommand(command: string, outputChannel: vscode.OutputChannel): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                outputChannel.appendLine(`Ошибка: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                outputChannel.appendLine(`Стандартная ошибка: ${stderr}`);
            }
            outputChannel.appendLine(stdout);
            resolve();
        });
    });
}
