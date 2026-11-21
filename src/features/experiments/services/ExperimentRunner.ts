import {
  ExperimentDefinition,
  ExperimentStep,
  StepExecutionResult,
} from '../types/ExperimentTypes';
import { ExperimentSafety } from './ExperimentSafety';
import { EmulatorManager } from '@/features/emulator/EmulatorManager';

/**
 * Runner service coordinating execution of experiment steps against the live Linux guest
 * or educational simulation models.
 */
export class ExperimentRunner {
  private static instance: ExperimentRunner | null = null;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): ExperimentRunner {
    if (!ExperimentRunner.instance) {
      ExperimentRunner.instance = new ExperimentRunner();
    }
    return ExperimentRunner.instance;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Executes a single experiment step.
   * If real-guest or hybrid, dispatches the wrapped command to the guest Linux VM.
   * If educational-simulation, evaluates educational models.
   */
  public async executeStep(
    experiment: ExperimentDefinition,
    stepIndex: number,
    timeoutMs: number = 10000
  ): Promise<StepExecutionResult> {
    if (stepIndex < 0 || stepIndex >= experiment.steps.length) {
      throw new Error(`Invalid step index ${stepIndex} for experiment "${experiment.id}".`);
    }

    const step = experiment.steps[stepIndex];
    const startTime = Date.now();

    // Check simulation mode
    if (experiment.executionMode === 'educational-simulation') {
      return this.executeSimulationStep(step, startTime);
    }

    const manager = EmulatorManager.getInstance();
    if (manager.getStatus() !== 'running') {
      return {
        stepId: step.id,
        command: step.command,
        stdout: '',
        stderr: 'Emulator is not running. Please start the virtual machine to execute guest experiments.',
        exitCode: 1,
        durationMs: Date.now() - startTime,
        passed: false,
        validationMessage: 'Virtual machine is not in running state.',
        isSimulation: false,
      };
    }

    this.isRunning = true;
    try {
      const nonce = Math.random().toString(36).substring(2, 8);
      const wrappedCmd = ExperimentSafety.wrapCommandForExecution(
        step.command,
        experiment.id,
        step.id,
        nonce
      );

      const startMarker = `___START_${step.id}_${nonce}___`;
      const endMarker = `___END_${step.id}_${nonce}___`;

      const result = await this.dispatchCommandToGuest(manager, wrappedCmd, startMarker, endMarker, timeoutMs);
      const durationMs = Date.now() - startTime;

      // Validate output
      const validation = this.validateStepOutput(step, result.stdout, result.exitCode);

      return {
        stepId: step.id,
        command: step.command,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        durationMs,
        passed: validation.passed,
        validationMessage: validation.message,
        isSimulation: false,
      };
    } catch (err: any) {
      return {
        stepId: step.id,
        command: step.command,
        stdout: '',
        stderr: err?.message || 'Execution error or timeout.',
        exitCode: 124,
        durationMs: Date.now() - startTime,
        passed: false,
        validationMessage: `Execution failed: ${err?.message || 'Timeout'}`,
        isSimulation: false,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Executes the cleanup procedure for an experiment workspace.
   */
  public async executeCleanup(experiment: ExperimentDefinition): Promise<void> {
    const manager = EmulatorManager.getInstance();
    if (manager.getStatus() !== 'running') return;

    const cleanupCmd = ExperimentSafety.buildCleanupCommand(
      experiment.id,
      experiment.cleanupCommand
    );

    try {
      manager.sendText(cleanupCmd + '\n');
    } catch {
      // Ignore cleanup dispatch failures
    }
  }

  private async dispatchCommandToGuest(
    manager: EmulatorManager,
    wrappedCmd: string,
    startMarker: string,
    endMarker: string,
    timeoutMs: number
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      let accumulatedOutput = '';
      let timer: any = null;

      const unsubSerial = manager.onSerial((char) => {
        accumulatedOutput += char;
        if (accumulatedOutput.includes(endMarker)) {
          cleanup();
          const parsed = this.parseMarkedOutput(accumulatedOutput, startMarker, endMarker);
          resolve(parsed);
        }
      });

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        unsubSerial();
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Command timed out after ${timeoutMs / 1000} seconds.`));
      }, timeoutMs);

      // Dispatch to guest keyboard stream
      manager.sendText(wrappedCmd + '\n');
    });
  }

  private parseMarkedOutput(
    raw: string,
    startMarker: string,
    endMarker: string
  ): { stdout: string; stderr: string; exitCode: number } {
    const startIndex = raw.indexOf(startMarker);
    const endIndex = raw.indexOf(endMarker);

    let stdout = '';
    let exitCode = 0;

    if (startIndex !== -1 && endIndex !== -1) {
      const extracted = raw.slice(startIndex + startMarker.length, endIndex);
      stdout = ExperimentSafety.sanitizeOutput(extracted);

      // Check for exit code token: "___END_id___:<exitCode>"
      const exitSuffix = raw.slice(endIndex + endMarker.length);
      const codeMatch = exitSuffix.match(/^:(\d+)/);
      if (codeMatch) {
        exitCode = parseInt(codeMatch[1], 10);
      }
    } else {
      stdout = ExperimentSafety.sanitizeOutput(raw);
    }

    return {
      stdout,
      stderr: exitCode !== 0 ? `Process exited with code ${exitCode}` : '',
      exitCode,
    };
  }

  private validateStepOutput(
    step: ExperimentStep,
    stdout: string,
    exitCode: number
  ): { passed: boolean; message: string } {
    if (!step.validationRule) {
      return { passed: exitCode === 0, message: exitCode === 0 ? 'Executed successfully.' : 'Non-zero exit code.' };
    }

    const { type, value, message } = step.validationRule;

    switch (type) {
      case 'exitCode': {
        const passed = exitCode === Number(value);
        return {
          passed,
          message: passed ? (message || `Exit code matched ${value}.`) : `Expected exit code ${value}, got ${exitCode}.`,
        };
      }
      case 'contains': {
        const passed = stdout.includes(String(value));
        return {
          passed,
          message: passed ? (message || `Found expected output: "${value}".`) : `Expected output to contain: "${value}".`,
        };
      }
      case 'not-contains': {
        const passed = !stdout.includes(String(value));
        return {
          passed,
          message: passed ? (message || `Successfully excluded: "${value}".`) : `Output unexpectedly contained: "${value}".`,
        };
      }
      case 'regex': {
        const regex = new RegExp(String(value));
        const passed = regex.test(stdout);
        return {
          passed,
          message: passed ? (message || `Pattern matched: ${value}`) : `Output failed to match pattern: ${value}`,
        };
      }
      default:
        return { passed: exitCode === 0, message: 'Step completed.' };
    }
  }

  private executeSimulationStep(step: ExperimentStep, startTime: number): StepExecutionResult {
    const simStdout = step.simulationModel || `[Educational Model] Simulated execution for: ${step.title}\nDemonstration output for concept evaluation.`;
    return {
      stepId: step.id,
      command: step.command,
      stdout: simStdout,
      stderr: '',
      exitCode: 0,
      durationMs: Date.now() - startTime,
      passed: true,
      validationMessage: 'Educational simulation validated.',
      isSimulation: true,
    };
  }
}
