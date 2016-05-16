if(require('electron-squirrel-startup')) return;
const qs = require ("querystring");
const electron = require('electron');
const app = electron.app;
const blobUtil = require ("blob-util");
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');
const package = require('./package.json');
const ipcMain = electron.ipcMain;

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;
ipcMain.on('new-window', function(event, arg) {
  //console.log("new-window", arg);  // prints args
  openNewWindow(arg);
});
function createWindow () {
  let mainWindowState = windowStateKeeper({
    defaultWidth: package.window.width,
    defaultHeight: package.window.height
  });
  // Create the browser window.
  mainWindow = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height
  });
  mainWindowState.manage(mainWindow);
  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/templates/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function openNewWindow(pdf) {
  let NewWindow = electron.BrowserWindow;
  const pdfURL = "http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
  //var url = blobUtil.createObjectURL(pdf);


  var win = new NewWindow({ width: 800, height: 600, show: false });
  win.on('closed', function() {
    win = null;
  });

  win.loadURL('file://' + __dirname + '/web/viewer.html?file=' + pdf);
  win.show();
  //win.webContents.openDevTools();
}

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin')
    app.quit();
  }
);

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', createWindow);

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});