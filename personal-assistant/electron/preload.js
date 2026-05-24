const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  // Expose safe IPC channels for notifications, etc.
  sendNotification: (title, body) =>
    ipcRenderer.send("show-notification", { title, body }),
});
