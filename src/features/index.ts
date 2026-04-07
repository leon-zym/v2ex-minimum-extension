import type { FeatureDefinition } from '~/types/feature';
import { replySortFeature } from '~/features/reply-sort';

const featureModules: FeatureDefinition[] = [
  replySortFeature,
];

export function registerAllFeatures(manager: {
  register: (feature: FeatureDefinition) => void;
}): void {
  for (const feature of featureModules) {
    manager.register(feature);
  }
}
