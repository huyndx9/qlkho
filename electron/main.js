const { app, BrowserWindow, dialog } = require('electron');
const os = require('os');
const path = require('path');

const PORT = process.env.API_PORT || 4000;

function getLanIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

function startServer() {
  process.env.DATA_DIR = path.join(app.getPath('userData'), 'data');
  const expressApp = require('../server/index.js');
  return new Promise((resolve, reject) => {
    const server = expressApp.listen(PORT, '0.0.0.0', () => resolve(server));
    server.on('error', reject);
  });
}

async function createWindow() {
  try {
    await startServer();
  } catch (err) {
    dialog.showErrorBox('Khong the khoi dong may chu', String(err.message || err));
    app.quit();
    return;
  }

  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true },
  });
  win.loadURL(`http://localhost:${PORT}`);

  const lanIp = getLanIP();
  if (lanIp) {
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Quan Ly Ton Kho',
      message: 'May khac trong cung mang LAN co the truy cap ung dung nay',
      detail: `Mo trinh duyet va truy cap: http://${lanIp}:${PORT}`,
    });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
