/**
 * Base Page Object Model for BillClaw E2E Tests
 *
 * This abstract class provides common functionality for all page objects.
 * Extend this class to create specific page objects for different pages.
 *
 * @example
 * ```typescript
 * import { BasePage } from './base-page'
 * import { Page, Locator } from '@playwright/test'
 *
 * class LoginPage extends BasePage {
 *   private readonly usernameInput: Locator
 *   private readonly passwordInput: Locator
 *   private readonly loginButton: Locator
 *
 *   constructor(page: Page) {
 *     super(page)
 *     this.usernameInput = this.page.locator('#username')
 *     this.passwordInput = this.page.locator('#password')
 *     this.loginButton = this.page.getByRole('button', { name: 'Login' })
 *   }
 *
 *   async login(username: string, password: string): Promise<void> {
 *     await this.usernameInput.fill(username)
 *     await this.passwordInput.fill(password)
 *     await this.loginButton.click()
 *   }
 * }
 * ```
 */

import { Page, Locator } from "@playwright/test"

/**
 * Abstract base class for all page objects
 */
export abstract class BasePage {
  /**
   * Creates a new BasePage instance
   * @param page - Playwright Page instance
   */
  constructor(protected page: Page) {}

  /**
   * Waits for an element to be visible on the page
   * @param selector - CSS selector or locator string
   * @param timeout - Maximum wait time in milliseconds (default: 15000)
   * @returns The Locator for the element
   */
  protected async waitForElement(
    selector: string,
    timeout = 15000
  ): Promise<Locator> {
    const locator = this.page.locator(selector)
    await locator.waitFor({ state: "visible", timeout })
    return locator
  }

  /**
   * Navigates to a specific path relative to the base URL
   * @param path - The path to navigate to (e.g., '/oauth/plaid')
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path)
  }

  /**
   * Takes a full-page screenshot and saves it to the test-results directory
   * @param name - Descriptive name for the screenshot
   * @returns The path to the saved screenshot
   */
  async takeScreenshot(name: string): Promise<string> {
    const path = `test-results/screenshots/${name}-${Date.now()}.png`
    await this.page.screenshot({ path, fullPage: true })
    return path
  }

  /**
   * Waits for the page URL to match a pattern
   * @param pattern - RegExp or string pattern to match
   * @param timeout - Maximum wait time in milliseconds (default: 30000)
   */
  async waitForUrl(
    pattern: RegExp | string,
    timeout = 30000
  ): Promise<void> {
    await this.page.waitForURL(pattern, { timeout })
  }

  /**
   * Waits for the page to reach a specific load state
   * @param state - The load state to wait for (default: 'networkidle')
   * @param timeout - Maximum wait time in milliseconds (default: 30000)
   */
  async waitForLoadState(
    state: "load" | "domcontentloaded" | "networkidle" = "networkidle",
    timeout = 30000
  ): Promise<void> {
    await this.page.waitForLoadState(state, { timeout })
  }

  /**
   * Gets the current page URL
   * @returns The current page URL as a string
   */
  getCurrentUrl(): string {
    return this.page.url()
  }

  /**
   * Checks if an element is visible on the page
   * @param selector - CSS selector or locator string
   * @returns True if the element is visible, false otherwise
   */
  async isElementVisible(selector: string): Promise<boolean> {
    const locator = this.page.locator(selector)
    return await locator.isVisible()
  }

  /**
   * Clicks on an element and waits for navigation
   * @param selector - CSS selector or locator string
   * @param timeout - Maximum wait time for navigation in milliseconds (default: 30000)
   */
  async clickAndWaitForNavigation(
    selector: string,
    timeout = 30000
  ): Promise<void> {
    await Promise.all([
      this.page.waitForURL(/.*/, { timeout }),
      this.page.locator(selector).click(),
    ])
  }
}
