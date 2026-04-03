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
  // New features are added here as static metadata.
  // The actual setup logic lives in each feature's own module under src/features/.
];
