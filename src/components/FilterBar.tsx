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
  CheckCircle2
} from 'lucide-react';
import { ProjectData, PRIORITY_OPTIONS } from '../types/project';
import { getPriorityMeta } from './PriorityBadge';

interface FilterBarProps {
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
  onResetFilters: () => void;
  totalResults: number;
  allProjects: ProjectData[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
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
  onResetFilters,
  totalResults,
  allProjects,
}) => {
  const defaultStatuses = ['In Progress', 'Project Not Started', 'Review Dinas', 'Masih Review Dinas', 'MR/PO Approved', 'Cancelled', 'Completed'];
  const uniqueStatuses = Array.from(new Set([...defaultStatuses, ...allProjects.map((p) => p.projectStatus).filter(Boolean)]));
  const defaultCategories = ['GOV IPPJU', 'GOV APJATEL', 'GOV SJUT', 'FTTH', 'IKR'];
  const categoryOptions = Array.from(new Set([...defaultCategories, ...allProjects.map((p) => p.projectCategory).filter(Boolean)]));
  const quarterOptions = ['Q1-26', 'Q2-26', 'Q3-26', 'Q4-26'];

  const hasActiveFilters = Boolean(
    searchTerm || selectedZona || selectedArea || selectedVendor || selectedCategory || selectedStatus || selectedPriority || selectedQuarter || selectedPic
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
            placeholder="Cari PMO ID, Project ID, Deskripsi, PIC, Vendor, Lokasi..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs text-slate-800 bg-slate-50/90 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 shadow-2xs font-medium"
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

        {/* Manual Input Filters for Zona, Area, Vendor, and PIC */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zona Manual Input */}
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <input
              type="text"
              placeholder="Zona..."
              value={selectedZona}
              onChange={(e) => onZonaChange(e.target.value)}
              className="h-8.5 w-26 sm:w-28 pl-7.5 pr-6 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
            {selectedZona && (
              <button
                onClick={() => onZonaChange('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Area Manual Input */}
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <input
              type="text"
              placeholder="Area..."
              value={selectedArea}
              onChange={(e) => onAreaChange(e.target.value)}
              className="h-8.5 w-26 sm:w-28 pl-7.5 pr-6 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
            {selectedArea && (
              <button
                onClick={() => onAreaChange('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Vendor Manual Input */}
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <input
              type="text"
              placeholder="Vendor..."
              value={selectedVendor}
              onChange={(e) => onVendorChange(e.target.value)}
              className="h-8.5 w-28 sm:w-32 pl-7.5 pr-6 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
            {selectedVendor && (
              <button
                onClick={() => onVendorChange('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* PIC Manual Input */}
          {onPicChange && (
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <input
                type="text"
                placeholder="PIC..."
                value={selectedPic}
                onChange={(e) => onPicChange(e.target.value)}
                className="h-8.5 w-26 sm:w-28 pl-7.5 pr-6 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
              />
              {selectedPic && (
                <button
                  onClick={() => onPicChange('')}
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
              className="h-8.5 pl-2.5 pr-6 py-1 text-xs font-medium text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
            >
              <option value="">Semua Quarter</option>
              {quarterOptions.map((q) => (
                <option key={q} value={q}>
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
              className="h-8.5 pl-2.5 pr-6 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
            >
              <option value="">Semua Status</option>
              {uniqueStatuses.map((st) => (
                <option key={st} value={st}>
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
                className="h-8.5 pl-2.5 pr-6 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
              >
                <option value="">Semua Tingkat Prioritas</option>
                {PRIORITY_OPTIONS.map((p) => {
                  const meta = getPriorityMeta(p);
                  return (
                    <option key={p} value={p}>
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
              className="h-8.5 pl-2.5 pr-6 py-1 text-xs text-slate-700 bg-slate-50/80 border border-slate-300/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all hover:bg-slate-100/60"
            >
              <option value="">Semua Kategori</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

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
