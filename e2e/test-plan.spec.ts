import { test, expect } from '@playwright/test'

/**
 * E2E tests covering the PR test plan:
 * https://github.com/kolezka/fastfetch-builder/pull/1
 */

/** Helper: clear state and get a clean page with the Neofetch preset auto-loaded */
async function freshPage(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForLoadState('networkidle')
  // The app auto-loads Neofetch preset when modules are empty
  // Wait for modules to appear
  await expect(page.getByText('Active Modules')).toBeVisible()
}

/** Helper: clear all modules to get empty state */
async function clearAllModules(page: import('@playwright/test').Page) {
  const clearBtn = page.getByTitle('Remove all modules')
  if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await clearBtn.click()
    await expect(page.getByText('No modules added yet')).toBeVisible()
  }
}

test.describe('PR Test Plan', () => {
  test.beforeEach(async ({ page }) => {
    await freshPage(page)
  })

  test('modules can be added by clicking palette buttons', async ({ page }) => {
    await clearAllModules(page)

    // Click a module in the palette to add it
    await page.getByTitle('Add OS module').click()

    // The module should appear in the active list
    await expect(page.getByText('No modules added yet')).not.toBeVisible()

    // Active modules count should show 1
    const countBadge = page.locator('text=Active Modules').locator('..').locator('span.rounded-full')
    await expect(countBadge).toHaveText('1')

    // Add another module
    await page.getByTitle('Add CPU module').click()
    await expect(countBadge).toHaveText('2')
  })

  test('up/down arrow buttons reorder correctly', async ({ page }) => {
    await clearAllModules(page)

    // Add OS, then CPU, then Memory
    await page.getByTitle('Add OS module').click()
    await page.getByTitle('Add CPU module').click()
    await page.getByTitle('Add Memory module').click()

    // Get all module card labels - verify initial order
    const moduleLabels = page.locator('li.rounded-lg.border-border .font-mono.text-sm.text-text-primary')
    await expect(moduleLabels).toHaveCount(3)
    await expect(moduleLabels.nth(0)).toHaveText('OS')
    await expect(moduleLabels.nth(1)).toHaveText('CPU')
    await expect(moduleLabels.nth(2)).toHaveText('Memory')

    // Click "Move down" on the first module (OS)
    const moveDownButtons = page.getByTitle('Move down')
    await moveDownButtons.nth(0).click()

    // Order should now be: CPU, OS, Memory
    await expect(moduleLabels.nth(0)).toHaveText('CPU')
    await expect(moduleLabels.nth(1)).toHaveText('OS')
    await expect(moduleLabels.nth(2)).toHaveText('Memory')

    // Click "Move up" on the last module (Memory)
    const moveUpButtons = page.getByTitle('Move up')
    await moveUpButtons.nth(2).click()

    // Order should now be: CPU, Memory, OS
    await expect(moduleLabels.nth(0)).toHaveText('CPU')
    await expect(moduleLabels.nth(1)).toHaveText('Memory')
    await expect(moduleLabels.nth(2)).toHaveText('OS')
  })

  test('resize handle adjusts panel widths', async ({ page }) => {
    const resizeHandle = page.getByTitle('Drag to resize')

    // Get initial right panel width via inline style
    const rightPanel = page.locator('div.flex.shrink-0.flex-col.overflow-hidden[style]')
    const initialWidth = await rightPanel.evaluate((el) => el.getBoundingClientRect().width)

    // Get handle position
    const handleBox = await resizeHandle.boundingBox()
    expect(handleBox).toBeTruthy()

    // Drag the handle to the left (increasing right panel width)
    await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(handleBox!.x - 100, handleBox!.y + handleBox!.height / 2, { steps: 10 })
    await page.mouse.up()

    // Right panel should now be wider
    const newWidth = await rightPanel.evaluate((el) => el.getBoundingClientRect().width)
    expect(newWidth).toBeGreaterThan(initialWidth)
  })

  test('JSONC preview updates in real time', async ({ page }) => {
    await clearAllModules(page)

    // Get initial JSONC preview content
    const codeMirror = page.locator('.cm-content')
    await expect(codeMirror).toBeVisible()
    const initialText = await codeMirror.textContent()

    // Add a module
    await page.getByTitle('Add CPU module').click()

    // JSONC preview should now contain "cpu"
    await expect(codeMirror).toContainText('cpu')

    // Add another module
    await page.getByTitle('Add Memory module').click()

    // JSONC preview should now contain "memory" too
    await expect(codeMirror).toContainText('memory')

    // The content should have changed from initial
    const updatedText = await codeMirror.textContent()
    expect(updatedText).not.toBe(initialText)
  })

  test('terminal mockup renders correctly', async ({ page }) => {
    // Should show "fastfetch" label in terminal title bar
    await expect(page.locator('text=fastfetch').first()).toBeVisible()

    // The ASCII logo should be rendered (pre element)
    const pre = page.locator('pre.font-mono')
    await expect(pre).toBeVisible()

    // With the neofetch preset auto-loaded, should show module values
    const preText = await pre.textContent()
    expect(preText).toBeTruthy()
    // The ASCII art contains the arch logo
    expect(preText).toContain('/\\')
    // Should show key-value pairs from modules
    expect(preText).toContain('OS')
  })

  test('presets load properly', async ({ page }) => {
    // Open presets dropdown
    await page.getByRole('button', { name: /Presets/ }).click()

    // Should show preset options — use the preset name within the button
    const presetDropdown = page.locator('.absolute.left-0')
    await expect(presetDropdown).toBeVisible()
    await expect(presetDropdown.locator('text=Neofetch').first()).toBeVisible()
    await expect(presetDropdown.locator('text=Minimal').first()).toBeVisible()
    await expect(presetDropdown.locator('text=Hardware').first()).toBeVisible()

    // Load the Minimal preset (click the button containing "Minimal")
    await presetDropdown.getByText('Minimal', { exact: true }).click()

    // Minimal preset has 4 modules: OS, Kernel, Shell, Uptime
    const countBadge = page.locator('text=Active Modules').locator('..').locator('span.rounded-full')
    await expect(countBadge).toHaveText('4')

    // Verify the correct modules are loaded
    const moduleLabels = page.locator('li.rounded-lg.border-border .font-mono.text-sm.text-text-primary')
    await expect(moduleLabels.nth(0)).toHaveText('OS')
    await expect(moduleLabels.nth(1)).toHaveText('Kernel')
    await expect(moduleLabels.nth(2)).toHaveText('Shell')
    await expect(moduleLabels.nth(3)).toHaveText('Uptime')

    // Now load Hardware preset
    await page.getByRole('button', { name: /Presets/ }).click()
    await presetDropdown.getByText('Hardware', { exact: true }).click()

    // Hardware has 11 modules
    await expect(countBadge).toHaveText('11')
  })

  test('localStorage persistence across page reloads', async ({ page }) => {
    // Load Minimal preset for a known state
    await page.getByRole('button', { name: /Presets/ }).click()
    const presetDropdown = page.locator('.absolute.left-0')
    await presetDropdown.getByText('Minimal', { exact: true }).click()

    const countBadge = page.locator('text=Active Modules').locator('..').locator('span.rounded-full')
    await expect(countBadge).toHaveText('4')

    // Verify localStorage has data
    const stored = await page.evaluate(() => localStorage.getItem('fastfetch-config'))
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed.state.modules).toHaveLength(4)

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Modules should persist after reload
    await expect(countBadge).toHaveText('4')

    const moduleLabels = page.locator('li.rounded-lg.border-border .font-mono.text-sm.text-text-primary')
    await expect(moduleLabels.nth(0)).toHaveText('OS')
    await expect(moduleLabels.nth(1)).toHaveText('Kernel')
    await expect(moduleLabels.nth(2)).toHaveText('Shell')
    await expect(moduleLabels.nth(3)).toHaveText('Uptime')
  })

  test('Copy button works', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])

    const copyBtn = page.getByRole('button', { name: 'Copy' })
    await expect(copyBtn).toBeVisible()

    // Click copy
    await copyBtn.click()

    // Button should show "Copied!" feedback
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible()

    // Verify clipboard content contains JSONC
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toContain('$schema')
    expect(clipboardText).toContain('modules')

    // Feedback should revert after ~1.5s
    await expect(copyBtn).toBeVisible({ timeout: 3000 })
  })

  test('Download button works', async ({ page }) => {
    // Listen for download event
    const downloadPromise = page.waitForEvent('download')

    const downloadBtn = page.getByRole('button', { name: 'Download' })
    await expect(downloadBtn).toBeVisible()
    await downloadBtn.click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('config.jsonc')

    // Read the downloaded file content
    const content = (await download.path()) ? await (await download.createReadStream()).toArray() : null
    expect(content).toBeTruthy()
    const text = Buffer.concat(content!).toString('utf-8')
    expect(text).toContain('$schema')
    expect(text).toContain('modules')
  })

  test('drag-and-drop reordering works', async ({ page }) => {
    await clearAllModules(page)

    // Add 3 modules
    await page.getByTitle('Add OS module').click()
    await page.getByTitle('Add CPU module').click()
    await page.getByTitle('Add Memory module').click()

    // Get the drag handles
    const dragHandles = page.getByTitle('Drag to reorder')
    await expect(dragHandles).toHaveCount(3)

    // Get positions of first and last drag handles
    const firstHandle = await dragHandles.nth(0).boundingBox()
    const lastHandle = await dragHandles.nth(2).boundingBox()
    expect(firstHandle).toBeTruthy()
    expect(lastHandle).toBeTruthy()

    // Drag first module (OS) down past the third module (Memory)
    await page.mouse.move(
      firstHandle!.x + firstHandle!.width / 2,
      firstHandle!.y + firstHandle!.height / 2,
    )
    await page.mouse.down()
    // Move in steps to trigger Framer Motion's reorder detection
    await page.mouse.move(
      lastHandle!.x + lastHandle!.width / 2,
      lastHandle!.y + lastHandle!.height + 20,
      { steps: 20 },
    )
    await page.mouse.up()

    // Wait for animation to settle
    await page.waitForTimeout(500)

    // After drag, OS should no longer be first
    const moduleLabels = page.locator('li.rounded-lg.border-border .font-mono.text-sm.text-text-primary')
    const firstModuleText = await moduleLabels.nth(0).textContent()
    // OS was dragged down, so first should now be CPU
    expect(firstModuleText).not.toBe('OS')
  })
})
