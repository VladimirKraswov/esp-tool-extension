const vscode = acquireVsCodeApi();

// Load available ports when the page loads
window.onload = function() {
    rescanPorts();
};

function rescanPorts() {
    vscode.postMessage({ command: 'rescanPorts' });
}

function changePort() {
    const selectedPort = document.getElementById('portSelect').value;
    vscode.postMessage({ command: 'changePort', port: selectedPort });
}

// Firmware control functions
function eraseFlash() {
    vscode.postMessage({ command: 'eraseFlash' });
}

function flashFirmware() {
    vscode.postMessage({ command: 'flashFirmware' });
}

// REPL control functions
function connectREPL() {
    vscode.postMessage({ command: 'connect' });
}

function disconnectREPL() {
    vscode.postMessage({ command: 'disconnect' });
}

function resetDevice() {
    vscode.postMessage({ command: 'resetDevice' });
}

// File management functions
function uploadFile() {
    vscode.postMessage({ command: 'uploadFile' });
}

function listFiles() {
    vscode.postMessage({ command: 'listFiles' });
}

function runCode() {
    vscode.postMessage({ command: 'run' });
}

// Populate the dropdown with received ports and select savedPort if available
window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'populatePorts') {
        const portSelect = document.getElementById('portSelect');
        portSelect.innerHTML = ''; // Clear existing options

        let savedPortFound = false;

        // Add each port to the dropdown and check if it matches savedPort
        message.ports.forEach(port => {
            const option = document.createElement('option');
            option.value = port.path;
            option.textContent = `${port.path} (${port.description || 'Unknown'})`;
            
            if (port.path === message.savedPort) {
                option.selected = true;
                savedPortFound = true;
            }
            
            portSelect.appendChild(option);
        });

        if (!savedPortFound && portSelect.options.length > 0) {
            portSelect.options[0].selected = true;
        }
    }
});