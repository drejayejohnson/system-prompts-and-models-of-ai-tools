const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage } = require("electron");
const path = require("path");

const DEV_URL = "http://localhost:3000";
const isDev = process.env.NODE_ENV !== "production";

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#faf9f7",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "../public/icon.png"),
  });

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

function createTray() {
  const iconPath = path.join(__dirname, "../public/tray-icon.png");
  tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }));

  const menu = Menu.buildFromTemplate([
    { label: "Open Assistant", click: () => mainWindow?.show() ?? createWindow() },
    { type: "separator" },
    { label: "Quit", role: "quit" },
  ]);

  tray.setToolTip("Personal Assistant");
  tray.setContextMenu(menu);
  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    } else {
      createWindow();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Global shortcut: Cmd+Shift+A to show/activate
  globalShortcut.register("CommandOrControl+Shift+A", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Keep running in tray on macOS
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
