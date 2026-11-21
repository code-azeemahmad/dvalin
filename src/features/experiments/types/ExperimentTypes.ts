/**
 * Type definitions for WebOS OS Lab & Interactive Experiments Subsystem.
 */

export type ExperimentCategory =
  | 'processes'
  | 'memory'
  | 'filesystem'
  | 'permissions'
  | 'shell'
  | 'kernel'
  | 'monitoring';

export type ExperimentDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExperimentExecutionMode =
  | 'real-guest'
  | 'hybrid'
  | 'educational-simulation';

export interface ExperimentValidationRule {
  type: 'contains' | 'not-contains' | 'regex' | 'exitCode';
  value: string | number;
  message?: string;
}

export interface ExperimentStep {
  id: string;
  title: string;
  instruction: string;
  explanation: string;
  command: string;
  expectedObservation: string;
  validationRule?: ExperimentValidationRule;
  simulationModel?: string;
}

export interface ExperimentQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExperimentDefinition {
  id: string;
  title: string;
  category: ExperimentCategory;
  difficulty: ExperimentDifficulty;
  description: string;
  learningObjectives: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  executionMode: ExperimentExecutionMode;
  workspace: string;
  steps: ExperimentStep[];
  questions: ExperimentQuestion[];
  cleanupCommand?: string;
}

export interface StepExecutionResult {
  stepId: string;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  passed: boolean;
  validationMessage: string;
  isSimulation: boolean;
}

export type ExperimentStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'failed';

export interface ExperimentProgressState {
  status: ExperimentStatus;
  currentStepIndex: number;
  completedSteps: string[];
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  lastRunTimestamp?: number;
  score?: number;
}

export interface GuestResourceMetrics {
  uptimeSeconds: number;
  memTotalKb: number;
  memFreeKb: number;
  memAvailableKb: number;
  processCount: number;
  cpuModel: string;
  kernelRelease: string;
  source: 'guest-linux';
  timestamp: number;
}

export interface HostResourceMetrics {
  jsHeapUsedMb: number;
  screenResolution: string;
  displayScale: number;
  activeWindowsCount: number;
  source: 'host-browser';
  timestamp: number;
}
