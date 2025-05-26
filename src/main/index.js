const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let pythonProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

function startPythonServer() {
  const pythonExecutable = isDev 
    ? 'python'
    : path.join(process.resourcesPath, 'python-backend', 'dist', 'app.exe')
    
  const pythonScript = isDev
    ? path.join(__dirname, '../../python-backend/app.py')
    : null

  if (isDev) {
    pythonProcess = spawn(pythonExecutable, [pythonScript])
  } else {
    pythonProcess = spawn(pythonExecutable)
  }

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python: ${data}`)
  })

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`)
  })
}

app.whenReady().then(() => {
  createWindow()
  startPythonServer()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (pythonProcess) {
    pythonProcess.kill()
  }
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill()
  }
})