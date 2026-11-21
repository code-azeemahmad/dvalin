import { ExperimentProgressState } from '../types/ExperimentTypes';

const STORAGE_KEY = 'webos_experiments_progress_v1';

/**
 * Service managing user progress, step completions, quiz answers, and scores in localStorage.
 */
export class ExperimentProgressService {
  private static instance: ExperimentProgressService | null = null;
  private cache: Record<string, ExperimentProgressState> = {};

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ExperimentProgressService {
    if (!ExperimentProgressService.instance) {
      ExperimentProgressService.instance = new ExperimentProgressService();
    }
    return ExperimentProgressService.instance;
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.cache = JSON.parse(raw);
      }
    } catch {
      this.cache = {};
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch {
      // Storage quota or restricted context
    }
  }

  public getProgress(experimentId: string): ExperimentProgressState {
    if (!this.cache[experimentId]) {
      this.cache[experimentId] = {
        status: 'not-started',
        currentStepIndex: 0,
        completedSteps: [],
        answers: {},
      };
    }
    return { ...this.cache[experimentId] };
  }

  public updateProgress(experimentId: string, update: Partial<ExperimentProgressState>): void {
    const current = this.getProgress(experimentId);
    this.cache[experimentId] = {
      ...current,
      ...update,
      lastRunTimestamp: Date.now(),
    };
    this.saveToStorage();
  }

  public completeStep(experimentId: string, stepId: string, nextIndex?: number): void {
    const current = this.getProgress(experimentId);
    const completedSet = new Set(current.completedSteps);
    completedSet.add(stepId);

    const newIndex = nextIndex !== undefined ? nextIndex : current.currentStepIndex + 1;
    this.updateProgress(experimentId, {
      status: 'in-progress',
      completedSteps: Array.from(completedSet),
      currentStepIndex: newIndex,
    });
  }

  public recordAnswer(experimentId: string, questionId: string, optionIndex: number): void {
    const current = this.getProgress(experimentId);
    const answers = { ...current.answers, [questionId]: optionIndex };
    this.updateProgress(experimentId, { answers });
  }

  public markCompleted(experimentId: string, score?: number): void {
    this.updateProgress(experimentId, {
      status: 'completed',
      score,
    });
  }

  public resetExperiment(experimentId: string): void {
    this.cache[experimentId] = {
      status: 'not-started',
      currentStepIndex: 0,
      completedSteps: [],
      answers: {},
      lastRunTimestamp: Date.now(),
      score: undefined,
    };
    this.saveToStorage();
  }

  public getAllProgress(): Record<string, ExperimentProgressState> {
    return { ...this.cache };
  }

  public getOverallStats(totalExperiments: number): {
    total: number;
    completed: number;
    inProgress: number;
    percentage: number;
  } {
    const values = Object.values(this.cache);
    const completed = values.filter((v) => v.status === 'completed').length;
    const inProgress = values.filter((v) => v.status === 'in-progress').length;
    const percentage = totalExperiments > 0 ? Math.round((completed / totalExperiments) * 100) : 0;

    return {
      total: totalExperiments,
      completed,
      inProgress,
      percentage,
    };
  }

  public clearAllProgress(): void {
    this.cache = {};
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  }
}
