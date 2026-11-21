import { describe, it, expect, beforeEach } from 'vitest';
import { ExperimentProgressService } from '../../src/features/experiments/services/ExperimentProgressService';

describe('ExperimentProgressService', () => {
  let service: ExperimentProgressService;

  beforeEach(() => {
    service = ExperimentProgressService.getInstance();
    service.clearAllProgress();
  });

  it('returns default not-started state for new experiments', () => {
    const prog = service.getProgress('exp-proc-01');
    expect(prog.status).toBe('not-started');
    expect(prog.currentStepIndex).toBe(0);
    expect(prog.completedSteps).toHaveLength(0);
    expect(prog.answers).toEqual({});
  });

  it('updates progress and advances step index when steps are completed', () => {
    service.completeStep('exp-proc-01', 'step_1', 1);
    const prog = service.getProgress('exp-proc-01');

    expect(prog.status).toBe('in-progress');
    expect(prog.currentStepIndex).toBe(1);
    expect(prog.completedSteps).toContain('step_1');
  });

  it('records quiz answers accurately', () => {
    service.recordAnswer('exp-proc-01', 'q_proc1_1', 1);
    const prog = service.getProgress('exp-proc-01');

    expect(prog.answers['q_proc1_1']).toBe(1);
  });

  it('marks experiments completed with optional score', () => {
    service.markCompleted('exp-proc-01', 100);
    const prog = service.getProgress('exp-proc-01');

    expect(prog.status).toBe('completed');
    expect(prog.score).toBe(100);
  });

  it('resets experiment progress cleanly', () => {
    service.completeStep('exp-proc-01', 'step_1', 1);
    service.markCompleted('exp-proc-01');

    service.resetExperiment('exp-proc-01');
    const resetProg = service.getProgress('exp-proc-01');

    expect(resetProg.status).toBe('not-started');
    expect(resetProg.currentStepIndex).toBe(0);
    expect(resetProg.completedSteps).toHaveLength(0);
  });

  it('calculates overall progress statistics', () => {
    service.markCompleted('exp-proc-01');
    service.completeStep('exp-proc-02', 'step_1', 1);

    const stats = service.getOverallStats(20);
    expect(stats.total).toBe(20);
    expect(stats.completed).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.percentage).toBe(5);
  });
});
