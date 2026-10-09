import React, { useState, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Building2, 
  UserCheck, 
  MapPin, 
  ShieldCheck, 
  Wrench, 
  Compass, 
  Coins, 
  Layers, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  FileX,
  FileCheck2,
  Filter,
  Check,
  AlertTriangle,
  Flame,
  Info,
  ChevronRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { DOCUMENT_SLOTS, getDocumentSlots, DocumentSlotDefinition, DocumentTypeKey } from '../types/document';
import { documentStorageService } from '../services/documentStorageService';
import { PriorityBadge } from './PriorityBadge';
import { getPriorityMeta } from '../utils/priorityHelpers';

interface DocumentCompletenessInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusType: 'all' | 'complete' | 'incomplete' | 'zero';
  projects: ProjectData[];
  onManageProjectDocs: (project: ProjectData) => void;
  showToast?: (msg: string) => void;
}

export const DocumentCompletenessInfoModal: React.FC<DocumentCompletenessInfoModalProps> = ({
  isOpen,
  onClose,
  statusType,
  projects,
  onManageProjectDocs,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'complete' | 'incomplete' | 'zero'>(statusType);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'perizinan' | 'teknis' | 'survey' | 'komersial'>('all');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');

  // Keep activeStatusTab in sync if prop changes
  React.useEffect(() => {
    setActiveStatusTab(statusType);
  }, [statusType]);

  const totalSlotsCount = DOCUMENT_SLOTS.length;

  // Filter projects belonging to this status category
  const filteredCategoryProjects = useMemo(() => {
    return projects.filter((p) => {
      const { uploaded, total } = documentStorageService.getUploadedCount(p);

      if (activeStatusTab === 'complete') {
        return total > 0 && uploaded === total;
      }
      if (activeStatusTab === 'incomplete') {
        return uploaded > 0 && uploaded < total;
      }
      if (activeStatusTab === 'zero') {
        return uploaded === 0;
      }
      return true;
    });
  }, [projects, activeStatusTab]);

  // Unique areas in this category
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    filteredCategoryProjects.forEach((p) => {
      if (p.areaKota) set.add(p.areaKota);
    });
    return Array.from(set).sort();
  }, [filteredCategoryProjects]);

  // Apply search and area filter
  const displayProjects = useMemo(() => {
    return filteredCategoryProjects.filter((p) => {
      if (selectedAreaFilter !== 'all' && p.areaKota !== selectedAreaFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.pmoId || '').toLowerCase().includes(q) ||
        (p.projectDescription || '').toLowerCase().includes(q) ||
        (p.projectId || '').toLowerCase().includes(q) ||
        (p.namaVendor || '').toLowerCase().includes(q) ||
        (p.areaKota || '').toLowerCase().includes(q) ||
        (p.picSectionHead || '').toLowerCase().includes(q) ||
        (p.priority || '').toLowerCase().includes(q)
      );
    });
  }, [filteredCategoryProjects, searchQuery, selectedAreaFilter]);

  // Statistics for each slot within this category
  const slotStats = useMemo(() => {
    const slots = selectedCategoryFilter === 'all' 
      ? DOCUMENT_SLOTS 
      : DOCUMENT_SLOTS.filter((s) => s.category === selectedCategoryFilter);

    return slots.map((slot) => {
      const completedCount = filteredCategoryProjects.filter((p) => {
        const rec = documentStorageService.getDocumentRecord(p);
        return Boolean(rec?.documents?.[slot.key]?.uploadedAt);
      }).length;

      const total = filteredCategoryProjects.length;
      const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        slot,
        completedCount,
        missingCount: total - completedCount,
        percentage
      };
    });
  }, [filteredCategoryProjects, selectedCategoryFilter]);

  // Overall completeness numbers
  const overallStats = useMemo(() => {
    let complete = 0;
    let incomplete = 0;
    let zero = 0;

    for (const p of projects) {
      const { uploaded, total } = documentStorageService.getUploadedCount(p);
      if (total > 0 && uploaded === total) complete++;
      else if (uploaded > 0) incomplete++;
      else zero++;
    }

    return {
      total: projects.length,
      complete,
      incomplete,
      zero,
      completePct: projects.length > 0 ? Math.round((complete / projects.length) * 100) : 0,
      incompletePct: projects.length > 0 ? Math.round((incomplete / projects.length) * 100) : 0,
      zeroPct: projects.length > 0 ? Math.round((zero / projects.length) * 100) : 0,
    };
  }, [projects]);

  if (!isOpen) return null;

  // Visual metadata per status
  const getHeaderMeta = () => {
    switch (activeStatusTab) {
      case 'complete':
        return {
          title: `Dokumen Lengkap (${totalSlotsCount}/${totalSlotsCount} Berkas Wajib Terpenuhi)`,
          subtitle: `Seluruh ${totalSlotsCount} berkas dokumen (Perizinan, Teknis, Survey & Komersial) telah lengkap 100% dan terverifikasi dalam sistem.`,
          icon: ShieldCheck,
          accentColor: 'from-emerald-600 to-teal-700',
          badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
          bannerBg: 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900',
          statusBadge: `${totalSlotsCount}/${totalSlotsCount} Berkas Lengkap`,
          tagline: 'Kesiapan Administrasi 100%',
          advice: 'Proyek dalam kategori ini telah memenuhi seluruh standar kelengkapan berkas untuk proses audit SAP, penagihan vendor, dan serah terima dinas.'
        };
      case 'incomplete':
        return {
          title: `Dokumen Belum Lengkap (1 - ${totalSlotsCount - 1} Berkas Terunggah)`,
          subtitle: `Proyek yang telah memiliki sebagian berkas terunggah, namun masih kekurangan beberapa dokumen wajib sebelum dapat diproses closing.`,
          icon: Clock,
          accentColor: 'from-amber-600 to-orange-700',
          badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
          bannerBg: 'bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900',
          statusBadge: `Perlu Kelengkapan Berkas`,
          tagline: 'Dalam Proses Pengumpulan Berkas',
          advice: 'Segera koordinasikan dengan Vendor dan PIC Section Head terkait untuk melengkapi berkas yang tertanda "Kurang" agar tidak menunda penagihan.'
        };
      case 'zero':
        return {
          title: 'Belum Ada Dokumen (0 Berkas / Baru Dimulai)',
          subtitle: 'Proyek yang belum memiliki satupun berkas terunggah ke dalam database dokumen sistem.',
          icon: FileX,
          accentColor: 'from-rose-600 to-red-700',
          badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
          bannerBg: 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900',
          statusBadge: '0 Berkas Terunggah',
          tagline: 'Perlu Inisiasi Upload',
          advice: 'Langkah awal: unggah minimal Surat Dinas / MR / APD Relokasi untuk mengaktifkan pelacakan berkas proyek.'
        };
      default:
        return {
          title: `Ringkasan Seluruh Berkas Dokumen Proyek (${totalSlotsCount} Berkas Wajib)`,
          subtitle: `Distribusi dan status kelengkapan seluruh berkas dokumen pendukung proyek OSP di seluruh Area dan Vendor.`,
          icon: Layers,
          accentColor: 'from-sky-600 to-blue-700',
          badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
          bannerBg: 'bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900',
          statusBadge: 'Semua Status Proyek',
          tagline: 'Database Berkas OSP Terpadu',
          advice: 'Pantau ketersediaan berkas secara berkala untuk menjaga akurasi administrasi dan kelancaran closing proyek.'
        };
    }
  };

  const headerMeta = getHeaderMeta();
  const HeaderIcon = headerMeta.icon;

  const handleExportCategoryExcel = () => {
    const res = documentStorageService.exportDocumentReportToExcel(filteredCategoryProjects);
    if (showToast) {
      if (res.success) {
        showToast(`Berhasil mengekspor ${res.count} data proyek kategori ini ke Excel (${res.filename}).`);
      } else {
        showToast('Gagal mengekspor data ke Excel.');
      }
    }
  };

  const handleExportCategoryCsv = () => {
    const res = documentStorageService.exportDocumentReportToCsv(filteredCategoryProjects);
    if (showToast) {
      if (res.success) {
        showToast(`Berhasil mengekspor ${res.count} data proyek kategori ini ke CSV (${res.filename}).`);
      } else {
        showToast('Gagal mengekspor data ke CSV.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-6xl max-h-[94vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Top Banner with Rich Header */}
        <div className={`p-5 sm:p-6 text-white ${headerMeta.bannerBg} border-b border-slate-800 shrink-0 relative overflow-hidden`}>
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${headerMeta.accentColor} flex items-center justify-center text-white shrink-0 shadow-lg ring-1 ring-white/20`}>
                <HeaderIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${headerMeta.badgeClass}`}>
                    {headerMeta.statusBadge}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {filteredCategoryProjects.length} dari {projects.length} Paket Proyek ({projects.length > 0 ? Math.round((filteredCategoryProjects.length / projects.length) * 100) : 0}%)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{headerMeta.title}</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  {headerMeta.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
              title="Tutup Jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Status Navigation Switcher Inside Modal */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Tab 1: Semua */}
            <button
              type="button"
              onClick={() => { setActiveStatusTab('all'); setSearchQuery(''); }}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                activeStatusTab === 'all'
                  ? 'bg-sky-600/30 border-sky-400 text-white ring-1 ring-sky-400/40 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Semua Proyek</span>
              </div>
              <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-white/10 text-white">{overallStats.total}</span>
            </button>

            {/* Tab 2: Dokumen Lengkap */}
            <button
              type="button"
              onClick={() => { setActiveStatusTab('complete'); setSearchQuery(''); }}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                activeStatusTab === 'complete'
                  ? 'bg-emerald-600/40 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Lengkap ({totalSlotsCount}/{totalSlotsCount})</span>
              </div>
              <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {overallStats.complete} ({overallStats.completePct}%)
              </span>
            </button>

            {/* Tab 3: Belum Lengkap */}
            <button
              type="button"
              onClick={() => { setActiveStatusTab('incomplete'); setSearchQuery(''); }}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                activeStatusTab === 'incomplete'
                  ? 'bg-amber-600/40 border-amber-400 text-amber-200 ring-1 ring-amber-400/40 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Belum Lengkap</span>
              </div>
              <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                {overallStats.incomplete} ({overallStats.incompletePct}%)
              </span>
            </button>

            {/* Tab 4: Belum Ada Dokumen */}
            <button
              type="button"
              onClick={() => { setActiveStatusTab('zero'); setSearchQuery(''); }}
              className={`p-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                activeStatusTab === 'zero'
                  ? 'bg-rose-600/40 border-rose-400 text-rose-200 ring-1 ring-rose-400/40 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <FileX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Belum Ada (0)</span>
              </div>
              <span className="font-mono text-xs px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                {overallStats.zero} ({overallStats.zeroPct}%)
              </span>
            </button>
          </div>

          {/* Advice & Export Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-[11px] min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{headerMeta.advice}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportCategoryExcel}
                disabled={filteredCategoryProjects.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-600/60 hover:bg-emerald-900 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Excel ({filteredCategoryProjects.length})</span>
              </button>
              <button
                type="button"
                onClick={handleExportCategoryCsv}
                disabled={filteredCategoryProjects.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/70 border border-sky-600/60 hover:bg-sky-900 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body: Multi-Section Layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4 bg-slate-50/60">
          
          {/* Section 1: 11 Dokumen Slot Breakdown & Progress */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Tingkat Ketersediaan {totalSlotsCount} Berkas Dokumen Wajib
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dihitung dari {filteredCategoryProjects.length} proyek dalam status ini
                  </p>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1">
                {(['all', 'perizinan', 'teknis', 'survey', 'komersial'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer capitalize ${
                      selectedCategoryFilter === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? `Semua Kategori (${totalSlotsCount})` : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {slotStats.map(({ slot, completedCount, missingCount, percentage }) => {
                const isFull = percentage === 100;
                const isZero = percentage === 0;

                const getCategoryStyle = (c: string) => {
                  switch (c) {
                    case 'perizinan': return 'bg-purple-50 text-purple-700 border-purple-200';
                    case 'teknis': return 'bg-sky-50 text-sky-700 border-sky-200';
                    case 'survey': return 'bg-amber-50 text-amber-800 border-amber-200';
                    case 'komersial': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    default: return 'bg-slate-100 text-slate-600 border-slate-200';
                  }
                };

                return (
                  <div
                    key={slot.key}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50/90 transition-all flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 shrink-0">
                          #{slot.num}
                        </span>
                        <span className="font-semibold text-slate-800 truncate" title={slot.label}>
                          {slot.label}
                        </span>
                      </div>
                      <span className={`font-mono text-[11px] font-extrabold shrink-0 ${
                        isFull ? 'text-emerald-600' : isZero ? 'text-rose-500' : 'text-amber-600'
                      }`}>
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isFull ? 'bg-emerald-500' : isZero ? 'bg-slate-300' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className={`px-1.5 py-0.2 rounded border text-[9.5px] font-medium capitalize ${getCategoryStyle(slot.category)}`}>
                        {slot.category}
                      </span>
                      <span className="font-mono text-slate-500">
                        <strong>{completedCount}</strong>/{filteredCategoryProjects.length} terunggah
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Daftar Proyek & Rincian Kelengkapan Berkas */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-sky-600" />
                  <span>Daftar Proyek dalam Status Ini ({displayProjects.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Klik tombol "Kelola Dokumen" pada setiap paket untuk melihat pratinjau, mengunggah, atau mengedit berkas.
                </p>
              </div>

              {/* Filters Toolbar inside modal */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Area Dropdown Filter */}
                {availableAreas.length > 0 && (
                  <select
                    value={selectedAreaFilter}
                    onChange={(e) => setSelectedAreaFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="all">Semua Area ({availableAreas.length})</option>
                    {availableAreas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                )}

                {/* Search input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari PMO ID, Project, Nama Vendor, PIC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Projects Table / Card List */}
            {displayProjects.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <FileX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Tidak ada data proyek yang sesuai dengan kriteria.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah filter pencarian atau pilih tab status lain.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {displayProjects.map((proj) => {
                  const rec = documentStorageService.getDocumentRecord(proj);
                  const docs = rec?.documents || {};
                  const projectSlots = getDocumentSlots(proj.projectCategory);
                  const projTotalSlots = projectSlots.length;
                  const uploadedSlots = projectSlots.filter((s) => Boolean(docs[s.key]?.uploadedAt));
                  const missingSlots = projectSlots.filter((s) => !docs[s.key]?.uploadedAt);
                  const uploadPct = projTotalSlots > 0 ? Math.round((uploadedSlots.length / projTotalSlots) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-2xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                    >
                      {/* Left Info: PMO ID, Description, Priority, Metadata */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {proj.pmoId}
                          </span>
                          {proj.projectDescription ? (
                            <span className="font-bold text-slate-900 truncate">
                              {proj.projectDescription}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs font-normal">
                              (Tanpa deskripsi)
                            </span>
                          )}
                          
                          {/* Priority Badge */}
                          <PriorityBadge priority={proj.priority || 'Normal'} size="xs" showLevel />

                          {proj.projectCategory && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                              {proj.projectCategory}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>Nama Vendor: <strong className="text-slate-700">{proj.namaVendor || '-'}</strong></span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-400" />
                            <span>PIC: <strong className="text-slate-700">{proj.picSectionHead || '-'}</strong></span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>Area: <strong className="text-slate-700">{proj.areaKota || '-'}</strong></span>
                          </span>
                        </div>

                        {/* Missing slots quick badge */}
                        {missingSlots.length > 0 && missingSlots.length < projTotalSlots && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              <span>Kurang {missingSlots.length} berkas:</span>
                            </span>
                            {missingSlots.slice(0, 5).map((m) => (
                              <span key={m.key} className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                                #{m.num} {m.label}
                              </span>
                            ))}
                            {missingSlots.length > 5 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                +{missingSlots.length - 5} berkas lagi
                              </span>
                            )}
                          </div>
                        )}

                        {missingSlots.length === 0 && (
                          <div className="flex items-center gap-1 pt-0.5 text-emerald-700 text-[10.5px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Semua {projTotalSlots} berkas lengkap dan tersimpan aman.</span>
                          </div>
                        )}
                      </div>

                      {/* Right Info: Progress & Action */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end font-mono font-bold text-xs">
                            <span className={uploadPct === 100 ? 'text-emerald-600' : uploadPct === 0 ? 'text-rose-500' : 'text-amber-600'}>
                              {uploadedSlots.length}/{projTotalSlots}
                            </span>
                            <span className="text-slate-400 font-normal">({uploadPct}%)</span>
                          </div>
                          <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                uploadPct === 100 ? 'bg-emerald-500' : uploadPct === 0 ? 'bg-rose-400' : 'bg-amber-500'
                              }`}
                              style={{ width: `${uploadPct}%` }}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onManageProjectDocs(proj);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
                          title="Buka panel kelola berkas proyek ini"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Kelola Dokumen</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-100/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
            <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">
              {totalSlotsCount} Dokumen Wajib: MR, Surat Dinas, Rekomtek, Surat Penunjukan Vendor, APD Relokasi, APD Internal, KMZ Relokasi, BA Survey Internal, Form BOQ, Timeline Relokasi, Timeline Internal.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0 self-end sm:self-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
