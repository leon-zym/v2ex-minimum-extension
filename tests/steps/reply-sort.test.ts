import { expect } from 'vitest';
import path from 'node:path';
import { runFeature, type StepDefinition, type DataTable } from '../support/gherkin-runner';
import {
  parseReplyThanks,
  sortRepliesByThanks,
} from '~/features/reply-sort/sort-logic';
import {
  createSortButtons,
  type SortButtonGroup,
} from '~/features/reply-sort/sort-button';

function createReplyCell(floor: number, thanks: number): Element {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.id = `r_${floor}`;

  const table = document.createElement('table');
  const tr = document.createElement('tr');
  const td = document.createElement('td');

  const noSpan = document.createElement('span');
  noSpan.className = 'no';
  noSpan.textContent = String(floor);
  td.appendChild(noSpan);

  if (thanks > 0) {
    const thanksSpan = document.createElement('span');
    thanksSpan.className = 'small fade';
    const img = document.createElement('img');
    img.src = '/static/img/heart.png';
    img.width = 14;
    thanksSpan.appendChild(img);
    thanksSpan.appendChild(document.createTextNode(` ${thanks}`));
    td.appendChild(thanksSpan);
  }

  const content = document.createElement('div');
  content.className = 'reply_content';
  content.textContent = `Reply #${floor}`;
  td.appendChild(content);

  tr.appendChild(td);
  table.appendChild(tr);
  cell.appendChild(table);

  return cell;
}

function getFloorOrder(cells: Element[]): string {
  return cells.map((c) => c.id.replace('r_', '')).join(',');
}

let singleCell: Element | null = null;
let cells: Element[] = [];
let sorted: Element[] = [];
let replyBox: Element | null = null;
let buttons: SortButtonGroup | null = null;

function buildCellsFromTable(dataTable: DataTable): void {
  const dataRows = dataTable.slice(1);
  cells = dataRows.map((row) => {
    const floor = parseInt(row[0], 10);
    const thanks = parseInt(row[1], 10);
    return createReplyCell(floor, thanks);
  });
}

function createReplyBoxWithHeader(summary: string): Element {
  const box = document.createElement('div');
  box.className = 'box';

  const header = document.createElement('div');
  header.className = 'cell';

  const tags = document.createElement('div');
  tags.className = 'fr';
  tags.textContent = '代码 质量 测试';
  header.appendChild(tags);

  const gray = document.createElement('span');
  gray.className = 'gray';
  gray.textContent = `${summary} • 2026-05-28 22:09:48 +08:00`;
  header.appendChild(gray);

  box.appendChild(header);
  box.appendChild(createReplyCell(1, 0));
  document.body.appendChild(box);

  return box;
}

const stepDefs: StepDefinition[] = [
  {
    pattern: /有一条评论包含感谢数 "(\d+)"/,
    fn: ([thanksStr]) => {
      singleCell = createReplyCell(1, parseInt(thanksStr, 10));
    },
  },
  {
    pattern: /有一条评论没有感谢数/,
    fn: () => {
      singleCell = createReplyCell(1, 0);
    },
  },
  {
    pattern: /解析该评论的感谢数时/,
    fn: () => {},
  },
  {
    pattern: /应该返回 (\d+)/,
    fn: ([expected]) => {
      expect(parseReplyThanks(singleCell!)).toBe(parseInt(expected, 10));
    },
  },
  {
    pattern: /有以下评论及感谢数/,
    fn: (_args, dataTable) => {
      if (dataTable) {
        buildCellsFromTable(dataTable);
      }
    },
  },
  {
    pattern: /按感谢数排序时/,
    fn: () => {
      sorted = sortRepliesByThanks(cells);
    },
  },
  {
    pattern: /恢复默认排序/,
    fn: () => {
      const originalOrder = cells.map((c) => c.id);
      sorted = originalOrder.map((id) => cells.find((c) => c.id === id)!);
    },
  },
  {
    pattern: /评论顺序应该为 "([^"]+)"/,
    fn: ([expected]) => {
      expect(getFloorOrder(sorted)).toBe(expected);
    },
  },
  {
    pattern: /当前帖子详情页存在旧版主题按钮区域/,
    fn: () => {
      const topicButtons = document.createElement('div');
      topicButtons.className = 'topic_buttons';

      const thank = document.createElement('div');
      thank.id = 'topic_thank';
      topicButtons.appendChild(thank);

      document.body.appendChild(topicButtons);
    },
  },
  {
    pattern: /当前帖子详情页没有旧版主题按钮区域/,
    fn: () => {
      expect(document.querySelector('.topic_buttons')).toBeNull();
    },
  },
  {
    pattern: /回复列表头部显示 "([^"]+)"/,
    fn: ([summary]) => {
      replyBox = createReplyBoxWithHeader(summary);
    },
  },
  {
    pattern: /创建排序按钮时/,
    fn: () => {
      buttons = createSortButtons(() => {}, 'default', replyBox);
      expect(buttons).not.toBeNull();
    },
  },
  {
    pattern: /应该在主题按钮区域显示 "([^"]+)" 按钮/,
    fn: ([text]) => {
      const topicButtons = document.querySelector('.topic_buttons');
      const button = topicButtons?.querySelector('[data-v2ex-min="sort-btn-thanks"]');

      expect(button?.textContent).toBe(text);
      expect(buttons?.container.parentElement).toBe(topicButtons);
    },
  },
  {
    pattern: /应该在回复列表头部显示 "([^"]+)" 按钮/,
    fn: ([text]) => {
      const header = replyBox?.firstElementChild;
      const button = header?.querySelector('[data-v2ex-min="sort-btn-thanks"]');

      expect(button?.textContent).toBe(text);
      expect(buttons?.container.parentElement).toBe(header);
    },
  },
];

runFeature(
  path.resolve(__dirname, '../features/reply-sort.feature'),
  stepDefs,
  {
    beforeEach: () => {
      document.body.innerHTML = '';
      singleCell = null;
      cells = [];
      sorted = [];
      replyBox = null;
      buttons = null;
    },
  },
);
