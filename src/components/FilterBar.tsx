import React from 'react';
import { 
  Search, 
  X, 
  RotateCcw,
  MapPin,
  Compass,
  Building2,
  UserCheck,
  Calendar,
  Activity,
  Flag,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
  HardHat,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { ProjectData, PRIORITY_OPTIONS, TabKey } from '../types/project';
import { VENDOR_OPTIONS, PIC_GOVREL_OPTIONS, WASPANG_DSB_OPTIONS, AREA_KOTA_OPTIONS } from '../data/dropdownOptions';
import { getPriorityMeta } from './PriorityBadge';

interface FilterBarProps {
  activeTab?: TabKey | string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedZona: string;
  onZonaChange: (value: string) => void;
  selectedArea: string;
  onAreaChange: (value: string) => void;
  selectedVendor: string;
  onVendorChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPriority?: string;
  onPriorityChange?: (value: string) => void;
  selectedQuarter: string;
  onQuarterChange: (value: string) => void;
  selectedPic?: string;
  onPicChange?: (value: string) => void;
  selectedWaspang?: string;
  onWaspangChange?: (value: string) => void;
  onResetFilters: () => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  totalResults: number;
  allProjects: ProjectData[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab,
  searchTerm,
  onSearchChange,
  selectedZona,
  onZonaChange,
  selectedArea,
  onAreaChange,
  selectedVendor,
  onVendorChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedPriority = '',
  onPriorityChange,
  selectedQuarter,
  onQuarterChange,
  selectedPic = '',
  onPicChange,
  selectedWaspang = '',
  onWaspangChange,
  onResetFilters,
  onExportExcel,
  onExportCsv,
  totalResults,
  allProjects,
}) => {
  const defaultStatuses = ['Done (Civil Work)', 'Done (Completed)', 'Done (Pulling)', 'In Progress', 'Masih Review Dinas', 'Not Started', 'Project Cancel'];
  const uniqueStatuses = Array.from(new Set([...defaultStatuses, ...allProjects.map((p) => p.projectStatus).filter(Boolean)])).sort((a, b) => a.localeCompare(b));
  const defaultCategories = ['GOV APJATEL', 'GOV IPPJU', 'GOV SJUT', 'GOV PUPR KOTA', 'GOV PUPR KAB', 'GOV SDA DBM'];
  const categoryOptions = Array.from(new Set([...defaultCategories, ...allProjects.map((p) => p.projectCategory).filter(Boolean)]));
  const quarterOptions = ['Q1-26', 'Q2-26', 'Q3-26', 'Q4-26'];

  // Helper label for active page export
  const getPageExportLabel = () => {
    if (activeTab === 'project-list') return 'Project List';
    if (activeTab === 'construction-plan') return 'Plan Implimentasi';
    if (activeTab === 'status-construction') return 'Status Construction';
    return 'Halaman Ini';
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedZona || selectedArea || selectedVendor || selectedCategory || selectedStatus || selectedPriority || selectedQuarter || selectedPic || selectedWaspang
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-2xs mb-3.5 space-y-3">
      {/* Top Filter Row: Search & Manual Inputs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        {/* Global Search input */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-600 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari PMO ID, Project ID, Deskripsi, PIC, Nama Vendor, Lokasi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all placeholder:text-slate-900 placeholder:font-semibold shadow-xs font-semibold"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Manual Input Filters for Area, Vendor, and PIC */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Area / Kota Dropdown Filter with Option to Select All */}
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <select
              value={selectedArea}
              onChange={(e) => onAreaChange(e.target.value)}
              title="Filter Area/Kota"
              className="h-8.5 pl-8 pr-6 py-1 text-xs font-medium text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[150px] max-w-full"
            >
              <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua Area/Kota</option>
              {AREA_KOTA_OPTIONS.map((area) => (
                <option key={area} value={area} className="bg-white text-slate-800 py-1 font-medium">
                  {area}
                </option>
              ))}
            </select>
            {selectedArea && (
              <button
                onClick={() => onAreaChange('')}
                title="Reset pilihan Area/Kota"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Nama Vendor Dropdown Filter with Option to Select All */}
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <select
              value={selectedVendor}
              onChange={(e) => onVendorChange(e.target.value)}
              title="Filter Nama Vendor"
              className="h-8.5 pl-8 pr-6 py-1 text-xs font-medium text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[160px] max-w-full"
            >
              <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua Nama Vendor</option>
              {VENDOR_OPTIONS.map((v) => (
                <option key={v} value={v} className="bg-white text-slate-800 py-1 font-medium">
                  {v}
                </option>
              ))}
            </select>
            {selectedVendor && (
              <button
                onClick={() => onVendorChange('')}
                title="Reset pilihan Nama Vendor"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* PIC Dropdown Filter with Option to Select All */}
          {onPicChange && (
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <select
                value={selectedPic}
                onChange={(e) => onPicChange(e.target.value)}
                title="Filter PIC"
                className="h-8.5 pl-8 pr-6 py-1 text-xs font-medium text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[140px] max-w-full"
              >
                <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua PIC</option>
                {PIC_GOVREL_OPTIONS.map((pic) => (
                  <option key={pic} value={pic} className="bg-white text-slate-800 py-1 font-medium">
                    {pic}
                  </option>
                ))}
              </select>
              {selectedPic && (
                <button
                  onClick={() => onPicChange('')}
                  title="Reset pilihan PIC"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Waspang DSB Dropdown Filter with Option to Select All */}
          {onWaspangChange && (
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <HardHat className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <select
                value={selectedWaspang}
                onChange={(e) => onWaspangChange(e.target.value)}
                title="Filter Waspang DSB"
                className="h-8.5 pl-8 pr-6 py-1 text-xs font-medium text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[150px] max-w-full"
              >
                <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua Waspang DSB</option>
                {WASPANG_DSB_OPTIONS.map((w) => (
                  <option key={w} value={w} className="bg-white text-slate-800 py-1 font-medium">
                    {w}
                  </option>
                ))}
              </select>
              {selectedWaspang && (
                <button
                  onClick={() => onWaspangChange('')}
                  title="Reset pilihan Waspang DSB"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Quarter Filter */}
          <div className="relative">
            <select
              value={selectedQuarter}
              onChange={(e) => onQuarterChange(e.target.value)}
              className="h-8.5 pl-2.5 pr-6 py-1 text-xs font-medium text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[120px]"
            >
              <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua Quarter</option>
              {quarterOptions.map((q) => (
                <option key={q} value={q} className="bg-white text-slate-800 py-1 font-medium">
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-8.5 pl-2.5 pr-6 py-1 text-xs text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[130px]"
            >
              <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua Status</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st} className="bg-white text-slate-800 py-1 font-medium">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          {onPriorityChange && (
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => onPriorityChange(e.target.value)}
                className="h-8.5 pl-2.5 pr-6 py-1 text-xs text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[150px]"
              >
                <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua Tingkat Prioritas</option>
                {PRIORITY_OPTIONS.map((p) => {
                  const meta = getPriorityMeta(p);
                  return (
                    <option key={p} value={p} className="bg-white text-slate-800 py-1 font-medium">
                      [L{meta.level}] {p} - {meta.levelName}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-8.5 pl-2.5 pr-6 py-1 text-xs text-slate-800 bg-slate-50/90 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/80 min-w-[140px]"
            >
              <option value="" className="bg-white text-slate-800 py-1 font-medium">Semua Kategori</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} className="bg-white text-slate-800 py-1 font-medium">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Export Excel (.xlsx) per page */}
          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              disabled={totalResults === 0}
              title={`Unduh data ${getPageExportLabel()} ke format Excel (.xlsx)`}
              className="h-8.5 flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel ({getPageExportLabel()})</span>
            </button>
          )}

          {/* Export CSV (.csv) per page */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              disabled={totalResults === 0}
              title={`Unduh data ${getPageExportLabel()} ke format CSV (.csv)`}
              className="h-8.5 flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>Export CSV ({getPageExportLabel()})</span>
            </button>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Reset seluruh filter"
              className="h-8.5 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-500" />
          <span>Menampilkan <strong className="text-slate-800 font-mono">{totalResults}</strong> dari {allProjects.length} Proyek</span>
        </div>
        {hasActiveFilters && (
          <span className="inline-flex items-center gap-1 text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60 text-[11px]">
            <CheckCircle2 className="w-3 h-3 text-sky-500" />
            Filter Aktif
          </span>
        )}
      </div>
    </div>
  );
};
