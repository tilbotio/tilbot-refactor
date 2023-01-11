const { app, protocol, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {       
  const win = new BrowserWindow({
    show: false, 
    title: "Tilbot",
    nodeIntegration: true,
  });
  win.maximize();

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
        callback({url: path.normalize(__dirname)});
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