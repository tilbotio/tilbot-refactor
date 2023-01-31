const { app, protocol, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');
const publicIp = require('public-ip');

let ps = undefined;

const createWindow = () => {       
  const win = new BrowserWindow({
    show: false, 
    title: "Tilbot",
    nodeIntegration: false,
    webPreferences: {
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },    
  });
  win.maximize();

  win.on('close', function() {
    if (ps !== undefined) {
      ps.kill('SIGTERM');
    }
  });

  // Get external and internal ip-address
  (async () => {
    var address, ifaces = require('os').networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address: undefined);
    }

    let ipv4 = await publicIp.v4();

    ipcMain.on('open-server', (event, project_json) => {
      fs.writeFileSync(`${__dirname}/electron-project.json`, project_json);
      ps = fork(`${__dirname}/electron/electron-server.cjs`);

      win.webContents.send('server-ip', {public_ip: ipv4, local_ip: address});
    });

    ipcMain.on('close-server', (event) => {
      if (ps !== undefined) {
        ps.kill('SIGTERM');
      }        
    });
  })();  

  protocol.interceptFileProtocol('file', (request, callback) => {        

    // Some paths need to be fixed

    let url = request.url;//.substr(5);

    if (url.indexOf('build') == -1) {
        if (url.indexOf('_app') != -1) {
            callback({url: 'build/' + url.substring(url.indexOf('_app'))});
        }
        else {
            // This should not be triggered anymore with a fix in place in the editor code
            callback({url: 'build/index.html'});
        }        
    }
    else {
        //if (url.indexOf('electron') != -1) {
        //  callback({path: path.normalize(__dirname) + '/' + url.substring(url.indexOf('electron'))});
        //}
        //else {
          callback({path: path.normalize(__dirname) + '/' + url.substring(url.indexOf('build'))});
        //}        
    }    
});  

  win.loadFile('build/editor.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});