import { describe, it, expect } from 'vitest';
import { ExperimentRegistry } from '../../src/features/experiments/services/ExperimentRegistry';
import { EXPERIMENTS_CATALOG } from '../../src/features/experiments/data/experiments';

describe('ExperimentRegistry Service', () => {
  const registry = ExperimentRegistry.getInstance();

  it('maintains a strict singleton instance', () => {
    const r1 = ExperimentRegistry.getInstance();
    const r2 = ExperimentRegistry.getInstance();
    expect(r1).toBe(r2);
  });

  it('contains all 20 structured experiments across the 7 categories', () => {
    const all = registry.getAllExperiments();
    expect(all.length).toBe(20);
    expect(all.length).toBe(EXPERIMENTS_CATALOG.length);

    const categories = new Set(all.map((e) => e.category));
    expect(categories.has('processes')).toBe(true);
    expect(categories.has('memory')).toBe(true);
    expect(categories.has('filesystem')).toBe(true);
    expect(categories.has('permissions')).toBe(true);
    expect(categories.has('shell')).toBe(true);
    expect(categories.has('kernel')).toBe(true);
  });

  it('enforces unique experiment IDs without collision', () => {
    const all = registry.getAllExperiments();
    const ids = new Set<string>();
    for (const exp of all) {
      expect(ids.has(exp.id)).toBe(false);
      ids.add(exp.id);
    }
  });

  it('filters experiments by category correctly', () => {
    const procExps = registry.getExperimentsByCategory('processes');
    expect(procExps.length).toBe(4);
    for (const exp of procExps) {
      expect(exp.category).toBe('processes');
    }

    const memExps = registry.getExperimentsByCategory('memory');
    expect(memExps.length).toBe(4);

    const fsExps = registry.getExperimentsByCategory('filesystem');
    expect(fsExps.length).toBe(3);

    const permExps = registry.getExperimentsByCategory('permissions');
    expect(permExps.length).toBe(1);

    const shExps = registry.getExperimentsByCategory('shell');
    expect(shExps.length).toBe(4);

    const kernExps = registry.getExperimentsByCategory('kernel');
    expect(kernExps.length).toBe(4);
  });

  it('filters experiments by difficulty correctly', () => {
    const beginner = registry.getExperimentsByDifficulty('beginner');
    const intermediate = registry.getExperimentsByDifficulty('intermediate');
    const advanced = registry.getExperimentsByDifficulty('advanced');

    expect(beginner.length).toBeGreaterThan(0);
    expect(intermediate.length).toBeGreaterThan(0);
    expect(advanced.length).toBeGreaterThan(0);
    expect(beginner.length + intermediate.length + advanced.length).toBe(20);
  });

  it('searches experiments by title, description, or learning objective', () => {
    const searchProc = registry.searchExperiments('process');
    expect(searchProc.length).toBeGreaterThanOrEqual(4);

    const searchInodes = registry.searchExperiments('inode');
    expect(searchInodes.length).toBeGreaterThanOrEqual(1);
    expect(searchInodes.some((e) => e.id === 'exp-fs-02')).toBe(true);

    const empty = registry.searchExperiments('non_existent_token_xyz');
    expect(empty.length).toBe(0);
  });

  it('passes comprehensive catalog definition validation', () => {
    const result = registry.validateRegistry();
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
