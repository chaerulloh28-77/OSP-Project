import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  Layers, 
  FolderKanban, 
  HardHat, 
  Activity, 
  GitCommit, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Filter, 
  X, 
  Download, 
  ArrowRight, 
  ArrowUpRight,
  Eye, 
  Edit3, 
  Maximize2, 
  Sparkles, 
  Info, 
  Search, 
  ChevronRight, 
  Table as TableIcon,
  ShieldCheck,
  Building2,
  TrendingUp,
  MapPin,
  Users,
  Flame,
  RotateCcw,
  Zap,
  AlertTriangle,
  Plus,
  LayoutGrid,
  Maximize,
  SlidersHorizontal,
  Compass,
  Check
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { documentStorageService } from '../services/documentStorageService';
import { DOCUMENT_SLOTS } from '../types/document';
import { PriorityBadge } from './PriorityBadge';
import { getPriorityMeta, PRIORITY_TIERS } from '../utils/priorityHelpers';

// Curated Professional Color Themes
export const COLOR_THEMES = {
  executive: [
    '#0284c7', // Sky 600
    '#10b981', // Emerald 500
    '#8b5cf6', // Violet 500
    '#f59e0b', // Amber 500
    '#f43f5e', // Rose 500
    '#06b6d4', // Cyan 500
    '#6366f1', // Indigo 500
    '#ec4899', // Pink 500
    '#14b8a6', // Teal 500
    '#84cc16', // Lime 500
    '#f97316', // Orange 500
    '#64748b', // Slate 500
  ],
  vibrant: [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#a855f7', // Purple
    '#eab308', // Yellow
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#6366f1', // Indigo
  ],
};

export interface PieChartSlice {
  id: string;
  label: string;
  value: number;
  color: string;
  filterFn: (project: ProjectData) => boolean;
}

interface PieChartConfig {
  id: string;
  tabKey: TabKey;
  tabNumber: number;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeColor: string;
  metricOptions: {
    key: string;
    label: string;
    getData: (projects: ProjectData[], colors: string[]) => PieChartSlice[];
  }[];
}

interface PieChartAnalyticsViewProps {
  projects: ProjectData[];
  onViewDetail?: (project: ProjectData) => void;
  onEditProject?: (project: ProjectData) => void;
  onJumpToTab?: (tab: TabKey, project: ProjectData) => void;
  initialTabFocus?: TabKey;
  showToast?: (msg: string) => void;
  onNewProject?: () => void;
}

