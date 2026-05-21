const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  screen,
  session,
  nativeImage,
  net,
  globalShortcut,
} = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");
const log = require("electron-log/main");
const appbar = require("./appbar");
const graph = require("./graph");

log.initialize();
log.transports.file.level = "info";
log.transports.console.level = "info";

process.on("unhandledRejection", (reason) => {
  log.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  log.error("[uncaughtException]", err);
});

const store = new Store();
graph.init(store);
const BASE_URL = "https://timetracker.devcore.se";
const isDev = !app.isPackaged;

let mainWindow = null;
let authWindow = null;
let tray = null;
let currentMode = "full";

const SIDEBAR_WIDTH = 380;

let displayChangeSilenceUntil = 0;
const TOP_HEIGHT = 18;
const TOP_RESERVED_HEIGHT = 46;
const REQUEST_TIMEOUT_MS = 15000;

let appBarRegistered = false;
let appBarReassertTimer = null;

let blurCollapseDisabled = false;

function formatLocalDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function createMainWindow() {
  const { height, width } = screen.getPrimaryDisplay().workAreaSize;
  const storedMode = store.get("mode");
  const backgroundColor = storedMode === "light" ? "#fdfcfb" : "#0b0910";

  mainWindow = new BrowserWindow({
    width: SIDEBAR_WIDTH,
    height: height,
    x: width - SIDEBAR_WIDTH,
    y: 0,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      session: session.fromPartition("persist:timetracker"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5180");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist-renderer/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("blur", () => {
    if (!mainWindow) return;
    if (blurCollapseDisabled) return;
    if (Date.now() < displayChangeSilenceUntil) return;
    if (mainWindow.webContents.isDevToolsFocused()) return;
    if (currentMode === "full") {
      setWindowSize("top");
      mainWindow.webContents.send("forced-size", "top");
    }
  });
}

function computeTopTarget() {
  if (!mainWindow || !appBarRegistered) return null;
  const hwnd = mainWindow.getNativeWindowHandle();
  const d = screen.getPrimaryDisplay();
  const adjusted = appbar.setTopPos(hwnd, {
    left: d.bounds.x,
    top: d.bounds.y,
    right: d.bounds.x + d.bounds.width,
    height: TOP_RESERVED_HEIGHT,
  });
  if (!adjusted) return null;
  return {
    x: adjusted.left,
    y: adjusted.top,
    width: adjusted.right - adjusted.left,
    height: TOP_HEIGHT,
  };
}

function applyTopPos() {
  const target = computeTopTarget();
  if (!target) return;
  const wasResizable = mainWindow.isResizable();
  if (!wasResizable) mainWindow.setResizable(true);
  mainWindow.setBounds(target);
  if (!wasResizable) mainWindow.setResizable(false);
}

function enterTopMode() {
  if (!mainWindow) return;
  const hwnd = mainWindow.getNativeWindowHandle();
  if (!appBarRegistered) {
    const ok = appbar.register(hwnd);
    if (!ok) {
      log.warn("[appbar] register failed");
      return;
    }
    appBarRegistered = true;
  }
  applyTopPos();
  if (appBarReassertTimer) clearInterval(appBarReassertTimer);
  appBarReassertTimer = setInterval(() => {
    if (currentMode !== "top") return;
    applyTopPos();
  }, 5000);
}

function exitTopMode() {
  if (appBarReassertTimer) {
    clearInterval(appBarReassertTimer);
    appBarReassertTimer = null;
  }
  if (appBarRegistered && mainWindow && !mainWindow.isDestroyed()) {
    appbar.remove(mainWindow.getNativeWindowHandle());
  }
  appBarRegistered = false;
}

async function setWindowSize(size) {
  if (!mainWindow) return;
  mainWindow.setOpacity(0);
  await new Promise((r) => setTimeout(r, 16));
  if (currentMode === "top" && size !== "top") exitTopMode();
  currentMode = size;
  if (size === "top") {
    enterTopMode();
  } else {
    const { height, width } = screen.getPrimaryDisplay().workAreaSize;
    const wasResizable = mainWindow.isResizable();
    if (!wasResizable) mainWindow.setResizable(true);
    mainWindow.setBounds({
      x: width - SIDEBAR_WIDTH,
      y: 0,
      width: SIDEBAR_WIDTH,
      height,
    });
    if (!wasResizable) mainWindow.setResizable(false);
  }
  await new Promise((r) => setTimeout(r, 60));
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.setOpacity(1);
}

function createAuthWindow() {
  authWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: "Sign in to DevCore TimeTracker",
    webPreferences: {
      session: session.fromPartition("persist:timetracker"),
    },
  });

  authWindow.loadURL(BASE_URL);

  let verified = false;
  const tryVerify = async (source) => {
    if (verified || !authWindow) return;
    const authed = await probeAuthenticated();
    log.info(`[auth] probe (${source}) →`, authed);
    if (!authed || verified || !authWindow) return;
    verified = true;
    clearInterval(pollId);
    authWindow.close();
    authWindow = null;
    if (mainWindow) mainWindow.webContents.send("auth-success");
  };
  authWindow.webContents.on("did-navigate", () => tryVerify("did-navigate"));
  authWindow.webContents.on("did-navigate-in-page", () => tryVerify("in-page"));
  authWindow.webContents.on("did-finish-load", () => tryVerify("finish-load"));
  const pollId = setInterval(() => tryVerify("poll"), 2000);

  authWindow.on("closed", () => {
    clearInterval(pollId);
    authWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, "assets/tray-icon.png");
  const icon = fs.existsSync(iconPath)
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show", click: () => mainWindow?.show() },
    { label: "Hide", click: () => mainWindow?.hide() },
    { type: "separator" },
    {
      label: "Top bar",
      click: () => {
        setWindowSize("top");
        mainWindow?.webContents.send("forced-size", "top");
      },
    },
    {
      label: "Full sidebar",
      click: () => {
        setWindowSize("full");
        mainWindow?.webContents.send("forced-size", "full");
      },
    },
    { type: "separator" },
    { label: "Sign out", click: () => signOut() },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("DevCore TimeTracker");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
}

