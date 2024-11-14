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

export function activate(context: vscode.ExtensionContext) {
    console.log('ESP Tool Extension is now active!');

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