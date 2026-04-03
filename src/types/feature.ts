export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  /** Content script context-aware setup. Returns an optional cleanup function. */
  setup: (ctx: FeatureContext) => (() => void) | void;
}

export interface FeatureContext {
  /** Convenience wrapper around document.querySelector scoped to the page */
  query: <T extends Element = Element>(selector: string) => T | null;
  queryAll: <T extends Element = Element>(selector: string) => T[];
}

export interface FeatureState {
  [featureId: string]: boolean;
}
