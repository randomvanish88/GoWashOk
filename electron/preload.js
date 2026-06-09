const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  validateLicense: (key) => ipcRenderer.invoke('validate-license', key),
  selectImage: () => ipcRenderer.invoke('select-image'),
  uploadImageToDrive: (filePath, fileName, folderId) => ipcRenderer.invoke('upload-image-to-drive', { filePath, fileName, folderId }),
  readFileAsBase64: (filePath) => ipcRenderer.invoke('read-file-as-base64', filePath),
  getVehiculosData: () => ipcRenderer.invoke('get-vehiculos-data'),
  backup: {
    save: (data) => ipcRenderer.invoke('backup-save', data),
    load: () => ipcRenderer.invoke('backup-load'),
  },
  googleSheets: {
    init: (spreadsheetId) => ipcRenderer.invoke('google-sheets-init', spreadsheetId),
    addRow: (sheetTitle, data) => ipcRenderer.invoke('google-sheets-add-row', { sheetTitle, data }),
    getRows: (sheetTitle) => ipcRenderer.invoke('google-sheets-get-rows', sheetTitle),
    deleteRow: (sheetTitle, searchColumn, searchValue, extraOptions) => ipcRenderer.invoke('google-sheets-delete-row', { sheetTitle, searchColumn, searchValue, extraOptions }),
    updateRow: (sheetTitle, searchColumn, searchValue, newData) => ipcRenderer.invoke('google-sheets-update-row', { sheetTitle, searchColumn, searchValue, newData }),
    clearSheet: (sheetTitle) => ipcRenderer.invoke('google-sheets-clear-sheet', sheetTitle),
    writeSheet: (sheetTitle, data) => ipcRenderer.invoke('google-sheets-write-sheet', { sheetTitle, data }),
    uploadCredentials: () => ipcRenderer.invoke('google-sheets-upload-creds'),
  },
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
