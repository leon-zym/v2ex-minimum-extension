import type { FeatureContext } from '~/types/feature';

export type SortMode = 'default' | 'thanks';

const STORAGE_KEY = 'v2ex-min-reply-sort';

export function createSortStorage(ctx: FeatureContext) {
  return {
    async load(): Promise<SortMode> {
      const value = await ctx.storage.get<SortMode>(STORAGE_KEY);
      return value === 'thanks' ? 'thanks' : 'default';
    },
    async save(mode: SortMode): Promise<void> {
      await ctx.storage.set(STORAGE_KEY, mode);
    },
  };
}
