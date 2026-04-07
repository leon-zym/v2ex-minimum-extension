import type {
  FeatureDefinition,
  FeatureContext,
  FeatureState,
  CleanupFn,
} from '~/types/feature';
import {
  loadFeatureState,
  setFeatureEnabled,
  onFeatureStateChanged,
} from '~/lib/storage';

class FeatureManager {
  private registry = new Map<string, FeatureDefinition>();
  private cleanups = new Map<string, CleanupFn>();
  private unsubscribe: (() => void) | null = null;

  register(feature: FeatureDefinition): void {
    this.registry.set(feature.id, feature);
  }

  getAll(): FeatureDefinition[] {
    return Array.from(this.registry.values());
  }

  async init(): Promise<void> {
    const state = await loadFeatureState();

    for (const feature of this.registry.values()) {
      const enabled = state[feature.id] ?? feature.defaultEnabled;
      if (enabled) {
        this.activate(feature);
      }
    }

    this.unsubscribe = onFeatureStateChanged((newState) => {
      this.reconcile(newState);
    });
  }

  async toggle(featureId: string, enabled: boolean): Promise<void> {
    await setFeatureEnabled(featureId, enabled);
  }

  async destroy(): Promise<void> {
    this.unsubscribe?.();
    const pending = Array.from(this.cleanups.values()).map((fn) => fn());
    await Promise.allSettled(pending);
    this.cleanups.clear();
  }

  private activate(feature: FeatureDefinition): void {
    if (this.cleanups.has(feature.id)) return;

    try {
      const ctx = this.createContext();
      const cleanup = feature.setup(ctx);
      if (cleanup) {
        this.cleanups.set(feature.id, cleanup);
      }
    } catch (err) {
      console.error(
        `[V2EX-Min] Failed to activate feature "${feature.id}":`,
        err,
      );
    }
  }

  private async deactivate(featureId: string): Promise<void> {
    const cleanup = this.cleanups.get(featureId);
    if (cleanup) {
      try {
        await cleanup();
      } catch (err) {
        console.error(
          `[V2EX-Min] Error during cleanup of feature "${featureId}":`,
          err,
        );
      }
      this.cleanups.delete(featureId);
    }
  }

  private reconcile(newState: FeatureState): void {
    for (const feature of this.registry.values()) {
      const shouldBeActive = newState[feature.id] ?? feature.defaultEnabled;
      const isActive = this.cleanups.has(feature.id);

      if (shouldBeActive && !isActive) {
        this.activate(feature);
      } else if (!shouldBeActive && isActive) {
        this.deactivate(feature.id);
      }
    }
  }

  private createContext(): FeatureContext {
    return {
      storage: {
        async get<T = unknown>(key: string): Promise<T | undefined> {
          const result = await browser.storage.local.get(key);
          return result[key] as T | undefined;
        },
        async set(key: string, value: unknown): Promise<void> {
          await browser.storage.local.set({ [key]: value });
        },
      },
    };
  }
}

export const featureManager = new FeatureManager();
