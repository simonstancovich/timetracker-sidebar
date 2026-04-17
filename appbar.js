const koffi = require('koffi')

const ABM_NEW = 0
const ABM_REMOVE = 1
const ABM_QUERYPOS = 2
const ABM_SETPOS = 3
const ABE_TOP = 1
const APPBAR_CALLBACK = 0x0401

let SHAppBarMessage = null
let APPBARDATA = null

function ensureLoaded() {
  if (SHAppBarMessage) return true
  if (process.platform !== 'win32') return false
  const shell32 = koffi.load('shell32.dll')
  const RECT = koffi.struct('RECT', {
    left: 'int32',
    top: 'int32',
    right: 'int32',
    bottom: 'int32',
  })
  APPBARDATA = koffi.struct('APPBARDATA', {
    cbSize: 'uint32',
    hWnd: 'void*',
    uCallbackMessage: 'uint32',
    uEdge: 'uint32',
    rc: RECT,
    lParam: 'intptr_t',
  })
  SHAppBarMessage = shell32.func(
    '__stdcall',
    'SHAppBarMessage',
    'uintptr_t',
    ['uint32', koffi.inout(koffi.pointer(APPBARDATA))],
  )
  return true
}

function hwndFromBuffer(hwndBuf) {
  if (!Buffer.isBuffer(hwndBuf)) return hwndBuf
  return hwndBuf.length >= 8
    ? hwndBuf.readBigUInt64LE(0)
    : BigInt(hwndBuf.readUInt32LE(0))
}

function dataFor(hwnd) {
  return {
    cbSize: koffi.sizeof(APPBARDATA),
    hWnd: hwnd,
    uCallbackMessage: APPBAR_CALLBACK,
    uEdge: ABE_TOP,
    rc: { left: 0, top: 0, right: 0, bottom: 0 },
    lParam: 0,
  }
}

function register(hwndBuf) {
  if (!ensureLoaded()) return false
  const hwnd = hwndFromBuffer(hwndBuf)
  const d = dataFor(hwnd)
  const result = SHAppBarMessage(ABM_NEW, d)
  console.log('[appbar] ABM_NEW →', result, 'hwnd:', hwnd.toString(16))
  return !!result
}

function setTopPos(hwndBuf, { left, top, right, height }) {
  if (!ensureLoaded()) return null
  const hwnd = hwndFromBuffer(hwndBuf)
  const d = dataFor(hwnd)
  d.rc = { left, top, right, bottom: top + height }
  const qr = SHAppBarMessage(ABM_QUERYPOS, d)
  console.log('[appbar] ABM_QUERYPOS →', qr, 'rc:', d.rc)
  d.rc = {
    left: d.rc.left,
    top: d.rc.top,
    right: d.rc.right,
    bottom: d.rc.top + height,
  }
  const sr = SHAppBarMessage(ABM_SETPOS, d)
  console.log('[appbar] ABM_SETPOS →', sr, 'rc:', d.rc)
  return { ...d.rc }
}

function remove(hwndBuf) {
  if (!ensureLoaded()) return
  const hwnd = hwndFromBuffer(hwndBuf)
  const d = dataFor(hwnd)
  SHAppBarMessage(ABM_REMOVE, d)
}

module.exports = { register, setTopPos, remove }
