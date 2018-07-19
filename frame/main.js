const electron = require('electron')
// Module to control application life.
const app = electron.app
const ipcMain = electron.ipcMain
const session = electron.session;
const globalShortcut = electron.globalShortcut;
const url = require('url')
var path = require('path');
var cp = require('child_process');
var fs = require('fs')


var devMode = process.env.NODE_ENV == 'development' || (process.argv || []).indexOf('--dev') !== -1;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
let win_opts;
if (!devMode) {
    if (fs.existsSync(path.join(__dirname, './config.json'))) {
        win_opts = (require('./config.json') || {}).window;
    }
} else {
    if (fs.existsSync(path.join(__dirname, './config.local.json'))) {
        win_opts = (require('./config.local.json') || {}).window;
    }
}
win_opts = win_opts || {
    width: 1024,
    height: 768,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    frame: false,
    fullscreen: true
}
let windowOptions = Object.assign(win_opts, { show: false })
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow(windowOptions);
    electron.mainWindow = mainWindow;

    console.log("current node_env:", process.env.NODE_ENV);
    mainWindow.setFullScreen(windowOptions.fullscreen || false);

    // Open the DevTools.
    if (windowOptions.devTools) {
        mainWindow.webContents.openDevTools()
    }
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.resolve(__dirname,'../publish/index.html'),
        protocol: 'file:',
        slashes: true
    }))


    globalShortcut.register('control+shift+D', function () {
        mainWindow.webContents.openDevTools()
    })


    // console.log(electron);
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {

        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
//小化
ipcMain.on('hide-window', function () {
    mainWindow.minimize();
});
//最大化
ipcMain.on('show-window', function () {
    mainWindow.maximize();
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
