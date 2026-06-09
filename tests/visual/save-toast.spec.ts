import { test, expect, chromium } from '@playwright/test'

test('SaveToast lab — card is dead-centered in the viewport', async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 380, height: 900 } })
  try {
    await page.goto('http://localhost:5180/save-toast-lab.html')
    const card = page.locator('[role="status"] > *').first()
    await card.waitFor()

    const cardBox = await card.boundingBox()
    const viewport = page.viewportSize()!
    if (!cardBox) throw new Error('card has no bounding box')

    const cardCenterX = cardBox.x + cardBox.width / 2
    const cardCenterY = cardBox.y + cardBox.height / 2
    const vpCenterX = viewport.width / 2
    const vpCenterY = viewport.height / 2

    const dx = Math.abs(cardCenterX - vpCenterX)
    const dy = Math.abs(cardCenterY - vpCenterY)

    const backdrop = page.locator('[role="status"]')
    const computed = await backdrop.evaluate((el) => {
      const cs = window.getComputedStyle(el)
      return {
        position: cs.position,
        top: cs.top,
        left: cs.left,
        right: cs.right,
        bottom: cs.bottom,
        display: cs.display,
        alignItems: cs.alignItems,
        justifyContent: cs.justifyContent,
        flexDirection: cs.flexDirection,
        zIndex: cs.zIndex,
        width: cs.width,
        height: cs.height,
        className: el.className,
      }
    })

    console.log('backdrop computed style:', JSON.stringify(computed, null, 2))
    console.log(
      `card center (${cardCenterX.toFixed(1)}, ${cardCenterY.toFixed(1)}) vs ` +
        `viewport center (${vpCenterX}, ${vpCenterY}) — dx ${dx.toFixed(1)} dy ${dy.toFixed(1)}`,
    )

    expect(dx).toBeLessThan(8)
    expect(dy).toBeLessThan(8)
  } finally {
    await browser.close()
  }
})
