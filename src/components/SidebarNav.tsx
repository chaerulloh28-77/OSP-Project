import React from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Building2,
  Clock,
  Layers,
  Database,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { TabKey } from '../types/project';
import { TAB_CONFIG } from '../data/tabColumns';
import { TabVisualIcon } from './TabVisualIcon';

interface SidebarNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalProjects: number;
  isNeonMode?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  totalProjects,
  isNeonMode = true,
}) => {
  const getTabNumberBadge = (id: TabKey) => {
    switch (id) {
      case 'dashboard-overview': return '1';
      case 'project-list': return '2';
      case 'construction-plan': return '3';
      case 'status-construction': return '4';
      case 'daily-mandor': return '5';
      case 'status-project': return '6';
      case 'project-tracking-pipeline': return '7';
      case 'closing-project': return '8';
      case 'upload-document': return '9';
      case 'pie-chart-analytics': return '9';
      default: return '•';
    }
  };

  return (
    <aside
      className={`border-r transition-all duration-200 flex flex-col shrink-0 select-none z-20 ${
        isNeonMode
          ? 'bg-[#060815] border-cyan-500/20 shadow-[5px_0_20px_rgba(6,182,212,0.03)] text-slate-200'
          : 'bg-white border-slate-300/90 shadow-sm text-slate-900 font-semibold'
      } ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Sidebar Header Brand (When collapsed/expanded) */}
      <div className={`h-16 px-4 border-b flex items-center justify-between ${
        isNeonMode ? 'border-slate-800/80' : 'border-slate-200 bg-slate-50/50'
      }`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm ring-1 ring-white/10">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className={`font-extrabold text-xs tracking-tight block truncate ${
                isNeonMode ? 'text-white' : 'text-slate-900'
              }`} title="Monitoring GOV FMI_DSB">
                Monitoring GOV
              </span>
              <span className={`text-[10px] font-bold block truncate ${
                isNeonMode ? 'text-sky-400' : 'text-sky-700'
              }`} title="FMI_DSB">
                FMI_DSB
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Perlebar Menu Samping' : 'Ciutkan Menu Samping'}
          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
            isNeonMode 
              ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
          } ${isCollapsed ? 'hidden' : 'block'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Group */}
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-1">
        {!isCollapsed && (
          <div className={`px-3 pt-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider ${
            isNeonMode ? 'text-slate-400' : 'text-slate-900'
          }`}>
            Daftar Sheet
          </div>
        )}

        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.id;
          const isPipeline = tab.id === 'project-tracking-pipeline';
          const isPieChart = tab.id === 'pie-chart-analytics';
          const tabNum = getTabNumberBadge(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                isActive
                  ? isNeonMode
                    ? isPieChart
                      ? 'bg-[#181a40] text-indigo-300 border border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                      : isPipeline
                      ? 'bg-[#25133d] text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-[#0d223f] text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 text-white font-extrabold shadow-sm border border-slate-900'
                  : isNeonMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  : 'text-slate-900 hover:text-black hover:bg-slate-100 border border-slate-200/60 font-extrabold'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <span className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r ${
                  isNeonMode
                    ? isPieChart
                      ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]'
                      : isPipeline
                      ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]'
                      : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                    : 'bg-sky-600'
                }`} />
              )}

              {/* Attractive Colorful Tab Icon */}
              <TabVisualIcon 
                tabKey={tab.id} 
                isActive={isActive} 
                size="md" 
                variant="badge" 
              />

              {/* Label & Details when not collapsed */}
              {!isCollapsed && (
                <div className="flex-1 text-left truncate">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`truncate text-xs ${
                      isActive 
                        ? 'font-extrabold text-white' 
                        : isNeonMode 
                        ? 'font-medium text-slate-200' 
                        : 'font-extrabold text-slate-900'
                    }`}>
                      {tab.label}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 font-extrabold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : isNeonMode 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-slate-200 text-slate-900'
                    }`}>
                      {tabNum}
                    </span>
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${
                    isNeonMode ? 'text-slate-400' : 'text-slate-700 font-bold'
                  }`}>
                    {tab.id === 'dashboard-overview' && 'Ringkasan KPI & Analitik Pie Chart'}
                    {tab.id === 'project-list' && 'Tabel master data & CRUD'}
                    {tab.id === 'construction-plan' && 'Perencanaan teknis & vendor'}
                    {tab.id === 'status-construction' && 'Progress galian & kabel FO'}
                    {tab.id === 'status-project' && 'Pengajuan Material, BOQ Labour & CE/BOQ'}
                    {tab.id === 'project-tracking-pipeline' && 'Pelacakan menyeluruh pipeline'}
                    {tab.id === 'closing-project' && 'No. PO, BA Opname, ABD, Foto & Analitik'}
                    {tab.id === 'daily-mandor' && 'Monitoring harian Mandor, Team, HH & Jalur Akses'}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Info */}
      <div className={`p-3 border-t ${
        isNeonMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
      }`}>
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className={`flex items-center justify-between text-[11px] ${
              isNeonMode ? 'text-slate-400' : 'text-slate-900 font-bold'
            }`}>
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Terdata</span>
              </span>
              <span className={`font-mono font-bold tabular-nums ${
                isNeonMode ? 'text-slate-200' : 'text-slate-900'
              }`}>
                {totalProjects} Project
              </span>
            </div>
            <div className={`p-2 rounded border text-[10px] ${
              isNeonMode 
                ? 'bg-slate-800/60 border-slate-700/60 text-slate-400' 
                : 'bg-white border-slate-300 text-slate-900 font-bold shadow-3xs'
            }`}>
              <span className="text-emerald-700 font-bold">● Auto-Save Aktif</span>
              <p className="mt-0.5 line-clamp-1">Data 7 halaman saling terhubung</p>
              <p className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-slate-900 font-extrabold tracking-wide">
                © PAUL
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            title="Buka Menu Samping"
            className={`w-full flex items-center justify-center p-2 rounded cursor-pointer ${
              isNeonMode 
                ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
