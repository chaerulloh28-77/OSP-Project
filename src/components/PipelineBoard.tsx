import React, { useState } from 'react';
import { 
  GitCommit, 
  CheckCircle2, 
  Clock, 
  HardHat, 
  Cable, 
  FileCheck2, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  Edit3, 
  MapPin, 
  Layers,
  Building2,
  Calendar,
  XCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { PriorityBadge } from './PriorityBadge';

interface PipelineBoardProps {
  projects: ProjectData[];
  onViewDetail: (project: ProjectData) => void;
  onEdit: (project: ProjectData) => void;
  onJumpToTab: (tab: TabKey, project: ProjectData) => void;
  onQuickUpdateStage?: (project: ProjectData, newStage: string) => void;
  isNeonMode?: boolean;
}

interface StageColumn {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
  badgeBg: string;
  filterFn: (p: ProjectData) => boolean;
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  projects,
  onViewDetail,
  onEdit,
  onJumpToTab,
  isNeonMode = true,
}) => {
  // Define pipeline stages
  const stages: StageColumn[] = [
    {
      id: 'stage-review',
      title: '1. Review & Dinas',
      shortDesc: 'Review Dinas, Audit & Survey',
      icon: Clock,
      colorClass: 'text-amber-700',
      borderClass: 'border-amber-300',
      badgeBg: 'bg-amber-100 text-amber-800',
      filterFn: (p) => 
        p.projectStatus === 'Review Dinas' ||
        p.projectStatus === 'Masih Review Dinas' || 
        (Boolean(p.projectStatus) && p.projectStatus.toLowerCase().includes('review')) ||
        p.statusSurvey === 'Belum' || 
        p.statusAudit === 'Belum di Audit',
    },
    {
      id: 'stage-procurement',
      title: '2. Procurement & PO',
      shortDesc: 'Pengajuan MR / PO Approved & Released',
      icon: FileCheck2,
      colorClass: 'text-sky-700',
      borderClass: 'border-sky-300',
      badgeBg: 'bg-sky-100 text-sky-800',
      filterFn: (p) => 
        (p.statusPengajuanProject === 'Approved' ||
         p.statusPengajuanProject === 'Release' ||
         p.statusPengajuanPo === 'Approved' ||
         p.statusPengajuanPo === 'Released' ||
         p.statusPengajuanMr === 'Approved' ||
         p.statusPengajuanMr === 'Released') && 
        p.statusConstruction === 'Project Not Started' &&
        p.projectStatus !== 'Cancelled',
    },
    {
      id: 'stage-civil',
      title: '3. Civil & Galian',
      shortDesc: 'Galian Sipil & Install HH/Pole',
      icon: HardHat,
      colorClass: 'text-indigo-700',
      borderClass: 'border-indigo-300',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      filterFn: (p) => 
        (Boolean(p.galianSipilProgress && p.galianSipilProgress !== '100%') || 
         Boolean(p.installHhProgress && p.installHhProgress !== 'Done')) &&
        p.statusConstruction !== 'Pulling Cable' &&
        p.projectStatus !== 'Cancelled',
    },
    {
      id: 'stage-pulling',
      title: '4. Pulling Cable FO',
      shortDesc: 'Penarikan Kabel & Splicing',
      icon: Cable,
      colorClass: 'text-purple-700',
      borderClass: 'border-purple-300',
      badgeBg: 'bg-purple-100 text-purple-800',
      filterFn: (p) => 
        p.statusConstruction === 'Pulling Cable' || 
        p.statusPullingCableFo === 'In Progress',
    },
    {
      id: 'stage-closing',
      title: '5. Testing & Closing',
      shortDesc: 'CO, Opname & SAP Closing',
      icon: CheckCircle2,
      colorClass: 'text-emerald-700',
      borderClass: 'border-emerald-300',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      filterFn: (p) => 
        (p.statusCo === 'Done' || p.laporanOpname === 'Submitted' || p.projectStatus === 'Completed') &&
        p.projectStatus !== 'Cancelled',
    },
    {
      id: 'stage-cancelled',
      title: '6. Cancelled / On-Hold',
      shortDesc: 'Project Batal atau Ditangguhkan',
      icon: XCircle,
      colorClass: 'text-rose-700',
      borderClass: 'border-rose-300',
      badgeBg: 'bg-rose-100 text-rose-800',
      filterFn: (p) => 
        p.projectStatus === 'Cancelled' || 
        p.statusConstruction === 'Project Cancel' || 
        p.statusPengajuanProject === 'Project Cancel',
    },
  ];

  // Helper to determine which stage a project belongs to
  const getStageForProject = (project: ProjectData): string => {
    if (project.projectStatus === 'Cancelled' || project.statusConstruction === 'Project Cancel' || project.statusPengajuanProject === 'Project Cancel') {
      return 'stage-cancelled';
    }
    if (project.statusCo === 'Done' || project.projectStatus === 'Completed' || project.closingSap === 'Done' || project.closingSap === 'Yes') {
      return 'stage-closing';
    }
    if (project.statusConstruction === 'Pulling Cable' || project.statusPullingCableFo === 'In Progress' || project.statusPullingCableFo === 'Done') {
      return 'stage-pulling';
    }
    if (project.galianSipilProgress && project.galianSipilProgress !== '0%') {
      return 'stage-civil';
    }
    if (
      project.statusPengajuanMr === 'Released' || 
      project.statusPengajuanPo === 'Released' || 
      project.statusPengajuanMr === 'Approved' || 
      project.statusPengajuanPo === 'Approved' || 
      project.statusPengajuanProject === 'Release' || 
      project.statusPengajuanProject === 'Released' || 
      project.statusPengajuanProject === 'Approved'
    ) {
      return 'stage-procurement';
    }
    return 'stage-review';
  };

  const getProgressPercentage = (p: ProjectData): number => {
    if (p.projectStatus === 'Cancelled') return 0;
    if (p.projectStatus === 'Completed') return 100;
    if (p.pullingCableProgress) {
      const match = p.pullingCableProgress.match(/\d+/);
      if (match) return Math.min(100, parseInt(match[0], 10));
    }
    if (p.statusConstruction === 'Pulling Cable') return 65;
    if (p.statusPengajuanMr === 'Released') return 35;
    return 15;
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Intro Bar */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-800 to-indigo-900 rounded-xl p-4 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Pipeline Tahapan & Milestone Project
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg border border-white/10 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono">{projects.length} Project Terdistribusi</span>
          </div>
        </div>
      </div>

      {/* 6 Stage Columns Horizon Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stages.map((stage) => {
          const StageIcon = stage.icon;
          // Filter projects that fall into this stage
          const stageProjects = projects.filter((p) => getStageForProject(p) === stage.id);

          return (
            <div
              key={stage.id}
              className={`rounded-xl border flex flex-col min-h-[480px] overflow-hidden transition-all duration-300 ${
                isNeonMode 
                  ? 'bg-[#080d1e] border-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.06)]' 
                  : 'bg-white border-slate-200/90 shadow-xs'
              }`}
            >
              {/* Stage Header */}
              <div className={`p-3 border-b ${
                isNeonMode ? 'bg-[#0b142c] border-slate-800' : 'bg-slate-50/70 border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className={`flex items-center gap-1.5 font-bold text-xs ${
                    isNeonMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    <StageIcon className={`w-3.5 h-3.5 ${stage.colorClass}`} />
                    <span className="truncate">{stage.title}</span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isNeonMode 
                      ? 'bg-slate-900 text-cyan-300 border border-cyan-500/30' 
                      : stage.badgeBg
                  }`}>
                    {stageProjects.length}
                  </span>
                </div>
                <p className={`text-[10px] line-clamp-1 ${isNeonMode ? 'text-slate-400' : 'text-slate-400'}`}>{stage.shortDesc}</p>
              </div>

              {/* Cards Container */}
              <div className={`p-2.5 flex-1 overflow-y-auto space-y-2.5 custom-scrollbar ${
                isNeonMode ? 'bg-[#060a16]' : 'bg-slate-50/30'
              }`}>
                {stageProjects.length === 0 ? (
                  <div className={`h-32 flex flex-col items-center justify-center text-center p-3 ${
                    isNeonMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <AlertCircle className={`w-5 h-5 mb-1 ${isNeonMode ? 'text-slate-600' : 'text-slate-300'}`} />
                    <span className="text-[11px]">Tidak ada project di tahap ini</span>
                  </div>
                ) : (
                  stageProjects.map((p) => {
                    const progressPct = getProgressPercentage(p);

                    return (
                      <div
                        key={p.id}
                        className={`interactive-card rounded-lg p-3 active:scale-[0.98] transition-all duration-200 cursor-pointer group space-y-2.5 border ${
                          isNeonMode 
                            ? 'bg-[#0a1128] border-slate-800 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] text-slate-200' 
                            : 'bg-white border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-400 text-slate-800'
                        }`}
                        onClick={() => onViewDetail(p)}
                      >
                        {/* Header: PMO ID & Category */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`font-mono text-xs font-bold ${
                            isNeonMode ? 'text-cyan-300 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]' : 'text-sky-700'
                          }`}>
                            {p.pmoId}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                            p.projectCategory === 'GOV IPPJU'
                              ? isNeonMode ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                              : p.projectCategory === 'GOV APJATEL'
                              ? isNeonMode ? 'bg-amber-950/80 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                              : p.projectCategory === 'GOV SJUT'
                              ? isNeonMode ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : isNeonMode ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {p.projectCategory || 'GOV IPPJU'}
                          </span>
                        </div>

                        {/* Title / Description */}
                        <p className={`text-xs font-semibold line-clamp-2 leading-snug ${
                          isNeonMode ? 'text-slate-100 group-hover:text-cyan-200' : 'text-slate-800 group-hover:text-sky-700'
                        }`}>
                          {p.projectDescription || <span className="text-slate-400 italic font-normal text-[11px]">(Tanpa deskripsi)</span>}
                        </p>

                        {/* Badges: Priority, Area/Kota & Quarter */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {p.priority && (
                            <PriorityBadge priority={p.priority} showLevel={true} size="xs" />
                          )}
                          {p.areaKota && (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-semibold font-mono ${
                              isNeonMode ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30' : 'bg-sky-50 text-sky-700 border-sky-200/60'
                            }`}>
                              <MapPin className="w-2.5 h-2.5" />
                              {p.areaKota}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-semibold font-mono ${
                            isNeonMode ? 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                          }`}>
                            <Calendar className="w-2.5 h-2.5" />
                            {p.quarter || 'Q1-26'}
                          </span>
                        </div>

                        {/* Vendor & Length */}
                        <div className={`pt-1 border-t flex items-center justify-between text-[11px] ${
                          isNeonMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                        }`}>
                          <span className="truncate max-w-[110px]" title={p.namaVendor}>
                            {p.namaVendor || 'Belum Vendor'}
                          </span>
                          <span className={`font-mono font-medium ${isNeonMode ? 'text-white' : 'text-slate-800'}`}>
                            {p.panjangRelokasi ? `${Number(p.panjangRelokasi).toLocaleString('id-ID')} m` : '-'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className={`flex items-center justify-between text-[10px] mb-1 ${
                            isNeonMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            <span>Estimasi Progres</span>
                            <span className={`font-mono font-semibold ${isNeonMode ? 'text-cyan-300' : 'text-slate-700'}`}>{progressPct}%</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                            isNeonMode ? 'bg-slate-800' : 'bg-slate-100'
                          }`}>
                            <div
                              className={`h-full rounded-full transition-all ${
                                stage.id === 'stage-cancelled'
                                  ? 'bg-rose-400'
                                  : progressPct >= 80
                                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                  : progressPct >= 40
                                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                                  : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Action buttons on hover */}
                        <div className={`pt-1.5 flex items-center justify-between gap-1 text-[11px] border-t ${
                          isNeonMode ? 'border-slate-800/80' : 'border-slate-100'
                        }`}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(p);
                              }}
                              title="Edit Data Project"
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                isNeonMode ? 'text-amber-400 hover:bg-amber-950/60' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewDetail(p);
                              }}
                              title="Lihat Detail 4 Sheet"
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                isNeonMode ? 'text-cyan-400 hover:bg-cyan-950/60' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onJumpToTab('status-construction', p);
                            }}
                            className="text-[10px] text-sky-600 hover:text-sky-800 flex items-center gap-0.5 font-medium cursor-pointer"
                          >
                            <span>Sheet Fisik</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
