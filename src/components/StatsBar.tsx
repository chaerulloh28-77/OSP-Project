import React, { useState } from 'react';
import { 
  FolderKanban, 
  Clock, 
  HardHat, 
  Ruler, 
  FileCheck2, 
  Cable,
  Zap,
  Activity,
  CheckCircle2, 
  XCircle,
  ShieldAlert,
  Boxes,
  Network,
  PlayCircle,
  Ban,
  Hourglass,
  Info,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { KpiItemDetailModal, KpiItemKey } from './KpiItemDetailModal';

interface StatsBarProps {
  projects: ProjectData[];
  onQuickFilter: (key: string, value: string) => void;
  activeFilterValue?: string;
  onSelectProject?: (project: ProjectData) => void;
  showToast?: (msg: string) => void;
  isNeonMode?: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ 
  projects, 
  onQuickFilter, 
  activeFilterValue,
  onSelectProject,
  showToast,
  isNeonMode = true
}) => {
  const [selectedKpiKey, setSelectedKpiKey] = useState<KpiItemKey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCardClasses = (isActive: boolean, color: 'sky' | 'amber' | 'blue' | 'rose' | 'emerald' | 'purple' | 'violet' | 'indigo' | 'slate') => {
    if (isNeonMode) {
      const activeBorders = {
        sky: 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] bg-[#0d162d]/90 text-cyan-300',
        amber: 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] bg-[#211610]/90 text-amber-300',
        blue: 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)] bg-[#0d162d]/90 text-blue-300',
        rose: 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)] bg-[#251015]/90 text-rose-300',
        emerald: 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-[#091a14]/90 text-emerald-300',
        purple: 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] bg-[#191026]/90 text-purple-300',
        violet: 'border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)] bg-[#141026]/90 text-violet-300',
        indigo: 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] bg-[#0e112d]/90 text-indigo-300',
        slate: 'border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.4)] bg-[#1a1c23]/90 text-slate-300',
      };
      
      const hoverBorders = {
        sky: 'hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] border-slate-800/80',
        amber: 'hover:border-amber-400/80 hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] border-slate-800/80',
        blue: 'hover:border-blue-400/80 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)] border-slate-800/80',
        rose: 'hover:border-rose-400/80 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] border-slate-800/80',
        emerald: 'hover:border-emerald-400/80 hover:shadow-[0_0_15px_rgba(16,185,129,0.25)] border-slate-800/80',
        purple: 'hover:border-purple-400/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.25)] border-slate-800/80',
        violet: 'hover:border-violet-400/80 hover:shadow-[0_0_15px_rgba(139,92,246,0.25)] border-slate-800/80',
        indigo: 'hover:border-indigo-400/80 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] border-slate-800/80',
        slate: 'hover:border-slate-400/80 hover:shadow-[0_0_15px_rgba(148,163,184,0.25)] border-slate-800/80',
      };

      return `bg-[#0b0e1e]/95 text-slate-200 ${isActive ? activeBorders[color] : hoverBorders[color]}`;
    } else {
      const activeBorders = {
        sky: 'border-sky-500 ring-2 ring-sky-500/30 bg-gradient-to-b from-sky-50/70 to-white text-slate-800 shadow-xs',
        amber: 'border-amber-500 ring-2 ring-amber-500/30 bg-gradient-to-b from-amber-50/70 to-white text-slate-800 shadow-xs',
        blue: 'border-blue-500 ring-2 ring-blue-500/30 bg-gradient-to-b from-blue-50/70 to-white text-slate-800 shadow-xs',
        rose: 'border-rose-500 ring-2 ring-rose-500/30 bg-gradient-to-b from-rose-50/70 to-white text-slate-800 shadow-xs',
        emerald: 'border-emerald-500 ring-2 ring-emerald-500/30 bg-gradient-to-b from-emerald-50/70 to-white text-slate-800 shadow-xs',
        purple: 'border-purple-500 ring-2 ring-purple-500/30 bg-gradient-to-b from-purple-50/70 to-white text-slate-800 shadow-xs',
        violet: 'border-violet-500 ring-2 ring-violet-500/30 bg-gradient-to-b from-violet-50/70 to-white text-slate-800 shadow-xs',
        indigo: 'border-indigo-500 ring-2 ring-indigo-500/30 bg-gradient-to-b from-indigo-50/70 to-white text-slate-800 shadow-xs',
        slate: 'border-slate-500 ring-2 ring-slate-500/30 bg-gradient-to-b from-slate-100/80 to-white text-slate-800 shadow-xs',
      };
      
      const hoverBorders = {
        sky: 'hover:border-sky-400 border-slate-200/90 shadow-2xs',
        amber: 'hover:border-amber-400 border-slate-200/90 shadow-2xs',
        blue: 'hover:border-blue-400 border-slate-200/90 shadow-2xs',
        rose: 'hover:border-rose-400 border-slate-200/90 shadow-2xs',
        emerald: 'hover:border-emerald-400 border-slate-200/90 shadow-2xs',
        purple: 'hover:border-purple-400 border-slate-200/90 shadow-2xs',
        violet: 'hover:border-violet-400 border-slate-200/90 shadow-2xs',
        indigo: 'hover:border-indigo-400 border-slate-200/90 shadow-2xs',
        slate: 'hover:border-slate-400 border-slate-200/90 shadow-2xs',
      };

      return `bg-white text-slate-800 ${isActive ? activeBorders[color] : hoverBorders[color]}`;
    }
  };

  // 1. Total Project
  const totalCount = projects.length;

  // 2. Construction
  const constructionCount = projects.filter(
    (p) => 
      p.statusConstruction === 'Pulling Cable' || 
      p.statusConstruction === 'Completed' || 
      p.statusConstruction === 'In Progress' ||
      p.projectStatus === 'In Progress' ||
      Number(p.pullingPanjangSelesai || 0) > 0 ||
      Number(p.pullingFoPanjangSelesai || 0) > 0
  ).length;

  // 3. Relokasi FO (Total meter)
  const totalLengthMeters = projects.reduce((acc, curr) => {
    const num = Number(curr.panjangRelokasi || 0);
    return acc + num;
  }, 0);

  // 4. Pulling Cable (Active locations)
  const pullingCableActive = projects.filter(
    (p) =>
      p.statusConstruction === 'Pulling Cable' ||
      p.statusPullingCableFo === 'In Progress' ||
      p.statusPullingCableFo === 'Done' ||
      (Boolean(p.pullingCableProgress) && p.pullingCableProgress !== '0%' && p.pullingCableProgress !== 'N/A') ||
      (Boolean(p.pullingCableFoProgress) && p.pullingCableFoProgress !== '0%' && p.pullingCableFoProgress !== 'N/A') ||
      Number(p.pullingFoPanjangSelesai || 0) > 0 ||
      Number(p.pullingPanjangSelesai || 0) > 0
  ).length;

  // 6. MR / PO
  const mrPoApprovedCount = projects.filter(
    (p) =>
      p.statusPengajuanProject === 'Approved' ||
      p.statusPengajuanProject === 'Release' ||
      p.statusPengajuanProject === 'Released' ||
      p.statusPengajuanPo === 'Approved' ||
      p.statusPengajuanPo === 'Released' ||
      p.statusPengajuanPo === 'Release' ||
      p.statusPengajuanMr === 'Approved' ||
      p.statusPengajuanMr === 'Released' ||
      p.statusPengajuanMr === 'Release'
  ).length;

  // 7. Project Not Started
  const notStartedCount = projects.filter(
    (p) => p.projectStatus === 'Project Not Started' || !p.projectStatus || p.projectStatus === 'Not Yet'
  ).length;

  // 8. In Progress
  const inProgressCount = projects.filter(
    (p) => p.projectStatus === 'In Progress' || p.statusConstruction === 'Pulling Cable'
  ).length;

  // 9. Project Cancel
  const cancelCount = projects.filter(
    (p) => 
      p.projectStatus === 'Cancelled' || 
      p.projectStatus === 'Project Cancel' || 
      p.statusPengajuanProject === 'Project Cancel'
  ).length;

  // 10. Completed
  const completedCount = projects.filter(
    (p) => p.projectStatus === 'Completed' || p.statusConstruction === 'Completed'
  ).length;

  const handleCardClick = (kpiKey: KpiItemKey, filterKey: string, filterVal: string) => {
    onQuickFilter(filterKey, filterVal);
    setSelectedKpiKey(kpiKey);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Symmetrical & Proportional Card Grid (2 cols mobile, 4 cols tablet, 8 cols desktop) */}
      {/* Symmetrical & Proportional Card Grid (2 cols mobile, 4 cols tablet, 8 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 mb-4">
        
        {/* 1. Total Project */}
        <div 
          onClick={() => handleCardClick('total', 'all', '')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(!activeFilterValue, 'sky')
          }`}
          title="Total Proyek Terdata (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-cyan-400' : 'text-slate-500 group-hover:text-sky-700'} transition-colors`}>Total Project</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black' 
                : 'bg-sky-500/10 text-sky-600 group-hover:bg-sky-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'text-slate-900 group-hover:text-sky-600'
            }`}>{totalCount}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-cyan-400/80' : 'text-sky-600'
            }`}>
              <span>paket</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 2. Construction */}
        <div 
          onClick={() => handleCardClick('construction', 'statusConstruction', 'Construction')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'Construction' || activeFilterValue === 'statusConstruction', 'amber')
          }`}
          title="Fase Konstruksi Lapangan (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-amber-400' : 'text-slate-500 group-hover:text-amber-700'} transition-colors`}>Construction</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black' 
                : 'bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <HardHat className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-amber-600'
            }`}>{constructionCount}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-amber-400/80' : 'text-amber-600'
            }`}>
              <span>konstruksi</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 3. Relokasi FO */}
        <div 
          onClick={() => handleCardClick('relokasi-fo', 'panjangRelokasi', 'Has Length')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'Has Length', 'blue')
          }`}
          title="Total Panjang Relokasi Fiber Optic (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-700'} transition-colors`}>Relokasi FO</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-black' 
                : 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <Network className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-base font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'text-slate-900 group-hover:text-blue-600'
            }`}>
              {totalLengthMeters.toLocaleString('id-ID')}
            </span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-blue-400/80' : 'text-blue-600'
            }`}>
              <span>m FO</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 5. Pulling Cable */}
        <div 
          onClick={() => handleCardClick('pulling-cable', 'statusPullingCableFo', 'Pulling Cable')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'Pulling Cable', 'purple')
          }`}
          title="Penarikan Kabel Aktif Lapangan (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-purple-400' : 'text-slate-500 group-hover:text-purple-700'} transition-colors`}>Pulling Cable</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-black' 
                : 'bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : 'text-purple-600'
            }`}>{pullingCableActive}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-purple-400/80' : 'text-purple-600'
            }`}>
              <span>lokasi</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 6. MR / PO */}
        <div 
          onClick={() => handleCardClick('mr-po', 'statusPengajuanProject', 'MR/PO Approved')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'MR/PO Approved' || activeFilterValue === 'PO Released', 'indigo')
          }`}
          title="MR & PO Approved / Released (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-indigo-400' : 'text-slate-500 group-hover:text-indigo-700'} transition-colors`}>MR / PO</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-black' 
                : 'bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]' : 'text-indigo-600'
            }`}>{mrPoApprovedCount}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-indigo-400/80' : 'text-indigo-600'
            }`}>
              <span>approved</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 7. Not Started */}
        <div 
          onClick={() => handleCardClick('not-started', 'projectStatus', 'Project Not Started')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'Project Not Started', 'slate')
          }`}
          title="Antrean Proyek Belum Dimulai (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-800'} transition-colors`}>Not Started</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-slate-500/10 text-slate-300 group-hover:bg-slate-500 group-hover:text-black' 
                : 'bg-slate-500/10 text-slate-600 group-hover:bg-slate-700 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <Hourglass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-slate-300 drop-shadow-[0_0_5px_rgba(148,163,184,0.5)]' : 'text-slate-700'
            }`}>{notStartedCount}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <span>antrean</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 8. In Progress */}
        <div 
          onClick={() => handleCardClick('in-progress', 'projectStatus', 'In Progress')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'In Progress', 'emerald')
          }`}
          title="Proyek Sedang Berjalan Aktif (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-emerald-400' : 'text-slate-500 group-hover:text-emerald-700'} transition-colors`}>In Progress</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black' 
                : 'bg-emerald-500/10 text-emerald-600 group-hover:bg-sky-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-sky-600'
            }`}>{inProgressCount}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-emerald-400/80' : 'text-sky-600/80'
            }`}>
              <span>aktif</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 9. Project Cancel */}
        <div 
          onClick={() => handleCardClick('cancelled', 'projectStatus', 'Project Cancel')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'Project Cancel' || activeFilterValue === 'Cancelled', 'rose')
          }`}
          title="Proyek Dibatalkan (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-rose-400' : 'text-slate-500 group-hover:text-rose-700'} transition-colors`}>Project Cancel</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-black' 
                : 'bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <Ban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]' : 'text-rose-600'
            }`}>{cancelCount}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-rose-400/80' : 'text-rose-600/80'
            }`}>
              <span>batal</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

        {/* 10. Completed */}
        <div 
          onClick={() => handleCardClick('completed', 'projectStatus', 'Completed')}
          className={`group interactive-card rounded-2xl p-3 border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            getCardClasses(activeFilterValue === 'Completed', 'violet')
          }`}
          title="Proyek Selesai 100% (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold tracking-wider uppercase truncate ${isNeonMode ? 'text-slate-400 group-hover:text-violet-400' : 'text-slate-500 group-hover:text-emerald-700'} transition-colors`}>Completed</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0 ${
              isNeonMode 
                ? 'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-black' 
                : 'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
            } group-hover:scale-110 group-hover:rotate-6`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`text-xl font-extrabold font-mono tabular-nums tracking-tight transition-colors ${
              isNeonMode ? 'text-violet-400 drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]' : 'text-emerald-600'
            }`}>{completedCount}</span>
            <span className={`text-[9.5px] font-semibold group-hover:underline flex items-center gap-0.5 ${
              isNeonMode ? 'text-violet-400/80' : 'text-emerald-600/80'
            }`}>
              <span>selesai</span>
              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>

      </div>

      {/* Item Detail Breakdown Modal */}
      <KpiItemDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemKey={selectedKpiKey}
        projects={projects}
        onSelectProject={(p) => {
          setIsModalOpen(false);
          if (onSelectProject) {
            onSelectProject(p);
          }
        }}
        onApplyFilterToMainTable={(key, val) => {
          onQuickFilter(key, val);
        }}
        showToast={showToast}
      />
    </>
  );
};
