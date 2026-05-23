const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");

const isDev =
  process.env.NODE_ENV === "development" || process.argv.includes("--dev");
const PORT = 3128;

// Simple static file server for production
function startServer(outDir) {
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".wasm": "application/wasm",
  };

  const server = http.createServer((req, res) => {
    let urlPath = req.url.split("?")[0];
    if (urlPath === "/") urlPath = "/index.html";

    const filePath = path.join(outDir, urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fallback: serve index.html for SPA routing
        fs.readFile(path.join(outDir, "index.html"), (err2, data2) => {
          if (err2) {
            res.writeHead(404);
            res.end("Not Found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data2);
          }
        });
        return;
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    });
  });

  server.listen(PORT, "127.0.0.1", () => {
    console.log(`Static server running at http://127.0.0.1:${PORT}`);
  });

  return server;
}

let mainWindow = null;
let server = null;

function createWindow() {
  mainWindow = new BrowserWindow({
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

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const outDir = path.join(__dirname, "..", "out");
    if (fs.existsSync(outDir)) {
      server = startServer(outDir);
      mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
    } else {
      console.error("out/ directory not found. Run: npm run build");
      app.quit();
    }
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (server) server.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("before-quit", () => {
  if (server) server.close();
});
