import fs from "fs";
import path from "path";

// Чтение игнорируемых файлов из .gitignore и .uploadignore
export function getIgnoredFiles(rootPath: string): string[] {
    const ignoreFiles = ['.gitignore', '.uploadignore'];
    const ignoredFiles = new Set<string>();

    ignoreFiles.forEach(ignoreFile => {
        const ignorePath = path.join(rootPath, ignoreFile);
        if (fs.existsSync(ignorePath)) {
            const lines = fs.readFileSync(ignorePath, 'utf-8').split(/\r?\n/);
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const fullPath = path.resolve(rootPath, trimmedLine);
                    ignoredFiles.add(fullPath);
                }
            });
        }
    });

    return Array.from(ignoredFiles);
}
export function getProjectFiles(rootPath: string, ignoredFiles: string[]): string[] {
    const files: string[] = [];

    function readDirRecursive(dir: string) {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            if (ignoredFiles.includes(filePath)) {
                return; // Пропустить игнорируемый файл или папку
            }

            if (fs.statSync(filePath).isDirectory()) {
                readDirRecursive(filePath);
            } else {
                files.push(filePath);
            }
        });
    }

    readDirRecursive(rootPath);
    return files.map(file => path.relative(rootPath, file));
}