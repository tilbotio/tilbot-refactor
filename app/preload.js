// From: https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron

const { contextBridge, ipcRenderer } = require("electron");

const validSendChannels = new Set([
  "open-server",
  "close-server",
  "do-delete-avatar",
  "load-project-db",
  "save-settings",
]);

const validReceiveChannels = new Set([]);

const validInvokeChannels = new Set([
  "get-csv",
  "load-avatar",
  "load-csv",
  "load-project",
  "load-settings",
  "query-db",
  "query-db-random",
  "save-project",
  "server-ip",
]);

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel, data) => {
    // whitelist channels
    if (validSendChannels.has(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    if (validReceiveChannels.has(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  invoke: async (channel, data) => {
    if (validInvokeChannels.has(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
  },
});
