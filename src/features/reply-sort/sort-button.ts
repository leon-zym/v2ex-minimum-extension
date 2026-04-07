import type { SortMode } from './sort-storage';

const ATTR = 'data-v2ex-min';
const CONTAINER_ATTR_VALUE = 'reply-sort-buttons';

export interface SortButtonGroup {
  container: HTMLElement;
  setActive(mode: SortMode): void;
  setLoading(loading: boolean): void;
  destroy(): void;
}

export function createSortButtons(
  onSwitch: (mode: SortMode) => void,
  initialMode: SortMode,
): SortButtonGroup | null {
  const topicButtons = document.querySelector('.topic_buttons');
  if (!topicButtons) return null;

  const container = document.createElement('span');
  container.setAttribute(ATTR, CONTAINER_ATTR_VALUE);
  container.className = 'v2ex-min-sort-group';

  const separator = document.createTextNode('\u00a0');
  const btnDefault = createButton('默认排序', 'default', initialMode === 'default');
  const btnThanks = createButton('感谢数排序', 'thanks', initialMode === 'thanks');
  const spinner = createSpinner();

  container.appendChild(separator);
  container.appendChild(btnDefault);
  container.appendChild(document.createTextNode('\u00a0'));
  container.appendChild(btnThanks);
  container.appendChild(spinner);

  btnDefault.addEventListener('click', (e) => {
    e.preventDefault();
    onSwitch('default');
  });
  btnThanks.addEventListener('click', (e) => {
    e.preventDefault();
    onSwitch('thanks');
  });

  const thankDiv = topicButtons.querySelector('#topic_thank');
  if (thankDiv) {
    thankDiv.after(container);
  } else {
    topicButtons.appendChild(container);
  }

  return {
    container,
    setActive(mode: SortMode) {
      btnDefault.classList.toggle('v2ex-min-sort-btn-active', mode === 'default');
      btnThanks.classList.toggle('v2ex-min-sort-btn-active', mode === 'thanks');
    },
    setLoading(loading: boolean) {
      spinner.style.display = loading ? 'inline-block' : 'none';
      btnThanks.classList.toggle('v2ex-min-sort-btn-disabled', loading);
      btnDefault.classList.toggle('v2ex-min-sort-btn-disabled', loading);
    },
    destroy() {
      container.remove();
    },
  };
}

function createButton(text: string, mode: SortMode, active: boolean): HTMLAnchorElement {
  const btn = document.createElement('a');
  btn.setAttribute(ATTR, `sort-btn-${mode}`);
  btn.href = '#;';
  btn.className = `tb v2ex-min-sort-btn${active ? ' v2ex-min-sort-btn-active' : ''}`;
  btn.textContent = text;
  return btn;
}

function createSpinner(): HTMLSpanElement {
  const spinner = document.createElement('span');
  spinner.setAttribute(ATTR, 'sort-spinner');
  spinner.className = 'v2ex-min-sort-spinner';
  spinner.style.display = 'none';
  return spinner;
}
