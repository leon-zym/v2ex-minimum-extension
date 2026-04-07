export type CleanupFn = () => void | Promise<void>;

export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  setup: (ctx: FeatureContext) => CleanupFn | void;
}

export interface FeatureContext {
  storage: {
    get: <T = unknown>(key: string) => Promise<T | undefined>;
    set: (key: string, value: unknown) => Promise<void>;
  };
}

export interface FeatureState {
  [featureId: string]: boolean;
}
