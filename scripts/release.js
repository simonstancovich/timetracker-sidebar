/* eslint-disable @typescript-eslint/no-require-imports */
// Release orchestration for Windows.
//
// Workaround for an electron-builder + rcedit-x64 quirk on Electron 28:
// rcedit fails with "Unable to commit changes" when version-strings and
// --set-icon are issued in a single invocation. Running them as two separate
// invocations (icon first, then version strings) succeeds. We:
//   1. let electron-builder pack the app into release/win-unpacked/
//      (the bundled rcedit step throws but the dir is written)
//   2. run rcedit ourselves: --set-icon, then version strings
//   3. let electron-builder build the NSIS installer + publish via --prepackaged
//      (which skips its own rcedit step on the already-stamped exe).

const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.resolve(__dirname, "..");
const PKG = require(path.join(ROOT, "package.json"));
const VERSION = PKG.version;
const PROD_NAME = PKG.build.productName;
const EXE_NAME = `${PROD_NAME}.exe`;
const UNPACKED_DIR = path.join(ROOT, "release", "win-unpacked");
const EXE = path.join(UNPACKED_DIR, EXE_NAME);
const ICON = path.join(ROOT, "build", "icon.ico");
const RCEDIT = path.join(
  process.env.LOCALAPPDATA,
  "electron-builder",
  "Cache",
  "winCodeSign",
  "winCodeSign-2.6.0",
  "rcedit-x64.exe",
);

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
    p.on("error", reject);
    p.on("exit", (code) => resolve(code ?? 0));
  });
}

function rcedit(args) {
  const r = spawnSync(RCEDIT, [EXE, ...args], { stdio: "inherit" });
  if (r.status !== 0) {
    throw new Error(`rcedit exited ${r.status} with args: ${args.join(" ")}`);
  }
}

(async () => {
  console.log("[release] vite build");
  if ((await run("npx", ["vite", "build"])) !== 0) {
    process.exit(1);
  }

  // electron-builder --dir packs the app; bundled rcedit step will fail but
  // the unpacked dir is written before that. Allow non-zero exit.
  console.log("[release] electron-builder --dir (rcedit failure ignored)");
  await run("npx", ["electron-builder", "--dir"]);
  if (!fs.existsSync(EXE)) {
    console.error(`[release] expected ${EXE} after pack`);
    process.exit(1);
  }

  console.log("[release] rcedit pass 1: --set-icon");
  rcedit(["--set-icon", ICON]);

  console.log("[release] rcedit pass 2: version strings");
  rcedit([
    "--set-version-string", "FileDescription", PROD_NAME,
    "--set-version-string", "ProductName", PROD_NAME,
    "--set-version-string", "LegalCopyright", `Copyright ${PROD_NAME}`,
    "--set-version-string", "InternalName", PROD_NAME,
    "--set-version-string", "OriginalFilename", EXE_NAME,
    "--set-file-version", VERSION,
    "--set-product-version", `${VERSION}.0`,
  ]);

  console.log("[release] electron-builder --prepackaged --publish always");
  const code = await run(
    "npx",
    [
      "dotenv", "-e", ".env", "--",
      "electron-builder",
      "--prepackaged", UNPACKED_DIR,
      "--publish", "always",
    ],
  );
  process.exit(code);
})().catch((err) => {
  console.error("[release] failed:", err.message);
  process.exit(1);
});
