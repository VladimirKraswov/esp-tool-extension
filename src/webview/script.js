const vscode = acquireVsCodeApi();

// Load available ports when the page loads
window.onload = function() {
    rescanPorts();
};

// Request available ports from the extension and populate the dropdown
function rescanPorts() {
    vscode.postMessage({ command: 'rescanPorts' });
}

// Function to send selected port to extension when changed
function changePort() {
    const selectedPort = document.getElementById('portSelect').value;
    vscode.postMessage({ command: 'changePort', port: selectedPort });
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
            
            // Check if this option matches the saved port
            if (port.path === message.savedPort) {
                option.selected = true;
                savedPortFound = true;
            }
            
            portSelect.appendChild(option);
        });

        // If saved port is not found, select the first port in the list by default
        if (!savedPortFound && portSelect.options.length > 0) {
            portSelect.options[0].selected = true;
        }
    }
});

function run() {
    vscode.postMessage({ command: 'run' });
}

function stop() {
    vscode.postMessage({ command: 'stop' });
}

function toggleConnect() {
    const selectedPort = document.getElementById('portSelect').value;
    vscode.postMessage({ command: 'connect', port: selectedPort });
}