const {app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
let mainwindow;

app.on('ready', ()=>{
    mainwindow = new BrowserWindow({
        width: 1024,
        height: 680,
        webPreferences: {
            nodeIntegration: true
        }
    });
    const urlLocation = isDev ? 'http://localhost:3000' : 'platformUrl'
    mainwindow.loadURL(urlLocation)
    mainwindow.webContents.openDevTools();
});