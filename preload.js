// From: https://stackoverflow.com/questions/57807459/how-to-use-preload-js-properly-in-electron

const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = [
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
                "save-settings"
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = [
                "server-ip", 
                "project-saved", 
                "project-load", 
                "csv-load", 
                "avatar-load", 
                "settings-load"
            ];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        invoke: async (channel, data) => {
            let validChannels = [
                "query-db", 
                "query-db-random"
            ];
            if (validChannels.includes(channel)) {
                let res = await ipcRenderer.invoke(channel, data);
                return res;
            }
        }
    }
);