const USER_SCOPED_STORE_KEYS = [
  "xp",
  "unlocked",
  "streak",
  "lastLoggedDate",
  "timer",
  "logForm",
  "currentUser",
  "achStats",
];

async function signOut() {
  await session.fromPartition("persist:timetracker").clearStorageData();
  for (const key of USER_SCOPED_STORE_KEYS) store.delete(key);
  mainWindow?.webContents.send("signed-out");
}

function apiRequest({ c, m, query, body }) {
  const qs = new URLSearchParams({ c, m, ...(query || {}) }).toString();
  const url = `${BASE_URL}/index.php?${qs}`;

  return new Promise((resolve) => {
    let settled = false;
    let timeoutId;
    const done = (result) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolve(result);
    };

    const req = net.request({
      method: "POST",
      url,
      session: session.fromPartition("persist:timetracker"),
      useSessionCookies: true,
      redirect: "manual",
    });
    req.setHeader("Content-Type", "application/x-www-form-urlencoded");
    req.setHeader("X-Requested-With", "XMLHttpRequest");

    timeoutId = setTimeout(() => {
      try {
        req.abort();
      } catch {}
      done({ timedOut: true });
    }, REQUEST_TIMEOUT_MS);

    let text = "";
    req.on("response", (res) => {
      res.on("data", (chunk) => {
        text += chunk.toString();
      });
      res.on("end", () => {
        done({ status: res.statusCode, body: text.replace(/^\uFEFF/, "") });
      });
    });
    req.on("error", (err) => {
      if (settled) return;
      done({ networkError: err.message });
    });
    req.write(body ? new URLSearchParams(body).toString() : "");
    req.end();
  });
}

