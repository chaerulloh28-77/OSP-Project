import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Eye, 
  Package, 
  HardHat, 
  ClipboardList, 
  FileCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Mail
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { 
  UploadedFileMeta, 
  DocumentProjectData, 
  PENGAJUAN_MATERIAL_SLOTS, 
  PENGAJUAN_BOQ_LABOUR_SLOTS, 
  PENGAJUAN_CE_BOQ_SLOTS, 
  DocumentProjectSlotDef,
  DocumentEmailDispatchType
} from '../types/document';
import { SendProjectDocumentEmailModal } from './SendProjectDocumentEmailModal';

interface DocumentProjectManagerProps {
  project: ProjectData;
  onUpdateProject: (updatedProject: ProjectData) => void;
  isReadOnly?: boolean;
}

export type PengajuanCategoryKey = 'pengajuan-material' | 'pengajuan-boq' | 'pengajuan-ce-boq';

export const DocumentProjectManager: React.FC<DocumentProjectManagerProps> = ({
  project,
  onUpdateProject,
  isReadOnly = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<PengajuanCategoryKey>('pengajuan-material');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // Ensure documentProject data structure exists
  const docProjectData: DocumentProjectData = project.documentProject || {
    pengajuanMaterial: { documents: {} },
    pengajuanBoqLabour: { documents: {} },
    pengajuanCeAndBoqLabour: { documents: {} },
  };

  const getCategorySlots = (catKey: PengajuanCategoryKey): DocumentProjectSlotDef[] => {
    switch (catKey) {
      case 'pengajuan-material':
        return PENGAJUAN_MATERIAL_SLOTS;
      case 'pengajuan-boq':
        return PENGAJUAN_BOQ_LABOUR_SLOTS;
      case 'pengajuan-ce-boq':
        return PENGAJUAN_CE_BOQ_SLOTS;
      default:
        return PENGAJUAN_MATERIAL_SLOTS;
    }
  };

  const getCategoryDocs = (catKey: PengajuanCategoryKey): Record<string, UploadedFileMeta | undefined> => {
    switch (catKey) {
      case 'pengajuan-material':
        return docProjectData.pengajuanMaterial?.documents || {};
      case 'pengajuan-boq':
        return docProjectData.pengajuanBoqLabour?.documents || {};
      case 'pengajuan-ce-boq':
        return docProjectData.pengajuanCeAndBoqLabour?.documents || {};
      default:
        return {};
    }
  };

  const handleFileUpload = (catKey: PengajuanCategoryKey, slotKey: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const fileMeta: UploadedFileMeta = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().split('T')[0],
        dataUrl: dataUrl,
      };

      const updatedDocProject: DocumentProjectData = {
        ...docProjectData,
      };

      if (catKey === 'pengajuan-material') {
        const currentSub = updatedDocProject.pengajuanMaterial || { documents: {} };
        updatedDocProject.pengajuanMaterial = {
          ...currentSub,
          documents: {
            ...currentSub.documents,
            [slotKey]: fileMeta,
          },
        };
      } else if (catKey === 'pengajuan-boq') {
        const currentSub = updatedDocProject.pengajuanBoqLabour || { documents: {} };
        updatedDocProject.pengajuanBoqLabour = {
          ...currentSub,
          documents: {
            ...currentSub.documents,
            [slotKey]: fileMeta,
          },
        };
      } else if (catKey === 'pengajuan-ce-boq') {
        const currentSub = updatedDocProject.pengajuanCeAndBoqLabour || { documents: {} };
        updatedDocProject.pengajuanCeAndBoqLabour = {
          ...currentSub,
          documents: {
            ...currentSub.documents,
            [slotKey]: fileMeta,
          },
        };
      }

      onUpdateProject({
        ...project,
        documentProject: updatedDocProject,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (catKey: PengajuanCategoryKey, slotKey: string) => {
    const updatedDocProject: DocumentProjectData = {
      ...docProjectData,
    };

    if (catKey === 'pengajuan-material') {
      const currentSub = updatedDocProject.pengajuanMaterial || { documents: {} };
      const newDocs = { ...currentSub.documents };
      delete newDocs[slotKey];
      updatedDocProject.pengajuanMaterial = {
        ...currentSub,
        documents: newDocs,
      };
    } else if (catKey === 'pengajuan-boq') {
      const currentSub = updatedDocProject.pengajuanBoqLabour || { documents: {} };
      const newDocs = { ...currentSub.documents };
      delete newDocs[slotKey];
      updatedDocProject.pengajuanBoqLabour = {
        ...currentSub,
        documents: newDocs,
      };
    } else if (catKey === 'pengajuan-ce-boq') {
      const currentSub = updatedDocProject.pengajuanCeAndBoqLabour || { documents: {} };
      const newDocs = { ...currentSub.documents };
      delete newDocs[slotKey];
      updatedDocProject.pengajuanCeAndBoqLabour = {
        ...currentSub,
        documents: newDocs,
      };
    }

    onUpdateProject({
      ...project,
      documentProject: updatedDocProject,
    });
  };

  const handleNotesChange = (catKey: PengajuanCategoryKey, slotKey: string, notesVal: string) => {
    const currentDocs = getCategoryDocs(catKey);
    const existingFile = currentDocs[slotKey];
    if (!existingFile) return;

    const updatedFile: UploadedFileMeta = {
      ...existingFile,
      notes: notesVal,
    };

    const updatedDocProject: DocumentProjectData = {
      ...docProjectData,
    };

    if (catKey === 'pengajuan-material') {
      const currentSub = updatedDocProject.pengajuanMaterial || { documents: {} };
      updatedDocProject.pengajuanMaterial = {
        ...currentSub,
        documents: {
          ...currentSub.documents,
          [slotKey]: updatedFile,
        },
      };
    } else if (catKey === 'pengajuan-boq') {
      const currentSub = updatedDocProject.pengajuanBoqLabour || { documents: {} };
      updatedDocProject.pengajuanBoqLabour = {
        ...currentSub,
        documents: {
          ...currentSub.documents,
          [slotKey]: updatedFile,
        },
      };
    } else if (catKey === 'pengajuan-ce-boq') {
      const currentSub = updatedDocProject.pengajuanCeAndBoqLabour || { documents: {} };
      updatedDocProject.pengajuanCeAndBoqLabour = {
        ...currentSub,
        documents: {
          ...currentSub.documents,
          [slotKey]: updatedFile,
        },
      };
    }

    onUpdateProject({
      ...project,
      documentProject: updatedDocProject,
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const currentSlots = getCategorySlots(activeCategory);
  const currentDocsMap = getCategoryDocs(activeCategory);

  const getUploadedCount = (catKey: PengajuanCategoryKey) => {
    const docs = getCategoryDocs(catKey);
    return Object.values(docs).filter(Boolean).length;
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      {/* Category Subtabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveCategory('pengajuan-material')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            activeCategory === 'pengajuan-material'
              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>1. Pengajuan Material</span>
          <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded ${
            activeCategory === 'pengajuan-material' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {getUploadedCount('pengajuan-material')}/11
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('pengajuan-boq')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            activeCategory === 'pengajuan-boq'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>2. Pengajuan BOQ Labour</span>
          <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded ${
            activeCategory === 'pengajuan-boq' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {getUploadedCount('pengajuan-boq')}/11
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('pengajuan-ce-boq')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
            activeCategory === 'pengajuan-ce-boq'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>3. Pengajuan FORM CE Material & BOQ Labour</span>
          <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded ${
            activeCategory === 'pengajuan-ce-boq' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {getUploadedCount('pengajuan-ce-boq')}/11
          </span>
        </button>
      </div>

      {/* Category Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <FileCheck className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            {activeCategory === 'pengajuan-material' && 'Dokumen Berkas untuk Pengajuan Material (11 Dokumen)'}
            {activeCategory === 'pengajuan-boq' && 'Dokumen Berkas untuk Pengajuan BOQ Labour (11 Dokumen)'}
            {activeCategory === 'pengajuan-ce-boq' && 'Dokumen Berkas untuk Pengajuan FORM CE Material & BOQ Labour (11 Dokumen)'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 transition-all cursor-pointer shadow-xs"
            title="Kirim berkas kategori ini via email dengan CC"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Kirim via Email</span>
          </button>
          <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded border border-sky-200">
            Semua File (*.*)
          </span>
        </div>
      </div>

      {/* 11 Document Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {currentSlots.map((slot) => {
          const uploadedFile = currentDocsMap[slot.key];

          return (
            <div
              key={slot.key}
              className={`p-3 rounded-lg border transition-all flex flex-col justify-between space-y-2.5 ${
                uploadedFile
                  ? 'bg-emerald-50/40 border-emerald-300/80 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {slot.num}
                    </span>
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {slot.label}
                    </span>
                  </div>
                  {uploadedFile ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Terunggah
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                      Belum Ada File
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 font-mono">
                  {slot.fileHint}
                </p>

                {/* Uploaded File Details Display */}
                {uploadedFile && (
                  <div className="p-2 bg-white rounded border border-emerald-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                      <span className="font-semibold text-slate-800 truncate text-[11px]" title={uploadedFile.name}>
                        📄 {uploadedFile.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {formatFileSize(uploadedFile.size)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                      <span>Diupload: {uploadedFile.uploadedAt || '-'}</span>
                      {uploadedFile.dataUrl && (
                        <a
                          href={uploadedFile.dataUrl}
                          download={uploadedFile.name}
                          className="text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-0.5"
                          title="Unduh Berkas"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes Input Field for Reference / Nomor Surat */}
                {uploadedFile && !isReadOnly && (
                  <div>
                    <input
                      type="text"
                      value={uploadedFile.notes || ''}
                      onChange={(e) => handleNotesChange(activeCategory, slot.key, e.target.value)}
                      placeholder="Nomor surat / catatan tambahan..."
                      className="w-full px-2 py-1 text-[11px] border border-slate-300 rounded bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
                    />
                  </div>
                )}
              </div>

              {/* Upload & Action Buttons */}
              {!isReadOnly && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <label className="flex-1 cursor-pointer">
                    <div className={`w-full text-center py-1.5 px-2 rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 border ${
                      uploadedFile
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300'
                    }`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadedFile ? 'Ganti File' : 'Unggah File'}</span>
                    </div>
                    <input
                      type="file"
                      accept="*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(activeCategory, slot.key, file);
                        }
                      }}
                    />
                  </label>

                  {uploadedFile && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(activeCategory, slot.key)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded border border-slate-200 transition-colors cursor-pointer"
                      title="Hapus File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Email Dispatch Modal */}
      <SendProjectDocumentEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        project={project}
        initialDispatchType={
          activeCategory === 'pengajuan-material'
            ? 'pengajuan-material'
            : activeCategory === 'pengajuan-boq'
            ? 'pengajuan-boq'
            : 'pengajuan-material-and-boq'
        }
        onEmailSent={(updated) => {
          onUpdateProject(updated);
        }}
        showToast={(_msg) => {}}
      />
    </div>
  );
};
