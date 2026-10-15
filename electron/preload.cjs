const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('dailySpace', {
  loadSync: () => ipcRenderer.sendSync('data:load'),
  save: json => ipcRenderer.send('data:save', json),
})
