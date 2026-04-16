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

const store = new Store();
const BASE_URL = "https://timetracker.devcore.se";
const isDev = !app.isPackaged;

let mainWindow = null;
let authWindow = null;
let tray = null;

const SIDEBAR_WIDTH = 380;

let displayChangeSilenceUntil = 0;
const PILL_WIDTH = 360;
const PILL_HEIGHT = 68;
const SQUARE_SIZE = 72;
const REQUEST_TIMEOUT_MS = 15000;

function formatLocalDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function createMainWindow() {
  const { height, width } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: SIDEBAR_WIDTH,
    height: height,
    x: width - SIDEBAR_WIDTH,
    y: 0,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
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
    mainWindow.loadFile(path.join(__dirname, "dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("blur", () => {
    if (!mainWindow) return;
    if (Date.now() < displayChangeSilenceUntil) return;
    const [, h] = mainWindow.getSize();
    if (mainWindow.webContents.isDevToolsFocused()) return;
    if (h > SQUARE_SIZE + 30) {
      setWindowSize("pill");
      mainWindow.webContents.send("forced-size", "pill");
    }
  });
}

function setWindowSize(size) {
  if (!mainWindow) return;
  const { height, width } = screen.getPrimaryDisplay().workAreaSize;
  const wasResizable = mainWindow.isResizable();
  if (!wasResizable) mainWindow.setResizable(true);
  if (size === "pill") {
    mainWindow.setBounds({
      x: width - PILL_WIDTH - 12,
      y: 12,
      width: PILL_WIDTH,
      height: PILL_HEIGHT,
    });
  } else if (size === "square") {
    mainWindow.setBounds({
      x: width - SQUARE_SIZE - 12,
      y: 12,
      width: SQUARE_SIZE,
      height: SQUARE_SIZE,
    });
  } else {
    mainWindow.setBounds({
      x: width - SIDEBAR_WIDTH,
      y: 0,
      width: SIDEBAR_WIDTH,
      height,
    });
  }
  if (!wasResizable) mainWindow.setResizable(false);
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
    console.log(`[auth] probe (${source}) →`, authed);
    if (!authed || verified || !authWindow) return;
    verified = true;
    clearInterval(pollId);
    store.set("loggedIn", true);
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

async function signOut() {
  await session.fromPartition("persist:timetracker").clearStorageData();
  store.delete("loggedIn");
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

ipcMain.handle("api-call", async (event, { params, body }) => {
  const { c, m, ...query } = params;
  const res = await apiRequest({ c, m, query, body });
  const label = `${c}.${m}`;

  if (res.timedOut) {
    console.log(`[api] ${label} → timeout after ${REQUEST_TIMEOUT_MS}ms`);
    return { error: "timeout" };
  }
  if (res.networkError) {
    console.log(`[api] ${label} → error: ${res.networkError}`);
    return { error: res.networkError };
  }
  if (res.status >= 300 && res.status < 400) {
    console.log(`[api] ${label} → redirect ${res.status}`);
    return { error: "not_authenticated" };
  }

  console.log(`[api] ${label} (${res.status}) ${res.body.slice(0, 300)}`);
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
    console.log(`[auth] probe timed out after ${REQUEST_TIMEOUT_MS}ms`);
    return false;
  }
  if (res.networkError) {
    console.log("[auth] probe error:", res.networkError);
    return false;
  }
  if (res.status >= 300 && res.status < 400) {
    console.log("[auth] probe got redirect", res.status);
    return false;
  }
  try {
    const json = JSON.parse(res.body);
    return Array.isArray(json.rows);
  } catch {
    console.log(
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
ipcMain.handle("set-size", (_e, size) => setWindowSize(size));

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
    const { height } = screen.getPrimaryDisplay().workAreaSize;
    const [, h] = mainWindow.getSize();
    const current =
      h >= height - 20 ? "full" : h <= SQUARE_SIZE + 10 ? "square" : "pill";
    setWindowSize(current);
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
    const [, h] = mainWindow.getSize();
    const workArea = screen.getPrimaryDisplay().workAreaSize;
    const isFull = h >= workArea.height - 2;
    if (isFull) {
      setWindowSize("pill");
      mainWindow.webContents.send("forced-size", "pill");
    } else {
      setWindowSize("full");
      mainWindow.webContents.send("forced-size", "full");
      mainWindow.focus();
    }
  });
  if (!ok) console.log(`[hotkey] failed to register ${HOTKEY}`);
});

app.on("will-quit", () => globalShortcut.unregisterAll());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
  }
});
