/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const settings = require('electron-settings');

const path = require('path');
const url = require('url');

const { dialog } = require('electron');

global.folder = '.';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './movie.ico',
    title: 'Moviez',
  });

  const menuTemplate = [

    {
      label: '&Sort',
      submenu: [
        {
          label: 'Set &Directory',
          click: () => {
            const newfolder = dialog.showOpenDialog({ properties: ['openDirectory'] });
            if (typeof newfolder !== 'undefined') {
              global.folder = newfolder[0];
              settings.set('folder', newfolder[0]);
              mainWindow.webContents.send('changeFolder');
            }
          },
        },
        {
          label: '&Title Asc',
          click: () => {
            mainWindow.webContents.send('sortByTitleAsc');
          },
        },
        {
          label: 'T&itle Dec',
          click: () => {
            mainWindow.webContents.send('sortByTitleDec');
          },
        },
        {
          label: '&Date Asc',
          click: () => {
            mainWindow.webContents.send('sortByDateAsc');
          },
        },
        {
          label: 'D&ate Dec',
          click: () => {
            mainWindow.webContents.send('sortByDateDec');
          },
        },
      ],
    },
    {
      label: '&View',
      submenu: [
        {
          label: '&Tile',
          click: () => {
            mainWindow.webContents.send('viewTile');
          },
        },
        {
          label: '&List',
          click: () => {
            mainWindow.webContents.send('viewList');
          },
        },
        { type: 'separator' },
        {
          label: 'Show &Favourites',
          click: () => {
            mainWindow.webContents.send('viewFavourites');
          },
        },
        {
          label: 'Show &All',
          click: () => {
            mainWindow.webContents.send('viewAll');
          },
        },
        { type: 'separator' },
        {
          label: 'Open &Dev Tools',
          click: () => {
            mainWindow.webContents.openDevTools();
          },
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.setMenu(menu);
  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './index/index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  global.folder = settings.get('folder') ? settings.get('folder') : '.';
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
