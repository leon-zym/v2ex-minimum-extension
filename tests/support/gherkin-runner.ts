import { readFileSync } from 'node:fs';
import {
  AstBuilder,
  GherkinClassicTokenMatcher,
  Parser,
} from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

export interface StepDefinition {
  pattern: RegExp;
  fn: (...args: string[]) => void | Promise<void>;
}

const newId = IdGenerator.uuid();

/**
 * Parse a .feature file and return scenario descriptions + steps.
 */
export function parseFeatureFile(filePath: string) {
  const source = readFileSync(filePath, 'utf-8');
  const parser = new Parser(new AstBuilder(newId), new GherkinClassicTokenMatcher());
  const gherkinDocument = parser.parse(source);

  const scenarios: Array<{
    name: string;
    steps: Array<{ keyword: string; text: string }>;
  }> = [];

  if (gherkinDocument.feature) {
    for (const child of gherkinDocument.feature.children) {
      if (child.scenario) {
        scenarios.push({
          name: child.scenario.name,
          steps: child.scenario.steps.map((s) => ({
            keyword: s.keyword.trim(),
            text: s.text,
          })),
        });
      }
    }
  }

  return scenarios;
}

/**
 * Execute steps against registered step definitions.
 */
export function executeSteps(
  steps: Array<{ keyword: string; text: string }>,
  definitions: StepDefinition[],
) {
  for (const step of steps) {
    const def = definitions.find((d) => d.pattern.test(step.text));
    if (!def) {
      throw new Error(`No step definition found for: "${step.keyword} ${step.text}"`);
    }
    const match = step.text.match(def.pattern);
    const args = match ? match.slice(1) : [];
    def.fn(...args);
  }
}
