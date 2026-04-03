import type { FeatureDefinition } from '~/types/feature';

/**
 * Import all feature definitions here.
 * Each feature module should export a FeatureDefinition.
 */
const featureModules: FeatureDefinition[] = [
  // Add new features here as they are created
];

export function registerAllFeatures(manager: {
  register: (feature: FeatureDefinition) => void;
}): void {
  for (const feature of featureModules) {
    manager.register(feature);
  }
}
