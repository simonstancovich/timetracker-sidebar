/**
 * Microsoft Graph integration for reading the signed-in user's calendar.
 *
 * Setup (do this once per tenant):
 *   1. Go to https://entra.microsoft.com → App registrations → New registration.
 *   2. Under "Authentication" → Add platform → Mobile and desktop applications.
 *      Tick "http://localhost" as a redirect URI.
 *   3. Enable "Allow public client flows".
 *   4. Under "API permissions" add delegated: Calendars.Read, User.Read.
 *   5. (Admin consent if tenant policy requires it.)
 *   6. Copy the Application (client) ID and Directory (tenant) ID.
 *   7. Set env vars AZURE_CLIENT_ID and AZURE_TENANT_ID before launching,
 *      or paste them below.
 *
 * Auth flow: MSAL interactive (auth code + PKCE). Click "Connect calendar"
 * and the system browser opens the Microsoft sign-in page, then redirects
 * back to a loopback port and the app receives the token. Refresh tokens
 * are cached via electron-store so future launches are silent.
 */

const { PublicClientApplication, LogLevel } = require("@azure/msal-node");
const { shell } = require("electron");
const { net } = require("electron");

const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || "";
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || "common";
const SCOPES = ["Calendars.Read", "User.Read"];
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

let pca = null;
let inMemoryCachePlugin = null;
let store = null;
let currentAccount = null;

function log(...args) {
  console.log("[graph]", ...args);
}

function isConfigured() {
  return !!AZURE_CLIENT_ID;
}

function buildCachePlugin(storeInstance) {
  return {
    beforeCacheAccess: async (ctx) => {
      const cached = storeInstance.get("msalCache");
      if (typeof cached === "string") ctx.tokenCache.deserialize(cached);
    },
    afterCacheAccess: async (ctx) => {
      if (ctx.cacheHasChanged) {
        storeInstance.set("msalCache", ctx.tokenCache.serialize());
      }
    },
  };
}

function init(storeInstance) {
  store = storeInstance;
  if (!isConfigured()) {
    log("AZURE_CLIENT_ID not set — calendar features disabled.");
    return;
  }
  inMemoryCachePlugin = buildCachePlugin(storeInstance);
  pca = new PublicClientApplication({
    auth: {
      clientId: AZURE_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${AZURE_TENANT_ID}`,
    },
    cache: { cachePlugin: inMemoryCachePlugin },
    system: {
      loggerOptions: {
        loggerCallback: (_lvl, msg) => log(msg),
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
      },
    },
  });
  log("initialized with tenant", AZURE_TENANT_ID);
}

async function loadAccount() {
  if (!pca) return null;
  const accounts = await pca.getTokenCache().getAllAccounts();
  currentAccount = accounts[0] || null;
  return currentAccount;
}

async function status() {
  if (!isConfigured()) return { configured: false, signedIn: false };
  const acct = await loadAccount();
  return {
    configured: true,
    signedIn: !!acct,
    username: acct?.username || null,
    name: acct?.name || null,
  };
}

async function signIn() {
  if (!isConfigured()) throw new Error("AZURE_CLIENT_ID not configured");
  const result = await pca.acquireTokenInteractive({
    scopes: SCOPES,
    openBrowser: async (url) => {
      await shell.openExternal(url);
    },
    successTemplate:
      "<html><body style='font-family:system-ui;text-align:center;padding:40px;color:#333'>" +
      "<h2>Signed in</h2><p>You can close this tab and return to the app.</p>" +
      "</body></html>",
    errorTemplate:
      "<html><body style='font-family:system-ui;text-align:center;padding:40px;color:#c00'>" +
      "<h2>Sign-in failed</h2><p>Close this tab and try again from the app.</p>" +
      "</body></html>",
  });
  currentAccount = result.account;
  return { username: result.account.username, name: result.account.name };
}

async function signOut() {
  if (!pca) return;
  const acct = await loadAccount();
  if (acct) await pca.getTokenCache().removeAccount(acct);
  currentAccount = null;
  store?.delete("msalCache");
}

async function getAccessToken() {
  if (!pca) throw new Error("not initialized");
  const acct = await loadAccount();
  if (!acct) throw new Error("not signed in");
  const res = await pca.acquireTokenSilent({
    account: acct,
    scopes: SCOPES,
  });
  return res.accessToken;
}

function graphGet(pathAndQuery, token) {
  return new Promise((resolve, reject) => {
    const req = net.request({
      method: "GET",
      url: `${GRAPH_BASE}${pathAndQuery}`,
    });
    req.setHeader("Authorization", `Bearer ${token}`);
    req.setHeader("Accept", "application/json");
    let body = "";
    req.on("response", (res) => {
      res.on("data", (chunk) => (body += chunk.toString()));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
        } else {
          reject(new Error(`graph ${res.statusCode}: ${body.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

/**
 * Fetch calendar events in a window around now.
 * windowHoursBack / windowHoursForward default to -1h .. +12h.
 */
async function getMeetings({ hoursBack = 1, hoursForward = 12 } = {}) {
  const token = await getAccessToken();
  const start = new Date(Date.now() - hoursBack * 3600 * 1000);
  const end = new Date(Date.now() + hoursForward * 3600 * 1000);
  const qs = new URLSearchParams({
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
    $orderby: "start/dateTime",
    $select:
      "id,subject,start,end,organizer,attendees,isAllDay,isCancelled,showAs,bodyPreview,webLink,onlineMeeting",
    $top: "30",
  }).toString();
  const res = await graphGet(
    `/me/calendarView?${qs}`,
    token,
  );
  return res.value || [];
}

module.exports = {
  init,
  isConfigured,
  status,
  signIn,
  signOut,
  getMeetings,
};
