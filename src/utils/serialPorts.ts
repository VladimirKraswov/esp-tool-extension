import * as vscode from 'vscode';
import { exec } from 'child_process';

// Функция для получения доступных портов
export async function getAvailablePorts() {
  return new Promise<{ path: string, description: string }[]>((resolve, reject) => {
    let command: string;

    // Определяем команду в зависимости от операционной системы
    if (process.platform === 'win32') {
      command = 'powershell "[System.IO.Ports.SerialPort]::GetPortNames()"';
    } else if (process.platform === 'darwin') {
      command = 'ls /dev/tty.*';
    } else if (process.platform === 'linux') {
      command = 'ls /dev/ttyUSB*';
    } else {
      return reject(new Error('Unsupported platform'));
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        vscode.window.showErrorMessage(`Ошибка при выполнении команды: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        vscode.window.showWarningMessage(`Сообщение об ошибке: ${stderr}`);
      }

      // Обрабатываем вывод команды, чтобы получить список портов
      const ports = stdout
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(path => ({ path: path.trim(), description: 'Serial Port' }));

      resolve(ports);
    });
  });
}

// Команда для пересканирования портов и отправки в веб-представление
export async function rescanPorts(panel?: vscode.WebviewPanel, savedPort: string = '') {
  try {
    const ports = await getAvailablePorts();
    if (panel) {
      panel.webview.postMessage({ command: 'populatePorts', ports, savedPort });
    }
  } catch (error: any) {
    if (panel) {
      panel.webview.postMessage({ command: 'error', message: error.message });
    }
  }
}