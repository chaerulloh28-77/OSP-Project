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
}

export const StatsBar: React.FC<StatsBarProps> = ({ 
  projects, 
  onQuickFilter, 
  activeFilterValue,
  onSelectProject,
  showToast
}) => {
  const [selectedKpiKey, setSelectedKpiKey] = useState<KpiItemKey | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 4. Relokasi COAX (Total meter)
  const totalLengthCoaxMeters = projects.reduce((acc, curr) => {
    const num = Number(curr.panjangRelokasiCoax || curr.pullingCoaxPanjangTotal || 0);
    return acc + num;
  }, 0);

  // 5. Pulling Cable (Active locations)
  const pullingCableActive = projects.filter(
    (p) =>
      p.statusConstruction === 'Pulling Cable' ||
      p.statusPullingCableFo === 'In Progress' ||
      p.statusPullingCableFo === 'Done' ||
      p.statusPullingCableCoax === 'In Progress' ||
      p.statusPullingCableCoax === 'Done' ||
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
      {/* Symmetrical & Proportional Card Grid (5 columns per row on desktop, 10 columns on wide screen) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-2.5 mb-4">
        
        {/* 1. Total Project */}
        <div 
          onClick={() => handleCardClick('total', 'all', '')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            !activeFilterValue 
              ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs bg-gradient-to-b from-sky-50/60 to-white' 
              : 'border-slate-200/90 hover:border-sky-300 shadow-2xs'
          }`}
          title="Total Proyek Terdata (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Total Project</span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">{totalCount}</span>
            <span className="text-[9.5px] font-semibold text-sky-600 group-hover:underline flex items-center gap-0.5">
              <span>paket</span>
              <Info className="w-2.5 h-2.5 text-sky-400" />
            </span>
          </div>
        </div>

        {/* 2. Construction */}
        <div 
          onClick={() => handleCardClick('construction', 'statusConstruction', 'Construction')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'Construction' || activeFilterValue === 'statusConstruction'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xs bg-gradient-to-b from-amber-50/60 to-white' 
              : 'border-slate-200/90 hover:border-amber-300 shadow-2xs'
          }`}
          title="Fase Konstruksi Lapangan (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Construction</span>
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <HardHat className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-amber-600 tracking-tight">{constructionCount}</span>
            <span className="text-[9.5px] font-semibold text-amber-600/80 group-hover:underline flex items-center gap-0.5">
              <span>konstruksi</span>
              <Info className="w-2.5 h-2.5 text-amber-400" />
            </span>
          </div>
        </div>

        {/* 3. Relokasi FO */}
        <div 
          onClick={() => handleCardClick('relokasi-fo', 'panjangRelokasi', 'Has Length')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'Has Length' 
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs bg-gradient-to-b from-blue-50/60 to-white' 
              : 'border-slate-200/90 hover:border-blue-300 shadow-2xs'
          }`}
          title="Total Panjang Relokasi Fiber Optic (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Relokasi FO</span>
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <Network className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {totalLengthMeters.toLocaleString('id-ID')}
            </span>
            <span className="text-[9.5px] font-semibold text-blue-600 group-hover:underline flex items-center gap-0.5">
              <span>m FO</span>
              <Info className="w-2.5 h-2.5 text-blue-400" />
            </span>
          </div>
        </div>

        {/* 4. Relokasi COAX */}
        <div 
          onClick={() => handleCardClick('relokasi-coax', 'panjangRelokasiCoax', 'Relokasi COAX')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'Relokasi COAX' || activeFilterValue === 'Has Coax Length' 
              ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs bg-gradient-to-b from-cyan-50/60 to-white' 
              : 'border-slate-200/90 hover:border-cyan-300 shadow-2xs'
          }`}
          title="Total Panjang Relokasi Coaxial (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Relokasi COAX</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <Cable className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-base font-extrabold font-mono tabular-nums text-slate-900 tracking-tight">
              {totalLengthCoaxMeters.toLocaleString('id-ID')}
            </span>
            <span className="text-[9.5px] font-semibold text-cyan-600 group-hover:underline flex items-center gap-0.5">
              <span>m COAX</span>
              <Info className="w-2.5 h-2.5 text-cyan-400" />
            </span>
          </div>
        </div>

        {/* 5. Pulling Cable */}
        <div 
          onClick={() => handleCardClick('pulling-cable', 'statusPullingCableFo', 'Pulling Cable')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'Pulling Cable' 
              ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-xs bg-gradient-to-b from-purple-50/60 to-white' 
              : 'border-slate-200/90 hover:border-purple-300 shadow-2xs'
          }`}
          title="Penarikan Kabel Aktif Lapangan (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Pulling Cable</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-purple-600 tracking-tight">{pullingCableActive}</span>
            <span className="text-[9.5px] font-semibold text-purple-600/80 group-hover:underline flex items-center gap-0.5">
              <span>lokasi</span>
              <Info className="w-2.5 h-2.5 text-purple-400" />
            </span>
          </div>
        </div>

        {/* 6. MR / PO */}
        <div 
          onClick={() => handleCardClick('mr-po', 'statusPengajuanProject', 'MR/PO Approved')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'MR/PO Approved' || activeFilterValue === 'PO Released'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs bg-gradient-to-b from-indigo-50/60 to-white' 
              : 'border-slate-200/90 hover:border-indigo-300 shadow-2xs'
          }`}
          title="MR & PO Approved / Released (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">MR / PO</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-indigo-600 tracking-tight">{mrPoApprovedCount}</span>
            <span className="text-[9.5px] font-semibold text-indigo-600/80 group-hover:underline flex items-center gap-0.5">
              <span>approved</span>
              <Info className="w-2.5 h-2.5 text-indigo-400" />
            </span>
          </div>
        </div>

        {/* 7. Not Started */}
        <div 
          onClick={() => handleCardClick('not-started', 'projectStatus', 'Project Not Started')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'Project Not Started' 
              ? 'border-slate-500 ring-2 ring-slate-500/20 shadow-xs bg-gradient-to-b from-slate-100/70 to-white' 
              : 'border-slate-200/90 hover:border-slate-400 shadow-2xs'
          }`}
          title="Antrean Proyek Belum Dimulai (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Not Started</span>
            <div className="w-7 h-7 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-all shadow-2xs shrink-0">
              <Hourglass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-slate-700 tracking-tight">{notStartedCount}</span>
            <span className="text-[9.5px] font-semibold text-slate-500 group-hover:underline flex items-center gap-0.5">
              <span>antrean</span>
              <Info className="w-2.5 h-2.5 text-slate-400" />
            </span>
          </div>
        </div>

        {/* 8. In Progress */}
        <div 
          onClick={() => handleCardClick('in-progress', 'projectStatus', 'In Progress')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'In Progress' 
              ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs bg-gradient-to-b from-sky-50/60 to-white' 
              : 'border-slate-200/90 hover:border-sky-300 shadow-2xs'
          }`}
          title="Proyek Sedang Berjalan Aktif (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">In Progress</span>
            <div className="w-7 h-7 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-sky-600 tracking-tight">{inProgressCount}</span>
            <span className="text-[9.5px] font-semibold text-sky-600/80 group-hover:underline flex items-center gap-0.5">
              <span>aktif</span>
              <Info className="w-2.5 h-2.5 text-sky-400" />
            </span>
          </div>
        </div>

        {/* 9. Project Cancel */}
        <div 
          onClick={() => handleCardClick('cancelled', 'projectStatus', 'Project Cancel')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'Project Cancel' || activeFilterValue === 'Cancelled'
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-xs bg-gradient-to-b from-rose-50/60 to-white' 
              : 'border-slate-200/90 hover:border-rose-300 shadow-2xs'
          }`}
          title="Proyek Dibatalkan (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Project Cancel</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <Ban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-rose-600 tracking-tight">{cancelCount}</span>
            <span className="text-[9.5px] font-semibold text-rose-600/80 group-hover:underline flex items-center gap-0.5">
              <span>batal</span>
              <Info className="w-2.5 h-2.5 text-rose-400" />
            </span>
          </div>
        </div>

        {/* 10. Completed */}
        <div 
          onClick={() => handleCardClick('completed', 'projectStatus', 'Completed')}
          className={`group bg-white rounded-2xl p-3 border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-[86px] relative overflow-hidden select-none ${
            activeFilterValue === 'Completed' 
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs bg-gradient-to-b from-emerald-50/60 to-white' 
              : 'border-slate-200/90 hover:border-emerald-300 shadow-2xs'
          }`}
          title="Proyek Selesai 100% (Klik untuk info rincian detail)"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">Completed</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold font-mono tabular-nums text-emerald-600 tracking-tight">{completedCount}</span>
            <span className="text-[9.5px] font-semibold text-emerald-600/80 group-hover:underline flex items-center gap-0.5">
              <span>selesai</span>
              <Info className="w-2.5 h-2.5 text-emerald-400" />
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
