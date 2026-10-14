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
    <header className={`sticky top-0 z-30 transition-all ${
      isNeonMode 
        ? 'bg-slate-900 border-b border-slate-800/80 shadow-md' 
        : 'bg-white border-b border-slate-200 shadow-xs text-slate-900'
    }`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Hamburger & Brand Name */}
          <div className="flex items-center gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Sembunyikan / Tampilkan Sidebar"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isNeonMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
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
                  <h1 className={`text-base sm:text-lg font-extrabold tracking-tight truncate font-sans ${
                    isNeonMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Monitoring GOV FMI_DSB
                  </h1>
                  <span className={`hidden md:inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase rounded-md border ${
                    isNeonMode ? 'bg-sky-500/15 text-sky-300 border-sky-400/25' : 'bg-sky-50 text-sky-800 border-sky-300'
                  }`}>
                    © PAUL
                  </span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${
                  isNeonMode ? 'text-slate-400' : 'text-slate-700 font-bold'
                }`}>
                  <span className={`font-bold tracking-wide ${isNeonMode ? 'text-sky-400' : 'text-sky-700'}`}>Copyright PAUL</span>
                  <span>•</span>
                  <span className={`font-mono font-extrabold ${isNeonMode ? 'text-slate-300' : 'text-slate-900'}`}>{totalProjects} Total Proyek</span>
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
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs border ${
                  isNeonMode 
                    ? 'text-amber-300 bg-amber-950/40 border-amber-800/60 hover:bg-amber-900/60 hover:text-white' 
                    : 'text-amber-900 bg-amber-50 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <Eraser className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden xl:inline">Bersihkan Project Description</span>
              </button>
            )}

            {/* Clear all projects button when projects exist */}
            {totalProjects > 0 && onClearAll && (
              <button
                type="button"
                onClick={onClearAll}
                title="Hapus / Kosongkan seluruh data project"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs border ${
                  isNeonMode 
                    ? 'text-rose-300 bg-rose-950/40 border-rose-800/60 hover:bg-rose-900/60 hover:text-white' 
                    : 'text-rose-900 bg-rose-50 border-rose-300 hover:bg-rose-100'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
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
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-2xs border disabled:opacity-40 disabled:cursor-not-allowed ${
                  isNeonMode 
                    ? 'text-emerald-300 bg-emerald-950/50 border-emerald-700/70 hover:text-white hover:bg-emerald-900/60' 
                    : 'text-emerald-900 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
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
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer shadow-2xs border disabled:opacity-40 disabled:cursor-not-allowed ${
                  isNeonMode 
                    ? 'text-sky-300 bg-sky-950/50 border-sky-700/70 hover:text-white hover:bg-sky-900/60' 
                    : 'text-sky-900 bg-sky-50 border-sky-300 hover:bg-sky-100'
                }`}
              >
                <Download className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            {/* Dark Neon / Light Theme Toggle Button */}
            {onToggleNeonMode && (
              <button
                type="button"
                onClick={onToggleNeonMode}
                title={isNeonMode ? "Ganti ke Tema Terang (Light Theme)" : "Ganti ke Tema Dark Neon Futuristik (Multi-Colour)"}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
                  isNeonMode 
                    ? 'bg-[#060a18] text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.45)] hover:shadow-[0_0_20px_rgba(6,182,212,0.7)]'
                    : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {isNeonMode ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40 animate-pulse" />
                    <span className="text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">Dark Neon ⚡</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-400/30" />
                    <span className="text-slate-900 font-extrabold">Light Mode ☀️</span>
                  </>
                )}
              </button>
            )}

            {/* Add New Project Button */}
            <button
              type="button"
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg transition-all shadow-sm shadow-sky-600/30 hover:shadow-sky-600/40 active:scale-[0.98] cursor-pointer"
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
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  isNeonMode 
                    ? 'text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border-transparent hover:border-rose-900/60' 
                    : 'text-slate-700 hover:text-rose-700 hover:bg-rose-50 border-slate-200'
                }`}
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline text-[11px]">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
