import React, { useState } from 'react';
import { useExperiments } from '../hooks/useExperiments';
import { ExperimentCatalog } from './ExperimentCatalog';
import { ExperimentDetail } from './ExperimentDetail';
import { ResourceMonitorView } from './ResourceMonitorView';
import { Activity, Layers, BookOpen } from 'lucide-react';

export const ExperimentsApp: React.FC = () => {
  const {
    filteredExperiments,
    selectedExperiment,
    selectedCategory,
    selectedDifficulty,
    searchQuery,
    progressMap,
    stats,
    activeStepIndex,
    stepResult,
    isExecuting,
    selectExperiment,
    setCategory,
    setDifficulty,
    setSearchQuery,
    setActiveStepIndex,
    runStep,
    resetCurrentExperiment,
    answerQuestion,
  } = useExperiments();

  const [activeView, setActiveView] = useState<'catalog' | 'detail' | 'monitor'>('catalog');

  const handleSelectExp = (id: string) => {
    selectExperiment(id);
    setActiveView('detail');
  };

  const handleBackToCatalog = () => {
    selectExperiment(null);
    setActiveView('catalog');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full bg-slate-950 text-slate-200 select-none overflow-hidden font-sans">
      {/* Navigation Sidebar */}
      <div className="w-full md:w-48 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-3 space-y-1 shrink-0">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          OS Laboratory
        </div>

        <button
          type="button"
          onClick={() => setActiveView('catalog')}
          className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'catalog'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Catalog ({stats.total})</span>
        </button>

        {selectedExperiment && (
          <button
            type="button"
            onClick={() => setActiveView('detail')}
            className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
              activeView === 'detail'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate">Active Lab</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveView('monitor')}
          className={`w-full px-3 py-2 rounded-xl flex items-center space-x-2.5 text-xs font-medium transition-colors cursor-pointer ${
            activeView === 'monitor'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Resource Monitor</span>
        </button>

        <div className="pt-4 border-t border-slate-800/80 px-2.5 space-y-1">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Completed</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {stats.completed} / {stats.total}
          </div>
          <div className="text-[10px] text-slate-400">{stats.percentage}% of all labs</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeView === 'catalog' && (
          <ExperimentCatalog
            experiments={filteredExperiments}
            selectedCategory={selectedCategory}
            selectedDifficulty={selectedDifficulty}
            searchQuery={searchQuery}
            progressMap={progressMap}
            stats={stats}
            onSelectCategory={setCategory}
            onSelectDifficulty={setDifficulty}
            onSearchChange={setSearchQuery}
            onSelectExperiment={handleSelectExp}
          />
        )}

        {activeView === 'detail' && selectedExperiment && (
          <ExperimentDetail
            experiment={selectedExperiment}
            activeStepIndex={activeStepIndex}
            stepResult={stepResult}
            isExecuting={isExecuting}
            progress={progressMap[selectedExperiment.id] || { status: 'not-started', completedSteps: [], answers: {} }}
            onBack={handleBackToCatalog}
            onSelectStep={setActiveStepIndex}
            onRunStep={runStep}
            onReset={resetCurrentExperiment}
            onAnswerQuestion={answerQuestion}
          />
        )}

        {activeView === 'monitor' && <ResourceMonitorView />}
      </div>
    </div>
  );
};
