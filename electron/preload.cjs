const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("deadLetterDesktop", Object.freeze({
  isDesktop: true,
  getState: () => ipcRenderer.invoke("desktop:get-state"),
  toggleFullscreen: () => ipcRenderer.invoke("desktop:toggle-fullscreen"),
  minimize: () => ipcRenderer.invoke("desktop:minimize"),
  quit: () => ipcRenderer.invoke("desktop:quit")
}));
