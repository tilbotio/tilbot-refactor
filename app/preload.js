// From: https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron

import { contextBridge, ipcRenderer } from "electron";

const validSendChannels = new Set([
  "open-server",
  "close-server",
  "do-save",
  "do-load",
  "do-load-csv-data",
  "do-load-avatar",
  "do-delete-avatar",
  "get-csv",
  "load-project-db",
  "get-settings",
  "save-settings",
]);

const validReceiveChannels = new Set([
  "server-ip",
  "project-saved",
  "project-load",
  "csv-load",
  "avatar-load",
  "settings-load",
]);

const validInvokeChannels = new Set([
  "query-db",
  "query-db-random",
  "load-avatar",
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
