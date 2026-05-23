const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev =
  process.env.NODE_ENV === "development" || process.argv.includes("--dev");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 750,
    minWidth: 400,
    minHeight: 550,
    title: "ds_todo",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Graceful show (prevent white flash)
  win.once("ready-to-show", () => win.show());

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const outDir = path.join(__dirname, "..", "out");
    win.loadFile(path.join(outDir, "index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
