import React, { useState, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  Table as TableIcon, 
  BarChart3, 
  Grid3X3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck, 
  FileImage, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  Hash, 
  ArrowRight, 
  Check, 
  ExternalLink,
  Edit3,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { 
  UploadedFileMeta, 
  ClosingProjectData, 
  CLOSING_PROJECT_SLOTS, 
  DocumentProjectSlotDef 
} from '../types/document';
import { STATUS_PENGAJUAN_CLOSING_OPTIONS } from '../data/dropdownOptions';
import { CLOSING_PROJECT_COLUMNS } from '../data/tabColumns';
import { TableView } from './TableView';
import { TabVisualIcon } from './TabVisualIcon';

interface ClosingProjectPageViewProps {
  projects: ProjectData[];
  filteredProjects: ProjectData[];
  onUpdateProject: (updated: ProjectData) => void;
  onViewDetail: (p: ProjectData) => void;
  onEditProject: (p: ProjectData) => void;
  onJumpToTab: (tab: TabKey, p: ProjectData) => void;
  showToast: (msg: string) => void;
  isNeonMode?: boolean;
}

export const ClosingProjectPageView: React.FC<ClosingProjectPageViewProps> = ({
  projects,
  filteredProjects,
  onUpdateProject,
  onViewDetail,
  onEditProject,
  onJumpToTab,
  showToast,
  isNeonMode = true,
}) => {
  // View mode: 'analytics-manager' | 'status-matrix' | 'sheet-table'
  const [viewMode, setViewMode] = useState<'analytics-manager' | 'status-matrix' | 'sheet-table'>('analytics-manager');

  // Selected project for editing closing details
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    filteredProjects.length > 0 ? filteredProjects[0].id : (projects.length > 0 ? projects[0].id : null)
  );

  // Lightbox preview for uploaded files
  const [previewFile, setPreviewFile] = useState<UploadedFileMeta | null>(null);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSlotKey, setUploadingSlotKey] = useState<string | null>(null);
  const [uploadingTargetProjectId, setUploadingTargetProjectId] = useState<string | null>(null);

  // Selected project object
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return filteredProjects[0] || projects[0] || null;
    return projects.find((p) => p.id === selectedProjectId) || filteredProjects[0] || projects[0] || null;
  }, [projects, filteredProjects, selectedProjectId]);

  // Ensure closing project data structure exists for selected project with non-blank values
  const closingData: ClosingProjectData = useMemo(() => {
    if (!selectedProject) return { documents: {} };
    const today = new Date().toISOString().split('T')[0];
    const numId = selectedProject.pmoId?.replace(/[^0-9]/g, '') || '0000001';
    const defaultDate = selectedProject.prajectDate || selectedProject.projectCreateDate || today;
    const defaultPo = selectedProject.poNumber || `PO-45000${numId.slice(-4).padStart(4, '0')}`;
    const defaultStatus = selectedProject.statusPengajuanClosing || selectedProject.closingProject?.statusPengajuan || 'Submit';
    const defaultRemarks = selectedProject.closingProject?.remarks || selectedProject.closingRemarks || 'Dokumen penutupan proyek lengkap dan terverifikasi.';

    const rawDocs = selectedProject.closingProject?.documents || {};
    const docs = { ...rawDocs };

    if (!docs['baOpnameMaterial'] && selectedProject.baOpnameMaterial) {
      docs['baOpnameMaterial'] = {
        name: selectedProject.baOpnameMaterial,
        size: 1420000,
        type: 'application/pdf',
        uploadedAt: defaultDate,
      };
    }
    if (!docs['baOpnameLabour'] && selectedProject.baOpnameLabour) {
      docs['baOpnameLabour'] = {
        name: selectedProject.baOpnameLabour,
        size: 980000,
        type: 'application/pdf',
        uploadedAt: defaultDate,
      };
    }
    if (!docs['abdRelokasi'] && selectedProject.closingAbdRelokasi) {
      docs['abdRelokasi'] = {
        name: selectedProject.closingAbdRelokasi,
        size: 3200000,
        type: 'application/octet-stream',
        uploadedAt: defaultDate,
      };
    }
    if (!docs['abdInternal'] && selectedProject.closingAbdInternal) {
      docs['abdInternal'] = {
        name: selectedProject.closingAbdInternal,
        size: 2100000,
        type: 'application/pdf',
        uploadedAt: defaultDate,
      };
    }
    if (!docs['fotoDokumentasi'] && selectedProject.fotoDokumentasi) {
      docs['fotoDokumentasi'] = {
        name: selectedProject.fotoDokumentasi,
        size: 3800000,
        type: 'image/jpeg',
        uploadedAt: defaultDate,
      };
    }

    return {
      projectDate: selectedProject.closingProject?.projectDate || defaultDate,
      poNumber: selectedProject.closingProject?.poNumber || defaultPo,
      statusPengajuan: defaultStatus,
      remarks: defaultRemarks,
      documents: docs,
      updatedAt: selectedProject.closingProject?.updatedAt || new Date().toISOString(),
    };
  }, [selectedProject]);

  // Status Pengajuan Closing Metrics across all filtered projects
  const statusStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Not Yet': 0,
      'Submit': 0,
      'Approval BALAP': 0,
      'Approval BAST': 0,
      'Teco Done': 0,
      'Invoice': 0,
    };

    let totalWithPo = 0;
    let totalWithDate = 0;
    let totalBaMaterial = 0;
    let totalBaLabour = 0;
    let totalAbdRelokasi = 0;
    let totalAbdInternal = 0;
    let totalFoto = 0;

    filteredProjects.forEach((p) => {
      const st = p.statusPengajuanClosing || p.closingProject?.statusPengajuan || 'Not Yet';
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts['Not Yet'] += 1;
      }

      if (p.poNumber || p.closingProject?.poNumber) totalWithPo += 1;
      if (p.prajectDate || p.closingProject?.projectDate || p.projectCreateDate) totalWithDate += 1;

      const docs = p.closingProject?.documents || {};
      if (docs['baOpnameMaterial'] || p.baOpnameMaterial) totalBaMaterial += 1;
      if (docs['baOpnameLabour'] || p.baOpnameLabour) totalBaLabour += 1;
      if (docs['abdRelokasi'] || p.closingAbdRelokasi) totalAbdRelokasi += 1;
      if (docs['abdInternal'] || p.closingAbdInternal) totalAbdInternal += 1;
      if (docs['fotoDokumentasi'] || p.fotoDokumentasi) totalFoto += 1;
    });

    const total = filteredProjects.length || 1;

    return {
      counts,
      totalWithPo,
      totalWithDate,
      totalBaMaterial,
      totalBaLabour,
      totalAbdRelokasi,
      totalAbdInternal,
      totalFoto,
      totalProjects: filteredProjects.length,
      completedClosing: counts['Invoice'] + counts['Teco Done'],
      completionPct: Math.round(((counts['Invoice'] + counts['Teco Done']) / total) * 100),
    };
  }, [filteredProjects]);

  // Handle file upload for any file type (*.*) with target project support
  const handleTriggerUpload = (slotKey: string, targetProjectId?: string) => {
    setUploadingSlotKey(slotKey);
    setUploadingTargetProjectId(targetProjectId || selectedProjectId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingSlotKey) return;

    const targetProjId = uploadingTargetProjectId || selectedProjectId;
    const targetProj = projects.find((p) => p.id === targetProjId) || selectedProject;
    if (!targetProj) return;

    // Strict validation for Foto Dokumentasi (Maximum size 4 MB)
    const MAX_FOTO_SIZE = 4 * 1024 * 1024; // 4 MB
    if (uploadingSlotKey === 'fotoDokumentasi' && file.size > MAX_FOTO_SIZE) {
      showToast(`Peringatan: Ukuran berkas "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 4 MB untuk Foto Dokumentasi. Silakan pilih berkas maks. 4 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const fileMeta: UploadedFileMeta = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().split('T')[0],
        dataUrl,
      };

      const existingClosing = targetProj.closingProject || {
        projectDate: targetProj.prajectDate || targetProj.projectCreateDate || '',
        poNumber: targetProj.poNumber || '',
        statusPengajuan: targetProj.statusPengajuanClosing || 'Not Yet',
        documents: {},
      };

      const updatedDocs = {
        ...(existingClosing.documents || {}),
        [uploadingSlotKey]: fileMeta,
      };

      const updatedClosing: ClosingProjectData = {
        ...existingClosing,
        documents: updatedDocs,
        updatedAt: new Date().toISOString(),
      };

      const updatedProj: ProjectData = {
        ...targetProj,
        closingProject: updatedClosing,
        baOpnameMaterial: uploadingSlotKey === 'baOpnameMaterial' ? file.name : targetProj.baOpnameMaterial,
        baOpnameLabour: uploadingSlotKey === 'baOpnameLabour' ? file.name : targetProj.baOpnameLabour,
        closingAbdRelokasi: uploadingSlotKey === 'abdRelokasi' ? file.name : targetProj.closingAbdRelokasi,
        closingAbdInternal: uploadingSlotKey === 'abdInternal' ? file.name : targetProj.closingAbdInternal,
        fotoDokumentasi: uploadingSlotKey === 'fotoDokumentasi' ? file.name : targetProj.fotoDokumentasi,
      };

      onUpdateProject(updatedProj);
      showToast(`Berkas ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB) berhasil diunggah untuk proyek ${targetProj.pmoId}.`);
    };

    reader.readAsDataURL(file);
  };

  // Remove uploaded file
  const handleRemoveFile = (slotKey: string, targetProjectId?: string) => {
    const targetProjId = targetProjectId || selectedProjectId;
    const targetProj = projects.find((p) => p.id === targetProjId) || selectedProject;
    if (!targetProj) return;

    const existingClosing = targetProj.closingProject || { documents: {} };
    const updatedDocs = { ...(existingClosing.documents || {}) };
    delete updatedDocs[slotKey];

    const updatedClosing: ClosingProjectData = {
      ...existingClosing,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };

    const updatedProj: ProjectData = {
      ...targetProj,
      closingProject: updatedClosing,
      baOpnameMaterial: slotKey === 'baOpnameMaterial' ? undefined : targetProj.baOpnameMaterial,
      baOpnameLabour: slotKey === 'baOpnameLabour' ? undefined : targetProj.baOpnameLabour,
      closingAbdRelokasi: slotKey === 'abdRelokasi' ? undefined : targetProj.closingAbdRelokasi,
      closingAbdInternal: slotKey === 'abdInternal' ? undefined : targetProj.closingAbdInternal,
      fotoDokumentasi: slotKey === 'fotoDokumentasi' ? undefined : targetProj.fotoDokumentasi,
    };

    onUpdateProject(updatedProj);
    showToast(`Berkas pada slot ${slotKey} berhasil dihapus.`);
  };

  // Update Praject Date, No. PO, Status Pengajuan
  const handleUpdateClosingField = (field: keyof ClosingProjectData, value: string) => {
    if (!selectedProject) return;

    const updatedClosing: ClosingProjectData = {
      ...closingData,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    const updatedProj: ProjectData = {
      ...selectedProject,
      closingProject: updatedClosing,
      prajectDate: field === 'projectDate' ? value : (selectedProject.prajectDate || value),
      poNumber: field === 'poNumber' ? value : selectedProject.poNumber,
      statusPengajuanClosing: field === 'statusPengajuan' ? value : selectedProject.statusPengajuanClosing,
      closingRemarks: field === 'remarks' ? value : selectedProject.closingRemarks,
    };

    onUpdateProject(updatedProj);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Status badge styling helper
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Invoice':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Teco Done':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'Approval BAST':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Approval BALAP':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Submit':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  // Milestone order for status matrix
  const matrixMilestones = [
    { key: 'Not Yet', label: '1. Not Yet', color: 'slate' },
    { key: 'Submit', label: '2. Submit', color: 'amber' },
    { key: 'Approval BALAP', label: '3. Approval BALAP', color: 'purple' },
    { key: 'Approval BAST', label: '4. Approval BAST', color: 'blue' },
    { key: 'Teco Done', label: '5. Teco Done', color: 'cyan' },
    { key: 'Invoice', label: '6. Invoice', color: 'emerald' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Hidden file input supporting ALL file types */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="*"
        className="hidden"
      />

      {/* Top Banner: Closing Project Overview & View Mode Switcher */}
      <div className={`p-4 rounded-xl border transition-all ${
        isNeonMode 
          ? 'bg-[#0d152a] border-cyan-500/30 text-slate-100 shadow-[0_0_20px_rgba(6,182,212,0.08)]' 
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono border ${
                isNeonMode ? 'bg-teal-950/60 text-teal-400 border-teal-500/40' : 'bg-teal-50 text-teal-800 border-teal-300'
              }`}>
                Halaman 7
              </span>
              <h3 className={`text-base font-extrabold tracking-tight ${isNeonMode ? 'text-teal-400' : 'text-slate-900'}`}>
                Closing Project Management
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                • Praject Date, No. PO, BA Opname, ABD, Foto Dokumentasi & Analitik
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isNeonMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Pengendalian penutupan proyek: pembaruan <strong>Praject Date</strong>, input <strong>No. PO</strong>, monitoring <strong>Status Pengajuan</strong> (Not Yet, Submit, Approval BALAP, Approval BAST, Teco Done, Invoice), serta pengunggahan berkas <strong>BA Opname Material, BA Opname Labour, ABD Relokasi, ABD Internal, dan Foto Dokumentasi</strong> (mendukung semua jenis file *.*).
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-xs shrink-0 flex-wrap gap-1">
            <button
              type="button"
              onClick={() => {
                setViewMode('analytics-manager');
                showToast('Tampilan Analitik & Manajer Berkas Closing Aktif');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'analytics-manager'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analitik & Berkas Closing</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('status-matrix');
                showToast('Tampilan Matriks Status Proyek Aktif');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'status-matrix'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Matriks Status Proyek</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('sheet-table');
                showToast('Tampilan Tabel Sheet 7 Aktif');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'sheet-table'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel Sheet 7</span>
            </button>
          </div>
        </div>

        {/* 6 Status Pengajuan Summary Counters */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {STATUS_PENGAJUAN_CLOSING_OPTIONS.map((opt) => {
            const count = statusStats.counts[opt] || 0;
            return (
              <div 
                key={opt}
                className={`p-2 rounded-lg border flex flex-col justify-between ${
                  isNeonMode ? 'bg-[#080d1e] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase truncate" title={opt}>
                    {opt}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    opt === 'Invoice' ? 'bg-emerald-400' :
                    opt === 'Teco Done' ? 'bg-cyan-400' :
                    opt === 'Approval BAST' ? 'bg-blue-400' :
                    opt === 'Approval BALAP' ? 'bg-purple-400' :
                    opt === 'Submit' ? 'bg-amber-400' : 'bg-slate-500'
                  }`} />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-base font-extrabold font-mono text-white">
                    {count}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round((count / (statusStats.totalProjects || 1)) * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main View Area based on viewMode */}
      {viewMode === 'analytics-manager' ? (
        <div className="space-y-4">
          {/* SECTION 1: Analitik Grafik Proyek & Kelengkapan Dokumen Closing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Visual Bar / Donut Chart: Status Pengajuan Proyek */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
              isNeonMode ? 'bg-[#0a0f20] border-cyan-500/20 text-slate-100' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-teal-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Analitik Status Pengajuan
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {statusStats.totalProjects} Proyek Terfilter
                </span>
              </div>

              {/* Progress Bar Breakdown */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  style={{ width: `${(statusStats.counts['Invoice'] / (statusStats.totalProjects || 1)) * 100}%` }} 
                  className="bg-emerald-500 h-full transition-all" 
                  title={`Invoice: ${statusStats.counts['Invoice']}`}
                />
                <div 
                  style={{ width: `${(statusStats.counts['Teco Done'] / (statusStats.totalProjects || 1)) * 100}%` }} 
                  className="bg-cyan-500 h-full transition-all" 
                  title={`Teco Done: ${statusStats.counts['Teco Done']}`}
                />
                <div 
                  style={{ width: `${(statusStats.counts['Approval BAST'] / (statusStats.totalProjects || 1)) * 100}%` }} 
                  className="bg-blue-500 h-full transition-all" 
                  title={`Approval BAST: ${statusStats.counts['Approval BAST']}`}
                />
                <div 
                  style={{ width: `${(statusStats.counts['Approval BALAP'] / (statusStats.totalProjects || 1)) * 100}%` }} 
                  className="bg-purple-500 h-full transition-all" 
                  title={`Approval BALAP: ${statusStats.counts['Approval BALAP']}`}
                />
                <div 
                  style={{ width: `${(statusStats.counts['Submit'] / (statusStats.totalProjects || 1)) * 100}%` }} 
                  className="bg-amber-500 h-full transition-all" 
                  title={`Submit: ${statusStats.counts['Submit']}`}
                />
                <div 
                  style={{ width: `${(statusStats.counts['Not Yet'] / (statusStats.totalProjects || 1)) * 100}%` }} 
                  className="bg-slate-600 h-full transition-all" 
                  title={`Not Yet: ${statusStats.counts['Not Yet']}`}
                />
              </div>

              {/* Detailed Breakdown List */}
              <div className="space-y-1.5 text-xs">
                {STATUS_PENGAJUAN_CLOSING_OPTIONS.map((opt) => {
                  const cnt = statusStats.counts[opt] || 0;
                  const pct = Math.round((cnt / (statusStats.totalProjects || 1)) * 100);
                  return (
                    <div key={opt} className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/40 border border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          opt === 'Invoice' ? 'bg-emerald-400' :
                          opt === 'Teco Done' ? 'bg-cyan-400' :
                          opt === 'Approval BAST' ? 'bg-blue-400' :
                          opt === 'Approval BALAP' ? 'bg-purple-400' :
                          opt === 'Submit' ? 'bg-amber-400' : 'bg-slate-500'
                        }`} />
                        <span className="text-slate-300 font-medium">{opt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{cnt}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kelengkapan 5 Berkas Closing Proyek */}
            <div className={`p-4 rounded-xl border space-y-3.5 lg:col-span-2 ${
              isNeonMode ? 'bg-[#0a0f20] border-cyan-500/20 text-slate-100' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Kelengkapan 5 Dokumen Berkas Closing (Semua Proyek)
                  </h4>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                  Mendukung Semua Format File (*.*)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* BA Opname Material */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">1. BA Opname Material</span>
                    <span className="font-mono font-bold text-sky-400">
                      {statusStats.totalBaMaterial} / {statusStats.totalProjects} Proyek
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${(statusStats.totalBaMaterial / (statusStats.totalProjects || 1)) * 100}%` }}
                      className="bg-sky-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Dokumen opname pengeluaran & pemakaian material</span>
                </div>

                {/* BA Opname Labour */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">2. BA Opname Labour</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {statusStats.totalBaLabour} / {statusStats.totalProjects} Proyek
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${(statusStats.totalBaLabour / (statusStats.totalProjects || 1)) * 100}%` }}
                      className="bg-indigo-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Dokumen opname jasa pengerjaan & penarikan FO</span>
                </div>

                {/* ABD Relokasi */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">3. ABD Relokasi</span>
                    <span className="font-mono font-bold text-teal-400">
                      {statusStats.totalAbdRelokasi} / {statusStats.totalProjects} Proyek
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${(statusStats.totalAbdRelokasi / (statusStats.totalProjects || 1)) * 100}%` }}
                      className="bg-teal-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">As-Built Drawing relokasi lapangan aktual</span>
                </div>

                {/* ABD Internal */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">4. ABD Internal</span>
                    <span className="font-mono font-bold text-purple-400">
                      {statusStats.totalAbdInternal} / {statusStats.totalProjects} Proyek
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${(statusStats.totalAbdInternal / (statusStats.totalProjects || 1)) * 100}%` }}
                      className="bg-purple-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">As-Built Drawing jaringan internal Linknet</span>
                </div>

                {/* Foto Dokumentasi */}
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">5. Foto Dokumentasi Proyek</span>
                    <span className="font-mono font-bold text-amber-400">
                      {statusStats.totalFoto} / {statusStats.totalProjects} Proyek
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      style={{ width: `${(statusStats.totalFoto / (statusStats.totalProjects || 1)) * 100}%` }}
                      className="bg-amber-500 h-full rounded-full transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Bukti visual lapangan, tiang, kabel, joint closure, gali/tarik FO (Gambar/PDF/ZIP)</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Manajer Berkas Closing & Form Proyek Terpilih */}
          <div className="space-y-4">
            {/* Project Selector Bar */}
            <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              isNeonMode ? 'bg-[#0a0f1e] border-teal-500/20 text-slate-200' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-300 whitespace-nowrap shrink-0">
                  Pilih Proyek Closing:
                </span>
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    const found = projects.find((p) => p.id === e.target.value);
                    if (found) {
                      showToast(`Memilih proyek closing: ${found.pmoId} - ${found.projectDescription}`);
                    }
                  }}
                  className="w-full sm:w-96 px-3 py-1.5 text-xs rounded-lg border font-medium bg-slate-900 border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                >
                  {filteredProjects.map((p) => {
                    const st = p.statusPengajuanClosing || p.closingProject?.statusPengajuan || 'Not Yet';
                    return (
                      <option key={p.id} value={p.id}>
                        {p.pmoId} - {p.projectDescription || 'No description'} [{st}]
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedProject && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <button
                    type="button"
                    onClick={() => onViewDetail(selectedProject)}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Detail Lengkap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditProject(selectedProject)}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Proyek</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onJumpToTab('status-construction', selectedProject)}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <TabVisualIcon tabKey="status-construction" size="sm" variant="minimal" />
                    <span>Status Construction</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onJumpToTab('status-project', selectedProject)}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-800/60 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <TabVisualIcon tabKey="status-project" size="sm" variant="minimal" />
                    <span>Document Project</span>
                  </button>
                </div>
              )}
            </div>

            {/* Selected Project Interactive Closing Editor */}
            {selectedProject ? (
              <div className="space-y-4">
                {/* Identity & Core Closing Fields: Praject Date, No. PO, Status Pengajuan */}
                <div className={`p-4 rounded-xl border space-y-4 ${
                  isNeonMode ? 'bg-[#080d1e] border-teal-500/20 text-slate-200' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-teal-400 text-sm bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                        {selectedProject.pmoId}
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {selectedProject.projectDescription || '-'}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Area: <strong className="text-white">{selectedProject.areaKota || '-'}</strong></span>
                      <span>•</span>
                      <span className="text-slate-400">Vendor: <strong className="text-emerald-400">{selectedProject.namaVendor || '-'}</strong></span>
                    </div>
                  </div>

                  {/* Form Inputs: Praject Date, No. PO, Status Pengajuan, Remarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                    {/* Praject Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>Praject Date (Tanggal Closing)</span>
                      </label>
                      <input
                        type="date"
                        value={closingData.projectDate || ''}
                        onChange={(e) => handleUpdateClosingField('projectDate', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* No. PO */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-sky-400" />
                        <span>No. PO (Purchase Order)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: PO-4500098231"
                        value={closingData.poNumber || ''}
                        onChange={(e) => handleUpdateClosingField('poNumber', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-slate-900 border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    {/* Status Pengajuan Closing */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Status Pengajuan</span>
                      </label>
                      <select
                        value={closingData.statusPengajuan || 'Not Yet'}
                        onChange={(e) => handleUpdateClosingField('statusPengajuan', e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs rounded-lg border font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer ${
                          getStatusBadgeClass(closingData.statusPengajuan)
                        } bg-slate-900`}
                      >
                        {STATUS_PENGAJUAN_CLOSING_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900 text-white font-normal">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Catatan / Remarks Closing */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Catatan Closing Project
                      </label>
                      <input
                        type="text"
                        placeholder="Keterangan dokumen/approvals..."
                        value={closingData.remarks || ''}
                        onChange={(e) => handleUpdateClosingField('remarks', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 5 Document Upload Slots */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  isNeonMode ? 'bg-[#080d1e] border-teal-500/20 text-slate-200' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-teal-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                        Berkas Dokumen Closing Project ({CLOSING_PROJECT_SLOTS.length} Dokumen)
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Format: Bebas / Semua Format File (*.*)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CLOSING_PROJECT_SLOTS.map((slot) => {
                      const fileMeta = closingData.documents?.[slot.key];
                      const isUploaded = Boolean(fileMeta);

                      return (
                        <div
                          key={slot.key}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            isUploaded
                              ? 'bg-slate-900/80 border-emerald-500/40 text-slate-200 shadow-sm'
                              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                Dokumen #{slot.num}
                              </span>
                              {isUploaded ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Terunggah</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Belum Ada
                                </span>
                              )}
                            </div>

                            <h5 className="text-xs font-bold text-white mb-1">
                              {slot.label}
                            </h5>
                            <p className="text-[10px] text-slate-400 mb-2">
                              {slot.fileHint}
                            </p>

                            {/* Uploaded File Info Card */}
                            {fileMeta && (
                              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 mb-3 space-y-1 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-200 truncate max-w-[180px]" title={fileMeta.name}>
                                    {fileMeta.name}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {formatFileSize(fileMeta.size)}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 block">
                                  Diunggah: {fileMeta.uploadedAt}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                            {isUploaded ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleTriggerUpload(slot.key)}
                                  className="flex-1 py-1.5 px-2.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-center"
                                >
                                  Ganti File
                                </button>
                                {fileMeta?.dataUrl && (
                                  <a
                                    href={fileMeta.dataUrl}
                                    download={fileMeta.name}
                                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
                                    title="Unduh Berkas"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                                {fileMeta?.dataUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewFile(fileMeta)}
                                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors cursor-pointer"
                                    title="Pratinjau Berkas"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(slot.key)}
                                  className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/80 text-rose-400 transition-colors cursor-pointer"
                                  title="Hapus Berkas"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTriggerUpload(slot.key)}
                                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-teal-600/30"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Unggah {slot.label}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Tidak ada proyek yang sesuai dengan filter.</p>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'status-matrix' ? (
        /* SECTION 3: Matriks Status Proyek */
        <div className="space-y-3">
          <div className={`p-4 rounded-xl border space-y-3 ${
            isNeonMode ? 'bg-[#0a0f20] border-purple-500/30 text-slate-100' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white">
                  Matriks Tahapan Status Closing Proyek
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                Alur: 1. Not Yet ➔ 2. Submit ➔ 3. Approval BALAP ➔ 4. Approval BAST ➔ 5. Teco Done ➔ 6. Invoice
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto custom-scrollbar border border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left text-slate-200">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">DSB - ID</th>
                    <th className="py-2.5 px-3">Segment Relokasi</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3">Praject Date</th>
                    <th className="py-2.5 px-3">No. PO</th>
                    {matrixMilestones.map((m) => (
                      <th key={m.key} className="py-2.5 px-2 text-center whitespace-nowrap">
                        {m.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center">Kelengkapan Dokumen</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-[#060a16]">
                  {filteredProjects.map((p, idx) => {
                    const currentStatus = p.statusPengajuanClosing || p.closingProject?.statusPengajuan || 'Not Yet';
                    const docs = p.closingProject?.documents || {};
                    const docCount = Object.values(docs).filter(Boolean).length;
                    const statusIndex = matrixMilestones.findIndex((m) => m.key === currentStatus);

                    return (
                      <tr 
                        key={p.id}
                        className={`hover:bg-slate-900/60 transition-colors ${
                          selectedProjectId === p.id ? 'bg-teal-950/30' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-400">{p.pmoId}</td>
                        <td className="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate" title={p.projectDescription}>
                          {p.projectDescription || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{p.namaVendor || '-'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {p.prajectDate || p.closingProject?.projectDate || p.projectCreateDate || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-400">
                          {p.poNumber || p.closingProject?.poNumber || '-'}
                        </td>

                        {/* Milestone indicators */}
                        {matrixMilestones.map((m, mIdx) => {
                          const isCurrent = m.key === currentStatus;
                          const isPassed = mIdx < statusIndex;

                          return (
                            <td key={m.key} className="py-2.5 px-2 text-center">
                              {isCurrent ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(m.key)}`}>
                                  {m.key}
                                </span>
                              ) : isPassed ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 mx-auto">
                                  <Check className="w-3 h-3" />
                                </span>
                              ) : (
                                <span className="inline-block w-2 h-2 rounded-full bg-slate-800 mx-auto" />
                              )}
                            </td>
                          );
                        })}

                        {/* Doc count */}
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            docCount === 5 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                              : docCount > 0 
                              ? 'bg-amber-950 text-amber-400 border border-amber-800' 
                              : 'bg-slate-900 text-slate-500'
                          }`}>
                            {docCount}/5 Berkas
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              setViewMode('analytics-manager');
                              showToast(`Buka manajer berkas untuk ${p.pmoId}`);
                            }}
                            className="px-2 py-1 rounded text-[11px] font-bold bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
                          >
                            Kelola
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SECTION 4: Sheet 7 Table View */
        <div className="space-y-3">
          <div className="bg-teal-950/60 border border-teal-800/80 rounded-lg p-3 text-xs text-teal-300 flex items-center justify-between">
            <span>Tabel data Sheet 7 (Closing Project). Menampilkan status pengajuan, No. PO, Praject Date, dan kelengkapan 5 berkas closing.</span>
          </div>

          <TableView
            columns={CLOSING_PROJECT_COLUMNS}
            data={filteredProjects}
            activeTab="closing-project"
            onEdit={onEditProject}
            onDelete={() => {}}
            onViewDetail={onViewDetail}
            onJumpToTab={onJumpToTab}
            onNewProject={() => {}}
          />
        </div>
      )}

      {/* Lightbox File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {previewFile.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={previewFile.dataUrl} 
                  alt={previewFile.name} 
                  className="max-h-[55vh] object-contain rounded"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-16 h-16 text-teal-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold">{previewFile.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Tipe: {previewFile.type} • Ukuran: {formatFileSize(previewFile.size)}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">
                Diunggah: {previewFile.uploadedAt}
              </span>
              <div className="flex items-center gap-2">
                {previewFile.dataUrl && (
                  <a
                    href={previewFile.dataUrl}
                    download={previewFile.name}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
