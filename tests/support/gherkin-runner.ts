import { readFileSync } from 'node:fs';
import {
  AstBuilder,
  GherkinClassicTokenMatcher,
  Parser,
} from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';
import { describe, it, beforeEach } from 'vitest';

export type DataTable = string[][];

export interface StepDefinition {
  pattern: RegExp;
  fn: (args: string[], dataTable?: DataTable) => void | Promise<void>;
}

interface ParsedStep {
  keyword: string;
  text: string;
  dataTable?: DataTable;
}

const newId = IdGenerator.uuid();

export function parseFeatureFile(filePath: string) {
  const source = readFileSync(filePath, 'utf-8');
  const parser = new Parser(new AstBuilder(newId), new GherkinClassicTokenMatcher());
  const gherkinDocument = parser.parse(source);

  const scenarios: Array<{
    name: string;
    steps: ParsedStep[];
  }> = [];

  if (gherkinDocument.feature) {
    for (const child of gherkinDocument.feature.children) {
      if (child.scenario) {
        scenarios.push({
          name: child.scenario.name,
          steps: child.scenario.steps.map((s) => {
            const step: ParsedStep = {
              keyword: s.keyword.trim(),
              text: s.text,
            };

            if (s.dataTable) {
              step.dataTable = s.dataTable.rows.map((row) =>
                row.cells.map((cell) => cell.value),
              );
            }

            return step;
          }),
        });
      }
    }
  }

  return scenarios;
}

/**
 * Parse a .feature file and run each scenario as a Vitest `it` block,
 * automatically matching step text against the provided step definitions.
 */
export function runFeature(
  featurePath: string,
  stepDefs: StepDefinition[],
  hooks?: {
    beforeEach?: () => void | Promise<void>;
  },
): void {
  const source = readFileSync(featurePath, 'utf-8');
  const featureName = source.match(/功能:\s*(.+)/)?.[1]?.trim() ?? featurePath;
  const scenarios = parseFeatureFile(featurePath);

  if (scenarios.length === 0) {
    throw new Error(`No scenarios found in ${featurePath}`);
  }

  describe(featureName, () => {
    if (hooks?.beforeEach) {
      beforeEach(hooks.beforeEach);
    }

    for (const scenario of scenarios) {
      it(scenario.name, async () => {
        for (const step of scenario.steps) {
          const def = stepDefs.find((d) => d.pattern.test(step.text));
          if (!def) {
            throw new Error(
              `No step definition for: "${step.keyword} ${step.text}"`,
            );
          }
          const match = step.text.match(def.pattern);
          const args = match ? match.slice(1) : [];
          await def.fn(args, step.dataTable);
        }
      });
    }
  });
}
