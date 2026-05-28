import type { FeatureDefinition } from '~/types/feature';
import { isV2exPage } from '~/lib/dom-utils';
import {
  getTotalPages,
  getReplyBox,
  getCurrentPageReplies,
  sortRepliesByThanks,
  fetchAllReplies,
  TooManyPagesError,
  FetchAbortedError,
} from './sort-logic';
import { createSortStorage, type SortMode } from './sort-storage';
import { createSortButtons, type SortButtonGroup } from './sort-button';
import './styles.css';

export const replySortFeature: FeatureDefinition = {
  id: 'reply-sort',
  name: '评论按感谢排序',
  description: '支持将帖子评论按感谢数量从多到少排序',
  defaultEnabled: true,

  setup(ctx) {
    if (!isV2exPage('/t/')) return;

    const replyBox = getReplyBox();
    if (!replyBox) return;

    const storage = createSortStorage(ctx);
    let currentMode: SortMode = 'default';
    let originalOrder: string[] = [];
    let isMultiPageSorted = false;
    let abortController: AbortController | null = null;
    let pagerElement: Element | null = null;

    originalOrder = getCurrentPageReplies().map((el) => el.id);

    const buttons = createSortButtons(handleSwitch, 'default', replyBox);
    if (!buttons) return;

    storage.load().then((saved) => {
      if (saved === 'thanks' && currentMode !== 'thanks') {
        handleSwitch('thanks');
      }
    });

    async function handleSwitch(mode: SortMode): Promise<void> {
      if (mode === currentMode) return;

      if (mode === 'default') {
        await restoreDefault(buttons!);
        return;
      }

      currentMode = 'thanks';
      buttons!.setActive('thanks');
      storage.save('thanks');

      const totalPages = getTotalPages();

      if (totalPages <= 1) {
        applySinglePageSort(replyBox!);
        return;
      }

      buttons!.setLoading(true);
      abortController = new AbortController();

      try {
        const allReplies = await fetchAllReplies(totalPages, abortController.signal);
        const sorted = sortRepliesByThanks(allReplies);
        replaceRepliesInDOM(replyBox!, sorted);
        isMultiPageSorted = true;
        hidePager();
      } catch (err) {
        if (err instanceof FetchAbortedError) return;

        if (err instanceof TooManyPagesError) {
          console.warn(`[V2EX-Min] ${err.message}`);
        } else {
          console.error('[V2EX-Min] Failed to fetch all replies:', err);
        }
        applySinglePageSort(replyBox!);
      } finally {
        buttons!.setLoading(false);
        abortController = null;
      }
    }

    function applySinglePageSort(box: Element): void {
      const replies = getCurrentPageReplies();
      const sorted = sortRepliesByThanks(replies);
      const fragment = document.createDocumentFragment();
      for (const node of sorted) {
        fragment.appendChild(node);
      }
      box.appendChild(fragment);
    }

    function replaceRepliesInDOM(box: Element, sorted: Element[]): void {
      const existing = getCurrentPageReplies();
      for (const el of existing) {
        el.remove();
      }

      const pager = box.querySelector('.cell.ps_container');
      const fragment = document.createDocumentFragment();
      for (const node of sorted) {
        fragment.appendChild(node);
      }

      if (pager) {
        box.insertBefore(fragment, pager);
      } else {
        box.appendChild(fragment);
      }
    }

    function hidePager(): void {
      pagerElement = document.querySelector('.cell.ps_container');
      if (pagerElement instanceof HTMLElement) {
        pagerElement.style.display = 'none';
      }
    }

    function showPager(): void {
      if (pagerElement instanceof HTMLElement) {
        pagerElement.style.display = '';
      }
    }

    async function restoreDefault(btns: SortButtonGroup): Promise<void> {
      currentMode = 'default';
      btns.setActive('default');
      storage.save('default');

      if (isMultiPageSorted) {
        window.location.search = '';
        return;
      }

      restoreSinglePageOrder(replyBox!);
    }

    function restoreSinglePageOrder(box: Element): void {
      const pager = box.querySelector('.cell.ps_container');
      const fragment = document.createDocumentFragment();
      for (const id of originalOrder) {
        const el = document.getElementById(id);
        if (el) fragment.appendChild(el);
      }
      if (pager) {
        box.insertBefore(fragment, pager);
      } else {
        box.appendChild(fragment);
      }
      showPager();
    }

    return () => {
      abortController?.abort();
      buttons?.destroy();

      if (currentMode === 'thanks') {
        storage.save('default');

        if (isMultiPageSorted) {
          window.location.reload();
          return;
        }

        restoreSinglePageOrder(replyBox);
      }
    };
  },
};
