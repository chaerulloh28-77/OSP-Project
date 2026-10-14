import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  ExternalLink, 
  Layers, 
  Building2, 
  Calendar, 
  HardHat, 
  FileCheck2, 
  Activity,
  Ruler, 
  Clock, 
  ArrowRight, 
  GitCommit, 
  ShieldCheck,
  Mail
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { TabVisualIcon } from './TabVisualIcon';
import { PriorityBadge } from './PriorityBadge';
import { SendProjectDocumentEmailModal } from './SendProjectDocumentEmailModal';

interface ProjectDetailDrawerProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: ProjectData) => void;
  onJumpToTab: (tab: TabKey, project: ProjectData) => void;
  onUpdateProject?: (updated: ProjectData) => void;
  isNeonMode?: boolean;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
  onJumpToTab,
  onUpdateProject,
  isNeonMode = true,
}) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-2xl shadow-2xl flex flex-col transition-all duration-300 ${
          isNeonMode 
            ? 'bg-[#080d1e] text-slate-100 border-l border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.2)]' 
            : 'bg-white text-slate-800 border-l border-slate-200'
        }`}>
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-sky-400">{project.pmoId}</span>
                  {project.projectId && (
                    <span className="text-xs text-slate-400 font-mono">({project.projectId})</span>
                  )}
                  {project.priority && (
                    <PriorityBadge priority={project.priority} showLevel={true} size="xs" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white truncate max-w-md">
                  {project.projectDescription || <span className="text-slate-400 italic font-normal text-xs">(Tanpa deskripsi)</span>}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEdit(project)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Jump Buttons Across Tabs */}
          <div className={`px-5 py-2.5 border-b flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs transition-colors ${
            isNeonMode ? 'bg-[#060a18] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <span className={`font-medium text-[11px] whitespace-nowrap ${isNeonMode ? 'text-cyan-400' : 'text-slate-500'}`}>Loncat ke Sheet:</span>
            <button
              onClick={() => {
                onJumpToTab('dashboard-overview', project);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium cursor-pointer whitespace-nowrap transition-all border ${
                isNeonMode 
                  ? 'bg-[#090f24] border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
              }`}
            >
              <TabVisualIcon tabKey="dashboard-overview" size="sm" variant="badge" />
              <span>1. Dashboard Overview</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('project-list', project);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium cursor-pointer whitespace-nowrap transition-all border ${
                isNeonMode 
                  ? 'bg-[#090f24] border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
              }`}
            >
              <TabVisualIcon tabKey="project-list" size="sm" variant="badge" />
              <span>2. Project List (Master Data)</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('construction-plan', project);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium cursor-pointer whitespace-nowrap transition-all border ${
                isNeonMode 
                  ? 'bg-[#090f24] border-violet-500/30 text-violet-300 hover:bg-violet-950/80 hover:border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.2)]' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
              }`}
            >
              <TabVisualIcon tabKey="construction-plan" size="sm" variant="badge" />
              <span>3. Plan Implimentasi Project</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('status-construction', project);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium cursor-pointer whitespace-nowrap transition-all border ${
                isNeonMode 
                  ? 'bg-[#090f24] border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/80 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
              }`}
            >
              <TabVisualIcon tabKey="status-construction" size="sm" variant="badge" />
              <span>4. Status Construction</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('status-project', project);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium cursor-pointer whitespace-nowrap transition-all border ${
                isNeonMode 
                  ? 'bg-[#090f24] border-orange-500/30 text-orange-300 hover:bg-orange-950/80 hover:border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.2)]' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
              }`}
            >
              <TabVisualIcon tabKey="status-project" size="sm" variant="badge" />
              <span>5. Document Project</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('project-tracking-pipeline', project);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                isNeonMode 
                  ? 'bg-[#090f24] border-purple-500/40 text-purple-300 hover:bg-purple-950/80 hover:border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.2)]' 
                  : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300'
              }`}
            >
              <TabVisualIcon tabKey="project-tracking-pipeline" size="sm" variant="badge" />
              <span>6. Project Tracing Pipeline</span>
            </button>
            <button
              onClick={() => {
                onJumpToTab('closing-project', project);
                onClose();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold cursor-pointer whitespace-nowrap transition-all border ${
                isNeonMode 
                  ? 'bg-[#090f24] border-rose-500/40 text-rose-300 hover:bg-rose-950/80 hover:border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.2)]' 
                  : 'bg-white border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300'
              }`}
            >
              <TabVisualIcon tabKey="closing-project" size="sm" variant="badge" />
              <span>7. Closing Project</span>
            </button>
          </div>

          {/* Drawer Body - Interconnected Tab Cards */}
          <div className={`flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5 transition-colors ${
            isNeonMode ? 'bg-[#050814]' : 'bg-slate-50/50'
          }`}>
            {/* 1. Tab Sheet 1: Project List Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sky-800 font-semibold text-xs">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>Sheet 2: Project List (Master Data)</span>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                  project.projectStatus === 'Review Dinas' || project.projectStatus === 'Masih Review Dinas'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : project.projectStatus === 'In Progress'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {project.projectStatus || '-'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Vendor</span>
                  <span className="font-semibold text-slate-800">{project.namaVendor || 'Belum Ada Vendor'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kategori</span>
                  <span className="font-medium text-slate-800">{project.projectCategory || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Area / Kota</span>
                  <span className="font-medium text-slate-800">{project.areaKota || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC Govrel</span>
                  <span className="font-medium text-slate-800">{project.picSectionHead || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC Internal (Waspang)</span>
                  <span className="font-medium text-slate-800">{project.waspangDsb || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Prioritas Project</span>
                  <div className="mt-0.5">
                    <PriorityBadge priority={project.priority} showLevel={true} size="xs" />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Start & End Project</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {project.tanggalStartProject || '-'} s/d {project.tanggalEndProject || '-'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Status Project</span>
                  <span className="font-bold text-sky-800">{project.projectStatus || 'Not Started'}</span>
                </div>
              </div>

              {/* Document Attachments Breakdown */}
              <div className="mt-3.5 pt-3 border-t border-slate-150">
                <span className="text-slate-500 font-bold block text-[11px] uppercase mb-2">Dokumen & Lampiran File:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">Surat Dinas:</span>
                    <span className="font-mono text-slate-700">{project.tanggalSuratDinas || '-'}</span>
                    {project.docSuratDinas && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docSuratDinas}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">Survey Bersama:</span>
                    <span className="font-mono text-slate-700">{project.tanggalSurveyBersama || '-'}</span>
                    {project.docSurveyBersama && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docSurveyBersama}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">Surat Rekomter:</span>
                    <span className="font-mono text-slate-700">{project.tanggalSuratRekomter || '-'}</span>
                    {project.docSuratRekomter && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docSuratRekomter}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">Penunjukan Vendor:</span>
                    <span className="font-mono text-slate-700">{project.tanggalSuratPenunjukanVendor || '-'}</span>
                    {project.docSuratPenunjukanVendor && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docSuratPenunjukanVendor}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">APD Relokasi:</span>
                    <span className="font-medium text-slate-700">{project.apdRelokasi || 'Belum ada'}</span>
                    {project.docApdRelokasi && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docApdRelokasi}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">KMZ Relokasi:</span>
                    <span className="font-medium text-slate-700">{project.kmzRelokasi || 'Belum ada'}</span>
                    {project.docKmzRelokasi && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docKmzRelokasi}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">APD Internal:</span>
                    <span className="font-medium text-slate-700">{project.apdLinknet || 'Not Yet'}</span>
                    {project.docApdInternal && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docApdInternal}</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-semibold">Timeline & Doc:</span>
                    <span className="font-medium text-slate-700">{project.timelineRelokasi || '-'}</span>
                    {project.docTimeline && (
                      <span className="block text-[11px] font-medium text-emerald-700 mt-0.5">File: {project.docTimeline}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Remarks Area */}
              {(project.remarksProject || project.remarks) && (
                <div className="mt-3 pt-2.5 border-t border-slate-200">
                  <span className="text-slate-700 block text-[11px] font-bold">Remarks (Catatan):</span>
                  <p className="text-xs text-slate-900 bg-slate-50 p-2.5 rounded border border-slate-300 mt-1 whitespace-pre-wrap font-semibold">
                    {project.remarksProject || project.remarks}
                  </p>
                </div>
              )}
            </div>

            {/* 2. Tab Sheet 2: Construction & Plan */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-xs">
                  <HardHat className="w-4 h-4 text-blue-600" />
                  <span>Sheet 3: Plan Implimentasi Project (Perencanaan & Nama Vendor)</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-700 block text-[11px] font-bold">Segment Relokasi</span>
                  <span className="font-semibold text-slate-900">{project.projectDescription || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Area / Kota</span>
                  <span className="font-semibold text-slate-900">{project.areaKota || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Nama Vendor</span>
                  <span className="font-semibold text-slate-900">{project.namaVendor || 'Belum Ada'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">PIC Govrel</span>
                  <span className="font-semibold text-slate-900">{project.picSectionHead || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">PIC Internal</span>
                  <span className="font-semibold text-slate-900">{project.waspangDsb || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Project - ID</span>
                  <span className="font-mono font-bold text-slate-900">{project.projectId || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Panjang Cable FO</span>
                  <span className="font-mono font-bold text-slate-900">
                    {project.panjangRelokasi ? `${Number(project.panjangRelokasi).toLocaleString('id-ID')} m` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Jalur Akses</span>
                  <span className="font-mono font-bold text-slate-900">
                    {project.jalurAkses ? `${Number(project.jalurAkses).toLocaleString('id-ID')} m` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Status Audit</span>
                  <span className="text-slate-900 font-semibold">{project.statusAudit || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Start & End Project</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {project.tanggalStartProject || '-'} s/d {project.tanggalEndProject || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Spesifikasi HH/HS/HG</span>
                  <span className="font-mono font-semibold text-slate-900 text-[11px] block">
                    {project.installHhItems && project.installHhItems.some(i => i.qty)
                      ? project.installHhItems.filter(i => i.qty).map(i => `${i.type} ${i.size} (${i.qty} unit)`).join(', ')
                      : project.installHhProgress || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-medium">Instal Galvanis</span>
                  <span className="font-mono font-semibold text-slate-900 text-[11px] block">
                    {project.installGalvanisItems && project.installGalvanisItems.some(i => i.length)
                      ? project.installGalvanisItems.filter(i => i.length).map(i => `${i.size} (${i.length} m)`).join(', ')
                      : '-'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-700 block text-[11px] font-bold">Remarks Plan</span>
                  <p className="text-slate-900 font-semibold bg-slate-50 p-2.5 rounded border border-slate-300 text-[11px]">
                    {project.remarksPlan || 'Tidak ada catatan tambahan'}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Tab Sheet 3: Status Construction */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Sheet 4: Status Construction (Progress Fisik Lapangan)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                  {project.statusConstruction || 'Not Started'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-700 block text-[11px] font-bold">Segment Relokasi</span>
                  <span className="font-semibold text-slate-900">{project.projectDescription || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Area / Kota</span>
                  <span className="font-medium text-slate-800">{project.areaKota || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nama Vendor</span>
                  <span className="font-semibold text-emerald-800">{project.namaVendor || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC Govrel</span>
                  <span className="font-medium text-slate-800">{project.picSectionHead || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC Internal (Waspang DSB)</span>
                  <span className="font-medium text-slate-800">{project.waspangDsb || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Project - ID</span>
                  <span className="font-mono font-bold text-sky-800">{project.projectId || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pulling FO (Otomatis)</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <span>{project.statusPullingCableFo || 'Not Yet'}</span>
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1 rounded border border-sky-200">
                      {project.pullingCableFoProgress || (project.statusPullingCableFo === 'Done' ? '100%' : project.statusPullingCableFo === 'In Progress' ? '50%' : '0%')}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Plan Pengambilan Material</span>
                  <span className="font-medium text-slate-800">{project.planPengambilanMaterial || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Material Location</span>
                  <span className="font-medium text-slate-800">{project.statusMaterialLocation || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status CO</span>
                  <span className="font-medium text-slate-800">{project.statusCo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Galian Sipil Progress</span>
                  <span className="font-medium text-slate-800">{project.galianSipilProgress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Install HH / Pole</span>
                  <span className="font-medium text-slate-800">{project.installHhProgress || '-'} | {project.installPoleProgress || '-'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 bg-emerald-50/70 border border-emerald-200 rounded p-2.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-900 font-bold block text-[11px]">Spesifikasi Pulling Cable FO & Aksesoris:</span>
                      {project.pullingFoItems && project.pullingFoItems.length > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded font-mono">
                          {project.pullingFoItems.reduce((acc, c) => acc + (Number(c.length) || 0), 0).toLocaleString('id-ID')} m FO
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-emerald-950 text-[11px] font-medium leading-relaxed">
                      {project.ftthIkrSpecProgress || 'Belum ada rincian spesifikasi FTTH / IKR'}
                    </p>
                    {project.pullingFoItems && project.pullingFoItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-emerald-200/80">
                        {project.pullingFoItems.map((fo, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-white border border-emerald-300 rounded px-1.5 py-0.5 text-emerald-900 font-medium">
                            <span className="font-semibold">{fo.type}</span>
                            <span className="font-mono text-emerald-700 font-bold">({fo.length ? Number(fo.length).toLocaleString('id-ID') : 0}m)</span>
                            {fo.status && <span className="text-[9px] text-slate-500">[{fo.status}]</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                {/* Detail Cut Over (Status CO): Cable FO Joint & Phase CO */}
                <div className="col-span-2 sm:col-span-3 bg-teal-50/80 border border-teal-200 rounded p-2.5 text-xs space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-teal-200">
                    <span className="text-teal-950 font-bold flex items-center gap-1.5 text-[11px]">
                      <GitCommit className="w-3.5 h-3.5 text-teal-600" />
                      <span>Status CO (Cut Over): Joint Cable FO & Phase CO Pelaksanaan</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      project.statusCo === 'Done' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      project.statusCo === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      Status: {project.statusCo || 'Not Yet'}
                    </span>
                  </div>

                  {/* 1. Cable FO Existing di joint dengan Cable FO New Jumper */}
                  <div>
                    <span className="text-[10px] font-bold text-teal-950 block mb-1">
                      Penyambungan Cable FO (Cable FO Existing di-joint dengan Cable FO New Jumper):
                    </span>
                    {project.coCableJointItems && project.coCableJointItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {project.coCableJointItems.map((c, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-teal-300 text-[11px] shadow-2xs font-semibold text-slate-800">
                            <span className="text-[10px] font-mono text-teal-700 font-bold">#{idx + 1}</span>
                            <span className="text-teal-950 font-bold">{c.cableExisting || 'Cable FO'}</span>
                            <span className="text-teal-600 font-bold px-1 bg-teal-50 rounded text-[10px]">di joint dgn</span>
                            <span className="text-emerald-800 font-bold">{c.cableNewJumper || 'Cable FO'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-700 italic font-medium">
                        {project.coCableJointSummary || '- Belum dikonfigurasi -'}
                      </p>
                    )}
                  </div>

                  {/* 2. Phase CO 1 di tanggal (dan tahapan selanjutnya) */}
                  <div>
                    <span className="text-[10px] font-bold text-sky-950 block mb-1">
                      Tahapan Phase CO & Tanggal Pelaksanaan:
                    </span>
                    {project.coPhaseItems && project.coPhaseItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {project.coPhaseItems.map((ph, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-sky-300 text-[11px] shadow-2xs">
                            <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="font-bold text-sky-950">{ph.phaseName}</span>
                            <span className="text-slate-500 font-semibold text-[10px]">di tanggal:</span>
                            <span className="font-mono font-bold text-slate-900 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                              {ph.tanggal || '-'}
                            </span>
                            {ph.status && (
                              <span className="text-[9px] font-semibold text-sky-700 bg-sky-100/70 px-1 py-0.2 rounded">
                                {ph.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-700 italic font-medium">
                        {project.coPhaseSummary || (project.phaseCo1Date ? `Phase CO 1 di tgl ${project.phaseCo1Date}` : '- Belum ada jadwal Phase CO -')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 block text-[11px]">Catatan Konstruksi</span>
                  <p className="text-slate-700 italic bg-slate-50 p-2 rounded text-[11px]">
                    {project.remarksConstruction || 'Tidak ada catatan konstruksi'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Tab Sheet 5: Document Project */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-indigo-800 font-semibold text-xs">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  <span>Sheet 5: Document Project (Pengajuan Material, BOQ Labour & CE/BOQ)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                  {project.statusPengajuanProject || 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Project Create Date</span>
                  <span className="font-medium text-slate-800 font-mono">{project.projectCreateDate || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">MR Number</span>
                  <span className="font-mono text-slate-800">{project.mrNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Dokumen Closing</span>
                  <span className="text-slate-800">{project.statusDokumenClosing || '-'}</span>
                </div>
              </div>

              {/* Document Project Submissions Overview */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 mb-3">
                <span className="font-bold text-slate-800 block text-[11px]">Ringkasan Dokumen Berkas Pengajuan:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">1. Pengajuan Material</span>
                    <span className="font-bold text-sky-700 font-mono">
                      {Object.values(project.documentProject?.pengajuanMaterial?.documents || {}).filter(Boolean).length}/11 Dokumen
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">2. Pengajuan BOQ Labour</span>
                    <span className="font-bold text-indigo-700 font-mono">
                      {Object.values(project.documentProject?.pengajuanBoqLabour?.documents || {}).filter(Boolean).length}/11 Dokumen
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-semibold">3. Pengajuan CE & BOQ</span>
                    <span className="font-bold text-purple-700 font-mono">
                      {Object.values(project.documentProject?.pengajuanCeAndBoqLabour?.documents || {}).filter(Boolean).length}/11 Dokumen
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Document Dispatch Banner */}
              <div className="p-3 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-lg mb-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-600 text-white rounded-md shadow-2xs">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Kirim Dokumen via Email</span>
                    <span className="text-[10px] text-slate-600 font-medium">Kirim Pengajuan Material, BOQ Labour, atau Gabungan serta CC</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email Pengajuan</span>
                </button>
              </div>

              <div className="col-span-2 sm:col-span-3">
                <span className="text-slate-700 block text-[11px] font-bold">Project Remarks</span>
                <p className="text-slate-900 font-semibold bg-slate-50 p-2.5 rounded border border-slate-300 text-[11px] mt-1">
                  {project.remarksProject || project.pengajuanProjectRemarks || 'Tidak ada catatan'}
                </p>
              </div>
            </div>

            {/* 5. Tab Sheet 6: Project Tracking Pipeline Summary */}
            <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-purple-100">
                <div className="flex items-center gap-2 text-purple-900 font-semibold text-xs">
                  <GitCommit className="w-4 h-4 text-purple-600" />
                  <span>Sheet 6: Project Tracing Pipeline (Pelacakan Menyeluruh)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                  {project.projectStatus || 'In Progress'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal Start Project</span>
                  <span className="font-medium text-slate-800">{project.tanggalStartProject || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tanggal End Project</span>
                  <span className="font-medium text-slate-800">{project.tanggalEndProject || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Pengajuan PO/MR</span>
                  <span className="font-semibold text-indigo-700">MR: {project.statusPengajuanMr || '-'} | PO: {project.statusPengajuanPo || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pulling Cable Progress</span>
                  <span className="font-medium text-slate-800">{project.pullingCableProgress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Galian Sipil Progress</span>
                  <span className="font-medium text-slate-800">{project.galianSipilProgress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Closing SAP</span>
                  <span className="font-medium text-slate-800">{project.closingSap || '-'}</span>
                </div>
              </div>
            </div>

            {/* 6. Tab Sheet 7: Closing Project Summary */}
            <div className="bg-white rounded-lg border border-teal-200 p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-teal-100">
                <div className="flex items-center gap-2 text-teal-900 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Sheet 7: Closing Project (BA Opname, ABD, Foto & Status)</span>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  project.statusPengajuanClosing === 'Invoice'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : project.statusPengajuanClosing === 'Teco Done'
                    ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                    : project.statusPengajuanClosing === 'Approval BAST'
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : project.statusPengajuanClosing === 'Approval BALAP'
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : project.statusPengajuanClosing === 'Submit'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  Status: {project.statusPengajuanClosing || project.closingProject?.statusPengajuan || 'Not Yet'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Praject Date</span>
                  <span className="font-medium text-slate-800 font-mono">
                    {project.prajectDate || project.closingProject?.projectDate || project.projectCreateDate || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">No. PO</span>
                  <span className="font-bold text-sky-700 font-mono">
                    {project.poNumber || project.closingProject?.poNumber || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Pengajuan</span>
                  <span className="font-semibold text-teal-700">
                    {project.statusPengajuanClosing || project.closingProject?.statusPengajuan || 'Not Yet'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">BA Opname Material</span>
                  <span className={`font-medium ${project.baOpnameMaterial || project.closingProject?.documents?.baOpnameMaterial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {project.baOpnameMaterial || project.closingProject?.documents?.baOpnameMaterial?.name || 'Belum Ada'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">BA Opname Labour</span>
                  <span className={`font-medium ${project.baOpnameLabour || project.closingProject?.documents?.baOpnameLabour ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                    {project.baOpnameLabour || project.closingProject?.documents?.baOpnameLabour?.name || 'Belum Ada'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ABD Relokasi</span>
                  <span className={`font-medium ${project.closingAbdRelokasi || project.closingProject?.documents?.abdRelokasi ? 'text-teal-700 font-semibold' : 'text-slate-500'}`}>
                    {project.closingAbdRelokasi || project.closingProject?.documents?.abdRelokasi?.name || 'Belum Ada'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ABD Internal</span>
                  <span className={`font-medium ${project.closingAbdInternal || project.closingProject?.documents?.abdInternal ? 'text-purple-700 font-semibold' : 'text-slate-500'}`}>
                    {project.closingAbdInternal || project.closingProject?.documents?.abdInternal?.name || 'Belum Ada'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Foto Dokumentasi</span>
                  <span className={`font-medium ${project.fotoDokumentasi || project.closingProject?.documents?.fotoDokumentasi ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                    {project.fotoDokumentasi || project.closingProject?.documents?.fotoDokumentasi?.name || 'Belum Ada (Mendukung Semua Format File *.*)'}
                  </span>
                </div>
              </div>

              {project.closingRemarks && (
                <div className="pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-700 block font-bold mb-1">Catatan Closing (Remarks):</span>
                  <p className="text-slate-900 font-semibold bg-slate-50 p-2 rounded border border-slate-300">{project.closingRemarks}</p>
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-teal-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onJumpToTab('closing-project', project);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Buka Sheet 7 Closing Project & Kelola Berkas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Terakhir diperbarui: {new Date(project.updatedAt || Date.now()).toLocaleString('id-ID')}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <SendProjectDocumentEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        project={project}
        initialDispatchType="pengajuan-material"
        onEmailSent={(updated) => {
          if (onUpdateProject) {
            onUpdateProject(updated);
          }
        }}
        showToast={(_msg) => {}}
        isNeonMode={isNeonMode}
      />
    </div>
  );
};
