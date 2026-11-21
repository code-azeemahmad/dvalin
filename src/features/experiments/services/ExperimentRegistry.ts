import { ExperimentDefinition, ExperimentCategory, ExperimentDifficulty } from '../types/ExperimentTypes';
import { EXPERIMENTS_CATALOG } from '../data/experiments';
import { ExperimentSafety } from './ExperimentSafety';

/**
 * Singleton registry for WebOS OS Lab experiments.
 * Enforces definition integrity, unique IDs, category indexing, and safe search filtering.
 */
export class ExperimentRegistry {
  private static instance: ExperimentRegistry | null = null;
  private experiments: Map<string, ExperimentDefinition> = new Map();

  private constructor() {
    this.initialize();
  }

  public static getInstance(): ExperimentRegistry {
    if (!ExperimentRegistry.instance) {
      ExperimentRegistry.instance = new ExperimentRegistry();
    }
    return ExperimentRegistry.instance;
  }

  private initialize(): void {
    this.experiments.clear();
    for (const exp of EXPERIMENTS_CATALOG) {
      this.registerExperiment(exp);
    }
  }

  /**
   * Registers a single experiment definition after structural validation.
   */
  public registerExperiment(def: ExperimentDefinition): void {
    if (!def.id || !def.id.trim()) {
      throw new Error('Experiment ID is required.');
    }
    if (this.experiments.has(def.id)) {
      throw new Error(`Duplicate experiment ID detected: "${def.id}".`);
    }
    if (!def.title || !def.steps || def.steps.length === 0) {
      throw new Error(`Invalid experiment definition for "${def.id}": title and at least one step required.`);
    }

    // Validate commands in steps for safety
    for (const step of def.steps) {
      const check = ExperimentSafety.validateCommand(step.command);
      if (!check.isSafe) {
        throw new Error(`Unsafe command in experiment "${def.id}", step "${step.id}": ${check.reason}`);
      }
    }

    this.experiments.set(def.id, def);
  }

  public getAllExperiments(): ExperimentDefinition[] {
    return Array.from(this.experiments.values());
  }

  public getExperimentById(id: string): ExperimentDefinition | null {
    return this.experiments.get(id) || null;
  }

  public getExperimentsByCategory(category: ExperimentCategory): ExperimentDefinition[] {
    return this.getAllExperiments().filter((e) => e.category === category);
  }

  public getExperimentsByDifficulty(difficulty: ExperimentDifficulty): ExperimentDefinition[] {
    return this.getAllExperiments().filter((e) => e.difficulty === difficulty);
  }

  public searchExperiments(query: string): ExperimentDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllExperiments();
    return this.getAllExperiments().filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.learningObjectives.some((obj) => obj.toLowerCase().includes(q))
    );
  }

  public validateRegistry(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const ids = new Set<string>();

    for (const exp of this.getAllExperiments()) {
      if (ids.has(exp.id)) {
        errors.push(`Duplicate ID: ${exp.id}`);
      }
      ids.add(exp.id);

      if (!exp.steps || exp.steps.length === 0) {
        errors.push(`Experiment ${exp.id} has no steps.`);
      }

      for (const step of exp.steps) {
        const check = ExperimentSafety.validateCommand(step.command);
        if (!check.isSafe) {
          errors.push(`Experiment ${exp.id} step ${step.id} unsafe: ${check.reason}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