export const PieChartAnalyticsView: React.FC<PieChartAnalyticsViewProps> = ({
  projects,
  onViewDetail,
  onEditProject,
  onJumpToTab,
  initialTabFocus,
  showToast,
  onNewProject,
}) => {
  // View mode: 'showcase' (Single Featured Chart + Deep Analysis) | 'grid' (Aesthetic Multi-Card) | 'bar' (Progress Distribution)
  const [viewLayoutMode, setViewLayoutMode] = useState<'showcase' | 'grid' | 'bar'>('showcase');

  // Chart Rendering Style: 'donut' | 'pie'
  const [chartStyle, setChartStyle] = useState<'donut' | 'pie'>('donut');

  // Active Selected Domain Chart in Showcase mode
  const [activeShowcaseChartId, setActiveShowcaseChartId] = useState<string>('chart-project-list');

  // Active Domain tab filter in grid mode
  const [activeDomainFilter, setActiveDomainFilter] = useState<string>(
    initialTabFocus && initialTabFocus !== 'pie-chart-analytics' ? initialTabFocus : 'all'
  );

  useEffect(() => {
    if (initialTabFocus && initialTabFocus !== 'pie-chart-analytics') {
      setActiveDomainFilter(initialTabFocus);
      setActiveShowcaseChartId(
        initialTabFocus === 'project-list' ? 'chart-project-list' :
        initialTabFocus === 'construction-plan' ? 'chart-construction-plan' :
        initialTabFocus === 'status-project' ? 'chart-status-project' :
        initialTabFocus === 'status-construction' ? 'chart-status-construction' :
        initialTabFocus === 'project-tracking-pipeline' ? 'chart-pipeline' :
        initialTabFocus === 'upload-document' ? 'chart-upload-document' : 'chart-project-list'
      );
    }
  }, [initialTabFocus]);

  // Selected slice state for segment inspector
  const [selectedSegment, setSelectedSegment] = useState<{
    chartId: string;
    chartTitle: string;
    metricLabel: string;
    sliceLabel: string;
    color: string;
    filterFn: (project: ProjectData) => boolean;
  } | null>(null);

  // Sub-metric selector state per chart
  const [metricSelections, setMetricSelections] = useState<Record<string, string>>({
    'chart-project-list': 'category',
    'chart-construction-plan': 'vendor',
    'chart-status-project': 'status',
    'chart-status-construction': 'construction',
    'chart-pipeline': 'stage',
    'chart-upload-document': 'completeness',
    'chart-priority-distribution': 'priority',
  });

  // Table search within selected segment
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const detailPanelRef = useRef<HTMLDivElement>(null);

  // Colors palette
  const colors = COLOR_THEMES.executive;

  // Reset all filters to clean initial state
  const handleResetToInitialView = () => {
    setViewLayoutMode('showcase');
    setChartStyle('donut');
    setActiveShowcaseChartId('chart-project-list');
    setActiveDomainFilter('all');
    setSelectedSegment(null);
    setTableSearchTerm('');
    setCurrentPage(1);
    setMetricSelections({
      'chart-project-list': 'category',
      'chart-construction-plan': 'vendor',
      'chart-status-project': 'status',
      'chart-status-construction': 'construction',
      'chart-pipeline': 'stage',
      'chart-upload-document': 'completeness',
      'chart-priority-distribution': 'priority',
    });
    if (showToast) showToast('Tampilan grafik pie chart dikembalikan ke posisi awal.');
  };

  // Define 7 Analytical Chart Configurations
  const chartConfigs: PieChartConfig[] = useMemo(() => [
    // 1. Tab 1: Project List
    {
      id: 'chart-project-list',
      tabKey: 'project-list',
      tabNumber: 1,
      title: '1. Project List',
      subtitle: 'Distribusi Kategori, Area/Kota, PIC & Waspang DSB',
      icon: FolderKanban,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      metricOptions: [
        {
          key: 'category',
          label: 'Kategori Proyek',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const cat = (p.projectCategory || 'Lainnya').trim();
              counts[cat] = (counts[cat] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `cat-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.projectCategory || 'Lainnya').trim() === label,
              }));
          },
        },
        {
          key: 'area',
          label: 'Area / Kota',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const a = (p.areaKota || 'Tanpa Area').trim();
              counts[a] = (counts[a] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `area-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.areaKota || 'Tanpa Area').trim() === label,
              }));
          },
        },
        {
          key: 'pic',
          label: 'PIC Section Head',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const pic = (p.picSectionHead || 'Belum Ditentukan').trim();
              counts[pic] = (counts[pic] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `pic-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.picSectionHead || 'Belum Ditentukan').trim() === label,
              }));
          },
        },
        {
          key: 'waspang',
          label: 'Waspang DSB',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const w = (p.waspangDsb || 'Belum Ditentukan').trim();
              counts[w] = (counts[w] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `waspang-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.waspangDsb || 'Belum Ditentukan').trim() === label,
              }));
          },
        },
      ],
    },

    // 2. Tab 2: Construction Plan
    {
      id: 'chart-construction-plan',
      tabKey: 'construction-plan',
      tabNumber: 2,
      title: '2. Construction Plan',
      subtitle: 'Mitra Nama Vendor, Quarter Target, & SP Relokasi',
      icon: HardHat,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      metricOptions: [
        {
          key: 'vendor',
          label: 'Nama Vendor',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const v = (p.namaVendor || 'Tanpa Vendor').trim();
              counts[v] = (counts[v] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `vendor-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.namaVendor || 'Tanpa Vendor').trim() === label,
              }));
          },
        },
        {
          key: 'quarter',
          label: 'Quarter Plan Target',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const q = (p.quarter || 'Unassigned').trim();
              counts[q] = (counts[q] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `q-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.quarter || 'Unassigned').trim() === label,
              }));
          },
        },
        {
          key: 'spm',
          label: 'Status SP Relokasi / PO',
          getData: (data, palette) => {
            const hasSp = data.filter((p) => Boolean(p.dateSuratPerintahRelokasi && p.dateSuratPerintahRelokasi.trim() !== '' && p.dateSuratPerintahRelokasi !== '-')).length;
            const noSp = data.length - hasSp;
            return [
              {
                id: 'sp-yes',
                label: 'SP Relokasi Terbit',
                value: hasSp,
                color: palette[1],
                filterFn: (p) => Boolean(p.dateSuratPerintahRelokasi && p.dateSuratPerintahRelokasi.trim() !== '' && p.dateSuratPerintahRelokasi !== '-'),
              },
              {
                id: 'sp-no',
                label: 'Belum Terbit SP',
                value: noSp,
                color: palette[4],
                filterFn: (p) => !p.dateSuratPerintahRelokasi || p.dateSuratPerintahRelokasi.trim() === '' || p.dateSuratPerintahRelokasi === '-',
              },
            ];
          },
        },
      ],
    },

    // 3. Tab 3: Status Project
    {
      id: 'chart-status-project',
      tabKey: 'status-project',
      tabNumber: 3,
      title: '3. Status Project',
      subtitle: 'Kemajuan Proyek & Kelengkapan MR Number',
      icon: Activity,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      metricOptions: [
        {
          key: 'status',
          label: 'Status Utama Proyek',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const s = (p.projectStatus || 'Draft / New').trim();
              counts[s] = (counts[s] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `st-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.projectStatus || 'Draft / New').trim() === label,
              }));
          },
        },
        {
          key: 'mrNumber',
          label: 'Kelengkapan Nomor MR',
          getData: (data, palette) => {
            const hasMr = data.filter((p) => Boolean(p.mrNumber && p.mrNumber.trim() !== '' && p.mrNumber !== '-')).length;
            const noMr = data.length - hasMr;
            return [
              {
                id: 'mr-yes',
                label: 'Nomor MR Ada',
                value: hasMr,
                color: palette[0],
                filterFn: (p) => Boolean(p.mrNumber && p.mrNumber.trim() !== '' && p.mrNumber !== '-'),
              },
              {
                id: 'mr-no',
                label: 'Belum Ada MR',
                value: noMr,
                color: palette[3],
                filterFn: (p) => !p.mrNumber || p.mrNumber.trim() === '' || p.mrNumber === '-',
              },
            ];
          },
        },
      ],
    },

    // 4. Tab 4: Status Construction
    {
      id: 'chart-status-construction',
      tabKey: 'status-construction',
      tabNumber: 4,
      title: '4. Status Construction',
      subtitle: 'Progres Pekerjaan Lapangan & Cable Pulling',
      icon: GitCommit,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      metricOptions: [
        {
          key: 'construction',
          label: 'Status Konstruksi Lapangan',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const c = (p.statusConstruction || 'Not Started').trim();
              counts[c] = (counts[c] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `const-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.statusConstruction || 'Not Started').trim() === label,
              }));
          },
        },
        {
          key: 'pullingBucket',
          label: 'Progres Cable Pulling FO',
          getData: (data, palette) => {
            const buckets: Record<string, number> = {
              'Selesai (100%)': 0,
              'Signifikan (50% - 99%)': 0,
              'Progres Awal (1% - 49%)': 0,
              'Belum Mulai (0%)': 0,
            };

            data.forEach((p) => {
              const target = Number(p.panjangRelokasi) || 0;
              const done = Number(p.pullingFoPanjangSelesai || p.pullingPanjangSelesai) || 0;
              const pct = target > 0 ? (done / target) * 100 : 0;

              if (pct >= 100) buckets['Selesai (100%)'] += 1;
              else if (pct >= 50) buckets['Signifikan (50% - 99%)'] += 1;
              else if (pct > 0) buckets['Progres Awal (1% - 49%)'] += 1;
              else buckets['Belum Mulai (0%)'] += 1;
            });

            return [
              {
                id: 'pb-100',
                label: 'Selesai (100%)',
                value: buckets['Selesai (100%)'],
                color: palette[1],
                filterFn: (p) => {
                  const target = Number(p.panjangRelokasi) || 0;
                  const done = Number(p.pullingFoPanjangSelesai || p.pullingPanjangSelesai) || 0;
                  return target > 0 && (done / target) * 100 >= 100;
                },
              },
              {
                id: 'pb-50',
                label: 'Signifikan (50% - 99%)',
                value: buckets['Signifikan (50% - 99%)'],
                color: palette[0],
                filterFn: (p) => {
                  const target = Number(p.panjangRelokasi) || 0;
                  const done = Number(p.pullingFoPanjangSelesai || p.pullingPanjangSelesai) || 0;
                  const pct = target > 0 ? (done / target) * 100 : 0;
                  return pct >= 50 && pct < 100;
                },
              },
              {
                id: 'pb-1',
                label: 'Progres Awal (1% - 49%)',
                value: buckets['Progres Awal (1% - 49%)'],
                color: palette[3],
                filterFn: (p) => {
                  const target = Number(p.panjangRelokasi) || 0;
                  const done = Number(p.pullingFoPanjangSelesai || p.pullingPanjangSelesai) || 0;
                  const pct = target > 0 ? (done / target) * 100 : 0;
                  return pct > 0 && pct < 50;
                },
              },
              {
                id: 'pb-0',
                label: 'Belum Mulai (0%)',
                value: buckets['Belum Mulai (0%)'],
                color: palette[4],
                filterFn: (p) => {
                  const done = Number(p.pullingFoPanjangSelesai || p.pullingPanjangSelesai) || 0;
                  return done === 0;
                },
              },
            ];
          },
        },
      ],
    },

    // 5. Tab 5: Tracking Pipeline
    {
      id: 'chart-pipeline',
      tabKey: 'project-tracking-pipeline',
      tabNumber: 5,
      title: '5. Tracking Pipeline',
      subtitle: 'Tahapan Workflow Kanban & Pipeline Monitoring',
      icon: Clock,
      badgeColor: 'bg-violet-100 text-violet-800 border-violet-300',
      metricOptions: [
        {
          key: 'stage',
          label: 'Tahapan Pipeline Workflow',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const st = (p.pipelineStage || 'Draft & Planning').trim();
              counts[st] = (counts[st] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `pipe-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => (p.pipelineStage || 'Draft & Planning').trim() === label,
              }));
          },
        },
      ],
    },

    // 6. Tab 6: Upload Dokumen PMO
    {
      id: 'chart-upload-document',
      tabKey: 'upload-document',
      tabNumber: 6,
      title: '6. Upload Dokumen PMO',
      subtitle: 'Kelengkapan 13 Berkas Dokumen Administrasi',
      icon: FileText,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      metricOptions: [
        {
          key: 'completeness',
          label: 'Tingkat Kelengkapan Berkas Dokumen',
          getData: (data, palette) => {
            const counts: Record<string, number> = {
              'Lengkap (100% / 13 Dokumen)': 0,
              'Hampir Lengkap (70% - 99%)': 0,
              'Sebagian (30% - 69%)': 0,
              'Minimal (< 30%)': 0,
              'Belum Ada Dokumen': 0,
            };

            data.forEach((p) => {
              const rec = documentStorageService.getDocumentRecord(p.pmoId || p.id);
              const uploadedCount = DOCUMENT_SLOTS.filter((s) => Boolean(rec.documents[s.key])).length;
              const pct = (uploadedCount / DOCUMENT_SLOTS.length) * 100;

              if (pct >= 100) counts['Lengkap (100% / 13 Dokumen)'] += 1;
              else if (pct >= 70) counts['Hampir Lengkap (70% - 99%)'] += 1;
              else if (pct >= 30) counts['Sebagian (30% - 69%)'] += 1;
              else if (uploadedCount > 0) counts['Minimal (< 30%)'] += 1;
              else counts['Belum Ada Dokumen'] += 1;
            });

            return [
              {
                id: 'doc-full',
                label: 'Lengkap (100% / 13 Dokumen)',
                value: counts['Lengkap (100% / 13 Dokumen)'],
                color: palette[1],
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p.pmoId || p.id);
                  return DOCUMENT_SLOTS.filter((s) => Boolean(rec.documents[s.key])).length === DOCUMENT_SLOTS.length;
                },
              },
              {
                id: 'doc-high',
                label: 'Hampir Lengkap (70% - 99%)',
                value: counts['Hampir Lengkap (70% - 99%)'],
                color: palette[0],
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p.pmoId || p.id);
                  const cnt = DOCUMENT_SLOTS.filter((s) => Boolean(rec.documents[s.key])).length;
                  return cnt >= 8 && cnt < DOCUMENT_SLOTS.length;
                },
              },
              {
                id: 'doc-mid',
                label: 'Sebagian (30% - 69%)',
                value: counts['Sebagian (30% - 69%)'],
                color: palette[3],
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p.pmoId || p.id);
                  const cnt = DOCUMENT_SLOTS.filter((s) => Boolean(rec.documents[s.key])).length;
                  return cnt >= 4 && cnt < 8;
                },
              },
              {
                id: 'doc-low',
                label: 'Minimal (< 30%)',
                value: counts['Minimal (< 30%)'],
                color: palette[4],
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p.pmoId || p.id);
                  const cnt = DOCUMENT_SLOTS.filter((s) => Boolean(rec.documents[s.key])).length;
                  return cnt > 0 && cnt < 4;
                },
              },
              {
                id: 'doc-zero',
                label: 'Belum Ada Dokumen',
                value: counts['Belum Ada Dokumen'],
                color: palette[11],
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p.pmoId || p.id);
                  return DOCUMENT_SLOTS.filter((s) => Boolean(rec.documents[s.key])).length === 0;
                },
              },
            ];
          },
        },
      ],
    },

    // 7. Matriks Prioritas Level 1-6
    {
      id: 'chart-priority-distribution',
      tabKey: 'project-list',
      tabNumber: 7,
      title: '7. Priority Tier Levels',
      subtitle: 'Distribusi Prioritas Proyek (Level 1 Kritis s/d Level 6)',
      icon: Flame,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      metricOptions: [
        {
          key: 'priority',
          label: 'Level Tingkat Prioritas',
          getData: (data, palette) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const meta = getPriorityMeta(p.priority);
              const label = meta.levelName;
              counts[label] = (counts[label] || 0) + 1;
            });

            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `prio-${label}`,
                label,
                value,
                color: palette[idx % palette.length],
                filterFn: (p) => getPriorityMeta(p.priority).levelName === label,
              }));
          },
        },
      ],
    },
  ], [colors]);

  // Filter visible charts based on active domain filter in grid mode
  const visibleGridCharts = useMemo(() => {
    if (activeDomainFilter === 'all') return chartConfigs;
    return chartConfigs.filter((c) => c.tabKey === activeDomainFilter || c.id === activeDomainFilter);
  }, [chartConfigs, activeDomainFilter]);

  // Active Showcase Chart Object
  const currentShowcaseChart = useMemo(() => {
    return chartConfigs.find((c) => c.id === activeShowcaseChartId) || chartConfigs[0];
  }, [chartConfigs, activeShowcaseChartId]);

  // Slice click handler
  const handleSliceClick = (
    chart: PieChartConfig,
    metricLabel: string,
    slice: PieChartSlice
  ) => {
    if (
      selectedSegment &&
      selectedSegment.chartId === chart.id &&
      selectedSegment.sliceLabel === slice.label
    ) {
      setSelectedSegment(null);
      if (showToast) showToast('Filter segmen dinonaktifkan.');
      return;
    }

    setSelectedSegment({
      chartId: chart.id,
      chartTitle: chart.title,
      metricLabel,
      sliceLabel: slice.label,
      color: slice.color,
      filterFn: slice.filterFn,
    });

    setTableSearchTerm('');
    setCurrentPage(1);

    if (showToast) {
      showToast(`Filter segmen: "${slice.label}" (${slice.value} Proyek)`);
    }

    setTimeout(() => {
      if (detailPanelRef.current) {
        detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 120);
  };

  // Projects strictly matching selected segment
  const matchingProjects = useMemo(() => {
    if (!selectedSegment) return [];
    return projects.filter(selectedSegment.filterFn);
  }, [projects, selectedSegment]);

  // Searched projects inside selected segment
  const searchedMatchingProjects = useMemo(() => {
    if (!tableSearchTerm.trim()) return matchingProjects;
    const q = tableSearchTerm.toLowerCase();
    return matchingProjects.filter((p) => 
      (p.pmoId || '').toLowerCase().includes(q) ||
      (p.projectDescription || '').toLowerCase().includes(q) ||
      (p.projectId || '').toLowerCase().includes(q) ||
      (p.namaVendor || '').toLowerCase().includes(q) ||
      (p.picSectionHead || '').toLowerCase().includes(q) ||
      (p.areaKota || '').toLowerCase().includes(q)
    );
  }, [matchingProjects, tableSearchTerm]);

  // Paginated matching projects
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return searchedMatchingProjects.slice(start, start + pageSize);
  }, [searchedMatchingProjects, currentPage]);

  const totalPages = Math.ceil(searchedMatchingProjects.length / pageSize) || 1;

  // Segment Aggregate KPIs
  const segmentKpis = useMemo(() => {
    if (matchingProjects.length === 0) return null;
    const totalFo = matchingProjects.reduce((acc, p) => acc + (Number(p.panjangRelokasi) || 0), 0);
    const totalGalianDone = matchingProjects.reduce((acc, p) => acc + (Number(p.galianPanjangSelesai) || 0), 0);
    const completedConstruction = matchingProjects.filter((p) => p.statusConstruction === 'Completed').length;
    const pctOfAll = projects.length > 0 ? ((matchingProjects.length / projects.length) * 100).toFixed(1) : '0';

    return {
      totalFo,
      totalGalianDone,
      completedConstruction,
      pctOfAll,
    };
  }, [matchingProjects, projects.length]);

  // Export CSV for segment
  const handleExportSegmentCsv = () => {
    if (!selectedSegment || matchingProjects.length === 0) return;
    const headers = [
      'No',
      'PMO ID',
      'Prioritas',
      'Deskripsi Proyek',
      'Project ID',
      'Nama Vendor',
      'Area',
      'Status Proyek',
      'Status Konstruksi',
      'PIC',
      'Waspang DSB',
      'Panjang FO (m)',
      'Quarter',
    ];

    const rows = matchingProjects.map((p, idx) => [
      idx + 1,
      `"${p.pmoId || ''}"`,
      `"${p.priority || 'Normal'}"`,
      `"${(p.projectDescription || '').replace(/"/g, '""')}"`,
      `"${p.projectId || ''}"`,
      `"${p.namaVendor || ''}"`,
      `"${p.areaKota || ''}"`,
      `"${p.projectStatus || ''}"`,
      `"${p.statusConstruction || ''}"`,
      `"${p.picSectionHead || ''}"`,
      `"${p.waspangDsb || ''}"`,
      Number(p.panjangRelokasi) || 0,
      `"${p.quarter || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const safeName = selectedSegment.sliceLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Segmen_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast(`Data segmen "${selectedSegment.sliceLabel}" diekspor.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md shrink-0 ring-1 ring-slate-800">
              <PieChartIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200">
                  EXECUTIVE DASHBOARD
                </span>
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                  Analitik Grafik Proyek & Matriks Status
                </h2>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-mono">
                  {projects.length} Proyek
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Visualisasi rasio, persentase, dan distribusi proyek. Pilih tampilan dan klik segmen grafik untuk filter data.
              </p>
            </div>
          </div>

          {/* Controls: Reset, Export PPT & Layout Switcher */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetToInitialView}
              title="Reset ke Tampilan Awal"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-slate-200 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Awal</span>
            </button>

            {/* Layout Mode Selector Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewLayoutMode('showcase')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewLayoutMode === 'showcase'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Showcase Interaktif (Satu Grafik Utama & Rincian Lengkap)"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Showcase</span>
              </button>

              <button
                type="button"
                onClick={() => setViewLayoutMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewLayoutMode === 'grid'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Multi-Card Grid Dashboard"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Multi-Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewLayoutMode('bar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewLayoutMode === 'bar'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Progres Distribution Bar"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bar Distribution</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Chart Style Toggle & Navigation Domain Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Domain Chart Selectors */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 max-w-full">
            {chartConfigs.map((c) => {
              const isActive =
                viewLayoutMode === 'showcase'
                  ? activeShowcaseChartId === c.id
                  : activeDomainFilter === c.id || activeDomainFilter === c.tabKey;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    if (viewLayoutMode === 'showcase') {
                      setActiveShowcaseChartId(c.id);
                    } else {
                      setActiveDomainFilter(c.id);
                    }
                    setSelectedSegment(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs ring-2 ring-sky-300/50'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <c.icon className="w-3.5 h-3.5" />
                  <span>{c.title}</span>
                </button>
              );
            })}
          </div>

          {/* Chart Shape Style Toggle (Donut vs Pie) */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-400">Bentuk Grafik:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setChartStyle('donut')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartStyle === 'donut' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Donut Ring
              </button>
              <button
                type="button"
                onClick={() => setChartStyle('pie')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  chartStyle === 'pie' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pie Chart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty Dataset Notification */}
      {projects.length === 0 && (
        <div className="bg-gradient-to-r from-sky-50 via-slate-50 to-amber-50 rounded-2xl p-5 border border-sky-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 border border-sky-200">
              <Info className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Data Proyek Masih Kosong
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Belum ada data proyek di dalam list. Grafik menampilkan indikator sampel netral.
              </p>
            </div>
          </div>
          {onNewProject && (
            <button
              type="button"
              onClick={onNewProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Project Baru</span>
            </button>
          )}
        </div>
      )}

      {/* ================= MODE 1: SHOWCASE FEATURED VIEW ================= */}
      {viewLayoutMode === 'showcase' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
          {/* Showcase Chart Header */}
          {(() => {
            const chart = currentShowcaseChart;
            const selectedMetricKey = metricSelections[chart.id] || chart.metricOptions[0].key;
            const currentMetric = chart.metricOptions.find((m) => m.key === selectedMetricKey) || chart.metricOptions[0];
            const slices = currentMetric.getData(projects, colors);
            const totalValue = slices.reduce((acc, s) => acc + s.value, 0);

            return (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
                      <chart.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                        {chart.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {chart.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Sub metric dropdown */}
                  {chart.metricOptions.length > 1 && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-600">Pilih Metrik:</span>
                      <select
                        value={selectedMetricKey}
                        onChange={(e) => {
                          setMetricSelections((prev) => ({
                            ...prev,
                            [chart.id]: e.target.value,
                          }));
                          if (selectedSegment?.chartId === chart.id) {
                            setSelectedSegment(null);
                          }
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-xs"
                      >
                        {chart.metricOptions.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Main Showcase Split View: SVG Chart Left | Interactive Progress Bars Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Big Interactive Showcase SVG Chart */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200/80 relative min-h-[300px]">
                    <ShowcaseSvgChart
                      slices={slices}
                      totalValue={totalValue}
                      chartStyle={chartStyle}
                      activeSliceLabel={
                        selectedSegment?.chartId === chart.id ? selectedSegment.sliceLabel : null
                      }
                      onSliceClick={(slice) => handleSliceClick(chart, currentMetric.label, slice)}
                    />
                    <div className="mt-4 text-center">
                      <span className="text-xs font-semibold text-slate-500 block">
                        Metrik Aktif: <strong className="text-slate-900">{currentMetric.label}</strong>
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Petunjuk: Klik segmen pada grafik di atas untuk filter rincian proyek.
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Sleek Legend Progress Bars */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                      <span>Kategori / Segmen</span>
                      <span>Jumlah Proyek & Persentase</span>
                    </div>

                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-2">
                      {slices.map((slice) => {
                        const isSelected =
                          selectedSegment?.chartId === chart.id &&
                          selectedSegment?.sliceLabel === slice.label;
                        const pct = totalValue > 0 ? Math.round((slice.value / totalValue) * 100) : 0;

                        return (
                          <div
                            key={slice.id}
                            onClick={() => handleSliceClick(chart, currentMetric.label, slice)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-sky-400'
                                : 'bg-slate-50 hover:bg-slate-100/90 text-slate-800 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                                  style={{ backgroundColor: slice.color }}
                                />
                                <span className="truncate">{slice.label}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                                <span className={isSelected ? 'text-sky-300' : 'text-slate-900'}>
                                  {slice.value} Proyek
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-200/70 text-slate-700'
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </div>

                            {/* Animated Percentage Bar */}
                            <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: slice.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ================= MODE 2: MULTI-GRID DASHBOARD VIEW ================= */}
      {viewLayoutMode === 'grid' && (
        <div className={`grid gap-5 ${
          visibleGridCharts.length === 1 
            ? 'grid-cols-1 max-w-3xl mx-auto' 
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }`}>
          {visibleGridCharts.map((chart) => {
            const selectedMetricKey = metricSelections[chart.id] || chart.metricOptions[0].key;
            const currentMetric = chart.metricOptions.find((m) => m.key === selectedMetricKey) || chart.metricOptions[0];
            const slices = currentMetric.getData(projects, colors);
            const totalValue = slices.reduce((acc, s) => acc + s.value, 0);

            return (
              <div
                key={chart.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
                        <chart.icon className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {chart.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate">
                          {chart.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Sub metric selector */}
                    {chart.metricOptions.length > 1 && (
                      <select
                        value={selectedMetricKey}
                        onChange={(e) => {
                          setMetricSelections((prev) => ({
                            ...prev,
                            [chart.id]: e.target.value,
                          }));
                          if (selectedSegment?.chartId === chart.id) {
                            setSelectedSegment(null);
                          }
                        }}
                        className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shrink-0 max-w-[130px] truncate"
                      >
                        {chart.metricOptions.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      Metrik: <strong className="text-slate-800">{currentMetric.label}</strong>
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      Total: {totalValue} Proyek
                    </span>
                  </div>

                  {/* SVG Chart */}
                  <div className="py-2 flex items-center justify-center relative min-h-[190px]">
                    <ShowcaseSvgChart
                      slices={slices}
                      totalValue={totalValue}
                      chartStyle={chartStyle}
                      activeSliceLabel={
                        selectedSegment?.chartId === chart.id ? selectedSegment.sliceLabel : null
                      }
                      onSliceClick={(slice) => handleSliceClick(chart, currentMetric.label, slice)}
                    />
                  </div>
                </div>

                {/* Legend Chips */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Rincian Segmen:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar pr-1">
                    {slices.map((slice) => {
                      const isSelected =
                        selectedSegment?.chartId === chart.id &&
                        selectedSegment?.sliceLabel === slice.label;
                      const pct = totalValue > 0 ? Math.round((slice.value / totalValue) * 100) : 0;

                      return (
                        <button
                          key={slice.id}
                          type="button"
                          onClick={() => handleSliceClick(chart, currentMetric.label, slice)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-sky-400'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="truncate max-w-[110px]">{slice.label}</span>
                          <span
                            className={`font-mono text-[9px] px-1 py-0.2 rounded ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
                            {slice.value} ({pct}%)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODE 3: BAR DISTRIBUTION VIEW ================= */}
      {viewLayoutMode === 'bar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {chartConfigs.map((chart) => {
            const selectedMetricKey = metricSelections[chart.id] || chart.metricOptions[0].key;
            const currentMetric = chart.metricOptions.find((m) => m.key === selectedMetricKey) || chart.metricOptions[0];
            const slices = currentMetric.getData(projects, colors);
            const totalValue = slices.reduce((acc, s) => acc + s.value, 0);

            return (
              <div
                key={chart.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
                      <chart.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{chart.title}</h3>
                      <p className="text-[10px] text-slate-400">{currentMetric.label}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                    Total: {totalValue}
                  </span>
                </div>

                <div className="space-y-3">
                  {slices.map((slice) => {
                    const pct = totalValue > 0 ? Math.round((slice.value / totalValue) * 100) : 0;
                    const isSelected =
                      selectedSegment?.chartId === chart.id &&
                      selectedSegment?.sliceLabel === slice.label;

                    return (
                      <div
                        key={slice.id}
                        onClick={() => handleSliceClick(chart, currentMetric.label, slice)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-sky-400'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: slice.color }}
                            />
                            <span className="truncate">{slice.label}</span>
                          </div>
                          <span className="font-mono text-xs">
                            {slice.value} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: slice.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= DEDICATED SEGMENT DETAILS INSPECTOR ================= */}
      {(() => {
        if (!selectedSegment) return null;
        const currentChart = chartConfigs.find((c) => c.id === selectedSegment.chartId);
        if (!currentChart) return null;
        return (
          <div 
            ref={detailPanelRef}
            className="bg-white rounded-2xl border-2 border-sky-500 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ring-4 ring-sky-500/10"
          >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="w-4.5 h-4.5 rounded-full ring-2 ring-white/80 shrink-0"
                style={{ backgroundColor: selectedSegment.color }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-sky-200 border border-white/20">
                    {selectedSegment.chartTitle} • {selectedSegment.metricLabel}
                  </span>
                  <span className="text-xs text-sky-300 font-mono">Filter Segmen Aktif</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  &quot;{selectedSegment.sliceLabel}&quot; ({matchingProjects.length} Proyek)
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportSegmentCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSegment(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Tutup Filter Segmen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Segment KPI Cards */}
          {segmentKpis && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200/80">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Proporsi Dataset
                </span>
                <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
                  {segmentKpis.pctOfAll}%
                </span>
                <span className="text-[10px] text-slate-500">
                  dari total {projects.length} proyek
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Long Span FO
                </span>
                <span className="text-lg font-black font-mono text-sky-700 mt-0.5 block">
                  {segmentKpis.totalFo.toLocaleString('id-ID')} m
                </span>
                <span className="text-[10px] text-slate-500">
                  Target panjang kabel
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Panjang Galian Selesai
                </span>
                <span className="text-lg font-black font-mono text-emerald-700 mt-0.5 block">
                  {segmentKpis.totalGalianDone.toLocaleString('id-ID')} m
                </span>
                <span className="text-[10px] text-slate-500">
                  Progres pekerjaan tanah
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Konstruksi Selesai
                </span>
                <span className="text-lg font-black font-mono text-indigo-700 mt-0.5 block">
                  {segmentKpis.completedConstruction} Proyek
                </span>
                <span className="text-[10px] text-slate-500">
                  Status &quot;Completed&quot;
                </span>
              </div>
            </div>
          )}

          {/* Search Bar inside Inspector */}
          <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearchTerm}
                onChange={(e) => {
                  setTableSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari PMO ID, nama vendor, deskripsi proyek..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {tableSearchTerm && (
                <button
                  type="button"
                  onClick={() => setTableSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs font-bold text-slate-500">
              Menampilkan {paginatedProjects.length} dari {searchedMatchingProjects.length} proyek
            </div>
          </div>

          {/* Projects Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-3">PMO ID</th>
                  <th className="py-3 px-3">Prioritas</th>
                  <th className="py-3 px-3">Deskripsi Proyek</th>
                  <th className="py-3 px-3">Nama Vendor</th>
                  <th className="py-3 px-3">Status Proyek</th>
                  <th className="py-3 px-3">Status Konstruksi</th>
                  <th className="py-3 px-3 text-right">Panjang FO</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs text-slate-800">
                {paginatedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ditemukan proyek yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map((p, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={p.id} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{rowNum}</td>
                        <td className="py-2.5 px-3 font-bold font-mono text-slate-900">{p.pmoId || '-'}</td>
                        <td className="py-2.5 px-3">
                          <PriorityBadge priority={p.priority} />
                        </td>
                        <td className="py-2.5 px-3 max-w-[220px] truncate font-medium" title={p.projectDescription}>
                          {p.projectDescription || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{p.namaVendor || '-'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                            {p.projectStatus || 'Draft'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {p.statusConstruction || 'Not Started'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {Number(p.panjangRelokasi) || 0} m
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {onJumpToTab && (
                              <button
                                type="button"
                                onClick={() => onJumpToTab(currentChart.tabKey, p)}
                                className="p-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-700 cursor-pointer"
                                title={`Buka di Tab: ${currentChart.title.split('.')[1].trim()}`}
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onViewDetail && (
                              <button
                                type="button"
                                onClick={() => onViewDetail(p)}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="Lihat Detail"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onEditProject && (
                              <button
                                type="button"
                                onClick={() => onEditProject(p)}
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="Edit Proyek"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Inspector Footer Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">
                Halaman {currentPage} dari {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold disabled:opacity-40 cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 font-bold disabled:opacity-40 cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
        );
      })()}
    </div>
  );
};

// High Quality SVG Showcase Chart Component
interface ShowcaseSvgChartProps {
  slices: PieChartSlice[];
  totalValue: number;
  chartStyle: 'donut' | 'pie';
  activeSliceLabel: string | null;
  onSliceClick: (slice: PieChartSlice) => void;
}

const ShowcaseSvgChart: React.FC<ShowcaseSvgChartProps> = ({
  slices,
  totalValue,
  chartStyle,
  activeSliceLabel,
  onSliceClick,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<PieChartSlice | null>(null);

  const center = 100;
  const outerRadius = 82;
  const innerRadius = chartStyle === 'donut' ? 50 : 0;

  const pathData = useMemo(() => {
    if (totalValue === 0) return [];

    let startAngle = 0;
    return slices.map((slice) => {
      const angle = (slice.value / totalValue) * 360;
      const endAngle = startAngle + angle;

      const isFull = angle >= 359.99;
      const actualEndAngle = isFull ? startAngle + 359.99 : endAngle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((actualEndAngle - 90) * Math.PI) / 180;

      const x1 = center + outerRadius * Math.cos(startRad);
      const y1 = center + outerRadius * Math.sin(startRad);
      const x2 = center + outerRadius * Math.cos(endRad);
      const y2 = center + outerRadius * Math.sin(endRad);

      let d = '';

      if (chartStyle === 'pie') {
        const largeArcFlag = angle > 180 ? 1 : 0;
        d = [
          `M ${center} ${center}`,
          `L ${x1} ${y1}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');
      } else {
        const ix1 = center + innerRadius * Math.cos(endRad);
        const iy1 = center + innerRadius * Math.sin(endRad);
        const ix2 = center + innerRadius * Math.cos(startRad);
        const iy2 = center + innerRadius * Math.sin(startRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        d = [
          `M ${x1} ${y1}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${ix1} ${iy1}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
          'Z',
        ].join(' ');
      }

      startAngle = endAngle;

      return {
        slice,
        d,
        angle,
      };
    });
  }, [slices, totalValue, chartStyle, innerRadius, outerRadius]);

  if (totalValue === 0) {
    return (
      <div className="relative flex items-center justify-center select-none py-4">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="16"
            strokeDasharray="6 4"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Data Kosong
          </span>
          <span className="text-base font-black font-mono text-slate-400 my-0.5">
            0 Proyek
          </span>
        </div>
      </div>
    );
  }

  const currentCenterSlice = hoveredSlice || slices.find((s) => s.label === activeSliceLabel) || null;

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2 group/chart">
      {/* Floating Hover Tooltip Pill */}
      {hoveredSlice && (
        <div className="absolute -top-3 z-20 px-3 py-1 bg-slate-900/90 text-white backdrop-blur-md rounded-full shadow-lg border border-slate-700/60 text-[11px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: hoveredSlice.color }} />
          <span>{hoveredSlice.label}:</span>
          <span className="text-amber-300 font-mono">{hoveredSlice.value} Proyek ({totalValue > 0 ? Math.round((hoveredSlice.value / totalValue) * 100) : 0}%)</span>
          <span className="text-[9px] text-slate-300 font-normal underline ml-1">Klik filter</span>
        </div>
      )}

      <svg
        viewBox="0 0 200 200"
        className="w-52 h-52 sm:w-60 sm:h-60 overflow-visible drop-shadow-md"
      >
        <g>
          {pathData.map(({ slice, d }) => {
            const isActive = activeSliceLabel === slice.label;
            const isHovered = hoveredSlice?.label === slice.label;

            return (
              <path
                key={slice.id}
                d={d}
                fill={slice.color}
                stroke="#ffffff"
                strokeWidth={isHovered || isActive ? 3 : 2}
                className="transition-all duration-300 cursor-pointer origin-center hover:brightness-110 active:scale-95"
                style={{
                  filter: isActive
                    ? `drop-shadow(0 0 10px ${slice.color})`
                    : isHovered
                    ? `drop-shadow(0 8px 16px ${slice.color}66)`
                    : 'none',
                  transform: isHovered ? 'scale(1.07)' : isActive ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${center}px ${center}px`,
                }}
                onMouseEnter={() => setHoveredSlice(slice)}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => onSliceClick(slice)}
              />
            );
          })}
        </g>
      </svg>

      {/* Center Donut Hole Text */}
      {chartStyle === 'donut' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
          {currentCenterSlice ? (
            <div className="transition-all duration-200 animate-in fade-in zoom-in-95">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider truncate max-w-[110px] block mx-auto"
                style={{ color: currentCenterSlice.color }}
              >
                {currentCenterSlice.label}
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 leading-none my-1 block">
                {currentCenterSlice.value}
              </span>
              <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                {Math.round((currentCenterSlice.value / totalValue) * 100)}% Rasio
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Ringkasan
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 leading-none my-1 block">
                {totalValue}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block">
                Paket Proyek
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
