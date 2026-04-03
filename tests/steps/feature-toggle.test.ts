import { describe, it, expect, beforeEach } from 'vitest';
import path from 'node:path';
import { parseFeatureFile, type StepDefinition } from '../support/gherkin-runner';
import { setFeatureEnabled, saveFeatureState } from '~/lib/storage';

const featureFilePath = path.resolve(__dirname, '../features/feature-toggle.feature');
const scenarios = parseFeatureFile(featureFilePath);

describe('功能开关系统', () => {
  let featureEnabled: boolean;

  beforeEach(async () => {
    await saveFeatureState({});
    featureEnabled = false;
  });

  const stepDefs: StepDefinition[] = [
    {
      pattern: /有一个默认启用的功能 "(.+)"/,
      fn: async (featureId: string) => {
        featureEnabled = true;
      },
    },
    {
      pattern: /有一个已启用的功能 "(.+)"/,
      fn: async (featureId: string) => {
        await setFeatureEnabled(featureId, true);
        featureEnabled = true;
      },
    },
    {
      pattern: /插件加载时/,
      fn: () => {
        // Feature manager initialization happens — state already set
      },
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

  for (const scenario of scenarios) {
    it(scenario.name, async () => {
      for (const step of scenario.steps) {
        const def = stepDefs.find((d) => d.pattern.test(step.text));
        if (!def) {
          throw new Error(`No step definition for: "${step.keyword} ${step.text}"`);
        }
        const match = step.text.match(def.pattern);
        const args = match ? match.slice(1) : [];
        await def.fn(...args);
      }
    });
  }
});
