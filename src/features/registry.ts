/**
 * Static feature metadata registry.
 * Shared between content script and popup — does NOT include runtime setup functions.
 */
export interface FeatureMeta {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
}

export const featureRegistry: FeatureMeta[] = [
  {
    id: 'reply-sort',
    name: '评论按感谢排序',
    description: '支持将帖子评论按感谢数量从多到少排序',
    defaultEnabled: true,
  },
];
