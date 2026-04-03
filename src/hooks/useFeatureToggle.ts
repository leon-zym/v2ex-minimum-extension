import { useState, useEffect, useCallback } from 'react';
import type { FeatureState } from '~/types/feature';
import type { FeatureMeta } from '~/features/registry';
import { loadFeatureState, setFeatureEnabled, onFeatureStateChanged } from '~/lib/storage';

export function useFeatureToggle(features: FeatureMeta[]) {
  const [state, setState] = useState<FeatureState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureState().then((s) => {
      setState(s);
      setLoading(false);
    });

    const unsub = onFeatureStateChanged((newState) => {
      setState(newState);
    });

    return unsub;
  }, []);

  const toggle = useCallback(
    async (featureId: string) => {
      const meta = features.find((f) => f.id === featureId);
      if (!meta) return;
      const current = state[featureId] ?? meta.defaultEnabled;
      await setFeatureEnabled(featureId, !current);
    },
    [features, state],
  );

  const isEnabled = useCallback(
    (featureId: string): boolean => {
      const meta = features.find((f) => f.id === featureId);
      return state[featureId] ?? meta?.defaultEnabled ?? false;
    },
    [features, state],
  );

  return { loading, toggle, isEnabled };
}
