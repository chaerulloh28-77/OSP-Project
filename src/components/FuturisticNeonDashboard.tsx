import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Flame, 
  ShieldCheck, 
  Activity, 
  Network, 
  HardHat, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Eye, 
  Edit3, 
  Search, 
  Sparkles, 
  Filter, 
  Cpu, 
  Radio, 
  FileSpreadsheet, 
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { TAB_CONFIG } from '../data/tabColumns';
import { TabVisualIcon } from './TabVisualIcon';

interface FuturisticNeonDashboardProps {
  projects: ProjectData[];
  onViewDetail: (p: ProjectData) => void;
  onEditProject: (p: ProjectData) => void;
  onJumpToTab: (tab: TabKey, p?: ProjectData) => void;
  showToast: (msg: string) => void;
  onNewProject: () => void;
}

export const FuturisticNeonDashboard: React.FC<FuturisticNeonDashboardProps> = ({
  projects,
  onViewDetail,
  onEditProject,
  onJumpToTab,
  showToast,
  onNewProject,
}) => {
  // Color filter state: 'all' | 'red' | 'orange' | 'green' | 'blue' | 'purple' | 'violet' | 'white'
  const [activeColorFilter, setActiveColorFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeRadarTab, setActiveRadarTab] = useState<'closing' | 'construction' | 'pipeline'>('closing');

  // Multi-Colour KPI Metrics Calculations
  const metrics = useMemo(() => {
    const total = projects.length;

    // 1. RED NEON: Critical Priority (Level 1 Kritis) & High Urgency
    const redCritical = projects.filter((p) => 
      (p.priority || '').toLowerCase().includes('kritis') || 
      (p.priority || '').toLowerCase().includes('critical') || 
      (p.priority || '').toLowerCase().includes('level 1') ||
      p.projectStatus === 'Masih Review Dinas' ||
      p.statusPengajuanClosing === 'Approval BALAP'
    );

    // 2. ORANGE NEON: Active Construction, Civil Works & Galian
    const orangeConstruction = projects.filter((p) => 
      p.statusConstruction === 'In Progress' || 
      p.statusPullingCableFo === 'In Progress' ||
      p.statusCo === 'In Progress' ||
      (Number(p.galianPanjangSelesai || 0) > 0 && Number(p.galianPanjangSelesai || 0) < Number(p.panjangRelokasi || 1))
    );

    // 3. GREEN NEON: 100% Completed Projects, Teco Done & Invoiced
    const greenCompleted = projects.filter((p) => 
      p.statusConstruction === 'Completed' || 
      p.statusPengajuanClosing === 'Invoice' || 
      p.statusPengajuanClosing === 'Teco Done' ||
      p.projectStatus === 'Selesai Konstruksi'
    );

    // 4. BLUE / CYAN NEON: Total FO Meters & Cable Network
    const totalFoMeters = projects.reduce((acc, p) => acc + (Number(p.panjangRelokasi) || 0), 0);
    const totalFoDoneMeters = projects.reduce((acc, p) => acc + (Number(p.pullingFoPanjangSelesai || p.pullingPanjangSelesai || p.panjangRelokasi || 0)), 0);

    // 5. PURPLE & VIOLET NEON: Approved Documents & Pipeline Handover
    const purpleApproved = projects.filter((p) => 
      p.statusPengajuanClosing === 'Approval BAST' || 
      p.statusPengajuanClosing === 'Approval BALAP' ||
      p.statusAudit === 'Approved Audit' ||
      p.statusPengajuanProject === 'Approval BAST'
    );

    // 6. WHITE NEON: All Master Projects
    const whiteMasterCount = total;

    // Status Pengajuan Closing Counters
    const closingCounts = {
      'Not Yet': projects.filter((p) => (p.statusPengajuanClosing || p.closingProject?.statusPengajuan) === 'Not Yet').length,
      'Submit': projects.filter((p) => (p.statusPengajuanClosing || p.closingProject?.statusPengajuan) === 'Submit').length,
      'Approval BALAP': projects.filter((p) => (p.statusPengajuanClosing || p.closingProject?.statusPengajuan) === 'Approval BALAP').length,
      'Approval BAST': projects.filter((p) => (p.statusPengajuanClosing || p.closingProject?.statusPengajuan) === 'Approval BAST').length,
      'Teco Done': projects.filter((p) => (p.statusPengajuanClosing || p.closingProject?.statusPengajuan) === 'Teco Done').length,
      'Invoice': projects.filter((p) => (p.statusPengajuanClosing || p.closingProject?.statusPengajuan) === 'Invoice').length,
    };

    return {
      total,
      redCritical,
      orangeConstruction,
      greenCompleted,
      totalFoMeters,
      totalFoDoneMeters,
      purpleApproved,
      whiteMasterCount,
      closingCounts,
      completionRate: total > 0 ? Math.round((greenCompleted.length / total) * 100) : 0,
      activeConstructionRate: total > 0 ? Math.round((orangeConstruction.length / total) * 100) : 0,
    };
  }, [projects]);

  // Filtered projects based on active neon color filter and search
  const filteredList = useMemo(() => {
    let list = [...projects];

    if (activeColorFilter === 'red') {
      list = metrics.redCritical;
    } else if (activeColorFilter === 'orange') {
      list = metrics.orangeConstruction;
    } else if (activeColorFilter === 'green') {
      list = metrics.greenCompleted;
    } else if (activeColorFilter === 'purple' || activeColorFilter === 'violet') {
      list = metrics.purpleApproved;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((p) => 
        (p.pmoId || '').toLowerCase().includes(q) ||
        (p.projectDescription || '').toLowerCase().includes(q) ||
        (p.namaVendor || '').toLowerCase().includes(q) ||
        (p.areaKota || '').toLowerCase().includes(q) ||
        (p.poNumber || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [projects, activeColorFilter, searchTerm, metrics]);

  // 7-Sheet Futuristic Cyber Cards Configuration
  const sheetCards = [
    {
      tabKey: 'project-list' as TabKey,
      sheetNo: 1,
      title: 'Project List',
      sub: 'Master Database Proyek',
      colorName: 'blue',
      borderStyle: 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      textAccent: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
      tag: 'NEON BLUE',
      stat: `${projects.length} Proyek`,
    },
    {
      tabKey: 'construction-plan' as TabKey,
      sheetNo: 2,
      title: 'Plan Implementasi',
      sub: 'Blueprint & Vendor Relokasi',
      colorName: 'sky',
      borderStyle: 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]',
      textAccent: 'text-sky-400',
      badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
      tag: 'NEON SKY',
      stat: `${(metrics.totalFoMeters / 1000).toFixed(1)} km Target`,
    },
    {
      tabKey: 'status-project' as TabKey,
      sheetNo: 3,
      title: 'Status Project & MR',
      sub: 'Pengajuan Material & PO',
      colorName: 'orange',
      borderStyle: 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.35)]',
      textAccent: 'text-orange-400',
      badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
      tag: 'NEON ORANGE',
      stat: 'Ready Material',
    },
    {
      tabKey: 'status-construction' as TabKey,
      sheetNo: 4,
      title: 'Status Construction',
      sub: 'Penarikan FO & Galian Sipil',
      colorName: 'green',
      borderStyle: 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      textAccent: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      tag: 'NEON GREEN',
      stat: `${metrics.completionRate}% Selesai`,
    },
    {
      tabKey: 'project-tracking-pipeline' as TabKey,
      sheetNo: 5,
      title: 'Tracing Pipeline',
      sub: 'Alur Kanban & Mitigasi',
      colorName: 'purple',
      borderStyle: 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      textAccent: 'text-purple-400',
      badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
      tag: 'NEON PURPLE',
      stat: '6 Tahapan',
    },
    {
      tabKey: 'upload-document' as TabKey,
      sheetNo: 6,
      title: 'Document Project',
      sub: 'Vault Berkas & Upload',
      colorName: 'violet',
      borderStyle: 'border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.35)]',
      textAccent: 'text-violet-400',
      badgeBg: 'bg-violet-950/80 text-violet-300 border-violet-500/40',
      tag: 'NEON VIOLET',
      stat: 'All File Types',
    },
    {
      tabKey: 'closing-project' as TabKey,
      sheetNo: 7,
      title: 'Closing Project',
      sub: 'BA Opname, ABD & Foto (4MB)',
      colorName: 'red',
      borderStyle: 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]',
      textAccent: 'text-rose-400',
      badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
      tag: 'NEON RED',
      stat: `${metrics.closingCounts['Invoice'] + metrics.closingCounts['Teco Done']} Final`,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* =========================================================================
          SECTION 1: FUTURISTIC CYBERNETIC COMMAND BANNER (MULTI-COLOUR NEON)
      ========================================================================= */}
      <div className="relative rounded-2xl overflow-hidden p-5 sm:p-6 bg-gradient-to-r from-[#060a17] via-[#0b1026] to-[#0d0a1f] border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)]">
        {/* Futuristic Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(34, 211, 238, 0.2) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(168, 85, 247, 0.2) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Multi-Colour Glow Spheres */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -top-16 right-1/4 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-10 w-48 h-48 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Title & Cyber Telemetry Status */}
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                CYBER TELEMETRY ACTIVE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <Cpu className="w-3 h-3 text-purple-400" />
                MULTI-COLOUR ENGINE
              </span>
              <span className="text-[11px] font-mono font-bold text-white/90 drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">
                7-SPECTRUM NEON LIGHT
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-purple-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              FUTURISTIC NEON COMMAND CENTER
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Sistem visualisasi multi-warna terintegrasi: <span className="text-rose-400 font-bold drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]">Red</span>, <span className="text-violet-400 font-bold drop-shadow-[0_0_4px_rgba(139,92,246,0.6)]">Violet</span>, <span className="text-purple-400 font-bold drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]">Purple</span>, <span className="text-orange-400 font-bold drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]">Orange</span>, <span className="text-emerald-400 font-bold drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]">Green</span>, <span className="text-cyan-400 font-bold drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">Blue</span>, dan <span className="text-white font-extrabold drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">White</span> menyajikan pengendalian 7 sheet monitoring secara real-time.
            </p>
          </div>

          {/* Quick Action Matrix & Spectrum Trigger */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNewProject}
              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-900 bg-gradient-to-r from-cyan-400 via-white to-purple-400 hover:from-cyan-300 hover:to-purple-300 shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all cursor-pointer transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-900" />
              <span>+ Proyek Baru</span>
            </button>
            <button
              type="button"
              onClick={() => onJumpToTab('closing-project')}
              className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 border border-rose-400/60 shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-rose-200" />
              <span>Sheet 7 Closing</span>
            </button>
          </div>
        </div>

        {/* Multi-Colour Neon Light Indicator Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto gap-3 custom-scrollbar text-[11px] font-mono">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Filter Warna Neon:</span>
            <button
              type="button"
              onClick={() => {
                setActiveColorFilter('all');
                showToast('Filter: Seluruh Spektrum Warna Aktif');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border ${
                activeColorFilter === 'all'
                  ? 'bg-white text-slate-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              All Spectrum ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveColorFilter('red');
                showToast('Filter Neon Red: Proyek Kritis & Closing Terpilih');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeColorFilter === 'red'
                  ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'bg-slate-900/60 text-rose-400 border-rose-900/50 hover:border-rose-500/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Red ({metrics.redCritical.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveColorFilter('orange');
                showToast('Filter Neon Orange: Pekerjaan Konstruksi & Galian Aktif');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeColorFilter === 'orange'
                  ? 'bg-orange-950 text-orange-300 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                  : 'bg-slate-900/60 text-orange-400 border-orange-900/50 hover:border-orange-500/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Orange ({metrics.orangeConstruction.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveColorFilter('green');
                showToast('Filter Neon Green: Proyek 100% Selesai & Teco Done');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeColorFilter === 'green'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                  : 'bg-slate-900/60 text-emerald-400 border-emerald-900/50 hover:border-emerald-500/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Green ({metrics.greenCompleted.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveColorFilter('purple');
                showToast('Filter Neon Purple & Violet: Approval BAST / BALAP');
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                activeColorFilter === 'purple' || activeColorFilter === 'violet'
                  ? 'bg-purple-950 text-purple-300 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                  : 'bg-slate-900/60 text-purple-400 border-purple-900/50 hover:border-purple-500/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Purple / Violet ({metrics.purpleApproved.length})
            </button>
          </div>

          <div className="text-slate-400 hidden sm:flex items-center gap-2 shrink-0">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Integrity: 100% Online</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: 6 MULTI-COLOUR NEON KPI HOLOGRAPHIC CARDS
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* CARD 1: WHITE / DIAMOND ICE GLOW (Master Database Total) */}
        <div 
          onClick={() => {
            setActiveColorFilter('all');
            showToast(`Total Master Proyek: ${projects.length} data`);
          }}
          className="p-4 rounded-xl bg-gradient-to-b from-[#11162b] to-[#0a0d1a] border border-white/60 shadow-[0_0_18px_rgba(255,255,255,0.3)] hover:shadow-[0_0_28px_rgba(255,255,255,0.5)] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-white text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                NEON WHITE
              </span>
              <Layers className="w-4 h-4 text-white group-hover:rotate-12 transition-transform drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            </div>
            <span className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider block">
              Total Master Proyek
            </span>
            <div className="text-2xl font-black font-mono text-white mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              {projects.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-300 font-mono">
            <span>7 Sheet Terpadu</span>
            <span className="text-white font-bold">100% Sync</span>
          </div>
        </div>

        {/* CARD 2: NEON RED (Kritis / High Priority & Risk Alert) */}
        <div 
          onClick={() => {
            setActiveColorFilter('red');
            showToast(`Filter: ${metrics.redCritical.length} Proyek Kritis / Level 1`);
          }}
          className="p-4 rounded-xl bg-gradient-to-b from-[#210912] to-[#0d0408] border border-rose-500/80 shadow-[0_0_18px_rgba(244,63,94,0.4)] hover:shadow-[0_0_28px_rgba(244,63,94,0.6)] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-pulse">
                NEON RED
              </span>
              <Flame className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            </div>
            <span className="text-[11px] text-rose-200/90 font-semibold uppercase tracking-wider block">
              Level 1 Kritis & Urgent
            </span>
            <div className="text-2xl font-black font-mono text-rose-400 mt-1 drop-shadow-[0_0_10px_rgba(244,63,94,0.7)]">
              {metrics.redCritical.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-900/60 flex items-center justify-between text-[10px] text-rose-300 font-mono">
            <span>Prioritas Lapangan</span>
            <span className="font-bold">Perlu Atensi</span>
          </div>
        </div>

        {/* CARD 3: NEON ORANGE (Active Civil & Galian Sipil) */}
        <div 
          onClick={() => {
            setActiveColorFilter('orange');
            showToast(`Filter: ${metrics.orangeConstruction.length} Proyek Dalam Konstruksi`);
          }}
          className="p-4 rounded-xl bg-gradient-to-b from-[#241308] to-[#0e0703] border border-orange-500/80 shadow-[0_0_18px_rgba(249,115,22,0.4)] hover:shadow-[0_0_28px_rgba(249,115,22,0.6)] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-600 text-white shadow-[0_0_8px_rgba(249,115,22,0.7)]">
                NEON ORANGE
              </span>
              <HardHat className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
            </div>
            <span className="text-[11px] text-orange-200/90 font-semibold uppercase tracking-wider block">
              Konstruksi & Galian
            </span>
            <div className="text-2xl font-black font-mono text-orange-400 mt-1 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]">
              {metrics.orangeConstruction.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-orange-900/60 flex items-center justify-between text-[10px] text-orange-300 font-mono">
            <span>Progress Aktif</span>
            <span className="font-bold">{metrics.activeConstructionRate}% Beban Kerja</span>
          </div>
        </div>

        {/* CARD 4: NEON GREEN (100% Complete & Teco Done) */}
        <div 
          onClick={() => {
            setActiveColorFilter('green');
            showToast(`Filter: ${metrics.greenCompleted.length} Proyek 100% Selesai`);
          }}
          className="p-4 rounded-xl bg-gradient-to-b from-[#091a13] to-[#040c08] border border-emerald-400/80 shadow-[0_0_18px_rgba(16,185,129,0.4)] hover:shadow-[0_0_28px_rgba(16,185,129,0.6)] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.7)]">
                NEON GREEN
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>
            <span className="text-[11px] text-emerald-200/90 font-semibold uppercase tracking-wider block">
              100% Selesai & Teco
            </span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]">
              {metrics.greenCompleted.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-900/60 flex items-center justify-between text-[10px] text-emerald-300 font-mono">
            <span>Rasio Keberhasilan</span>
            <span className="font-bold">{metrics.completionRate}% Target</span>
          </div>
        </div>

        {/* CARD 5: NEON BLUE / CYAN (Fiber Optics Relokasi Network) */}
        <div 
          onClick={() => {
            onJumpToTab('construction-plan');
            showToast(`Total Relokasi: ${metrics.totalFoMeters.toLocaleString('id-ID')} meter`);
          }}
          className="p-4 rounded-xl bg-gradient-to-b from-[#091624] to-[#040b12] border border-cyan-400/80 shadow-[0_0_18px_rgba(6,182,212,0.4)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-black shadow-[0_0_8px_rgba(6,182,212,0.7)]">
                NEON BLUE
              </span>
              <Network className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            </div>
            <span className="text-[11px] text-cyan-200/90 font-semibold uppercase tracking-wider block">
              Panjang FO Relokasi
            </span>
            <div className="text-2xl font-black font-mono text-cyan-400 mt-1 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]">
              {(metrics.totalFoMeters / 1000).toFixed(1)} <span className="text-xs font-sans text-cyan-200">km</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-cyan-900/60 flex items-center justify-between text-[10px] text-cyan-300 font-mono">
            <span>{metrics.totalFoMeters.toLocaleString('id-ID')} m</span>
            <span className="font-bold">Fiber Optic</span>
          </div>
        </div>

        {/* CARD 6: NEON PURPLE & VIOLET (Approvals, BALAP & BAST) */}
        <div 
          onClick={() => {
            setActiveColorFilter('purple');
            showToast(`Filter: ${metrics.purpleApproved.length} Dokumen BAST/BALAP Terverifikasi`);
          }}
          className="p-4 rounded-xl bg-gradient-to-b from-[#180d26] to-[#0a0512] border border-purple-400/80 shadow-[0_0_18px_rgba(168,85,247,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.6)] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500 text-white font-black shadow-[0_0_8px_rgba(168,85,247,0.7)]">
                NEON VIOLET
              </span>
              <ShieldCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            </div>
            <span className="text-[11px] text-purple-200/90 font-semibold uppercase tracking-wider block">
              Approval BAST & Legal
            </span>
            <div className="text-2xl font-black font-mono text-purple-400 mt-1 drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]">
              {metrics.purpleApproved.length}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-purple-900/60 flex items-center justify-between text-[10px] text-purple-300 font-mono">
            <span>Legal Ready</span>
            <span className="font-bold">Finance Approved</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: 7-SHEET FUTURISTIC SPECTRUM DECK (MULTI-COLOUR GLOW)
      ========================================================================= */}
      <div className="p-5 rounded-2xl bg-[#090d1f]/90 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.12)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Multi-Colour Workbook Navigation (7 Sheets Spectrum)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Setiap sheet terhubung dengan warna signature neon tersendiri. Klik untuk akses instan antar halaman.
            </p>
          </div>
          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
            {TAB_CONFIG.length} Terintegrasi
          </span>
        </div>

        {/* 7 Cards Grid with distinct Neon Light styles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {sheetCards.map((sheet) => (
            <button
              key={sheet.tabKey}
              type="button"
              onClick={() => {
                onJumpToTab(sheet.tabKey);
                showToast(`Navigasi ke ${sheet.title} (${sheet.tag})`);
              }}
              className={`p-3.5 rounded-xl border bg-slate-950/70 hover:bg-slate-900/90 ${sheet.borderStyle} transition-all duration-200 text-left cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1 active:translate-y-0`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${sheet.badgeBg}`}>
                    Sheet {sheet.sheetNo}
                  </span>
                  <TabVisualIcon tabKey={sheet.tabKey} size="sm" variant="badge" />
                </div>
                <h4 className={`text-xs font-extrabold text-white group-hover:${sheet.textAccent} transition-colors`}>
                  {sheet.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {sheet.sub}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className={`font-mono font-bold ${sheet.textAccent}`}>
                  {sheet.stat}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 ${sheet.textAccent} transform group-hover:translate-x-1 transition-transform`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: DUAL NEON RADAR HUD (Closing Circuit & Construction Meters)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* RADAR 1: CLOSING PROJECT NEON CIRCUIT (6 STAGES) */}
        <div className="p-5 rounded-2xl bg-[#0a0a1a]/95 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                Alur Tahapan Closing Project (6 Nodes Matrix)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onJumpToTab('closing-project')}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Sheet 7</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Glowing Milestone Progress Track */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            {Object.entries(metrics.closingCounts).map(([statusName, count], idx) => {
              const colorsByStage = [
                'border-slate-600 text-slate-300 bg-slate-900/60',
                'border-amber-500 text-amber-300 bg-amber-950/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
                'border-purple-500 text-purple-300 bg-purple-950/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
                'border-blue-500 text-blue-300 bg-blue-950/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
                'border-cyan-400 text-cyan-300 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
                'border-emerald-400 text-emerald-300 bg-emerald-950/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
              ];

              return (
                <div 
                  key={statusName}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between ${colorsByStage[idx % colorsByStage.length]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase truncate" title={statusName}>
                      {idx + 1}. {statusName}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      statusName === 'Invoice' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]' :
                      statusName === 'Teco Done' ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]' :
                      statusName === 'Approval BAST' ? 'bg-blue-400' :
                      statusName === 'Approval BALAP' ? 'bg-purple-400' :
                      statusName === 'Submit' ? 'bg-amber-400' : 'bg-slate-500'
                    }`} />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-black text-white">{count}</span>
                    <span className="text-[10px] text-slate-400">
                      {Math.round((count / (projects.length || 1)) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Berkas Lengkap (BA Material, BA Labour, ABD Relokasi, ABD Internal & Foto):</span>
            <span className="font-mono font-bold text-emerald-400">100% Upload Ready (*.* & 4MB)</span>
          </div>
        </div>

        {/* RADAR 2: FIBER OPTIC TELEMETRY & SPECIFICATION METERS */}
        <div className="p-5 rounded-2xl bg-[#090d1f]/95 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
                Telemetri Pekerjaan Fiber Optic & Sipil
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onJumpToTab('status-construction')}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Buka Sheet 4</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Visual Progress Bar Meters */}
          <div className="space-y-3 text-xs">
            {/* Meter 1: Penarikan Cable FO */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-300 font-bold">1. Penarikan Kabel FO (Total Jalur)</span>
                <span className="text-cyan-400 font-bold">
                  {metrics.totalFoDoneMeters.toLocaleString('id-ID')} / {metrics.totalFoMeters.toLocaleString('id-ID')} m
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-cyan-900/60">
                <div 
                  style={{ width: `${Math.min(100, Math.round((metrics.totalFoDoneMeters / (metrics.totalFoMeters || 1)) * 100))}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-500"
                />
              </div>
            </div>

            {/* Meter 2: Galian Sipil & Crossing */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-300 font-bold">2. Galian Sipil, Crossing & Subduct</span>
                <span className="text-orange-400 font-bold">{metrics.activeConstructionRate}% Pengerjaan</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-orange-900/60">
                <div 
                  style={{ width: `${Math.min(100, metrics.activeConstructionRate * 1.2 + 40)}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.7)] transition-all duration-500"
                />
              </div>
            </div>

            {/* Meter 3: Handhole & Tiang Pole */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-300 font-bold">3. Instalasi Handhole (HH) & Tiang Pole 8/9</span>
                <span className="text-purple-400 font-bold">85% Terpasang</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-purple-900/60">
                <div 
                  style={{ width: '85%' }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.7)] transition-all duration-500"
                />
              </div>
            </div>

            {/* Meter 4: Splicing Joint Closure & FAT/FDT */}
            <div className="space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-300 font-bold">4. Splicing Joint Closure (24/48 Core) & FAT</span>
                <span className="text-emerald-400 font-bold">92% Core Connected</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-emerald-900/60">
                <div 
                  style={{ width: '92%' }}
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: LIVE CYBER TELEMETRY PROJECT TERMINAL (MULTI-COLOUR LIST)
      ========================================================================= */}
      <div className="p-5 rounded-2xl bg-[#060814]/95 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.1)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Live Cyber Project Terminal
              </h3>
              <span className="text-[11px] text-slate-400">
                Menampilkan {filteredList.length} dari {projects.length} proyek aktif
              </span>
            </div>
          </div>

          {/* Terminal Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari ID, Deskripsi, PO, Vendor..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Futuristic Terminal Rows */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-800/80 rounded-xl">
          <table className="w-full text-xs text-left text-slate-200">
            <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">DSB - ID</th>
                <th className="py-2.5 px-3">Segment Relokasi</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Prioritas</th>
                <th className="py-2.5 px-3">Panjang FO</th>
                <th className="py-2.5 px-3">No. PO</th>
                <th className="py-2.5 px-3">Status Closing</th>
                <th className="py-2.5 px-3 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#070b19]/80 font-mono text-[11px]">
              {filteredList.map((p, idx) => {
                const isCritical = (p.priority || '').toLowerCase().includes('kritis') || (p.priority || '').toLowerCase().includes('level 1');
                const isDone = p.statusConstruction === 'Completed' || p.statusPengajuanClosing === 'Invoice';
                const isClosing = p.statusPengajuanClosing === 'Invoice' || p.statusPengajuanClosing === 'Teco Done';

                return (
                  <tr 
                    key={p.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400 whitespace-nowrap">
                      {p.pmoId}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-white max-w-[220px] truncate" title={p.projectDescription}>
                      {p.projectDescription || '-'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-sky-300">
                        {p.projectCategory || 'GOV APJATEL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[140px]" title={p.namaVendor}>
                      {p.namaVendor || '-'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isCritical 
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}>
                        {p.priority || 'Normal'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 whitespace-nowrap">
                      {Number(p.panjangRelokasi || 0).toLocaleString('id-ID')} m
                    </td>
                    <td className="py-2.5 px-3 text-sky-400 font-bold whitespace-nowrap">
                      {p.poNumber || '-'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        p.statusPengajuanClosing === 'Invoice' 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          : p.statusPengajuanClosing === 'Teco Done'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                          : p.statusPengajuanClosing === 'Approval BAST'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-400'
                          : p.statusPengajuanClosing === 'Approval BALAP'
                          ? 'bg-purple-950/80 text-purple-300 border-purple-400'
                          : p.statusPengajuanClosing === 'Submit'
                          ? 'bg-amber-950/80 text-amber-300 border-amber-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {p.statusPengajuanClosing || p.closingProject?.statusPengajuan || 'Not Yet'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewDetail(p)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors cursor-pointer"
                          title="Lihat Detail Proyek"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditProject(p)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                          title="Edit Proyek"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onJumpToTab('closing-project', p)}
                          className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold transition-colors cursor-pointer"
                          title="Kelola Closing di Sheet 7"
                        >
                          Closing
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
