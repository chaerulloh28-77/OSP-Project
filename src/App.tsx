import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  HardHat, 
  Layers, 
  Activity, 
  CheckCircle, 
  Info,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  ChevronRight,
  GitCommit,
  LayoutGrid,
  Table as TableIcon,
  Grid3X3,
  AlignJustify,
  Trash2,
  RotateCcw,
  ShieldCheck,
  PieChart
} from 'lucide-react';
import { ProjectData, TabKey } from './types/project';
import {
  calculateGalianPercentage,
  calculatePullingPercentage,
  calculatePullingFoPercentage,
} from './data/dropdownOptions';
import { 
  PROJECT_LIST_COLUMNS, 
  CONSTRUCTION_PLAN_COLUMNS, 
  STATUS_PROJECT_COLUMNS, 
  STATUS_CONSTRUCTION_COLUMNS,
  PROJECT_TRACKING_PIPELINE_COLUMNS,
  TAB_CONFIG 
} from './data/tabColumns';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { TableView } from './components/TableView';
import { ProjectCardGrid } from './components/ProjectCardGrid';
import { PipelineBoard } from './components/PipelineBoard';
import { SidebarNav } from './components/SidebarNav';
import { TabVisualIcon } from './components/TabVisualIcon';
import { ProjectFormModal } from './components/ProjectFormModal';
import { ProjectDetailDrawer } from './components/ProjectDetailDrawer';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ClearAllConfirmModal } from './components/ClearAllConfirmModal';
import { ClearDescriptionConfirmModal } from './components/ClearDescriptionConfirmModal';
import { UploadDocumentView } from './components/UploadDocumentView';
import { PieChartAnalyticsView } from './components/PieChartAnalyticsView';
import { LoginPage } from './components/LoginPage';
import { PriorityTierBar } from './components/PriorityTierBar';
import { authService, AuthUser } from './services/authService';

