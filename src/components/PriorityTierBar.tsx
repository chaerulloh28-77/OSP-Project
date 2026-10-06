import React from 'react';
import { PRIORITY_TIERS, getPriorityMeta } from '../utils/priorityHelpers';
import { ProjectData, PRIORITY_OPTIONS } from '../types/project';
import { Flame, SlidersHorizontal, Layers, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface PriorityTierBarProps {
  projects: ProjectData[];
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  className?: string;
}

export const PriorityTierBar: React.FC<PriorityTierBarProps> = ({
  projects,
  selectedPriority,
  onSelectPriority,
  className = '',
}) => {
  // Count projects per priority
  const priorityCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const opt of PRIORITY_OPTIONS) {
      counts[opt] = 0;
    }
    counts['all'] = projects.length;

    for (const p of projects) {
      const pr = p.priority || 'Normal';
      counts[pr] = (counts[pr] || 0) + 1;
    }
    return counts;
  }, [projects]);

  // Aggregate count by tier (1 - 6)
  const tierCounts = React.useMemo(() => {
    const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const p of projects) {
      const meta = getPriorityMeta(p.priority || 'Normal');
      map[meta.level] = (map[meta.level] || 0) + 1;
    }
    return map;
  }, [projects]);

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3 transition-all ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Indikator Prioritas Berdasarkan Tingkatan (Level 1 - 6)</span>
              <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {projects.length} Total Paket
              </span>
            </h4>
          </div>
        </div>

        {selectedPriority && (
          <button
            type="button"
            onClick={() => onSelectPriority('')}
            className="text-[11px] text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer self-start md:self-auto px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 transition-colors"
          >
            <span>Reset Filter Prioritas: <strong>{selectedPriority}</strong></span>
            <span className="text-xs">×</span>
          </button>
        )}
      </div>

      {/* Grid of 6 Priority Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {PRIORITY_TIERS.map((tier) => {
          const TierIcon = tier.icon;
          const count = tierCounts[tier.tier] || 0;
          const isSelected = tier.values.includes(selectedPriority);

          return (
            <div
              key={tier.tier}
              className={`p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-800 bg-slate-900 text-white shadow-md ring-2 ring-slate-800/30'
                  : `${tier.bgColor} ${tier.borderColor} hover:shadow-xs hover:-translate-y-0.5`
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div
                    className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0 relative ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : `bg-gradient-to-tr ${tier.gradient} text-white shadow-2xs`
                    }`}
                  >
                    {tier.hasPulseRing && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                      </span>
                    )}
                    <TierIcon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[11px] font-bold block truncate ${isSelected ? 'text-white' : tier.textColor}`}>
                      Tingkat {tier.tier}
                    </span>
                    <span className={`text-[9.5px] block truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {tier.title.split('(')[1]?.replace(')', '')?.trim() || tier.title}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-white text-slate-900'
                      : `${tier.textColor} bg-white/80 border ${tier.borderColor}`
                  }`}
                >
                  {count}
                </span>
              </div>

              {/* Specific priority pills in this tier */}
              <div className="flex flex-wrap gap-1 mt-1">
                {tier.values.map((val) => {
                  const valCount = priorityCounts[val] || 0;
                  const isValActive = selectedPriority === val;
                  const itemMeta = getPriorityMeta(val);
                  const ItemIcon = itemMeta.icon;

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => onSelectPriority(isValActive ? '' : val)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                        isValActive
                          ? 'bg-white text-slate-900 border-white shadow-xs font-bold'
                          : isSelected
                          ? 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
                          : `${itemMeta.bgColor} ${itemMeta.textColor} ${itemMeta.borderColor} hover:shadow-2xs`
                      }`}
                      title={`Klik untuk filter proyek dengan prioritas ${val} (${valCount} proyek)`}
                    >
                      {itemMeta.hasPulseRing && (
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600" />
                        </span>
                      )}
                      <ItemIcon className="w-2.5 h-2.5 shrink-0" />
                      <span>{val}</span>
                      <span className={`font-mono text-[9px] px-1 py-0.2 rounded ${
                        isValActive ? 'bg-slate-200 text-slate-800' : 'bg-black/10 text-current'
                      }`}>
                        {valCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
