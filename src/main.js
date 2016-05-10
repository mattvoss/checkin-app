const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const package = require('./package.json');
const winSquirrelStartupEventHandler = require('./js/winSquirrelStartupEventHandler');

// Report crashes to our server.
//require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;
if (!winSquirrelStartupEventHandler.handleStartupEvent()) {
  function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: package.window.width, height: package.window.height});

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/templates/index.html');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });
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
}