export default function App() {
  // Current user authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // Master projects dataset (pure local storage)
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('pie-chart-analytics');
  const [pieChartInitialTabFocus, setPieChartInitialTabFocus] = useState<TabKey | undefined>(undefined);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedPic, setSelectedPic] = useState('');
  const [selectedWaspang, setSelectedWaspang] = useState('');
  const [activeKpiFilter, setActiveKpiFilter] = useState<{ key: string; value: string } | null>(null);

  // View Mode: 'normal' (tabel standar) | 'compact' (tabel ringkas/padat) | 'card' (card grid)
  const [tableViewMode, setTableViewMode] = useState<'normal' | 'compact' | 'card'>('normal');

  // Tab 5 Pipeline View Mode: 'board' or 'sheet'
  const [pipelineViewMode, setPipelineViewMode] = useState<'board' | 'sheet'>('board');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Neon Light Mode state (defaults to true for incredible cool neon glow styling)
  const [isNeonMode, setIsNeonMode] = useState<boolean>(true);

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<ProjectData | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);

  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearDescriptionModalOpen, setIsClearDescriptionModalOpen] = useState(false);

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // 1. Initial Load & Local Storage Subscription
  useEffect(() => {
    // Initial load from local storage
    storageService.loadProjects().then((loaded) => {
      if (loaded) {
        setProjects(loaded);
        setLastSavedTime(new Date().toISOString());
      }
    }).catch((err) => {
      console.error('Local load error:', err);
    });

    // In-app & cross-tab synchronization listener
    const unsubscribeStorage = storageService.subscribeProjects(
      (latestProjects) => {
        setProjects(latestProjects);
        setLastSavedTime(new Date().toISOString());
      }
    );

    return () => {
      unsubscribeStorage();
    };
  }, []);

  // 2. Persist state updates to local storage
  const persistChanges = useCallback((updatedProjects: ProjectData[]) => {
    setProjects(updatedProjects);
    storageService.saveProjects(updatedProjects).then((result) => {
      if (result && result.success) {
        setLastSavedTime(result.timestamp);
      }
    }).catch((err) => {
      console.error('Local batch persist error:', err);
    });
  }, []);

  // Filter projects based on active filters
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      // Direct KPI Card filter handling
      if (activeKpiFilter) {
        if (activeKpiFilter.key === 'statusConstruction' || activeKpiFilter.value === 'Construction') {
          const isConstruction = 
            item.statusConstruction === 'Pulling Cable' || 
            item.statusConstruction === 'Completed' || 
            item.statusConstruction === 'In Progress' ||
            item.projectStatus === 'In Progress' ||
            Number(item.pullingPanjangSelesai || 0) > 0 ||
            Number(item.pullingFoPanjangSelesai || 0) > 0;
          if (!isConstruction) return false;
        }
        if (activeKpiFilter.key === 'Review Dinas' || activeKpiFilter.key === 'Masih Review Dinas') {
          const isReview = 
            item.projectStatus === 'Review Dinas' || 
            item.projectStatus === 'Masih Review Dinas' ||
            (Boolean(item.projectStatus) && item.projectStatus.toLowerCase().includes('review'));
          if (!isReview) return false;
        }
        if (activeKpiFilter.key === 'Has Galian Length' || activeKpiFilter.key === 'Relokasi Galian') {
          if (!item.galianPanjangTotal || Number(item.galianPanjangTotal) <= 0) return false;
        }
        if (activeKpiFilter.key === 'Has Length' && (!item.panjangRelokasi || Number(item.panjangRelokasi) <= 0)) {
          return false;
        }
        if (activeKpiFilter.key === 'Project Not Started' || activeKpiFilter.value === 'Project Not Started') {
          const isNotStarted = item.projectStatus === 'Project Not Started' || !item.projectStatus || item.projectStatus === 'Not Yet';
          if (!isNotStarted) return false;
        }
        if (activeKpiFilter.key === 'In Progress' || activeKpiFilter.value === 'In Progress') {
          if (item.projectStatus !== 'In Progress' && item.statusConstruction !== 'Pulling Cable') return false;
        }
        if (activeKpiFilter.key === 'Project Cancel' || activeKpiFilter.value === 'Project Cancel' || activeKpiFilter.key === 'Cancelled') {
          const isCancel = item.projectStatus === 'Cancelled' || item.projectStatus === 'Project Cancel' || item.statusPengajuanProject === 'Project Cancel';
          if (!isCancel) return false;
        }
        if (activeKpiFilter.key === 'Completed' || activeKpiFilter.value === 'Completed') {
          const isDone = item.projectStatus === 'Completed' || item.statusConstruction === 'Completed';
          if (!isDone) return false;
        }
        if (activeKpiFilter.key === 'MR/PO Approved' || activeKpiFilter.key === 'PO Released' || activeKpiFilter.key === 'Approved') {
          const isApproved =
            item.statusPengajuanProject === 'Approved' ||
            item.statusPengajuanProject === 'Release' ||
            item.statusPengajuanProject === 'Released' ||
            item.statusPengajuanPo === 'Approved' ||
            item.statusPengajuanPo === 'Released' ||
            item.statusPengajuanPo === 'Release' ||
            item.statusPengajuanMr === 'Approved' ||
            item.statusPengajuanMr === 'Released' ||
            item.statusPengajuanMr === 'Release';
          if (!isApproved) return false;
        }
        if (activeKpiFilter.key === 'Pulling Cable' || activeKpiFilter.value === 'Pulling Cable') {
          const isPulling =
            item.statusConstruction === 'Pulling Cable' ||
            item.statusPullingCableFo === 'In Progress' ||
            item.statusPullingCableFo === 'Done' ||
            (Boolean(item.pullingCableProgress) && item.pullingCableProgress !== '0%' && item.pullingCableProgress !== 'N/A') ||
            (Boolean(item.pullingCableFoProgress) && item.pullingCableFoProgress !== '0%' && item.pullingCableFoProgress !== 'N/A') ||
            Number(item.pullingFoPanjangSelesai || 0) > 0 ||
            Number(item.pullingPanjangSelesai || 0) > 0;
          if (!isPulling) return false;
        }
      }

      // Search term matches across multiple fields
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery = 
          (item.pmoId || '').toLowerCase().includes(query) ||
          (item.projectDescription || '').toLowerCase().includes(query) ||
          (item.projectId || '').toLowerCase().includes(query) ||
          (item.picSectionHead || '').toLowerCase().includes(query) ||
          (item.namaVendor || '').toLowerCase().includes(query) ||
          (item.mrNumber || '').toLowerCase().includes(query) ||
          (item.poNumber || '').toLowerCase().includes(query) ||
          (item.areaKota || '').toLowerCase().includes(query) ||
          (item.projectCategory || '').toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (selectedArea && item.areaKota !== selectedArea) return false;
      if (selectedVendor && item.namaVendor !== selectedVendor) return false;
      if (selectedCategory && item.projectCategory !== selectedCategory) return false;
      if (selectedStatus) {
        if (selectedStatus === 'Review Dinas' || selectedStatus === 'Masih Review Dinas') {
          const isReview = 
            item.projectStatus === 'Review Dinas' || 
            item.projectStatus === 'Masih Review Dinas' ||
            (Boolean(item.projectStatus) && item.projectStatus.toLowerCase().includes('review'));
          if (!isReview) return false;
        } else if (selectedStatus === 'MR/PO Approved' || selectedStatus === 'Approved') {
          const isApproved =
            item.statusPengajuanProject === 'Approved' ||
            item.statusPengajuanProject === 'Release' ||
            item.statusPengajuanPo === 'Approved' ||
            item.statusPengajuanPo === 'Released' ||
            item.statusPengajuanMr === 'Approved' ||
            item.statusPengajuanMr === 'Released';
          if (!isApproved) return false;
        } else if (item.projectStatus !== selectedStatus) {
          return false;
        }
      }
      if (selectedPriority && (item.priority || 'Normal') !== selectedPriority) return false;
      if (selectedQuarter && item.quarter !== selectedQuarter) return false;
      if (selectedPic && item.picSectionHead !== selectedPic) return false;
      if (selectedWaspang && item.waspangDsb !== selectedWaspang) return false;

      return true;
    });
  }, [projects, activeKpiFilter, searchTerm, selectedZona, selectedArea, selectedVendor, selectedCategory, selectedStatus, selectedPriority, selectedQuarter, selectedPic, selectedWaspang]);

  // Current tab columns mapping
  const currentColumns = useMemo(() => {
    switch (activeTab) {
      case 'project-list':
        return PROJECT_LIST_COLUMNS;
      case 'construction-plan':
        return CONSTRUCTION_PLAN_COLUMNS;
      case 'status-project':
        return STATUS_PROJECT_COLUMNS;
      case 'status-construction':
        return STATUS_CONSTRUCTION_COLUMNS;
      case 'project-tracking-pipeline':
        return PROJECT_TRACKING_PIPELINE_COLUMNS;
      default:
        return PROJECT_LIST_COLUMNS;
    }
  }, [activeTab]);

  // Tab-specific summary metrics for informative tab banner
  const tabStats = useMemo(() => {
    // 2. Construction & Plan metrics
    const totalPanjangRelokasi = filteredProjects.reduce((acc, p) => acc + (Number(p.panjangRelokasi) || 0), 0);
    const doneSurveyCount = filteredProjects.filter((p) => p.statusSurvey === 'Done survey').length;
    const adaBaCount = filteredProjects.filter((p) => p.baSurvey === 'Ada' || p.baSurvey === 'Sudah BA').length;
    const adaApdCount = filteredProjects.filter((p) => p.apdRelokasi === 'Ada' || p.apdRelokasi === 'APD FTTH' || p.apdRelokasi === 'APD IKR' || p.apdRelokasi === 'Sudah').length;
    const uniqueVendorsCount = new Set(filteredProjects.map((p) => p.namaVendor).filter(Boolean)).size;

    // 3. Status Project metrics
    const releasePengajuanCount = filteredProjects.filter((p) => p.statusPengajuanProject === 'Release').length;
    const approvedPengajuanCount = filteredProjects.filter((p) => p.statusPengajuanProject === 'Approved').length;
    const submitPengajuanCount = filteredProjects.filter((p) => p.statusPengajuanProject === 'Submit').length;
    const notYetPengajuanCount = filteredProjects.filter((p) => !p.statusPengajuanProject || p.statusPengajuanProject === 'Not Yet').length;
    const hasCreateDateCount = filteredProjects.filter((p) => Boolean(p.projectCreateDate && p.projectCreateDate.trim() !== '')).length;
    const hasMrNumberCount = filteredProjects.filter((p) => Boolean(p.mrNumber && p.mrNumber.trim() !== '')).length;
    const closingDoneCount = filteredProjects.filter((p) => p.statusDokumenClosing && p.statusDokumenClosing !== 'Not Yet').length;

    // 4. Status Construction metrics
    const completedConstructionCount = filteredProjects.filter((p) => p.statusConstruction === 'Completed').length;
    const pullingCableConstructionCount = filteredProjects.filter((p) => p.statusConstruction === 'Pulling Cable').length;
    const inProgressConstructionCount = filteredProjects.filter((p) => p.statusConstruction === 'In Progress').length;
    const pullingFoDoneCount = filteredProjects.filter((p) => p.statusPullingCableFo === 'Done').length;
    const closingSapDoneCount = filteredProjects.filter((p) => p.closingSap === 'Done' || p.closingSap === 'Yes').length;

    return {
      totalPanjangRelokasi,
      doneSurveyCount,
      adaBaCount,
      adaApdCount,
      uniqueVendorsCount,
      releasePengajuanCount,
      approvedPengajuanCount,
      submitPengajuanCount,
      notYetPengajuanCount,
      hasCreateDateCount,
      hasMrNumberCount,
      closingDoneCount,
      completedConstructionCount,
      pullingCableConstructionCount,
      inProgressConstructionCount,
      pullingFoDoneCount,
      closingSapDoneCount,
    };
  }, [filteredProjects]);

  // Handler: Add / Update Project (CRUD: Create & Edit locally)
  const handleSaveProject = async (data: ProjectData) => {
    const isEdit = projects.some((p) => p.id === data.id);
    let updated: ProjectData[];

    if (isEdit) {
      updated = projects.map((p) => (p.id === data.id ? data : p)).sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
      setProjects(updated);
      showToast(`Project ${data.pmoId} berhasil disimpan.`);
    } else {
      updated = [...projects, data].sort((a, b) => (Number(a.no) || 0) - (Number(b.no) || 0));
      setProjects(updated);
      showToast(`Project baru ${data.pmoId} berhasil ditambahkan.`);
    }

    if (detailProject && detailProject.id === data.id) {
      setDetailProject(data);
    }

    try {
      const res = await storageService.saveProject(data);
      if (res && res.timestamp) {
        setLastSavedTime(res.timestamp);
      }
    } catch (err) {
      console.error('Error saving project locally:', err);
      showToast('Gagal menyimpan project.');
    }
  };

  // Handler: Delete Single Project
  const handleDeleteProject = async (target: ProjectData) => {
    const updated = projects.filter((p) => p.id !== target.id);
    setProjects(updated);
    showToast(`Project ${target.pmoId} berhasil dihapus.`);
    
    if (detailProject && detailProject.id === target.id) {
      setIsDetailDrawerOpen(false);
      setDetailProject(null);
    }

    try {
      await storageService.deleteProject(target.id);
    } catch (err) {
      console.error('Error deleting project locally:', err);
      showToast('Gagal menghapus project.');
    }
  };

  // Handler: Hapus Semua Data Project List (0 projects)
  const handleClearAllProjects = async () => {
    setProjects([]);
    setLastSavedTime(new Date().toISOString());
    setIsClearAllModalOpen(false);
    showToast('Seluruh data project berhasil dikosongkan.');

    try {
      await storageService.clearAllProjects();
    } catch (err) {
      console.error('Error clearing projects:', err);
      showToast('Gagal mengosongkan data project.');
    }
  };

  // Handler: Hapus dan Bersihkan seluruh data di dalam Project Description
  const handleClearAllProjectDescriptions = async () => {
    const updated = projects.map((p) => ({
      ...p,
      projectDescription: '',
      updatedAt: new Date().toISOString(),
    }));
    persistChanges(updated);
    setIsClearDescriptionModalOpen(false);
    showToast('Data di dalam Project Description berhasil dihapus dan dibersihkan.');

    try {
      await storageService.clearAllProjectDescriptions();
    } catch (err) {
      console.error('Error clearing project descriptions:', err);
      showToast('Gagal membersihkan data Project Description.');
    }
  };

  // Handler: Inline cell quick update (single row local storage sync)
  const handleQuickUpdateCell = (projectId: string, field: keyof ProjectData, value: string) => {
    let modifiedRow: ProjectData | null = null;
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        const item: ProjectData = {
          ...p,
          [field]: value,
          updatedAt: new Date().toISOString(),
        };

        // Auto-recalculate Galian Progress if statusConstruction or galian progress is updated
        if (field === 'statusConstruction' || field === 'galianSipilProgress') {
          item.galianSipilProgress = calculateGalianPercentage(
            item.statusConstruction,
            field === 'galianSipilProgress' ? value : item.galianSipilProgress
          );
        }

        // Auto-recalculate Pulling Cable Progress if FO or status construction is updated
        if (
          field === 'statusPullingCableFo' ||
          field === 'pullingFoPanjangSelesai' ||
          field === 'pullingFoPanjangTotal' ||
          field === 'pullingCableFoProgress' ||
          field === 'statusConstruction' ||
          field === 'pullingPanjangSelesai' ||
          field === 'pullingPanjangTotal' ||
          field === 'pullingCableProgress' ||
          field === 'panjangRelokasi' ||
          field === 'galianPanjangTotal' ||
          field === 'galianPanjangSelesai' ||
          field === 'galianSipilProgress'
        ) {
          // 1. Sync FO Relokasi with Target Meter FO
          if (field === 'panjangRelokasi') {
            const num = Number(value) || 0;
            item.pullingFoPanjangTotal = num;
            if (!item.galianPanjangTotal || Number(item.galianPanjangTotal) === 0) {
              item.galianPanjangTotal = num;
            }
          }
          if (field === 'pullingFoPanjangTotal') {
            item.panjangRelokasi = Number(value) || 0;
            if (!item.galianPanjangTotal || Number(item.galianPanjangTotal) === 0) {
              item.galianPanjangTotal = Number(value) || 0;
            }
          }

          // 3. Sync Galian Sipil Progress with Target Meter Galian & Meter Selesai
          const galianTotal = Number(item.galianPanjangTotal || item.panjangRelokasi || 0);
          let galianDone = Number(item.galianPanjangSelesai || 0);

          if (field === 'galianSipilProgress') {
            const sVal = String(value || '').trim();
            if (sVal === '100%' || sVal.toLowerCase() === 'done' || sVal.toLowerCase() === 'completed') {
              if (galianTotal > 0) {
                galianDone = galianTotal;
                item.galianPanjangSelesai = galianTotal;
              }
            } else if (sVal.includes('%')) {
              const pct = parseInt(sVal, 10);
              if (!isNaN(pct) && galianTotal > 0) {
                galianDone = Math.round((pct / 100) * galianTotal);
                item.galianPanjangSelesai = galianDone;
              }
            }
          } else if (field === 'galianPanjangSelesai' || field === 'galianPanjangTotal' || field === 'panjangRelokasi') {
            if (galianTotal > 0 && galianDone > 0) {
              const pct = Math.min(100, Math.round((galianDone / galianTotal) * 100));
              item.galianSipilProgress = `${pct}%`;
            } else if (galianDone === 0) {
              item.galianSipilProgress = '0%';
            }
          }

          // 4. FO Pulling Recalculation
          const foTotal = Number(item.pullingFoPanjangTotal || item.panjangRelokasi || 0);
          let foDone = Number(item.pullingFoPanjangSelesai || 0);

          // If FO is marked Done and done meters is 0, auto-fill to total
          if (field === 'statusPullingCableFo' && value === 'Done' && foDone === 0 && foTotal > 0) {
            foDone = foTotal;
            item.pullingFoPanjangSelesai = foTotal;
          }

          if (field !== 'pullingCableFoProgress') {
            item.pullingCableFoProgress = calculatePullingFoPercentage(
              item.statusPullingCableFo || 'Not Yet',
              foDone,
              foTotal,
              item.statusConstruction
            );
          }

          // 5. Overall Pulling Recalculation (FO based)
          if (field !== 'pullingCableProgress') {
            item.pullingCableProgress = item.pullingCableFoProgress || '0%';
          }

          if (item.pullingCableProgress === '100%' && item.statusConstruction === 'Pulling Cable') {
            item.statusPullingCableFo = 'Done';
          }
        }

        modifiedRow = item;
        return item;
      }
      return p;
    });

    setProjects(updated);
    showToast(`Perubahan sel tersimpan.`);

    if (modifiedRow) {
      storageService.saveProject(modifiedRow).catch((err) => {
        console.error('Failed to sync cell update to Firestore:', err);
      });
    }
  };

  // Handler: Quick jumping across tabs for a project
  const handleJumpToTab = (tab: TabKey, project: ProjectData) => {
    setActiveTab(tab);
    setSearchTerm(project.pmoId);
    showToast(`Membuka ${project.pmoId} di ${tab}`);
  };

  // Handler: Quick filter from StatsBar cards
  const handleQuickFilter = (key: string, value: string) => {
    if (key === 'all') {
      handleResetFilters();
      showToast('Menampilkan seluruh data project');
      return;
    }
    
    if (activeKpiFilter?.key === value) {
      setActiveKpiFilter(null);
      showToast('Filter status dinonaktifkan');
    } else {
      setActiveKpiFilter({ key: value, value });
      showToast(`Memfilter tampilan: ${value}`);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedZona('');
    setSelectedArea('');
    setSelectedVendor('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedQuarter('');
    setSelectedPic('');
    setSelectedWaspang('');
    setActiveKpiFilter(null);
  };

  const currentTabMeta = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];

  // If user is not authenticated, display login screen
  if (!currentUser) {
    return (
      <>
        <LoginPage 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast(`Selamat datang, ${user.name}!`);
          }} 
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`h-screen flex flex-col antialiased overflow-hidden transition-colors duration-300 ${
      isNeonMode 
        ? 'bg-[#060814] text-slate-100' 
        : 'bg-slate-100 text-slate-800'
    }`}>
      {/* 1. Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onNewProject={() => {
          setEditingProject(null);
          setIsFormModalOpen(true);
        }}
        projects={projects}
        onExportExcel={() => {
          const res = storageService.exportToExcel(projects);
          if (res.success) {
            showToast(`File Excel berhasil diunduh (${res.count} proyek).`);
          } else {
            showToast('Tidak ada data proyek untuk diekspor.');
          }
        }}
        onExportCsv={() => {
          const res = storageService.exportToCsv(projects);
          if (res.success) {
            showToast(`File CSV berhasil diunduh (${res.count} proyek).`);
          } else {
            showToast('Tidak ada data proyek untuk diekspor.');
          }
        }}
        lastSavedTime={lastSavedTime}
        totalProjects={projects.length}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
        onClearAll={() => setIsClearAllModalOpen(true)}
        onClearDescriptions={() => setIsClearDescriptionModalOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
          showToast('Anda telah berhasil keluar dari aplikasi.');
        }}
        isNeonMode={isNeonMode}
        onToggleNeonMode={() => {
          setIsNeonMode((prev) => !prev);
          showToast(`Mode Neon Light: ${!isNeonMode ? 'AKTIF 💡' : 'NONAKTIF'}`);
        }}
      />

      {/* Main Body Container with Left Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Menu */}
        <SidebarNav
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          totalProjects={projects.length}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            {/* KPI Stats Summary Bar */}
            <StatsBar 
              projects={projects} 
              onQuickFilter={handleQuickFilter}
              activeFilterValue={activeKpiFilter?.key || selectedStatus || (searchTerm ? 'Search' : '')}
              onSelectProject={(proj) => {
                setDetailProject(proj);
                setIsDetailDrawerOpen(true);
              }}
              showToast={showToast}
              isNeonMode={isNeonMode}
            />

            {/* Google Sheets-style Horizontal Workbook Tab Bar */}
            <div className={`mb-4 p-1.5 rounded-xl border flex items-center overflow-x-auto gap-1.5 scrollbar-none transition-all duration-300 ${
              isNeonMode 
                ? 'bg-slate-950/80 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'bg-slate-200/90 border-slate-300/80 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className={`hidden md:flex items-center gap-1 text-[11px] font-bold uppercase px-2 font-mono border-r ${
                  isNeonMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-300'
                }`}>
                  <FileSpreadsheet className={`w-3.5 h-3.5 ${isNeonMode ? 'text-cyan-400' : 'text-slate-400'}`} />
                  WORKBOOK SHEETS
                </span>
                {TAB_CONFIG.map((tab, idx) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        showToast(`Buka Sheet: ${tab.label}`);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? isNeonMode
                            ? 'bg-[#0e162e] text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)] border border-cyan-400/50 scale-102 font-extrabold'
                            : 'bg-slate-900 text-sky-400 shadow-sm border border-slate-800 scale-102 font-extrabold ring-2 ring-sky-400/20'
                          : isNeonMode
                          ? 'bg-slate-900/40 text-slate-400 hover:bg-slate-900/80 hover:text-white border border-slate-800/60 shadow-3xs'
                          : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200 shadow-3xs'
                      }`}
                    >
                      <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                        isActive 
                          ? isNeonMode ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-800 text-sky-300' 
                          : isNeonMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <TabVisualIcon tabKey={tab.id} isActive={isActive} size="sm" variant="minimal" />
                      <span>{tab.label.split('.').slice(1).join('.').trim() || tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Header Banner with Sheet Information & Modern Controls */}
            <div className={`mb-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-300 space-y-3 ${
              isNeonMode 
                ? 'bg-[#0a0f1d]/90 border-cyan-500/20 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                : 'bg-white border-slate-200/90 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <TabVisualIcon tabKey={activeTab} isActive={true} size="lg" variant="solid" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-base font-bold tracking-tight ${isNeonMode ? 'text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.3)]' : 'text-slate-900'}`}>{currentTabMeta.label}</h2>
                      <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${
                        isNeonMode ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {filteredProjects.length} data proyek
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isNeonMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {currentTabMeta.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  {/* View Mode Switcher: Tabel Standar, Tabel Compact, Card Grid, or Pie Chart */}
                  {activeTab === 'pie-chart-analytics' ? (
                    <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/90 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab(pieChartInitialTabFocus || 'project-list');
                          showToast('Kembali ke tampilan tabel');
                        }}
                        title="Kembali ke Tampilan Tabel Data"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all bg-white text-sky-700 shadow-2xs cursor-pointer font-semibold"
                      >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span>Kembali ke Tabel</span>
                      </button>
                    </div>
                  ) : (activeTab !== 'project-tracking-pipeline' && activeTab !== 'upload-document') || pipelineViewMode === 'sheet' ? (
                    <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/90 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setTableViewMode('normal');
                          showToast('Tampilan Tabel Standar aktif');
                        }}
                        title="Tampilan Tabel Standar (Lebar baris normal)"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                          tableViewMode === 'normal'
                            ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tabel Normal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTableViewMode('compact');
                          showToast('Tampilan Tabel Compact (Rapat & Padat) aktif');
                        }}
                        title="Tampilan Tabel Compact (Baris lebih padat, muat lebih banyak data)"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                          tableViewMode === 'compact'
                            ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <AlignJustify className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tabel Compact</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTableViewMode('card');
                          showToast('Tampilan Card Grid aktif');
                        }}
                        title="Tampilan Kartu Kotak Grid (Card Grid)"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                          tableViewMode === 'card'
                            ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Grid3X3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Card Grid</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPieChartInitialTabFocus(activeTab);
                          setActiveTab('pie-chart-analytics');
                          showToast(`Membuka Grafik Pie Chart untuk ${currentTabMeta.label}`);
                        }}
                        title="Buka Tampilan Grafik Pie Chart Analitik 6 Dimensi"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-all text-indigo-700 hover:bg-white/80 cursor-pointer"
                      >
                        <PieChart className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">Grafik Pie</span>
                      </button>
                    </div>
                  ) : null}

                {/* View Switcher for Tab 5 Pipeline */}
                {activeTab === 'project-tracking-pipeline' && (
                  <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/90 text-xs">
                    <button
                      type="button"
                      onClick={() => setPipelineViewMode('board')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                        pipelineViewMode === 'board'
                          ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Pipeline Board</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPipelineViewMode('sheet')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                        pipelineViewMode === 'sheet'
                          ? 'bg-white text-purple-700 shadow-2xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                      <span>Sheet Table</span>
                    </button>
                  </div>
                )}

                {/* Hapus Semua Data Project List button */}
                {projects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsClearAllModalOpen(true)}
                    title="Hapus Seluruh Data Project"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/90 rounded-lg transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Hapus Semua Data</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsFormModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg transition-all shadow-sm shadow-sky-600/25 active:scale-[0.98] cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Input Data Baru</span>
                </button>
              </div>
            </div>

            {/* Dedicated Tab Information Bar for Construction & Plan (Sheet 2) */}
            {activeTab === 'construction-plan' && (
              <div className="pt-3 border-t border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-in fade-in duration-150">
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Target Relokasi</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {tabStats.totalPanjangRelokasi.toLocaleString('id-ID')} m
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Survey Lapangan</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {tabStats.doneSurveyCount} Selesai • {filteredProjects.length - tabStats.doneSurveyCount} Belum
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">BA Survey & APD</span>
                  <span className="text-xs font-semibold text-indigo-700">
                    {tabStats.adaBaCount} Ada BA • {tabStats.adaApdCount} Ada APD
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Nama Vendor Konstruksi</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {tabStats.uniqueVendorsCount} Nama Vendor Terdata
                  </span>
                </div>
              </div>
            )}

            {/* Dedicated Tab Information Bar for Status Project (Sheet 3) */}
            {activeTab === 'status-project' && (
              <div className="pt-3 border-t border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-in fade-in duration-150">
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Pengajuan</span>
                  <span className="text-xs font-semibold text-indigo-700">
                    {tabStats.releasePengajuanCount} Release • {tabStats.approvedPengajuanCount} Approved
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Project Create Date</span>
                  <span className="text-xs font-semibold text-sky-700 font-mono">
                    {tabStats.hasCreateDateCount} Proyek Terdata
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">MR Number</span>
                  <span className="text-xs font-semibold text-emerald-700 font-mono">
                    {tabStats.hasMrNumberCount} MR Diterbitkan
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Dokumen Closing</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {tabStats.closingDoneCount} Dokumen Selesai / Teco
                  </span>
                </div>
              </div>
            )}

            {/* Dedicated Tab Information Bar for Status Construction (Sheet 4) */}
            {activeTab === 'status-construction' && (
              <div className="pt-3 border-t border-slate-150 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-150">
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Konstruksi Fisik</span>
                  <span className="text-xs font-semibold text-emerald-700">
                    {tabStats.completedConstructionCount} Completed • {tabStats.pullingCableConstructionCount} Pulling
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pulling Cable FO</span>
                  <span className="text-xs font-semibold text-sky-700">
                    {tabStats.pullingFoDoneCount} Selesai (Done)
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Closing SAP</span>
                  <span className="text-xs font-semibold text-slate-800 font-mono">
                    {tabStats.closingSapDoneCount} Selesai Closing
                  </span>
                </div>
              </div>
            )}
          </div>

            {/* Priority Indicator Tiers (Level 1-5) */}
            {activeTab !== 'upload-document' && activeTab !== 'pie-chart-analytics' && (
              <PriorityTierBar
                projects={projects}
                selectedPriority={selectedPriority}
                onSelectPriority={setSelectedPriority}
              />
            )}

            {/* Filter and Search Bar (Tabs 1-5) */}
            {activeTab !== 'upload-document' && activeTab !== 'pie-chart-analytics' && (
              <FilterBar
                activeTab={activeTab}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedZona={selectedZona}
                onZonaChange={setSelectedZona}
                selectedArea={selectedArea}
                onAreaChange={setSelectedArea}
                selectedVendor={selectedVendor}
                onVendorChange={setSelectedVendor}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedPriority={selectedPriority}
                onPriorityChange={setSelectedPriority}
                selectedQuarter={selectedQuarter}
                onQuarterChange={setSelectedQuarter}
                selectedPic={selectedPic}
                onPicChange={setSelectedPic}
                selectedWaspang={selectedWaspang}
                onWaspangChange={setSelectedWaspang}
                onResetFilters={handleResetFilters}
                totalResults={filteredProjects.length}
                allProjects={projects}
              />
            )}

            {/* 3. Main View Area (Pie Chart, Upload Document, Board, Card Grid, or Table View) */}
            {activeTab === 'pie-chart-analytics' ? (
              <PieChartAnalyticsView
                projects={projects}
                onViewDetail={(proj) => {
                  setDetailProject(proj);
                  setIsDetailDrawerOpen(true);
                }}
                onEditProject={(proj) => {
                  setEditingProject(proj);
                  setIsFormModalOpen(true);
                }}
                onJumpToTab={handleJumpToTab}
                initialTabFocus={pieChartInitialTabFocus}
                showToast={showToast}
                onNewProject={() => {
                  setEditingProject(null);
                  setIsFormModalOpen(true);
                }}
              />
            ) : activeTab === 'upload-document' ? (
              <UploadDocumentView
                projects={projects}
                onOpenNewProject={() => {
                  setEditingProject(null);
                  setIsFormModalOpen(true);
                }}
                showToast={showToast}
              />
            ) : activeTab === 'project-tracking-pipeline' && pipelineViewMode === 'board' ? (
              <PipelineBoard
                projects={filteredProjects}
                onViewDetail={(proj) => {
                  setDetailProject(proj);
                  setIsDetailDrawerOpen(true);
                }}
                onEdit={(proj) => {
                  setEditingProject(proj);
                  setIsFormModalOpen(true);
                }}
                onJumpToTab={handleJumpToTab}
              />
            ) : tableViewMode === 'card' ? (
              <ProjectCardGrid
                data={filteredProjects}
                activeTab={activeTab}
                onEdit={(proj) => {
                  setEditingProject(proj);
                  setIsFormModalOpen(true);
                }}
                onDelete={(proj) => {
                  setProjectToDelete(proj);
                  setIsDeleteModalOpen(true);
                }}
                onViewDetail={(proj) => {
                  setDetailProject(proj);
                  setIsDetailDrawerOpen(true);
                }}
                onJumpToTab={handleJumpToTab}
              />
            ) : (
              <TableView
                columns={currentColumns}
                data={filteredProjects}
                activeTab={activeTab}
                isCompact={tableViewMode === 'compact'}
                onEdit={(proj) => {
                  setEditingProject(proj);
                  setIsFormModalOpen(true);
                }}
                onDelete={(proj) => {
                  setProjectToDelete(proj);
                  setIsDeleteModalOpen(true);
                }}
                onViewDetail={(proj) => {
                  setDetailProject(proj);
                  setIsDetailDrawerOpen(true);
                }}
                onJumpToTab={handleJumpToTab}
                onQuickUpdateCell={handleQuickUpdateCell}
                onNewProject={() => {
                  setEditingProject(null);
                  setIsFormModalOpen(true);
                }}
              />
            )}

            {/* Footer Copyright */}
            <footer className="mt-8 mb-4 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 tracking-tight font-sans">Monitoring GOV FMI_DSB</span>
                <span>•</span>
                <span className="font-medium text-sky-700">© PAUL</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hak Cipta Dilindungi Undang-Undang
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* 4. CRUD Modals & Drawers */}
      
      {/* Create / Edit Project Modal */}
      <ProjectFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
        totalProjects={projects.length}
        existingProjects={projects}
      />

      {/* Complete Project Detail Drawer (All Tabs for selected row) */}
      <ProjectDetailDrawer
        isOpen={isDetailDrawerOpen}
        project={detailProject}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setDetailProject(null);
        }}
        onEdit={(proj) => {
          setIsDetailDrawerOpen(false);
          setEditingProject(proj);
          setIsFormModalOpen(true);
        }}
        onJumpToTab={handleJumpToTab}
      />

      {/* Delete Single Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        project={projectToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteProject}
      />

      {/* Delete All Projects Confirmation Modal */}
      <ClearAllConfirmModal
        isOpen={isClearAllModalOpen}
        totalProjects={projects.length}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={handleClearAllProjects}
      />

      {/* Clear Project Description Confirmation Modal */}
      <ClearDescriptionConfirmModal
        isOpen={isClearDescriptionModalOpen}
        totalProjects={projects.length}
        onClose={() => setIsClearDescriptionModalOpen(false)}
        onConfirm={handleClearAllProjectDescriptions}
      />

      {/* Live Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
