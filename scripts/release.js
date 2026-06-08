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
const os = require("node:os");
const crypto = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
const PKG = require(path.join(ROOT, "package.json"));
const VERSION = PKG.version;
const PROD_NAME = PKG.build.productName;
const EXE_NAME = `${PROD_NAME}.exe`;
const OUTPUT_DIR = PKG.build.directories.output;
const UNPACKED_DIR = path.join(OUTPUT_DIR, "win-unpacked");
const EXE = path.join(UNPACKED_DIR, EXE_NAME);
const ICON = path.join(ROOT, "build", "icon.ico");
// Portable target: hand-roll latest.yml since electron-builder skips
// isWriteUpdateInfo for portable. The file electron-builder produces is
// named via the build.portable.artifactName pattern.
const PORTABLE_ARTIFACT = `DevCore-TimeTracker-${VERSION}.exe`;
const PORTABLE_EXE = path.join(OUTPUT_DIR, PORTABLE_ARTIFACT);
const LATEST_YML = path.join(OUTPUT_DIR, "latest.yml");
const RCEDIT = path.join(
  process.env.LOCALAPPDATA,
  "electron-builder",
  "Cache",
  "winCodeSign",
  "winCodeSign-2.6.0",
  "rcedit-x64.exe",
);

function run(cmd, args, opts = {}) {
  // shell:true joins args with spaces, so wrap any arg with whitespace in
  // quotes for the shell to receive it as a single argument.
  const quoted = args.map((a) => (/\s/.test(a) ? `"${a}"` : a));
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, quoted, { stdio: "inherit", shell: true, ...opts });
    p.on("error", reject);
    p.on("exit", (code) => resolve(code ?? 0));
  });
}

// Copy the exe to a no-spaces path before rcedit'ing — rcedit fails with
// "Unable to commit changes" when the file path contains whitespace (true at
// least on the "Interna Projekt" project path here).
const SCRATCH_DIR = path.join(os.tmpdir(), "rcedit-scratch");
const SCRATCH_EXE = path.join(SCRATCH_DIR, "app.exe");

function copyToScratch() {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
  fs.copyFileSync(EXE, SCRATCH_EXE);
}

function copyFromScratch() {
  // Delete the destination first — the freshly-extracted exe may still be
  // under AV real-time scan and copyFileSync (which truncates+writes) fails
  // with "UNKNOWN". Removing first lets us replace with a sleep+retry loop.
  let lastErr;
  for (let i = 0; i < 20; i++) {
    try {
      if (fs.existsSync(EXE)) fs.unlinkSync(EXE);
      fs.copyFileSync(SCRATCH_EXE, EXE);
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      const wait = Date.now() + 500;
      while (Date.now() < wait) { /* busy-wait so we stay synchronous */ }
    }
  }
  if (lastErr) throw lastErr;
  fs.unlinkSync(SCRATCH_EXE);
  fs.rmdirSync(SCRATCH_DIR);
}

function rcedit(args) {
  const r = spawnSync(RCEDIT, [SCRATCH_EXE, ...args], { stdio: "inherit" });
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

  console.log(`[release] copy exe to scratch path (avoids rcedit space-in-path bug): ${SCRATCH_EXE}`);
  copyToScratch();

  console.log("[release] rcedit pass 1: version strings");
  rcedit([
    "--set-version-string", "FileDescription", PROD_NAME,
    "--set-version-string", "ProductName", PROD_NAME,
    "--set-version-string", "LegalCopyright", `Copyright ${PROD_NAME}`,
    "--set-version-string", "InternalName", PROD_NAME,
    "--set-version-string", "OriginalFilename", EXE_NAME,
    "--set-file-version", VERSION,
    "--set-product-version", `${VERSION}.0`,
  ]);

  console.log("[release] rcedit pass 2: --set-icon");
  rcedit(["--set-icon", ICON]);

  console.log("[release] copy stamped exe back");
  copyFromScratch();

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
  if (code !== 0) process.exit(code);

  console.log(`[release] generate latest.yml for portable target: ${LATEST_YML}`);
  const buf = fs.readFileSync(PORTABLE_EXE);
  const sha512 = crypto.createHash("sha512").update(buf).digest("base64");
  const size = buf.length;
  const releaseDate = new Date().toISOString();
  const yml = [
    `version: ${VERSION}`,
    `files:`,
    `  - url: ${PORTABLE_ARTIFACT}`,
    `    sha512: ${sha512}`,
    `    size: ${size}`,
    `path: ${PORTABLE_ARTIFACT}`,
    `sha512: ${sha512}`,
    `releaseDate: '${releaseDate}'`,
    ``,
  ].join("\n");
  fs.writeFileSync(LATEST_YML, yml);

  console.log(`[release] upload latest.yml to v${VERSION} release`);
  const ghCode = await run("gh", [
    "release", "upload", `v${VERSION}`, LATEST_YML,
    "--repo", `${PKG.build.publish.owner}/${PKG.build.publish.repo}`,
    "--clobber",
  ]);
  process.exit(ghCode);
})().catch((err) => {
  console.error("[release] failed:", err.message);
  process.exit(1);
});
