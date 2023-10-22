// @ts-nocheck

import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { Archive } from './service/Archive';
import { ZipFormat } from './service/ZipFormat';
import { Z7Format } from './service/Z7Format';

class AppUpdater {
  constructor() {
    log.info(transports.file.level = 'info');
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  log.info(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(log.info);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };




  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }
}

function formateFactory(type,option){
  console.log("formateFactory",type)
  let instance = null;
  switch (type) {
    case 'zip':
      instance = new ZipFormat(option)
      break;
    case '7z':
    instance = new Z7Format(option);
    break;
    default:
      instance = new ZipFormat(option)
      break;
  }
  return instance;
}

app
  .whenReady()
  .then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen);
     /**
   * 监听渲染层
  */

  ipcMain.on('compression',(event, data)=>{
    const {fileList,size, type, fileName} = data;
    let option = {
      size,
      ...data
    }
    console.log("app.getPath('temp')",app.getPath('temp'))
    const formatInstance = formateFactory(type,{outputDir:app.getPath('temp'),archiveName: fileName});
    let archiveInstance = new Archive(formatInstance).compression(fileList,option);
    archiveInstance.then((data)=>{
      if(data && data.fullFileName){
        shell.showItemInFolder(data.fullFileName);
      }
      log.info("archiveInstance",data)
    }).catch((err)=>{
      log.info("错误",err)
    })
  })
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(log.info);
