import { app, BrowserWindow, shell, ipcMain, nativeTheme, Menu } from "electron";
import path from "path";
import { autoUpdater } from "electron-updater";

const isDev = process.env["NODE_ENV"] !== "production";
const WEB_URL = isDev ? "http://localhost:3000" : "https://app.promptos.io";

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  nativeTheme.themeSource = "dark";

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "PromptOS",
    backgroundColor: "#05060A",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  });

  mainWindow.loadURL(WEB_URL).catch((err) => {
    console.error("Failed to load URL:", err);
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (isDev) {
      mainWindow?.webContents.openDevTools({ mode: "detach" });
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "PromptOS",
      submenu: [
        { role: "about" },
        { type: "separator" },
        {
          label: "Check for Updates",
          click: () => autoUpdater.checkForUpdatesAndNotify(),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on("ready", () => {
  buildMenu();
  createWindow();

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify().catch(console.error);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

ipcMain.handle("app:version", () => app.getVersion());
ipcMain.handle("app:platform", () => process.platform);

autoUpdater.on("update-available", () => {
  mainWindow?.webContents.send("update:available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update:downloaded");
});

ipcMain.handle("update:install", () => {
  autoUpdater.quitAndInstall();
});
