import React from 'react';
import {
  ExperimentDefinition,
  ExperimentCategory,
  ExperimentDifficulty,
  ExperimentProgressState,
} from '../types/ExperimentTypes';
import {
  Search,
  Cpu,
  HardDrive,
  FolderTree,
  Shield,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ExperimentCatalogProps {
  experiments: ExperimentDefinition[];
  selectedCategory: ExperimentCategory | 'all';
  selectedDifficulty: ExperimentDifficulty | 'all';
  searchQuery: string;
  progressMap: Record<string, ExperimentProgressState>;
  stats: { total: number; completed: number; inProgress: number; percentage: number };
  onSelectCategory: (cat: ExperimentCategory | 'all') => void;
  onSelectDifficulty: (diff: ExperimentDifficulty | 'all') => void;
  onSearchChange: (q: string) => void;
  onSelectExperiment: (id: string) => void;
}

export const ExperimentCatalog: React.FC<ExperimentCatalogProps> = ({
  experiments,
  selectedCategory,
  selectedDifficulty,
  searchQuery,
  progressMap,
  stats,
  onSelectCategory,
  onSelectDifficulty,
  onSearchChange,
  onSelectExperiment,
}) => {
  const categories: { id: ExperimentCategory | 'all'; label: string; icon: any }[] = [
    { id: 'all', label: 'All Experiments', icon: Layers },
    { id: 'processes', label: 'Processes', icon: Cpu },
    { id: 'memory', label: 'Memory', icon: HardDrive },
    { id: 'filesystem', label: 'Filesystem', icon: FolderTree },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'shell', label: 'Shell & Scripting', icon: Terminal },
    { id: 'kernel', label: 'Kernel & Proc', icon: Activity },
  ];

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'real-guest':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Real Linux Guest
          </span>
        );
      case 'hybrid':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            Hybrid (Observed + Model)
          </span>
        );
      case 'educational-simulation':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Educational Model
          </span>
        );
      default:
        return null;
    }
  };

  const getDifficultyBadge = (diff: ExperimentDifficulty) => {
    switch (diff) {
      case 'beginner':
        return <span className="text-[10px] text-emerald-400 font-medium">Beginner</span>;
      case 'intermediate':
        return <span className="text-[10px] text-sky-400 font-medium">Intermediate</span>;
      case 'advanced':
        return <span className="text-[10px] text-purple-400 font-medium">Advanced</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Banner & Stats */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-base font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>WebOS OS Lab — Operating Systems Laboratory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hands-on experiments executed against the genuine Tiny Core Linux x86 kernel.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 min-w-64 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">Lab Progress</span>
            <span className="text-sky-400 font-bold font-mono">
              {stats.completed}/{stats.total} Completed ({stats.percentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-850 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, stats.percentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-44 lg:w-56"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => onSelectDifficulty(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Experiments Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {experiments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            No experiments found matching current filters. Try resetting search or selecting All Experiments.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {experiments.map((exp) => {
              const prog = progressMap[exp.id] || { status: 'not-started', completedSteps: [] };
              const isCompleted = prog.status === 'completed';
              const isInProgress = prog.status === 'in-progress';

              return (
                <div
                  key={exp.id}
                  onClick={() => onSelectExperiment(exp.id)}
                  className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/60 rounded-xl p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:shadow-lg hover:shadow-sky-950/20 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      {getModeBadge(exp.executionMode)}
                      {getDifficultyBadge(exp.difficulty)}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {exp.description}
                      </p>
                    </div>

                    <div className="pt-1 flex items-center space-x-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exp.estimatedMinutes} min
                      </span>
                      <span>•</span>
                      <span>{exp.steps.length} practical steps</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : isInProgress ? (
                      <span className="text-[11px] text-sky-400 font-semibold">
                        In Progress ({prog.completedSteps.length}/{exp.steps.length})
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Not Started</span>
                    )}

                    <span className="text-sky-400 text-xs font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{isCompleted ? 'Review' : isInProgress ? 'Resume' : 'Start'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
