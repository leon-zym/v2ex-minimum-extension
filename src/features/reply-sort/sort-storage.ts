export type SortMode = 'default' | 'thanks';

const STORAGE_KEY = 'v2ex-min-reply-sort';

export async function loadSortPreference(): Promise<SortMode> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const value = result[STORAGE_KEY];
  return value === 'thanks' ? 'thanks' : 'default';
}

export async function saveSortPreference(mode: SortMode): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: mode });
}
