import React from 'react';
import {
  ExperimentDefinition,
  StepExecutionResult,
  ExperimentProgressState,
} from '../types/ExperimentTypes';
import { ExperimentVisualization } from './ExperimentVisualization';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Terminal,
  HelpCircle,
  Loader2,
  FolderTree,
  AlertCircle,
} from 'lucide-react';

interface ExperimentDetailProps {
  experiment: ExperimentDefinition;
  activeStepIndex: number;
  stepResult: StepExecutionResult | null;
  isExecuting: boolean;
  progress: ExperimentProgressState;
  onBack: () => void;
  onSelectStep: (index: number) => void;
  onRunStep: (index: number) => void;
  onReset: () => void;
  onAnswerQuestion: (questionId: string, optionIndex: number) => void;
}

export const ExperimentDetail: React.FC<ExperimentDetailProps> = ({
  experiment,
  activeStepIndex,
  stepResult,
  isExecuting,
  progress,
  onBack,
  onSelectStep,
  onRunStep,
  onReset,
  onAnswerQuestion,
}) => {
  const currentStep = experiment.steps[activeStepIndex];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-white">{experiment.title}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {experiment.executionMode === 'real-guest'
                  ? 'Real Linux Guest'
                  : experiment.executionMode === 'hybrid'
                  ? 'Hybrid Model'
                  : 'Educational Model'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{experiment.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Lab</span>
        </button>
      </div>

      <div className="p-5 space-y-6 max-w-5xl mx-auto w-full">
        {/* Objectives & Workspace Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-white">Learning Objectives</span>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {experiment.learningObjectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <span className="font-bold text-white">Experiment Workspace</span>
            <div className="flex items-center space-x-1.5 text-sky-400 font-mono text-[11px] break-all">
              <FolderTree className="w-3.5 h-3.5 shrink-0" />
              <span>{experiment.workspace}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Isolated directory in /tmp; user files outside this workspace remain untouched.
            </p>
          </div>
        </div>

        {/* Optional Visualization */}
        <ExperimentVisualization experimentId={experiment.id} />

        {/* Step Navigation Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Experiment Steps ({activeStepIndex + 1}/{experiment.steps.length})
            </span>
            <div className="flex items-center space-x-1.5">
              {experiment.steps.map((step, idx) => {
                const isStepCompleted = progress.completedSteps.includes(step.id);
                const isActive = idx === activeStepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onSelectStep(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-sm'
                        : isStepCompleted
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isStepCompleted && <CheckCircle2 className="w-3 h-3" />}
                    <span>Step {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Panel */}
          {currentStep && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div>
                <h3 className="text-sm font-bold text-white">{currentStep.title}</h3>
                <p className="text-xs text-sky-400 font-medium mt-1">{currentStep.instruction}</p>
                <p className="text-xs text-slate-400 mt-1">{currentStep.explanation}</p>
              </div>

              {/* Command Box */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Command to Execute</span>
                </span>
                <div className="bg-black/90 rounded-xl p-3 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between gap-3 overflow-x-auto">
                  <code>{currentStep.command}</code>
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => onRunStep(activeStepIndex)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0 shadow-md"
                  >
                    {isExecuting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>{isExecuting ? 'Executing in Guest...' : 'Run Step'}</span>
                  </button>
                </div>
              </div>

              {/* Step Output Box */}
              {stepResult && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Guest Output & Validation</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 font-mono">{stepResult.durationMs} ms</span>
                      {stepResult.passed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1">
                          <XCircle className="w-3 h-3" />
                          <span>CHECK FAILED</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-black rounded-xl p-3 border border-slate-850 font-mono text-xs text-slate-200 overflow-x-auto max-h-56 whitespace-pre-wrap select-text">
                    {stepResult.stdout || (
                      <span className="text-slate-600 italic">No standard output returned.</span>
                    )}
                  </div>

                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                      stepResult.passed
                        ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/40 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {stepResult.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    )}
                    <span>{stepResult.validationMessage}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Knowledge Check Questions */}
        {experiment.questions.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Knowledge Check Quiz</span>
            </div>

            <div className="space-y-4">
              {experiment.questions.map((q) => {
                const selectedAnswer = progress.answers[q.id];
                const hasAnswered = selectedAnswer !== undefined;
                const isCorrect = selectedAnswer === q.correctIndex;

                return (
                  <div key={q.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                    <p className="text-xs font-semibold text-slate-200">{q.question}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedAnswer === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => onAnswerQuestion(q.id, optIdx)}
                            className={`p-2.5 rounded-lg text-left text-xs border transition-colors cursor-pointer ${
                              isChosen
                                ? isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                                  : 'bg-rose-950/40 border-rose-600 text-rose-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <div
                        className={`p-2.5 rounded-lg text-[11px] ${
                          isCorrect ? 'bg-emerald-950/30 text-emerald-300' : 'bg-rose-950/30 text-rose-300'
                        }`}
                      >
                        <span className="font-bold">{isCorrect ? 'Correct! ' : 'Incorrect: '}</span>
                        <span>{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
