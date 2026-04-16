// Generates a simple 16×16 tray icon PNG (purple rounded square with a white dot).
// Run: node scripts/gen-tray-icon.js
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const W = 16, H = 16
const r = 4 // corner radius
const purple = [124, 58, 237]
const white = [255, 255, 255]
const transparent = [0, 0, 0, 0]

function inRoundedRect(x, y) {
  // point-in-rounded-rect (0..W-1, 0..H-1)
  if (x < 0 || x > W - 1 || y < 0 || y > H - 1) return false
  const dxL = x, dxR = W - 1 - x
  const dyT = y, dyB = H - 1 - y
  const corners = [
    [dxL, dyT], [dxR, dyT], [dxL, dyB], [dxR, dyB],
  ]
  for (const [cx, cy] of corners) {
    if (cx < r && cy < r) {
      const dx = r - cx, dy = r - cy
      if (dx * dx + dy * dy > r * r) return false
    }
  }
  return true
}

function inCenterDot(x, y) {
  const cx = (W - 1) / 2, cy = (H - 1) / 2
  const dx = x - cx, dy = y - cy
  return dx * dx + dy * dy <= 9 // ~r=3
}

const rows = []
for (let y = 0; y < H; y++) {
  const row = [0] // filter byte (None)
  for (let x = 0; x < W; x++) {
    if (inRoundedRect(x, y)) {
      if (inCenterDot(x, y)) row.push(white[0], white[1], white[2], 255)
      else row.push(purple[0], purple[1], purple[2], 255)
    } else {
      row.push(...transparent)
    }
  }
  rows.push(Buffer.from(row))
}
const raw = Buffer.concat(rows)
const idat = zlib.deflateSync(raw)

function crc32(buf) {
  if (zlib.crc32) return zlib.crc32(buf)
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8       // bit depth
ihdr[9] = 6       // color type (RGBA)
ihdr[10] = 0      // compression
ihdr[11] = 0      // filter
ihdr[12] = 0      // interlace

const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
])

const outDir = path.join(__dirname, '..', 'assets')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, 'tray-icon.png')
fs.writeFileSync(outPath, png)
console.log('wrote', outPath, png.length, 'bytes')
