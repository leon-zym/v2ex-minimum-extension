/**
 * Wait for an element to appear in the DOM, with timeout.
 */
export function waitForElement<T extends Element = Element>(
  selector: string,
  timeout = 5000,
): Promise<T | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector<T>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector<T>(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Check if the current page matches a V2EX URL pattern.
 * @example isV2exPage('/t/') matches topic pages
 */
export function isV2exPage(pathPrefix: string): boolean {
  return window.location.pathname.startsWith(pathPrefix);
}
