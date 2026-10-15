const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

// Data lives in a plain JSON file under the OS user-data directory,
// e.g. %APPDATA%/DailySpace/daily-space-data.json on Windows.
function dataPath() {
  return path.join(app.getPath('userData'), 'daily-space-data.json')
}

ipcMain.on('data:load', event => {
  try {
    event.returnValue = fs.readFileSync(dataPath(), 'utf8')
  } catch {
    event.returnValue = ''
  }
})

ipcMain.on('data:save', (_event, json) => {
  try {
    fs.mkdirSync(path.dirname(dataPath()), { recursive: true })
    fs.writeFileSync(dataPath(), String(json), 'utf8')
  } catch {
    // Keep the app usable even if writing fails; renderer keeps its state.
  }
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#f7f8f5',
    autoHideMenuBar: true,
    title: '日常 · Daily Space',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
