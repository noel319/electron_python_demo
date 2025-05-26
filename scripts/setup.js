const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function setupProject() {
    console.log('Setting up Electron React Python Auth App...');
    
    // Create directories
    const dirs = [
        'src/main',
        'src/preload', 
        'src/renderer/src/components',
        'src/renderer/src/services',
        'src/renderer/src/styles',
        'python-backend',
        'scripts',
        'resources'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
    
    // Install Python dependencies
    try {
        console.log('Installing Python dependencies...');
        execSync('pip install -r python-backend/requirements.txt', { stdio: 'inherit' });
        console.log('Python dependencies installed successfully!');
    } catch (error) {
        console.error('Failed to install Python dependencies:', error.message);
    }
    
    console.log('Setup completed!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run dev" to start development');
    console.log('2. Run "npm run build:python" to build Python backend');
    console.log('3. Run "npm run build" to build the entire app');
    console.log('4. Run "npm run build:win" to create Windows installer');
}

if (require.main === module) {
    setupProject();
}

module.exports = setupProject;