ipcMain.handle("api-call", async (event, payload) => {
  const { params, body } = payload || {};
  if (!params || !params.c || !params.m) {
    log.warn("[api] invalid_params:", payload);
    return { error: "invalid_params" };
  }
  const { c, m, ...query } = params;
  const res = await apiRequest({ c, m, query, body });
  const label = `${c}.${m}`;

  if (res.timedOut) {
    log.warn(`[api] ${label} → timeout after ${REQUEST_TIMEOUT_MS}ms`);
    return { error: "timeout" };
  }
  if (res.networkError) {
    log.warn(`[api] ${label} → error: ${res.networkError}`);
    return { error: res.networkError };
  }
  if (res.status >= 300 && res.status < 400) {
    log.warn(`[api] ${label} → redirect ${res.status} (session lost)`);
    mainWindow?.webContents.send("session-lost");
    return { error: "not_authenticated" };
  }

  log.info(`[api] ${label} (${res.status}) ${res.body.slice(0, 300)}`);
  try {
    return { data: JSON.parse(res.body) };
  } catch {
    if (res.status >= 200 && res.status < 300) {
      return { data: { success: true, raw: res.body } };
    }
    const snippet = res.body
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    log.warn(`[api] ${label} non-JSON ${res.status}: ${snippet}`);
    return { error: `http_${res.status}${snippet ? ": " + snippet : ""}` };
  }
});

ipcMain.handle("check-auth", async () => probeAuthenticated());

async function probeAuthenticated() {
  const res = await apiRequest({
    c: "time",
    m: "load",
    body: { date: formatLocalDate(new Date()) },
  });

  if (res.timedOut) {
    log.warn(`[auth] probe timed out after ${REQUEST_TIMEOUT_MS}ms`);
    return false;
  }
  if (res.networkError) {
    log.warn("[auth] probe error:", res.networkError);
    return false;
  }
  if (res.status >= 300 && res.status < 400) {
    log.info("[auth] probe got redirect", res.status);
    return false;
  }
  try {
    const json = JSON.parse(res.body);
    return Array.isArray(json.rows);
  } catch {
    log.warn(
      "[auth] probe got non-JSON (first 200 chars):",
      res.body.slice(0, 200),
    );
    return false;
  }
}

ipcMain.handle("open-auth", () => {
  if (!authWindow) createAuthWindow();
});

ipcMain.handle("sign-out", () => signOut());

ipcMain.handle("store-get", (event, key) => store.get(key));
ipcMain.handle("store-set", (event, key, value) => store.set(key, value));
ipcMain.handle("set-size", async (_e, size) => {
  await setWindowSize(size);
});
ipcMain.handle("set-blur-collapse-disabled", (_e, disabled) => {
  blurCollapseDisabled = !!disabled;
});

ipcMain.handle("graph-status", () => graph.status());
ipcMain.handle("graph-sign-in", async (event) => {
  try {
    return await graph.signIn((code) => {
      event.sender.send("graph-device-code", code);
    });
  } catch (err) {
    return { error: err.message || String(err) };
  }
});
ipcMain.handle("graph-sign-out", () => graph.signOut());
ipcMain.handle("graph-meetings", async (_e, opts) => {
  try {
    return { meetings: await graph.getMeetings(opts || {}) };
  } catch (err) {
    return { error: err.message || String(err) };
  }
});

if (!app.requestSingleInstanceLock()) {
  app.exit(0);
} else {
  app.on("second-instance", () => {
    if (!mainWindow) {
      createMainWindow();
      return;
    }
    if (mainWindow.isMinimized()) mainWindow.restore();
    setWindowSize("full");
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send("forced-size", "full");
  });
}

app.whenReady().then(() => {
  createMainWindow();
  createTray();
  app.on("activate", () => {
    if (!mainWindow) createMainWindow();
  });

  const onDisplayChange = () => {
    displayChangeSilenceUntil = Date.now() + 2500;
    if (!mainWindow) return;
    setWindowSize(currentMode);
  };
  screen.on("display-metrics-changed", onDisplayChange);
  screen.on("display-added", onDisplayChange);
  screen.on("display-removed", onDisplayChange);

  const HOTKEY = "CommandOrControl+Shift+T";
  const ok = globalShortcut.register(HOTKEY, () => {
    if (!mainWindow) {
      createMainWindow();
      return;
    }
    if (currentMode === "full") {
      setWindowSize("top");
      mainWindow.webContents.send("forced-size", "top");
    } else {
      setWindowSize("full");
      mainWindow.webContents.send("forced-size", "full");
      mainWindow.focus();
    }
  });
  if (!ok) log.warn(`[hotkey] failed to register ${HOTKEY}`);
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  exitTopMode();
});

process.on("exit", () => {
  try { exitTopMode(); } catch {}
});

app.on("window-all-closed", () => {});
