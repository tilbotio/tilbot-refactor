const { app, protocol, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');
const publicIp = require('public-ip');
const AdmZip = require('adm-zip');
const CsvData = require('./csvdata.cjs');

let ps = undefined;

let csv_datas = {};

const createWindow = () => {       
  const win = new BrowserWindow({
    show: false, 
    title: "Tilbot",
    icon: path.join(__dirname, "src/icon/png/64x64.png"),
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
    let ipv4 = 'localhost';
    let address = 'localhost';
    let ifaces = null;

    try {
      address, ifaces = require('os').networkInterfaces();
      for (var dev in ifaces) {
        ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address: undefined);
      }

      ipv4 = await publicIp.v4({
        timeout: 200
      });  

      console.log('doneee');
    }

    catch {
      console.log('error with ip');
    }

    ipcMain.on('open-server', (event, project_json) => {
      let p = `${__dirname}`;
      if (process.platform === 'darwin') {
        p = app.getPath('userData');
      }
      if (!fs.existsSync(p + '/currentproject/')) {
        fs.mkdirSync(p + '/currentproject');
      }
      fs.writeFileSync(p + '/currentproject/electron-project.json', project_json);
      ps = fork(`${__dirname}/electron/electron-server.cjs`,
        ['-p=' + p]
      );

      win.webContents.send('server-ip', {public_ip: ipv4, local_ip: address});
    });

    ipcMain.on('close-server', (event) => {
      if (ps !== undefined) {
        ps.kill('SIGTERM');
      }        
    });
  })(); 

  ipcMain.on('do-load', (event) => {
    let load_file = dialog.showOpenDialogSync({
        properties: [
          'openFile'
        ],
        filters: [{
            name: 'Tilbot project',
            extensions: [
                'tilbot',
                'json'
            ]
        }]
    });

    if (load_file !== undefined) {
      let p = `${__dirname}`;
      if (process.platform === 'darwin') {
        p = app.getPath('userData');
      }

      // Remove the old temp project
      if (fs.existsSync(p + '/currentproject')) {
        fs.rmSync(p + '/currentproject', { recursive: true });
      }
      fs.mkdirSync(p + '/currentproject');

      // Only one file should be allowed to be selected.
      if (load_file[0].endsWith('.tilbot')) {
        const zip = new AdmZip(load_file[0]);
        var zipEntries = zip.getEntries(); // an array of ZipEntry records
  
        zipEntries.forEach(function (zipEntry) {
            if (zipEntry.entryName == "project.json") {
                win.webContents.send('project-load', zipEntry.getData().toString("utf8"));
            }
            else if (zipEntry.entryName.startsWith('var/')) {
              zip.extractEntryTo(zipEntry, p + '/currentproject');              
            }
            else {
              zip.extractEntryTo(zipEntry, p + '/currentproject');
            }
        });          
      }

      else {
        let json = fs.readFileSync(load_file[0], 'utf8');
        console.log(json);
        win.webContents.send('project-load', json);
      }

      // @TODO: something with additional files like avatar, data files, etc.
    }
  });  

  ipcMain.on('get-csv', (event, filename) => {
    let p = `${__dirname}`;
    if (process.platform === 'darwin') {
      p = app.getPath('userData');
    }

    if (fs.existsSync(p + '/currentproject/var/' + filename)) {
      let csv = fs.readFileSync(p + '/currentproject/var/' + filename, 'utf8');
      win.webContents.send('csv-load', { filename: filename, csv: csv });
    }
  });  

  ipcMain.on('load-project-db', (event, project) => {
    let p = `${__dirname}`;
    if (process.platform === 'darwin') {
      p = app.getPath('userData');
    }

    csv_datas = {};

    // Set up the data files
    for (let v in project.variables) {
      if (project.variables[v].type == 'csv') {
        csv_datas[project.variables[v].name] = new CsvData(project.variables[v].csvfile, p + '/currentproject/');
      }
    }
    
  });

  ipcMain.handle('query-db', async (event, params) => {
    if (Object.keys(csv_datas).indexOf(params.db) == -1) {
      return null;
    }

    let res = await csv_datas[params.db].get(params.col, params.val);    
    return res;
  });

  ipcMain.handle('query-db-random', async (event, params) => {
    let res = await csv_datas[params.db].get_random_line();    
    return res;
  });

  ipcMain.on('get-settings', (event, params) => {
    let p = `${__dirname}`;
    if (process.platform === 'darwin') {
      p = app.getPath('userData');
    }

    if (!fs.existsSync(p + '/settings.json')) {
      let settings = {
        chatgpt_api_key: '',
        llm_setting: 'chatgpt',
        llm_api_address: ''     
      }

      fs.writeFileSync(p + '/settings.json', JSON.stringify(settings));
      win.webContents.send('settings-load', { settings: settings, path: p + '/currentproject/' });
    }
    else {
      win.webContents.send('settings-load', { settings: JSON.parse(fs.readFileSync(p + '/settings.json', 'utf8')), path: p + '/currentproject/' });
    }
  });

  ipcMain.on('save-settings', (event, params) => {
    let p = `${__dirname}`;
    if (process.platform === 'darwin') {
      p = app.getPath('userData');
    }

    fs.writeFileSync(p + '/settings.json', JSON.stringify(params.settings));
  });

  ipcMain.on('do-load-csv-data', (event) => {
    let load_file = dialog.showOpenDialogSync({
        properties: [
          'openFile'
        ],
        filters: [{
            name: 'Comma-separated value (CSV) file',
            extensions: [
                '.csv'
            ]
        }]
    });

    if (load_file !== undefined) {
        let p = `${__dirname}`;
        if (process.platform === 'darwin') {
          p = app.getPath('userData');
        }

        let fname = path.basename(load_file[0]);

        if (!fs.existsSync(p + '/currentproject/')) {
          fs.mkdirSync(p + '/currentproject');
        }

        if (!fs.existsSync(p + '/currentproject/var/')) {
          fs.mkdirSync(p + '/currentproject/var');
        }
          
        fs.copyFileSync(load_file[0], p + '/currentproject/var/' + fname);
        let csv = fs.readFileSync(load_file[0], 'utf8');
        win.webContents.send('csv-load', { filename: fname, csv: csv });

        // @TODO: load into csvdb for use
    }
  });   

  ipcMain.on('do-load-avatar', (event, prev_name) => {

    let load_file = dialog.showOpenDialogSync({
      properties: [
        'openFile'
      ],
      filters: [{
          name: 'Avatar image',
          extensions: [
              'png',
              'jpg',
              'jpeg',
              'svg'
          ]
      }]
    });

    if (load_file !== undefined) {
        let p = `${__dirname}`;
        if (process.platform === 'darwin') {
          p = app.getPath('userData');
        }

        if (!fs.existsSync(p + '/currentproject/')) {
          fs.mkdirSync(p + '/currentproject');
        }

        if (!fs.existsSync(p + '/currentproject/avatar')) {
          fs.mkdirSync(p + '/currentproject/avatar');
        }

        // Delete previous avatar
        if (prev_name !== '' && fs.existsSync(p + '/currentproject/avatar/' + prev_name)) {
          fs.rmSync(p + '/currentproject/avatar/' + prev_name);
        }

        let fname = path.basename(load_file[0]);
          
        fs.copyFileSync(load_file[0], p + '/currentproject/avatar/' + fname);
        win.webContents.send('avatar-load', { filename: fname });
    }
  });

  ipcMain.on('do-delete-avatar', (event, fname) => {
    let p = `${__dirname}`;
    if (process.platform === 'darwin') {
      p = app.getPath('userData');
    }

    // Delete avatar
    if (fname !== '' && fs.existsSync(p + '/currentproject/' + fname)) {
      fs.rmSync(p + '/currentproject/' + fname);
    }    

    // @TODO: Should we send confirmation that it has been deleted?
  });
  
  ipcMain.on('do-save', (event, project) => {
    let save_file = dialog.showSaveDialogSync({
        filters: [{
            name: 'Tilbot project',
            extensions: [
                'tilbot'
            ]
        }]
    });

    if (save_file !== undefined) {
      let p = `${__dirname}`;
      if (process.platform === 'darwin') {
        p = app.getPath('userData');
      }

      const file = new AdmZip();
      file.addFile('project.json', Buffer.from(project));

      let proj_obj = JSON.parse(project);
      for (v in proj_obj.variables) {
        if (proj_obj.variables[v].type == 'csv') {
          file.addLocalFile(p + '/currentproject/var/' + proj_obj.variables[v].csvfile, 'var');
        }
      }

      if (proj_obj.settings !== undefined && proj_obj.settings.avatar_file !== undefined && proj_obj.settings.avatar_file !== '') {
        file.addLocalFile(p + '/currentproject/avatar/' + proj_obj.settings.avatar_file, 'avatar');
      }

      if (proj_obj.settings !== undefined && proj_obj.settings.avatar_file_sm !== undefined && proj_obj.settings.avatar_file_sm !== '') {
        file.addLocalFile(p + '/currentproject/avatar/' + proj_obj.settings.avatar_file_sm, 'avatar');
      }
      
      fs.writeFileSync(save_file, file.toBuffer());
      win.webContents.send('project-saved');
    }
  });

  // @TODO: For the online version, this will have to be integrated with the editorsocket, I think.
  // @TODO: CSV client thing here when launching the simulator (send project file here, load CSV things)


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