const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function buildPython() {
    return new Promise((resolve, reject) => {
        const pythonBackendPath = path.join(__dirname, '..', 'python-backend');
        const distPath = path.join(pythonBackendPath, 'dist');
        
        // Create dist directory if it doesn't exist
        if (!fs.existsSync(distPath)) {
            fs.mkdirSync(distPath, { recursive: true });
        }
        
        // Build Python executable
        const pyinstaller = spawn('pyinstaller', [
            '--onefile',
            '--distpath', distPath,
            '--workpath', path.join(pythonBackendPath, 'build'),
            '--specpath', pythonBackendPath,
            'app.py'
        ], {
            cwd: pythonBackendPath,
            stdio: 'inherit'
        });
        
        pyinstaller.on('close', (code) => {
            if (code === 0) {
                console.log('Python backend built successfully!');
                resolve();
            } else {
                console.error(`PyInstaller exited with code ${code}`);
                reject(new Error(`Build failed with code ${code}`));
            }
        });
        
        pyinstaller.on('error', (err) => {
            console.error('Failed to start PyInstaller:', err);
            reject(err);
        });
    });
}

if (require.main === module) {
    buildPython().catch(console.error);
}

module.exports = buildPython;