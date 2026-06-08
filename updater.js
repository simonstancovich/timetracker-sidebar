const { app } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log/main");
const fs = require("node:fs");

const PORTABLE_EXE = process.env.PORTABLE_EXECUTABLE_FILE || null;

autoUpdater.logger = log;
autoUpdater.autoDownload = true;
// Portable target: we do the on-disk swap ourselves when the update finishes
// downloading (electron-updater's auto-install path assumes an NSIS installer).
autoUpdater.autoInstallOnAppQuit = !PORTABLE_EXE;

let mainWindowGetter = () => null;
let initIsPackaged = false;
let portableSwapDone = false;

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
  if (PORTABLE_EXE && info.downloadedFile) {
    try {
      fs.copyFileSync(info.downloadedFile, PORTABLE_EXE);
      portableSwapDone = true;
      log.info(`[updater] portable exe swapped at ${PORTABLE_EXE}`);
    } catch (err) {
      log.error("[updater] portable swap failed", err);
    }
  }
  send("update-status", { state: "ready", version: info.version });
});
autoUpdater.on("error", (err) => {
  log.error("[updater] error", err);
  send("update-status", { state: "error", error: String(err && err.message ? err.message : err) });
});

function init({ getMainWindow, isPackaged }) {
  mainWindowGetter = getMainWindow;
  initIsPackaged = !!isPackaged;
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
  if (!initIsPackaged) {
    throw new Error("Updates are disabled in dev mode (app is not packaged)");
  }
  return autoUpdater.checkForUpdates();
}

function quitAndInstall() {
  if (PORTABLE_EXE) {
    if (portableSwapDone) app.relaunch({ execPath: PORTABLE_EXE });
    app.exit(0);
    return;
  }
  autoUpdater.quitAndInstall(false, true);
}

module.exports = { init, checkNow, quitAndInstall };
