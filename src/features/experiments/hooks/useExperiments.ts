import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ExperimentDefinition,
  ExperimentCategory,
  ExperimentDifficulty,
  StepExecutionResult,
  ExperimentProgressState,
} from '../types/ExperimentTypes';
import { ExperimentRegistry } from '../services/ExperimentRegistry';
import { ExperimentProgressService } from '../services/ExperimentProgressService';
import { ExperimentRunner } from '../services/ExperimentRunner';

export function useExperiments() {
  const registry = useMemo(() => ExperimentRegistry.getInstance(), []);
  const progressService = useMemo(() => ExperimentProgressService.getInstance(), []);
  const runner = useMemo(() => ExperimentRunner.getInstance(), []);

  const [allExperiments] = useState<ExperimentDefinition[]>(() => registry.getAllExperiments());
  const [selectedExpId, setSelectedExpId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExperimentCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExperimentDifficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [progressMap, setProgressMap] = useState<Record<string, ExperimentProgressState>>(() =>
    progressService.getAllProgress()
  );

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [stepResult, setStepResult] = useState<StepExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Selected experiment resolution
  const selectedExperiment = useMemo(() => {
    if (!selectedExpId) return null;
    return registry.getExperimentById(selectedExpId);
  }, [selectedExpId, registry]);

  // Sync active step with progress when selected experiment changes
  useEffect(() => {
    if (selectedExpId) {
      const p = progressService.getProgress(selectedExpId);
      setActiveStepIndex(p.currentStepIndex || 0);
      setStepResult(null);
    }
  }, [selectedExpId, progressService]);

  // Filtered experiments list
  const filteredExperiments = useMemo(() => {
    return allExperiments.filter((exp) => {
      if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && exp.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesDesc = exp.description.toLowerCase().includes(q);
        const matchesCategory = exp.category.toLowerCase().includes(q);
        const matchesObjectives = exp.learningObjectives.some((obj) => obj.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesObjectives) return false;
      }
      return true;
    });
  }, [allExperiments, selectedCategory, selectedDifficulty, searchQuery]);

  const refreshProgress = useCallback(() => {
    setProgressMap(progressService.getAllProgress());
  }, [progressService]);

  const runStep = useCallback(
    async (stepIndex: number) => {
      if (!selectedExperiment) return;
      setIsExecuting(true);
      setStepResult(null);

      try {
        const result = await runner.executeStep(selectedExperiment, stepIndex);
        setStepResult(result);

        if (result.passed) {
          const step = selectedExperiment.steps[stepIndex];
          const nextIndex = Math.min(stepIndex + 1, selectedExperiment.steps.length - 1);
          progressService.completeStep(selectedExperiment.id, step.id, nextIndex);
          setActiveStepIndex(nextIndex);

          // If last step completed, check completion
          if (stepIndex === selectedExperiment.steps.length - 1) {
            progressService.markCompleted(selectedExperiment.id);
          }
        }
        refreshProgress();
      } finally {
        setIsExecuting(false);
      }
    },
    [selectedExperiment, runner, progressService, refreshProgress]
  );

  const resetCurrentExperiment = useCallback(async () => {
    if (!selectedExperiment) return;
    await runner.executeCleanup(selectedExperiment);
    progressService.resetExperiment(selectedExperiment.id);
    setActiveStepIndex(0);
    setStepResult(null);
    refreshProgress();
  }, [selectedExperiment, runner, progressService, refreshProgress]);

  const answerQuestion = useCallback(
    (questionId: string, optionIndex: number) => {
      if (!selectedExperiment) return;
      progressService.recordAnswer(selectedExperiment.id, questionId, optionIndex);
      refreshProgress();
    },
    [selectedExperiment, progressService, refreshProgress]
  );

  const stats = useMemo(() => {
    return progressService.getOverallStats(allExperiments.length);
  }, [progressService, allExperiments.length, progressMap]);

  return {
    allExperiments,
    filteredExperiments,
    selectedExperiment,
    selectedExpId,
    selectedCategory,
    selectedDifficulty,
    searchQuery,
    progressMap,
    stats,
    activeStepIndex,
    stepResult,
    isExecuting,
    selectExperiment: setSelectedExpId,
    setCategory: setSelectedCategory,
    setDifficulty: setSelectedDifficulty,
    setSearchQuery,
    setActiveStepIndex,
    runStep,
    resetCurrentExperiment,
    answerQuestion,
  };
}
