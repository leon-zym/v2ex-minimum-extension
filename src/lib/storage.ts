import type { FeatureState } from '~/types/feature';

const STORAGE_KEY = 'v2ex-min-features';

export async function loadFeatureState(): Promise<FeatureState> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as FeatureState) ?? {};
}

export async function saveFeatureState(state: FeatureState): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: state });
}

export async function getFeatureEnabled(
  featureId: string,
  defaultValue: boolean,
): Promise<boolean> {
  const state = await loadFeatureState();
  return state[featureId] ?? defaultValue;
}

export async function setFeatureEnabled(
  featureId: string,
  enabled: boolean,
): Promise<void> {
  const state = await loadFeatureState();
  state[featureId] = enabled;
  await saveFeatureState(state);
}

export function onFeatureStateChanged(
  callback: (state: FeatureState) => void,
): () => void {
  const listener = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      callback((changes[STORAGE_KEY].newValue as FeatureState) ?? {});
    }
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
