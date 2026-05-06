import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getVersion: () => ipcRenderer.invoke("app:version") as Promise<string>,
  getPlatform: () => ipcRenderer.invoke("app:platform") as Promise<string>,
  installUpdate: () => ipcRenderer.invoke("update:install") as Promise<void>,
  onUpdateAvailable: (callback: () => void) => {
    ipcRenderer.on("update:available", callback);
    return () => ipcRenderer.removeListener("update:available", callback);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("update:downloaded", callback);
    return () => ipcRenderer.removeListener("update:downloaded", callback);
  },
});
