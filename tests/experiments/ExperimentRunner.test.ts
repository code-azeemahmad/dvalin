import { describe, it, expect } from 'vitest';
import { ExperimentRunner } from '../../src/features/experiments/services/ExperimentRunner';
import { ExperimentRegistry } from '../../src/features/experiments/services/ExperimentRegistry';

describe('ExperimentRunner Engine', () => {
  const runner = ExperimentRunner.getInstance();
  const registry = ExperimentRegistry.getInstance();

  it('maintains a strict singleton instance', () => {
    const r1 = ExperimentRunner.getInstance();
    const r2 = ExperimentRunner.getInstance();
    expect(r1).toBe(r2);
  });

  it('rejects guest command execution when emulator is inactive', async () => {
    const exp = registry.getExperimentById('exp-proc-01')!;
    const result = await runner.executeStep(exp, 0);

    expect(result.passed).toBe(false);
    expect(result.stderr).toContain('Emulator is not running');
    expect(result.exitCode).toBe(1);
  });

  it('executes simulation steps for educational simulation experiments', async () => {
    // Create educational simulation experiment definition
    const simExp = {
      ...registry.getExperimentById('exp-proc-01')!,
      id: 'exp-sim-test',
      executionMode: 'educational-simulation' as const,
      steps: [
        {
          id: 'sim_step_1',
          title: 'Simulation Step 1',
          instruction: 'Run model',
          explanation: 'Model evaluation',
          command: 'echo Sim',
          expectedObservation: 'Sim',
          simulationModel: 'Simulated Output for Testing',
        },
      ],
    };

    const result = await runner.executeStep(simExp, 0);
    expect(result.passed).toBe(true);
    expect(result.isSimulation).toBe(true);
    expect(result.stdout).toContain('Simulated Output for Testing');
  });

  it('validates step output rules correctly', () => {
    const validator = (runner as any).validateStepOutput.bind(runner);

    // Contains rule
    const ruleContains = { id: 's1', validationRule: { type: 'contains', value: 'MemFree' } };
    expect(validator(ruleContains, 'MemTotal: 128MB\nMemFree: 85MB', 0).passed).toBe(true);
    expect(validator(ruleContains, 'MemTotal: 128MB', 0).passed).toBe(false);

    // ExitCode rule
    const ruleExit = { id: 's2', validationRule: { type: 'exitCode', value: 0 } };
    expect(validator(ruleExit, '', 0).passed).toBe(true);
    expect(validator(ruleExit, '', 1).passed).toBe(false);

    // Regex rule
    const ruleRegex = { id: 's3', validationRule: { type: 'regex', value: '^Linux.*6\\.\\d+' } };
    expect(validator(ruleRegex, 'Linux box 6.18.35', 0).passed).toBe(true);
    expect(validator(ruleRegex, 'Darwin Kernel 23.0', 0).passed).toBe(false);
  });

  it('parses marked stdout and exit code accurately', () => {
    const parser = (runner as any).parseMarkedOutput.bind(runner);
    const raw = 'Pre-junk\n___START_step1___\nHello WebOS Inode Data\n___END_step1___:0\nPost-junk';

    const parsed = parser(raw, '___START_step1___', '___END_step1___');
    expect(parsed.stdout).toBe('Hello WebOS Inode Data');
    expect(parsed.exitCode).toBe(0);
    expect(parsed.stderr).toBe('');
  });
});
