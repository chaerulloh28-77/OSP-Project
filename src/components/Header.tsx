import React from 'react';
import { 
  Building2, 
  Plus, 
  Download, 
  Menu,
  Trash2,
  FileSpreadsheet,
  LogOut,
  Eraser,
  Zap,
  Sun
} from 'lucide-react';
import { TabKey, ProjectData } from '../types/project';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onNewProject: () => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  projects?: ProjectData[];
  lastSavedTime: string;
  totalProjects: number;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onClearAll?: () => void;
  onClearDescriptions?: () => void;
  currentUser?: { email: string; name: string } | null;
  onLogout?: () => void;
  isNeonMode?: boolean;
  onToggleNeonMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProject,
  onExportCsv,
  onExportExcel,
  totalProjects,
  onToggleSidebar,
  onClearAll,
  onClearDescriptions,
  onLogout,
  isNeonMode = true,
  onToggleNeonMode,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-30 shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Hamburger & Brand Name */}
          <div className="flex items-center gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Sembunyikan / Tampilkan Sidebar"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-sm ring-1 ring-white/10">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white truncate font-sans">
                    Monitoring GOV FMI_DSB
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-sky-500/15 text-sky-300 rounded-md border border-sky-400/25">
                    © PAUL
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-sky-400 tracking-wide">Copyright PAUL</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300 font-semibold">{totalProjects} Total Proyek</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bersihkan Project Description button */}
            {totalProjects > 0 && onClearDescriptions && (
              <button
                type="button"
                onClick={onClearDescriptions}
                title="Hapus dan bersihkan data di dalam kolom Project Description"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-lg hover:bg-amber-900/60 hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <Eraser className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">Bersihkan Project Description</span>
              </button>
            )}

            {/* Clear all projects button when projects exist */}
            {totalProjects > 0 && onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                title="Hapus / Kosongkan seluruh data project"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg hover:bg-rose-900/60 hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xl:inline">Hapus Semua Data</span>
              </button>
            )}

            {/* Export Excel (.xlsx) button */}
            {onExportExcel && (
              <button
                type="button"
                onClick={onExportExcel}
                disabled={totalProjects === 0}
                title="Unduh laporan master 5 sheet dalam format Excel (.xlsx)"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-700/70 rounded-lg hover:text-white hover:bg-emerald-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            )}

            {/* Export CSV (.csv) button */}
            {onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                disabled={totalProjects === 0}
                title="Unduh data dalam format CSV (.csv)"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-300 bg-sky-950/50 border border-sky-700/70 rounded-lg hover:text-white hover:bg-sky-900/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            {/* Neon Mode Toggle Button */}
            {onToggleNeonMode && (
              <button
                type="button"
                onClick={onToggleNeonMode}
                title={isNeonMode ? "Switch to Classic Mode" : "Switch to Neon Light Mode"}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                  isNeonMode 
                    ? 'bg-slate-950 text-cyan-400 border-cyan-500/60 shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:shadow-[0_0_18px_rgba(34,211,238,0.6)]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {isNeonMode ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30 animate-pulse" />
                    <span className="text-cyan-300 drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]">Neon ON</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-slate-400" />
                    <span>Neon OFF</span>
                  </>
                )}
              </button>
            )}

            {/* Add New Project Button */}
            <button
              type="button"
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg transition-all shadow-sm shadow-sky-600/30 hover:shadow-sky-600/40 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Project</span>
            </button>

            {/* Logout button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Keluar dari akun (Logout)"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-900/60 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline text-[11px]">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
