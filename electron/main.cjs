const path = require("node:path");
const {
  app,
  BrowserWindow,
  ipcMain,
  session,
  shell
} = require("electron");

if (require("electron-squirrel-startup")) {
  app.quit();
}

const APP_ID = "com.squirrel.DeadLetterOffice.DeadLetterOffice";
let mainWindow = null;

app.setAppUserModelId(APP_ID);
app.enableSandbox();

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
}

function isTrustedLocalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "file:";
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,
    minHeight: 540,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#080806",
    fullscreenable: true,
    title: "Dead Letter Office",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.webContents.on("will-navigate", (event, targetUrl) => {
    if (!isTrustedLocalUrl(targetUrl)) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    const key = String(input.key || "").toLowerCase();
    const toggleFullscreen = key === "f11" || (input.alt && key === "enter");

    if (toggleFullscreen) {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      return;
    }

    if (key === "escape" && mainWindow.isFullScreen()) {
      event.preventDefault();
      mainWindow.setFullScreen(false);
      return;
    }

    if (app.isPackaged) {
      const reload = key === "f5" || ((input.control || input.meta) && key === "r");
      const devTools = (input.control || input.meta) && input.shift && key === "i";
      if (reload || devTools) {
        event.preventDefault();
      }
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function withMainWindow(callback) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return null;
  }
  return callback(mainWindow);
}

ipcMain.handle("desktop:get-state", () => ({
  platform: process.platform,
  fullscreen: Boolean(mainWindow && mainWindow.isFullScreen()),
  packaged: app.isPackaged,
  version: app.getVersion()
}));

ipcMain.handle("desktop:toggle-fullscreen", () => withMainWindow((window) => {
  window.setFullScreen(!window.isFullScreen());
  return window.isFullScreen();
}));

ipcMain.handle("desktop:minimize", () => withMainWindow((window) => {
  window.minimize();
  return true;
}));

ipcMain.handle("desktop:quit", () => {
  app.quit();
  return true;
});

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("second-instance", () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
