const REPLY_SELECTOR = '.cell[id^="r_"]';
const THANKS_SELECTOR = '.small.fade';
const PAGE_INPUT_SELECTOR = '.page_input';
const MAX_PAGES = 10;
const PER_PAGE_TIMEOUT = 5_000;
const TOTAL_TIMEOUT = 15_000;

export function parseReplyThanks(cell: Element): number {
  const thanksEl = cell.querySelector(THANKS_SELECTOR);
  if (!thanksEl) return 0;

  const text = thanksEl.textContent?.trim() ?? '';
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getTotalPages(): number {
  const pageInput = document.querySelector<HTMLInputElement>(PAGE_INPUT_SELECTOR);
  if (pageInput) {
    const max = parseInt(pageInput.getAttribute('max') ?? '1', 10);
    return Number.isFinite(max) && max >= 1 ? max : 1;
  }
  return 1;
}

export function getReplyBox(): Element | null {
  const firstReply = document.querySelector(REPLY_SELECTOR);
  return firstReply?.parentElement ?? null;
}

export function getCurrentPageReplies(): Element[] {
  return Array.from(document.querySelectorAll(REPLY_SELECTOR));
}

export function sortRepliesByThanks(cells: Element[]): Element[] {
  return [...cells].sort((a, b) => {
    const thanksA = parseReplyThanks(a);
    const thanksB = parseReplyThanks(b);
    return thanksB - thanksA;
  });
}

function parseRepliesFromHTML(html: string): Element[] {
  const doc = document.implementation.createHTMLDocument('');
  doc.documentElement.innerHTML = html;
  return Array.from(doc.querySelectorAll(REPLY_SELECTOR));
}

function getTopicBaseUrl(): string {
  return window.location.pathname;
}

export class FetchAbortedError extends Error {
  constructor(message = 'Fetch aborted') {
    super(message);
    this.name = 'FetchAbortedError';
  }
}

export class TooManyPagesError extends Error {
  constructor(totalPages: number) {
    super(`评论页数过多（${totalPages} 页），仅对当前页排序`);
    this.name = 'TooManyPagesError';
  }
}

export async function fetchAllReplies(
  totalPages: number,
  signal?: AbortSignal,
): Promise<Element[]> {
  if (totalPages > MAX_PAGES) {
    throw new TooManyPagesError(totalPages);
  }

  const baseUrl = getTopicBaseUrl();
  const currentPage = getCurrentPageNumber();
  const currentReplies = getCurrentPageReplies();

  const timeoutId = setTimeout(() => {
    // If a parent AbortController exists, this is a no-op.
    // The caller should provide an AbortController whose signal we use.
  }, TOTAL_TIMEOUT);

  try {
    const pagePromises: Promise<Element[]>[] = [];

    for (let p = 1; p <= totalPages; p++) {
      if (p === currentPage) {
        pagePromises.push(Promise.resolve(currentReplies));
        continue;
      }

      const controller = new AbortController();
      const perPageTimeout = setTimeout(() => controller.abort(), PER_PAGE_TIMEOUT);

      if (signal) {
        signal.addEventListener('abort', () => controller.abort(), { once: true });
      }

      pagePromises.push(
        fetch(`${baseUrl}?p=${p}`, {
          signal: controller.signal,
          credentials: 'same-origin',
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch page ${p}: ${res.status}`);
            return res.text();
          })
          .then((html) => {
            clearTimeout(perPageTimeout);
            return parseRepliesFromHTML(html);
          })
          .catch((err) => {
            clearTimeout(perPageTimeout);
            if (err.name === 'AbortError' || signal?.aborted) {
              throw new FetchAbortedError();
            }
            throw err;
          }),
      );
    }

    const results = await Promise.all(pagePromises);
    return results.flat();
  } finally {
    clearTimeout(timeoutId);
  }
}

function getCurrentPageNumber(): number {
  const params = new URLSearchParams(window.location.search);
  const p = parseInt(params.get('p') ?? '1', 10);
  return Number.isFinite(p) && p >= 1 ? p : 1;
}
