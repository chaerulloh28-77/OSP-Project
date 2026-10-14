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
  PieChart,
  FolderGit2
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
  CLOSING_PROJECT_COLUMNS,
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
import { DocumentProjectPageView } from './components/DocumentProjectPageView';
import { ClosingProjectPageView } from './components/ClosingProjectPageView';
import { PieChartAnalyticsView } from './components/PieChartAnalyticsView';
import { DailyMandorView } from './components/DailyMandorView';
import { LoginPage } from './components/LoginPage';
import { PriorityTierBar } from './components/PriorityTierBar';
import { authService, AuthUser } from './services/authService';

export default function App() {
  // Current user authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // Master projects dataset (pure local storage)
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard-overview');
  const [showPieChartInDashboard, setShowPieChartInDashboard] = useState<boolean>(true);
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
      case 'closing-project':
        return CLOSING_PROJECT_COLUMNS;
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
          const res = storageService.exportPageToExcel(filteredProjects, activeTab);
          if (res.success) {
            showToast(`File Excel ${res.filename} berhasil diunduh (${res.count} data).`);
          } else {
            showToast('Tidak ada data untuk diekspor.');
          }
        }}
        onExportCsv={() => {
          const res = storageService.exportPageToCsv(filteredProjects, activeTab);
          if (res.success) {
            showToast(`File CSV ${res.filename} berhasil diunduh (${res.count} data).`);
          } else {
            showToast('Tidak ada data untuk diekspor.');
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
            {/* KPI Stats Summary Bar - ONLY on Page 1 / Sheet 1 (Dashboard Overview) */}
            {activeTab === 'dashboard-overview' && (
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
            )}

            {/* Google Sheets-style Horizontal Workbook Tab Bar */}
            <div className={`mb-4 p-1.5 rounded-xl border flex items-center overflow-x-auto gap-1.5 custom-scrollbar transition-all duration-300 ${
              isNeonMode 
                ? 'bg-slate-950/80 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'bg-slate-200/90 border-slate-300/80 shadow-xs'
            }`}>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`hidden md:flex items-center gap-1 text-[11px] font-bold uppercase px-2 font-mono border-r shrink-0 ${
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isActive
                          ? isNeonMode
                            ? 'bg-[#0e162e] text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)] border border-cyan-400/50 scale-102 font-extrabold'
                            : 'bg-slate-900 text-sky-400 shadow-sm border border-slate-800 scale-102 font-extrabold ring-2 ring-sky-400/20'
                          : isNeonMode
                          ? 'bg-slate-900/40 text-slate-400 hover:bg-slate-900/80 hover:text-white border border-slate-800/60 shadow-3xs'
                          : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200 shadow-3xs'
                      }`}
                    >
                      <span className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-extrabold shrink-0 ${
                        isActive 
                          ? isNeonMode ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-800 text-sky-300' 
                          : isNeonMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <TabVisualIcon tabKey={tab.id} isActive={isActive} size="sm" variant="minimal" />
                      <span className="shrink-0">{tab.label.split('.').slice(1).join('.').trim() || tab.label}</span>
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
                  ) : (activeTab !== 'project-tracking-pipeline' && activeTab !== 'status-project') || pipelineViewMode === 'sheet' ? (
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
                          if (activeTab === 'project-list') {
                            setShowPieChartInDashboard((prev) => !prev);
                            showToast(`Grafik Pie Chart: ${!showPieChartInDashboard ? 'Ditampilkan' : 'Disembunyikan'}`);
                          } else {
                            setPieChartInitialTabFocus(activeTab);
                            setActiveTab('pie-chart-analytics');
                            showToast(`Membuka Grafik Pie Chart untuk ${currentTabMeta.label}`);
                          }
                        }}
                        title="Tampilkan / Sembunyikan Grafik Pie Chart Analitik"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          activeTab === 'project-list' && showPieChartInDashboard
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-indigo-700 hover:bg-white/80'
                        }`}
                      >
                        <PieChart className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {activeTab === 'project-list' ? (showPieChartInDashboard ? 'Pie Chart (Aktif)' : 'Grafik Pie') : 'Grafik Pie'}
                        </span>
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

            {/* Dedicated Tab Information Bar for Document Project (Sheet 5) */}
            {activeTab === 'status-project' && (
              <div className="pt-3 border-t border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-in fade-in duration-150">
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Document Project</span>
                  <span className="text-xs font-semibold text-indigo-700">
                    {tabStats.releasePengajuanCount} Release • {tabStats.approvedPengajuanCount} Approved
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pengajuan Material</span>
                  <span className="text-xs font-semibold text-sky-700 font-mono">
                    11 Jenis Berkas
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pengajuan BOQ Labour</span>
                  <span className="text-xs font-semibold text-emerald-700 font-mono">
                    11 Jenis Berkas
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Pengajuan CE & BOQ</span>
                  <span className="text-xs font-semibold text-purple-700 font-mono">
                    11 Jenis Berkas
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

            {/* Dedicated Tab Information Bar for Closing Project (Sheet 7) */}
            {activeTab === 'closing-project' && (
              <div className="pt-3 border-t border-slate-150 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-in fade-in duration-150">
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Pengajuan</span>
                  <span className="text-xs font-semibold text-teal-700">
                    Not Yet ➔ Submit ➔ BALAP ➔ BAST ➔ Teco ➔ Invoice
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Data Identitas</span>
                  <span className="text-xs font-semibold text-sky-700">
                    Praject Date & No. PO
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Berkas BA & ABD</span>
                  <span className="text-xs font-semibold text-indigo-700">
                    BA Opname Mat/Lab, ABD Relokasi/Int
                  </span>
                </div>
                <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Foto Dokumentasi</span>
                  <span className="text-xs font-semibold text-amber-700">
                    Mendukung Semua Format File (*.*)
                  </span>
                </div>
              </div>
            )}
          </div>

            {/* Priority Indicator Tiers (Level 1-5) */}
            {activeTab !== 'dashboard-overview' && activeTab !== 'pie-chart-analytics' && (
              <PriorityTierBar
                projects={projects}
                selectedPriority={selectedPriority}
                onSelectPriority={setSelectedPriority}
              />
            )}

            {/* Filter and Search Bar (Tabs 2-6) */}
            {activeTab !== 'dashboard-overview' && activeTab !== 'pie-chart-analytics' && (
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
                onExportExcel={() => {
                  const res = storageService.exportPageToExcel(filteredProjects, activeTab);
                  if (res.success) {
                    showToast(`File Excel ${res.filename} berhasil diunduh (${res.count} data).`);
                  } else {
                    showToast('Tidak ada data untuk diekspor.');
                  }
                }}
                onExportCsv={() => {
                  const res = storageService.exportPageToCsv(filteredProjects, activeTab);
                  if (res.success) {
                    showToast(`File CSV ${res.filename} berhasil diunduh (${res.count} data).`);
                  } else {
                    showToast('Tidak ada data untuk diekspor.');
                  }
                }}
                totalResults={filteredProjects.length}
                allProjects={projects}
              />
            )}

            {/* 3. Main View Area (Dashboard Overview & Pie Chart, Upload Document, Board, Card Grid, or Table View) */}
            {activeTab === 'dashboard-overview' ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 5-Dimension Pie Chart Analytics */}
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
                  isNeonMode={isNeonMode}
                />

                {/* Quick Navigation Cards to All Sheets */}
                <div className={`p-4 sm:p-5 rounded-2xl border space-y-3.5 transition-all relative overflow-hidden ${
                  isNeonMode 
                    ? 'bg-[#090e23]/95 border-cyan-500/30 text-slate-200 shadow-[0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-xl' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  {/* Futuristic Multi-Colour Neon Light Ribbon */}
                  {isNeonMode && (
                    <div className="h-0.5 w-full bg-gradient-to-r from-rose-500 via-violet-500 via-purple-500 via-amber-500 via-emerald-500 via-cyan-400 to-white shadow-[0_0_10px_rgba(139,92,246,0.8)] rounded-full mb-1" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded tracking-widest ${
                        isNeonMode ? 'bg-cyan-950 text-cyan-300 border border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'bg-slate-100 text-slate-700'
                      }`}>
                        WORKBOOK NAVIGATION
                      </span>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${
                        isNeonMode ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]' : 'text-slate-700'
                      }`}>
                        Akses Cepat Antar Halaman Terintegrasi (8 Sheet)
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" title="Red" />
                        <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_6px_#8b5cf6]" title="Violet" />
                        <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#c026d3]" title="Purple" />
                        <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]" title="Orange" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" title="Green" />
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" title="Blue" />
                        <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff]" title="White" />
                      </div>
                      <span className={`text-[11px] font-mono font-semibold ${isNeonMode ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-cyan-700'}`}>
                        Multi-Colour Connected
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {/* Sheet 2: Project List (Blue / Cyan Neon) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('project-list');
                        showToast('Membuka Halaman 2: Project List (Master Data)');
                      }}
                      className={`p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                        isNeonMode
                          ? 'bg-[#071329]/80 hover:bg-[#0b1b3d] border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.45)]'
                          : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                          isNeonMode 
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-[0_0_6px_rgba(6,182,212,0.4)]' 
                            : 'bg-sky-950 text-sky-400 border-sky-800'
                        }`}>
                          Halaman 2
                        </span>
                        <TabVisualIcon tabKey="project-list" size="sm" variant="badge" />
                      </div>
                      <h5 className={`text-xs font-bold transition-colors ${
                        isNeonMode ? 'text-white group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'text-white group-hover:text-sky-300'
                      }`}>Project List</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Master data, filter, search & CRUD</p>
                    </button>

                    {/* Sheet 3: Plan Implimentasi (Violet Neon) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('construction-plan');
                        showToast('Membuka Halaman 3: Plan Implimentasi Project');
                      }}
                      className={`p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                        isNeonMode
                          ? 'bg-[#170e2d]/80 hover:bg-[#221345] border-violet-500/40 hover:border-violet-400 hover:shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                          : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                          isNeonMode 
                            ? 'bg-violet-950 text-violet-300 border-violet-500/60 shadow-[0_0_6px_rgba(139,92,246,0.4)]' 
                            : 'bg-blue-950 text-blue-400 border-blue-800'
                        }`}>
                          Halaman 3
                        </span>
                        <TabVisualIcon tabKey="construction-plan" size="sm" variant="badge" />
                      </div>
                      <h5 className={`text-xs font-bold transition-colors ${
                        isNeonMode ? 'text-white group-hover:text-violet-300 group-hover:drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]' : 'text-white group-hover:text-blue-300'
                      }`}>Plan Implimentasi</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Perencanaan teknis & vendor pelaksana</p>
                    </button>

                    {/* Sheet 4: Status Construction (Green Neon) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('status-construction');
                        showToast('Membuka Halaman 4: Status Construction');
                      }}
                      className={`p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                        isNeonMode
                          ? 'bg-[#071d15]/80 hover:bg-[#0d2e22] border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.45)]'
                          : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                          isNeonMode 
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-[0_0_6px_rgba(16,185,129,0.4)]' 
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}>
                          Halaman 4
                        </span>
                        <TabVisualIcon tabKey="status-construction" size="sm" variant="badge" />
                      </div>
                      <h5 className={`text-xs font-bold transition-colors ${
                        isNeonMode ? 'text-white group-hover:text-emerald-300 group-hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'text-white group-hover:text-emerald-300'
                      }`}>Status Construction</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Pulling FO multi-cable & closing SAP</p>
                    </button>

                    {/* Sheet 5: Daily Mandor (Amber / Orange Neon) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('daily-mandor');
                        showToast('Membuka Halaman 5: Daily Mandor & Operational Report');
                      }}
                      className={`p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                        isNeonMode
                          ? 'bg-[#291b08]/80 hover:bg-[#3d270b] border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                          : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                          isNeonMode 
                            ? 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-[0_0_6px_rgba(245,158,11,0.4)]' 
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          Halaman 5
                        </span>
                        <TabVisualIcon tabKey="daily-mandor" size="sm" variant="badge" />
                      </div>
                      <h5 className={`text-xs font-bold transition-colors ${
                        isNeonMode ? 'text-white group-hover:text-amber-300 group-hover:drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]' : 'text-white group-hover:text-amber-300'
                      }`}>Daily Mandor</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Laporan Mandor, HH/HS/HG & Jalur Akses</p>
                    </button>

                    {/* Sheet 6: Document Project (Orange Neon) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('status-project');
                        showToast('Membuka Halaman 6: Document Project');
                      }}
                      className={`p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                        isNeonMode
                          ? 'bg-[#211108]/80 hover:bg-[#331b0c] border-orange-500/40 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.45)]'
                          : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                          isNeonMode 
                            ? 'bg-amber-950 text-orange-300 border-orange-500/60 shadow-[0_0_6px_rgba(249,115,22,0.4)]' 
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}>
                          Halaman 6
                        </span>
                        <TabVisualIcon tabKey="status-project" size="sm" variant="badge" />
                      </div>
                      <h5 className={`text-xs font-bold transition-colors ${
                        isNeonMode ? 'text-white group-hover:text-orange-300 group-hover:drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]' : 'text-white group-hover:text-amber-300'
                      }`}>Document Project</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">3 Pengajuan berkas (Material, BOQ, CE)</p>
                    </button>

                    {/* Sheet 7: Project Tracking Pipeline (Purple Neon) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('project-tracking-pipeline');
                        showToast('Membuka Halaman 7: Project Tracing Pipeline');
                      }}
                      className={`p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                        isNeonMode
                          ? 'bg-[#21092a]/80 hover:bg-[#330f40] border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(192,38,211,0.45)]'
                          : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                          isNeonMode 
                            ? 'bg-purple-950 text-purple-300 border-purple-500/60 shadow-[0_0_6px_rgba(192,38,211,0.4)]' 
                            : 'bg-purple-950 text-purple-400 border-purple-800'
                        }`}>
                          Halaman 7
                        </span>
                        <TabVisualIcon tabKey="project-tracking-pipeline" size="sm" variant="badge" />
                      </div>
                      <h5 className={`text-xs font-bold transition-colors ${
                        isNeonMode ? 'text-white group-hover:text-purple-300 group-hover:drop-shadow-[0_0_6px_rgba(192,38,211,0.6)]' : 'text-white group-hover:text-purple-300'
                      }`}>Tracing Pipeline</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Alur tahapan terpadu & Kanban board</p>
                    </button>

                    {/* Sheet 8: Closing Project (Red / Rose Neon) */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('closing-project');
                        showToast('Membuka Halaman 8: Closing Project');
                      }}
                      className={`p-3 rounded-xl border transition-all text-left group cursor-pointer ${
                        isNeonMode
                          ? 'bg-[#280913]/80 hover:bg-[#3d0e1d] border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                          : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800 hover:border-teal-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                          isNeonMode 
                            ? 'bg-rose-950 text-rose-300 border-rose-500/60 shadow-[0_0_6px_rgba(244,63,94,0.4)]' 
                            : 'bg-teal-950 text-teal-400 border-teal-800'
                        }`}>
                          Halaman 8
                        </span>
                        <TabVisualIcon tabKey="closing-project" size="sm" variant="badge" />
                      </div>
                      <h5 className={`text-xs font-bold transition-colors ${
                        isNeonMode ? 'text-white group-hover:text-rose-300 group-hover:drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]' : 'text-white group-hover:text-teal-300'
                      }`}>Closing Project</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">Praject Date, PO, BA, ABD & Foto</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'pie-chart-analytics' ? (
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
            ) : activeTab === 'status-project' ? (
              <DocumentProjectPageView
                projects={projects}
                filteredProjects={filteredProjects}
                onUpdateProject={(updated) => {
                  const updatedList = projects.map((p) => (p.id === updated.id ? updated : p));
                  persistChanges(updatedList);
                  showToast(`Dokumen proyek ${updated.pmoId} berhasil diperbarui.`);
                }}
                onViewDetail={(proj) => {
                  setDetailProject(proj);
                  setIsDetailDrawerOpen(true);
                }}
                onEditProject={(proj) => {
                  setEditingProject(proj);
                  setIsFormModalOpen(true);
                }}
                onJumpToTab={handleJumpToTab}
                showToast={showToast}
                isNeonMode={isNeonMode}
              />
            ) : activeTab === 'closing-project' ? (
              <ClosingProjectPageView
                projects={projects}
                filteredProjects={filteredProjects}
                onUpdateProject={(updated) => {
                  const updatedList = projects.map((p) => (p.id === updated.id ? updated : p));
                  persistChanges(updatedList);
                  showToast(`Data closing proyek ${updated.pmoId} berhasil diperbarui.`);
                }}
                onViewDetail={(proj) => {
                  setDetailProject(proj);
                  setIsDetailDrawerOpen(true);
                }}
                onEditProject={(proj) => {
                  setEditingProject(proj);
                  setIsFormModalOpen(true);
                }}
                onJumpToTab={handleJumpToTab}
                showToast={showToast}
                isNeonMode={isNeonMode}
              />
            ) : activeTab === 'daily-mandor' ? (
              <DailyMandorView
                projects={projects}
                onShowToast={showToast}
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
                isNeonMode={isNeonMode}
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
                isNeonMode={isNeonMode}
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
                isNeonMode={isNeonMode}
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
        onUpdateProject={handleSaveProject}
        isNeonMode={isNeonMode}
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
