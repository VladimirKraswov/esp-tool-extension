import { ChildProcess, exec } from 'child_process';
import * as vscode from 'vscode';

export default function runCommand(command: string, outputChannel: vscode.OutputChannel): Promise<void> {
    return new Promise((resolve, reject) => {
        const process: ChildProcess = exec(command, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });

        process.stdout?.on('data', (data) => {
            outputChannel.append(data.toString());
        });

        process.stderr?.on('data', (data) => {
            outputChannel.append(data.toString());
        });
    });
}