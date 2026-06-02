const { autoUpdater } = require("electron-updater");
const log = require("electron-log/main");

autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindowGetter = () => null;

function send(channel, payload) {
  const win = mainWindowGetter();
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

autoUpdater.on("checking-for-update", () => {
  log.info("[updater] checking for update");
});
autoUpdater.on("update-available", (info) => {
  log.info("[updater] update available", info.version);
  send("update-status", { state: "available", version: info.version });
});
autoUpdater.on("update-not-available", (info) => {
  log.info("[updater] no update", info.version);
  send("update-status", { state: "not-available", version: info.version });
});
autoUpdater.on("download-progress", (p) => {
  log.info(`[updater] downloading ${Math.round(p.percent)}%`);
  send("update-status", { state: "downloading", percent: p.percent });
});
autoUpdater.on("update-downloaded", (info) => {
  log.info("[updater] update downloaded", info.version);
  send("update-status", { state: "ready", version: info.version });
});
autoUpdater.on("error", (err) => {
  log.error("[updater] error", err);
  send("update-status", { state: "error", error: String(err && err.message ? err.message : err) });
});

function init({ getMainWindow, isPackaged }) {
  mainWindowGetter = getMainWindow;
  if (!isPackaged) {
    log.info("[updater] skipped in dev (app not packaged)");
    return;
  }
  autoUpdater.checkForUpdatesAndNotify().catch((err) => {
    log.error("[updater] checkForUpdatesAndNotify failed", err);
  });
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      log.warn("[updater] periodic check failed", err);
    });
  }, 15 * 60 * 1000);
}

function checkNow() {
  return autoUpdater.checkForUpdates();
}

function quitAndInstall() {
  autoUpdater.quitAndInstall(false, true);
}

module.exports = { init, checkNow, quitAndInstall };
