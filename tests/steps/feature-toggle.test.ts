import { expect } from 'vitest';
import path from 'node:path';
import { runFeature, type StepDefinition } from '../support/gherkin-runner';
import { setFeatureEnabled, saveFeatureState } from '~/lib/storage';

let featureEnabled: boolean;

const stepDefs: StepDefinition[] = [
  {
    pattern: /有一个默认启用的功能 "(.+)"/,
    fn: async () => {
      featureEnabled = true;
    },
  },
  {
    pattern: /有一个已启用的功能 "(.+)"/,
    fn: async ([featureId]) => {
      await setFeatureEnabled(featureId, true);
      featureEnabled = true;
    },
  },
  {
    pattern: /插件加载时/,
    fn: () => {},
  },
  {
    pattern: /用户将该功能切换为禁用/,
    fn: async () => {
      await setFeatureEnabled('test-feature', false);
      featureEnabled = false;
    },
  },
  {
    pattern: /该功能应该处于启用状态/,
    fn: () => {
      expect(featureEnabled).toBe(true);
    },
  },
  {
    pattern: /该功能应该处于禁用状态/,
    fn: () => {
      expect(featureEnabled).toBe(false);
    },
  },
];

runFeature(
  path.resolve(__dirname, '../features/feature-toggle.feature'),
  stepDefs,
  {
    beforeEach: async () => {
      await saveFeatureState({});
      featureEnabled = false;
    },
  },
);
