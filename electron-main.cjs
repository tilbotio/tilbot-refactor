const { app, protocol, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {       
  const win = new BrowserWindow({
    show: false, 
    title: "Tilbot",
  });
  win.maximize();

  protocol.interceptFileProtocol('file', (request, callback) => {        

    // Some paths need to be fixed

    let url = request.url.substr(5);

    if (url.indexOf('build') == -1) {
        if (url.indexOf('_app') != -1) {
            callback({path: 'build/' + url.substring(url.indexOf('_app'))});
        }
        else {
            callback({path: 'build/index.html'});
        }        
    }
    else {
        callback({path: 'build' + url.split('build')[1]});
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