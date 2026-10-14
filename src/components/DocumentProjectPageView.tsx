import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  FolderOpen, 
  Upload, 
  Table as TableIcon, 
  Search, 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Package, 
  HardHat, 
  FileText, 
  Sparkles, 
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Mail
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { DocumentEmailDispatchType } from '../types/document';
import { DocumentProjectManager } from './DocumentProjectManager';
import { TableView } from './TableView';
import { STATUS_PROJECT_COLUMNS } from '../data/tabColumns';
import { TabVisualIcon } from './TabVisualIcon';
import { SendProjectDocumentEmailModal } from './SendProjectDocumentEmailModal';

interface DocumentProjectPageViewProps {
  projects: ProjectData[];
  filteredProjects: ProjectData[];
  onUpdateProject: (updated: ProjectData) => void;
  onViewDetail: (p: ProjectData) => void;
  onEditProject: (p: ProjectData) => void;
  onJumpToTab: (tab: TabKey, p: ProjectData) => void;
  showToast: (msg: string) => void;
  isNeonMode?: boolean;
  selectedProjectId?: string | null;
  onSelectProject?: (id: string | null) => void;
}

export const DocumentProjectPageView: React.FC<DocumentProjectPageViewProps> = ({
  projects,
  filteredProjects,
  onUpdateProject,
  onViewDetail,
  onEditProject,
  onJumpToTab,
  showToast,
  isNeonMode = false,
  selectedProjectId,
  onSelectProject,
}) => {
  // View mode: 'manager' (interactive document file upload & manager) | 'table' (sheet 5 table view)
  const [viewMode, setViewMode] = useState<'manager' | 'table'>('manager');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    selectedProjectId || (filteredProjects.length > 0 ? filteredProjects[0].id : null)
  );

  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailDispatchType, setEmailDispatchType] = useState<DocumentEmailDispatchType>('pengajuan-material');

  const activeId = selectedProjectId !== undefined && selectedProjectId !== null ? selectedProjectId : internalSelectedId;

  // Currently selected project for document management
  const selectedProject = useMemo(() => {
    if (!activeId) return filteredProjects[0] || projects[0] || null;
    return projects.find((p) => p.id === activeId) || filteredProjects[0] || projects[0] || null;
  }, [projects, filteredProjects, activeId]);

  const handleSelectProject = (proj: ProjectData) => {
    setInternalSelectedId(proj.id);
    if (onSelectProject) {
      onSelectProject(proj.id);
    }
    showToast(`Memilih proyek: ${proj.pmoId} - ${proj.projectDescription}`);
  };

  // Document statistics across all filtered projects
  const docStats = useMemo(() => {
    let totalMaterialDocs = 0;
    let totalBoqDocs = 0;
    let totalCeBoqDocs = 0;

    filteredProjects.forEach((p) => {
      const dp = p.documentProject;
      if (dp) {
        if (dp.pengajuanMaterial?.documents) {
          totalMaterialDocs += Object.values(dp.pengajuanMaterial.documents).filter(Boolean).length;
        }
        if (dp.pengajuanBoqLabour?.documents) {
          totalBoqDocs += Object.values(dp.pengajuanBoqLabour.documents).filter(Boolean).length;
        }
        if (dp.pengajuanCeAndBoqLabour?.documents) {
          totalCeBoqDocs += Object.values(dp.pengajuanCeAndBoqLabour.documents).filter(Boolean).length;
        }
      }
    });

    return {
      totalMaterialDocs,
      totalBoqDocs,
      totalCeBoqDocs,
      totalAllDocs: totalMaterialDocs + totalBoqDocs + totalCeBoqDocs,
    };
  }, [filteredProjects]);

  // Selected project document counts
  const selectedCounts = useMemo(() => {
    if (!selectedProject || !selectedProject.documentProject) {
      return { mat: 0, boq: 0, ceboq: 0, total: 0 };
    }
    const dp = selectedProject.documentProject;
    const mat = dp.pengajuanMaterial?.documents ? Object.values(dp.pengajuanMaterial.documents).filter(Boolean).length : 0;
    const boq = dp.pengajuanBoqLabour?.documents ? Object.values(dp.pengajuanBoqLabour.documents).filter(Boolean).length : 0;
    const ceboq = dp.pengajuanCeAndBoqLabour?.documents ? Object.values(dp.pengajuanCeAndBoqLabour.documents).filter(Boolean).length : 0;
    return { mat, boq, ceboq, total: mat + boq + ceboq };
  }, [selectedProject]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card: Summary & Mode Switcher */}
      <div className={`p-4 rounded-xl border transition-all ${
        isNeonMode 
          ? 'bg-[#0d152a] border-cyan-500/30 text-slate-100 shadow-[0_0_20px_rgba(6,182,212,0.08)]' 
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono border ${
                isNeonMode ? 'bg-amber-950/60 text-amber-400 border-amber-500/40' : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                Halaman 5
              </span>
              <h3 className={`text-base font-extrabold tracking-tight ${isNeonMode ? 'text-amber-400' : 'text-slate-900'}`}>
                Document Project Hub
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                • 3 Kategori Pengajuan Berkas (11 Dokumen per Kategori)
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-3xl leading-relaxed ${isNeonMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Pengelolaan & pengunggahan berkas: <strong>1. Pengajuan Material</strong> (11 Dokumen), <strong>2. Pengajuan BOQ Labour</strong> (11 Dokumen), dan <strong>3. Pengajuan FORM CE Material & BOQ Labour</strong> (11 Dokumen). Mendukung semua jenis file (*.*).
            </p>
          </div>

          {/* View Mode Toggle: Interactive Manager vs Sheet Table */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200 text-xs shrink-0">
            <button
              type="button"
              onClick={() => {
                setViewMode('manager');
                showToast('Tampilan Manajer Dokumen Aktif');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'manager'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>Manajer Berkas Dokumen</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('table');
                showToast('Tampilan Tabel Sheet 5 Aktif');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>Tabel Sheet 5</span>
            </button>
          </div>
        </div>

        {/* 3 Categories KPI Metrics */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className={`p-2.5 rounded-lg border ${
            isNeonMode ? 'bg-[#060a16] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">1. Pengajuan Material</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold text-sky-600 font-mono">
                {docStats.totalMaterialDocs} Berkas
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-medium">
                11 Slot
              </span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border ${
            isNeonMode ? 'bg-[#060a16] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">2. Pengajuan BOQ Labour</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold text-indigo-600 font-mono">
                {docStats.totalBoqDocs} Berkas
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-medium">
                11 Slot
              </span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border ${
            isNeonMode ? 'bg-[#060a16] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">3. Pengajuan CE & BOQ</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold text-purple-600 font-mono">
                {docStats.totalCeBoqDocs} Berkas
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-medium">
                11 Slot
              </span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border ${
            isNeonMode ? 'bg-[#060a16] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Berkas Terunggah</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold text-emerald-600 font-mono">
                {docStats.totalAllDocs} File
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                Semua Proyek
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'manager' ? (
        <div className="space-y-4">
          {/* Project Selector Bar */}
          <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isNeonMode ? 'bg-[#0a0f1e] border-cyan-500/20 text-slate-200' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">
                Pilih Proyek:
              </span>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value);
                  if (found) handleSelectProject(found);
                }}
                className={`w-full sm:w-80 px-3 py-1.5 text-xs rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${
                  isNeonMode 
                    ? 'bg-slate-900 border-slate-700 text-slate-100' 
                    : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {filteredProjects.map((p) => {
                  const dp = p.documentProject;
                  const total = dp ? 
                    (Object.values(dp.pengajuanMaterial?.documents || {}).filter(Boolean).length) +
                    (Object.values(dp.pengajuanBoqLabour?.documents || {}).filter(Boolean).length) +
                    (Object.values(dp.pengajuanCeAndBoqLabour?.documents || {}).filter(Boolean).length) : 0;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.pmoId} - {p.projectDescription || 'No description'} ({total}/33 Dokumen)
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
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Detail Lengkap</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditProject(selectedProject)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Edit Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToTab('status-construction', selectedProject)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <TabVisualIcon tabKey="status-construction" size="sm" variant="minimal" />
                  <span>Ke Status Construction</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailDispatchType('pengajuan-material');
                    setIsEmailModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Kirim pengajuan berkas via email dengan opsi Material, BOQ Labour, atau Gabungan serta CC"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim via Email</span>
                </button>
              </div>
            )}
          </div>

          {/* Selected Project Card Summary */}
          {selectedProject ? (
            <div className="space-y-4">
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-800 text-sm bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {selectedProject.pmoId}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedProject.projectDescription || '-'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      Area: <strong className="text-slate-800">{selectedProject.areaKota || '-'}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Vendor: <strong className="text-emerald-700">{selectedProject.namaVendor || '-'}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Project - ID</span>
                    <span className="font-mono font-bold text-slate-800">{selectedProject.projectId || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">PIC Govrel / Internal</span>
                    <span className="text-slate-800">{selectedProject.picSectionHead || '-'} / {selectedProject.waspangDsb || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Status Pengajuan</span>
                    <span className="font-semibold text-indigo-700">{selectedProject.statusPengajuanProject || 'Normal'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Kelengkapan Total</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {selectedCounts.total}/33 Berkas ({Math.round((selectedCounts.total / 33) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* The Dedicated 3-Category Document Project Manager */}
              <DocumentProjectManager
                project={selectedProject}
                onUpdateProject={onUpdateProject}
              />
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">Belum ada proyek yang dipilih atau tidak ada data yang cocok dengan filter.</p>
            </div>
          )}
        </div>
      ) : (
        /* Sheet Table View */
        <div className="space-y-3">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-800 flex items-center justify-between">
            <span>Tabel data Sheet 5 (Document Project). Klik tombol <strong>Kelola Dokumen</strong> pada baris manapun untuk membuka upload berkas 3 kategori.</span>
          </div>

          <TableView
            columns={STATUS_PROJECT_COLUMNS}
            data={filteredProjects}
            activeTab="status-project"
            onEdit={onEditProject}
            onDelete={() => {}}
            onViewDetail={onViewDetail}
            onJumpToTab={onJumpToTab}
            onNewProject={() => {}}
          />
        </div>
      )}

      {/* Modal Kirim Dokumen via Email */}
      {selectedProject && (
        <SendProjectDocumentEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          project={selectedProject}
          initialDispatchType={emailDispatchType}
          onEmailSent={(updatedProject) => {
            onUpdateProject(updatedProject);
          }}
          showToast={showToast}
          isNeonMode={isNeonMode}
        />
      )}
    </div>
  );
};
