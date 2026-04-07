import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseReplyThanks,
  sortRepliesByThanks,
} from '~/features/reply-sort/sort-logic';

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
  return cells
    .map((c) => {
      const id = c.id;
      return id.replace('r_', '');
    })
    .join(',');
}

describe('评论按感谢数排序', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('解析有感谢数的评论', () => {
    const cell = createReplyCell(1, 6);
    expect(parseReplyThanks(cell)).toBe(6);
  });

  it('解析无感谢数的评论', () => {
    const cell = createReplyCell(1, 0);
    expect(parseReplyThanks(cell)).toBe(0);
  });

  it('单页评论按感谢数降序排序', () => {
    const cells = [
      createReplyCell(1, 0),
      createReplyCell(2, 6),
      createReplyCell(3, 2),
      createReplyCell(4, 0),
      createReplyCell(5, 8),
    ];

    const sorted = sortRepliesByThanks(cells);
    expect(getFloorOrder(sorted)).toBe('5,2,3,1,4');
  });

  it('感谢数相同时保持原始顺序', () => {
    const cells = [
      createReplyCell(1, 3),
      createReplyCell(2, 3),
      createReplyCell(3, 5),
    ];

    const sorted = sortRepliesByThanks(cells);
    expect(getFloorOrder(sorted)).toBe('3,1,2');
  });

  it('恢复默认排序', () => {
    const cells = [
      createReplyCell(1, 0),
      createReplyCell(2, 6),
      createReplyCell(3, 2),
    ];
    const originalOrder = cells.map((c) => c.id);

    const sorted = sortRepliesByThanks(cells);
    expect(getFloorOrder(sorted)).toBe('2,3,1');

    const restored = originalOrder
      .map((id) => cells.find((c) => c.id === id)!)
      .filter(Boolean);
    expect(getFloorOrder(restored)).toBe('1,2,3');
  });
});
