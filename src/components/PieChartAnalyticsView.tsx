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
  Zap,
  AlertTriangle
} from 'lucide-react';
import { ProjectData, TabKey } from '../types/project';
import { documentStorageService } from '../services/documentStorageService';
import { DOCUMENT_SLOTS } from '../types/document';
import { PriorityBadge } from './PriorityBadge';
import { getPriorityMeta, PRIORITY_TIERS } from '../utils/priorityHelpers';

// Color palette for slices
const SLICE_COLORS = [
  '#0284c7', // sky-600
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#64748b', // slate-500
  '#a855f7', // purple-500
  '#3b82f6', // blue-500
];

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
    getData: (projects: ProjectData[]) => PieChartSlice[];
  }[];
}

interface PieChartAnalyticsViewProps {
  projects: ProjectData[];
  onViewDetail?: (project: ProjectData) => void;
  onEditProject?: (project: ProjectData) => void;
  onJumpToTab?: (tab: TabKey, project: ProjectData) => void;
  initialTabFocus?: TabKey;
  showToast?: (msg: string) => void;
}

export const PieChartAnalyticsView: React.FC<PieChartAnalyticsViewProps> = ({
  projects,
  onViewDetail,
  onEditProject,
  onJumpToTab,
  initialTabFocus,
  showToast,
}) => {
  // Active Domain tab filter ('all' for 6-card grid, or specific domain)
  const [activeDomainFilter, setActiveDomainFilter] = useState<string>(
    initialTabFocus && initialTabFocus !== 'pie-chart-analytics' ? initialTabFocus : 'all'
  );

  useEffect(() => {
    if (initialTabFocus && initialTabFocus !== 'pie-chart-analytics') {
      setActiveDomainFilter(initialTabFocus);
    }
  }, [initialTabFocus]);

  // Selected slice state for "informasi yang keluar hanya untuk yang di klik"
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
  });

  // Table search within selected segment
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Reference to inspect panel for smooth auto-scroll
  const detailPanelRef = useRef<HTMLDivElement>(null);

  // Define the 6 Charts Configurations
  const chartConfigs: PieChartConfig[] = useMemo(() => [
    // 1. Tab 1: Project List
    {
      id: 'chart-project-list',
      tabKey: 'project-list',
      tabNumber: 1,
      title: '1. Project List',
      subtitle: 'Distribusi Kategori, Area/Kota, Zona & PIC',
      icon: FolderKanban,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      metricOptions: [
        {
          key: 'category',
          label: 'Kategori Proyek',
          getData: (data) => {
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
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.projectCategory || 'Lainnya').trim() === label,
              }));
          },
        },
        {
          key: 'area',
          label: 'Area / Kota',
          getData: (data) => {
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
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.areaKota || 'Tanpa Area').trim() === label,
              }));
          },
        },
        {
          key: 'zona',
          label: 'Zona Distribusi',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const z = (p.zona || 'Tanpa Zona').trim();
              counts[z] = (counts[z] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `zona-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.zona || 'Tanpa Zona').trim() === label,
              }));
          },
        },
        {
          key: 'pic',
          label: 'PIC Section Head',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const pic = (p.picSectionHead || 'Belum Ada PIC').trim();
              counts[pic] = (counts[pic] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `pic-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.picSectionHead || 'Belum Ada PIC').trim() === label,
              }));
          },
        },
        {
          key: 'priority',
          label: 'Status Prioritas (Level 1-6)',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const prio = (p.priority || 'Normal').trim();
              counts[prio] = (counts[prio] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => {
                const metaA = getPriorityMeta(a[0]);
                const metaB = getPriorityMeta(b[0]);
                return metaB.weight - metaA.weight;
              })
              .map(([label, value]) => {
                let sliceColor = '#64748b';
                if (label === 'Critical') sliceColor = '#e11d48';
                else if (label === 'P1') sliceColor = '#dc2626';
                else if (label === 'Urgent') sliceColor = '#ea580c';
                else if (label === 'Top Priority') sliceColor = '#9333ea';
                else if (label === 'High') sliceColor = '#f59e0b';
                else if (label === 'P2') sliceColor = '#d97706';
                else if (label === 'Medium') sliceColor = '#0284c7';
                else if (label === 'P3') sliceColor = '#0ea5e9';
                else if (label === 'Normal') sliceColor = '#475569';
                else if (label === 'Low') sliceColor = '#94a3b8';
                return {
                  id: `list-prio-${label}`,
                  label,
                  value,
                  color: sliceColor,
                  filterFn: (p) => (p.priority || 'Normal').trim() === label,
                };
              });
          },
        },
      ],
    },

    // 2. Tab 2: Construction & Plan
    {
      id: 'chart-construction-plan',
      tabKey: 'construction-plan',
      tabNumber: 2,
      title: '2. Construction & Plan',
      subtitle: 'Vendor Pelaksana, APD, KMZ & BA Survey',
      icon: HardHat,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      metricOptions: [
        {
          key: 'vendor',
          label: 'Vendor Pelaksana',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const v = (p.namaVendor || 'Belum Ada Vendor').trim();
              counts[v] = (counts[v] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `vendor-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.namaVendor || 'Belum Ada Vendor').trim() === label,
              }));
          },
        },
        {
          key: 'apd',
          label: 'Status APD Relokasi / FTTH / IKR',
          getData: (data) => {
            let ada = 0;
            let belum = 0;
            data.forEach((p) => {
              const apd = p.apdRelokasi || '';
              if (apd === 'Ada' || apd === 'Sudah' || apd === 'APD FTTH' || apd === 'APD IKR') ada++;
              else belum++;
            });
            return [
              {
                id: 'apd-ada',
                label: 'Ada APD (Ready)',
                value: ada,
                color: '#10b981',
                filterFn: (p) => {
                  const apd = p.apdRelokasi || '';
                  return apd === 'Ada' || apd === 'Sudah' || apd === 'APD FTTH' || apd === 'APD IKR';
                },
              },
              {
                id: 'apd-belum',
                label: 'Belum Ada APD',
                value: belum,
                color: '#f43f5e',
                filterFn: (p) => {
                  const apd = p.apdRelokasi || '';
                  return !(apd === 'Ada' || apd === 'Sudah' || apd === 'APD FTTH' || apd === 'APD IKR');
                },
              },
            ];
          },
        },
        {
          key: 'kmz',
          label: 'Status KMZ Relokasi / FTTH / IKR',
          getData: (data) => {
            let ada = 0;
            let belum = 0;
            data.forEach((p) => {
              const kmz = p.kmzRelokasi || '';
              if (kmz === 'Ada' || kmz === 'Sudah' || kmz === 'KMZ FTTH' || kmz === 'KMZ IKR') ada++;
              else belum++;
            });
            return [
              {
                id: 'kmz-ada',
                label: 'Ada KMZ (Ready)',
                value: ada,
                color: '#0284c7',
                filterFn: (p) => {
                  const kmz = p.kmzRelokasi || '';
                  return kmz === 'Ada' || kmz === 'Sudah' || kmz === 'KMZ FTTH' || kmz === 'KMZ IKR';
                },
              },
              {
                id: 'kmz-belum',
                label: 'Belum Ada KMZ',
                value: belum,
                color: '#f59e0b',
                filterFn: (p) => {
                  const kmz = p.kmzRelokasi || '';
                  return !(kmz === 'Ada' || kmz === 'Sudah' || kmz === 'KMZ FTTH' || kmz === 'KMZ IKR');
                },
              },
            ];
          },
        },
        {
          key: 'survey',
          label: 'Status BA Survey',
          getData: (data) => {
            let ada = 0;
            let belum = 0;
            data.forEach((p) => {
              if (p.baSurvey === 'Ada' || p.baSurvey === 'Sudah BA' || p.baSurvey === 'Done') ada++;
              else belum++;
            });
            return [
              {
                id: 'survey-done',
                label: 'Sudah Ada BA Survey',
                value: ada,
                color: '#8b5cf6',
                filterFn: (p) => p.baSurvey === 'Ada' || p.baSurvey === 'Sudah BA' || p.baSurvey === 'Done',
              },
              {
                id: 'survey-not',
                label: 'Belum Ada BA Survey',
                value: belum,
                color: '#64748b',
                filterFn: (p) => p.baSurvey !== 'Ada' && p.baSurvey !== 'Sudah BA' && p.baSurvey !== 'Done',
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
      subtitle: 'Status Pengajuan, Review Dinas, PO & Closing',
      icon: Activity,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      metricOptions: [
        {
          key: 'status',
          label: 'Project Status Master',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const s = (p.projectStatus || 'In Progress').trim();
              counts[s] = (counts[s] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `status-${label}`,
                label,
                value,
                color: label === 'Completed' || label === 'Done' ? '#10b981' :
                       label.includes('Review') ? '#f59e0b' :
                       label === 'Cancelled' ? '#f43f5e' :
                       label === 'In Progress' ? '#0284c7' : SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.projectStatus || 'In Progress').trim() === label,
              }));
          },
        },
        {
          key: 'pengajuan',
          label: 'Status Pengajuan Project',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const s = (p.statusPengajuanProject || 'Not Yet').trim();
              counts[s] = (counts[s] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `pengajuan-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.statusPengajuanProject || 'Not Yet').trim() === label,
              }));
          },
        },
        {
          key: 'material',
          label: 'Plan Pengambilan Material',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const m = (p.planPengambilanMaterial || 'Not Yet').trim();
              counts[m] = (counts[m] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `mat-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.planPengambilanMaterial || 'Not Yet').trim() === label,
              }));
          },
        },
        {
          key: 'closing-doc',
          label: 'Status Dokumen Closing',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const c = (p.statusDokumenClosing || 'Not Yet').trim();
              counts[c] = (counts[c] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `close-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.statusDokumenClosing || 'Not Yet').trim() === label,
              }));
          },
        },
        {
          key: 'priority-status',
          label: 'Status Prioritas & Urgensi',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const prio = (p.priority || 'Normal').trim();
              counts[prio] = (counts[prio] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => {
                const metaA = getPriorityMeta(a[0]);
                const metaB = getPriorityMeta(b[0]);
                return metaB.weight - metaA.weight;
              })
              .map(([label, value]) => {
                let sliceColor = '#64748b';
                if (label === 'Critical') sliceColor = '#e11d48';
                else if (label === 'P1') sliceColor = '#dc2626';
                else if (label === 'Urgent') sliceColor = '#ea580c';
                else if (label === 'Top Priority') sliceColor = '#9333ea';
                else if (label === 'High') sliceColor = '#f59e0b';
                else if (label === 'P2') sliceColor = '#d97706';
                else if (label === 'Medium') sliceColor = '#0284c7';
                else if (label === 'P3') sliceColor = '#0ea5e9';
                else if (label === 'Normal') sliceColor = '#475569';
                else if (label === 'Low') sliceColor = '#94a3b8';
                return {
                  id: `status-prio-${label}`,
                  label,
                  value,
                  color: sliceColor,
                  filterFn: (p) => (p.priority || 'Normal').trim() === label,
                };
              });
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
      subtitle: 'Konstruksi Fisik, Pulling FO/COAX & Closing SAP',
      icon: TrendingUp,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      metricOptions: [
        {
          key: 'construction',
          label: 'Status Konstruksi Fisik',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const s = (p.statusConstruction || 'In Progress').trim();
              counts[s] = (counts[s] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `const-${label}`,
                label,
                value,
                color: label === 'Completed' || label === 'Done' ? '#10b981' :
                       label === 'Pulling Cable' ? '#8b5cf6' :
                       label === 'In Progress' ? '#0284c7' :
                       label.includes('Not Started') ? '#64748b' : SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.statusConstruction || 'In Progress').trim() === label,
              }));
          },
        },
        {
          key: 'fo',
          label: 'Status Pulling Cable FO',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const s = (p.statusPullingCableFo || 'Not Started').trim();
              counts[s] = (counts[s] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `fo-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.statusPullingCableFo || 'Not Started').trim() === label,
              }));
          },
        },
        {
          key: 'coax',
          label: 'Status Pulling COAX',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const s = (p.statusPullingCableCoax || 'No COAX').trim();
              counts[s] = (counts[s] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `coax-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.statusPullingCableCoax || 'No COAX').trim() === label,
              }));
          },
        },
        {
          key: 'sap',
          label: 'Closing SAP',
          getData: (data) => {
            let yes = 0;
            let no = 0;
            data.forEach((p) => {
              if (p.closingSap === 'Yes' || p.closingSap === 'Done') yes++;
              else no++;
            });
            return [
              {
                id: 'sap-yes',
                label: 'Selesai Closing SAP (Yes)',
                value: yes,
                color: '#10b981',
                filterFn: (p) => p.closingSap === 'Yes' || p.closingSap === 'Done',
              },
              {
                id: 'sap-no',
                label: 'Belum Closing SAP (No)',
                value: no,
                color: '#64748b',
                filterFn: (p) => p.closingSap !== 'Yes' && p.closingSap !== 'Done',
              },
            ];
          },
        },
      ],
    },

    // 5. Tab 5: Project Tracking Pipeline
    {
      id: 'chart-pipeline',
      tabKey: 'project-tracking-pipeline',
      tabNumber: 5,
      title: '5. Tracking Pipeline',
      subtitle: 'Tahapan Siklus Proyek (Pre-Project hingga Closing)',
      icon: GitCommit,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      metricOptions: [
        {
          key: 'stage',
          label: 'Tahapan Pipeline Relokasi',
          getData: (data) => {
            let stageReview = 0;
            let stageProcurement = 0;
            let stageCivil = 0;
            let stagePulling = 0;
            let stageClosing = 0;
            let stageCancelled = 0;

            data.forEach((p) => {
              if (p.projectStatus === 'Cancelled' || p.statusConstruction === 'Project Cancel') {
                stageCancelled++;
              } else if (p.statusCo === 'Done' || p.projectStatus === 'Completed') {
                stageClosing++;
              } else if (p.statusConstruction === 'Pulling Cable' || p.statusPullingCableFo === 'In Progress') {
                stagePulling++;
              } else if (p.statusConstruction === 'In Progress' || (p.galianSipilProgress && p.galianSipilProgress !== '100%')) {
                stageCivil++;
              } else if (p.statusPengajuanPo === 'Approved' || p.statusPengajuanProject === 'Release') {
                stageProcurement++;
              } else {
                stageReview++;
              }
            });

            return [
              {
                id: 'pipe-review',
                label: '1. Review & Dinas',
                value: stageReview,
                color: '#f59e0b',
                filterFn: (p) => 
                  p.projectStatus !== 'Cancelled' &&
                  p.projectStatus !== 'Completed' &&
                  p.statusConstruction !== 'Pulling Cable' &&
                  (p.projectStatus?.includes('Review') || p.statusSurvey === 'Belum'),
              },
              {
                id: 'pipe-procure',
                label: '2. Procurement & PO',
                value: stageProcurement,
                color: '#0284c7',
                filterFn: (p) =>
                  p.projectStatus !== 'Cancelled' &&
                  (p.statusPengajuanPo === 'Approved' || p.statusPengajuanProject === 'Release') &&
                  p.statusConstruction === 'Project Not Started',
              },
              {
                id: 'pipe-civil',
                label: '3. Civil & Galian Sipil',
                value: stageCivil,
                color: '#6366f1',
                filterFn: (p) =>
                  p.projectStatus !== 'Cancelled' &&
                  p.statusConstruction !== 'Pulling Cable' &&
                  p.statusConstruction !== 'Completed',
              },
              {
                id: 'pipe-pulling',
                label: '4. Pulling Cable FO',
                value: stagePulling,
                color: '#a855f7',
                filterFn: (p) =>
                  p.projectStatus !== 'Cancelled' &&
                  (p.statusConstruction === 'Pulling Cable' || p.statusPullingCableFo === 'In Progress'),
              },
              {
                id: 'pipe-closing',
                label: '5. Testing & Closing',
                value: stageClosing,
                color: '#10b981',
                filterFn: (p) =>
                  p.projectStatus === 'Completed' || p.statusCo === 'Done' || p.closingSap === 'Yes',
              },
              {
                id: 'pipe-cancel',
                label: '6. Cancelled / On-Hold',
                value: stageCancelled,
                color: '#f43f5e',
                filterFn: (p) =>
                  p.projectStatus === 'Cancelled' || p.statusConstruction === 'Project Cancel',
              },
            ];
          },
        },
        {
          key: 'quarter',
          label: 'Target Quarter (Q)',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const q = (p.quarter || 'Tidak Terjadwal').trim();
              counts[q] = (counts[q] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], idx) => ({
                id: `q-${label}`,
                label,
                value,
                color: SLICE_COLORS[idx % SLICE_COLORS.length],
                filterFn: (p) => (p.quarter || 'Tidak Terjadwal').trim() === label,
              }));
          },
        },
      ],
    },

    // 6. Tab 6: Upload Document
    {
      id: 'chart-upload-document',
      tabKey: 'upload-document',
      tabNumber: 6,
      title: '6. Upload Dokumen',
      subtitle: 'Kelengkapan 13 Berkas Dokumen Resmi PMO',
      icon: FileText,
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      metricOptions: [
        {
          key: 'completeness',
          label: 'Status Kelengkapan Dokumen',
          getData: (data) => {
            let lengkap = 0;
            let partial = 0;
            let belum = 0;

            data.forEach((p) => {
              const rec = documentStorageService.getDocumentRecord(p);
              const count = Object.keys(rec.documents).length;
              if (count >= DOCUMENT_SLOTS.length) lengkap++;
              else if (count > 0) partial++;
              else belum++;
            });

            return [
              {
                id: 'doc-complete',
                label: 'Lengkap 100% (13 Dokumen)',
                value: lengkap,
                color: '#10b981',
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p);
                  return Object.keys(rec.documents).length >= DOCUMENT_SLOTS.length;
                },
              },
              {
                id: 'doc-partial',
                label: 'Sebagian (1 - 12 Dokumen)',
                value: partial,
                color: '#0284c7',
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p);
                  const c = Object.keys(rec.documents).length;
                  return c > 0 && c < DOCUMENT_SLOTS.length;
                },
              },
              {
                id: 'doc-zero',
                label: 'Belum Ada Berkas (0 Dokumen)',
                value: belum,
                color: '#f43f5e',
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p);
                  return Object.keys(rec.documents).length === 0;
                },
              },
            ];
          },
        },
        {
          key: 'mr-status',
          label: 'Dokumen MR (Material Request)',
          getData: (data) => {
            let ada = 0;
            let belum = 0;
            data.forEach((p) => {
              const rec = documentStorageService.getDocumentRecord(p);
              if (rec.documents['mr']) ada++;
              else belum++;
            });
            return [
              {
                id: 'mr-ada',
                label: 'Ada Dokumen MR',
                value: ada,
                color: '#10b981',
                filterFn: (p) => Boolean(documentStorageService.getDocumentRecord(p).documents['mr']),
              },
              {
                id: 'mr-belum',
                label: 'Belum Ada MR',
                value: belum,
                color: '#f59e0b',
                filterFn: (p) => !documentStorageService.getDocumentRecord(p).documents['mr'],
              },
            ];
          },
        },
        {
          key: 'dinas-status',
          label: 'Dokumen Surat Dinas / Rekomtek',
          getData: (data) => {
            let ada = 0;
            let belum = 0;
            data.forEach((p) => {
              const rec = documentStorageService.getDocumentRecord(p);
              if (rec.documents['suratDinas'] || rec.documents['rekomtek']) ada++;
              else belum++;
            });
            return [
              {
                id: 'dinas-ada',
                label: 'Ada Surat Dinas / Rekomtek',
                value: ada,
                color: '#6366f1',
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p);
                  return Boolean(rec.documents['suratDinas'] || rec.documents['rekomtek']);
                },
              },
              {
                id: 'dinas-belum',
                label: 'Belum Ada Surat Dinas',
                value: belum,
                color: '#64748b',
                filterFn: (p) => {
                  const rec = documentStorageService.getDocumentRecord(p);
                  return !rec.documents['suratDinas'] && !rec.documents['rekomtek'];
                },
              },
            ];
          },
        },
      ],
    },

    // 7. Tab 7: Status Prioritas Proyek
    {
      id: 'chart-priority-status',
      tabKey: 'pie-chart-analytics',
      tabNumber: 7,
      title: '7. Status Prioritas',
      subtitle: 'Tingkat Urgensi Proyek (Level 1 Kritis s/d Level 6 Rendah)',
      icon: Flame,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      metricOptions: [
        {
          key: 'priority-all',
          label: 'Semua Status Prioritas (Level 1-6)',
          getData: (data) => {
            const counts: Record<string, number> = {};
            data.forEach((p) => {
              const prio = (p.priority || 'Normal').trim();
              counts[prio] = (counts[prio] || 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => {
                const metaA = getPriorityMeta(a[0]);
                const metaB = getPriorityMeta(b[0]);
                return metaB.weight - metaA.weight;
              })
              .map(([label, value]) => {
                let sliceColor = '#64748b';
                if (label === 'Critical') sliceColor = '#e11d48';
                else if (label === 'P1') sliceColor = '#dc2626';
                else if (label === 'Urgent') sliceColor = '#ea580c';
                else if (label === 'Top Priority') sliceColor = '#9333ea';
                else if (label === 'High') sliceColor = '#f59e0b';
                else if (label === 'P2') sliceColor = '#d97706';
                else if (label === 'Medium') sliceColor = '#0284c7';
                else if (label === 'P3') sliceColor = '#0ea5e9';
                else if (label === 'Normal') sliceColor = '#475569';
                else if (label === 'Low') sliceColor = '#94a3b8';
                return {
                  id: `prio-all-${label}`,
                  label,
                  value,
                  color: sliceColor,
                  filterFn: (p) => (p.priority || 'Normal').trim() === label,
                };
              });
          },
        },
        {
          key: 'priority-tiers',
          label: 'Ringkasan Tier Prioritas (Tingkat 1 - 6)',
          getData: (data) => {
            const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
            data.forEach((p) => {
              const meta = getPriorityMeta(p.priority);
              tierCounts[meta.level] = (tierCounts[meta.level] || 0) + 1;
            });
            const tierConfigs = [
              { level: 1, label: 'Tingkat 1: Kritis (Critical / P1)', color: '#e11d48' },
              { level: 2, label: 'Tingkat 2: Mendesak (Urgent / Top Priority)', color: '#ea580c' },
              { level: 3, label: 'Tingkat 3: Tinggi (High / P2)', color: '#f59e0b' },
              { level: 4, label: 'Tingkat 4: Sedang (Medium / P3)', color: '#0284c7' },
              { level: 5, label: 'Tingkat 5: Standar (Normal)', color: '#475569' },
              { level: 6, label: 'Tingkat 6: Rendah (Low)', color: '#94a3b8' },
            ];
            return tierConfigs
              .map((t) => ({
                id: `tier-${t.level}`,
                label: t.label,
                value: tierCounts[t.level] || 0,
                color: t.color,
                filterFn: (p: ProjectData) => getPriorityMeta(p.priority).level === t.level,
              }))
              .filter((t) => t.value > 0);
          },
        },
        {
          key: 'priority-urgent-focus',
          label: 'Fokus Kritis & Mendesak vs Standar',
          getData: (data) => {
            let criticalUrgent = 0;
            let normalOther = 0;
            data.forEach((p) => {
              const meta = getPriorityMeta(p.priority);
              if (meta.level <= 2) criticalUrgent++;
              else normalOther++;
            });
            return [
              {
                id: 'focus-critical',
                label: 'Kritis & Mendesak (Tk. 1 & 2)',
                value: criticalUrgent,
                color: '#e11d48',
                filterFn: (p: ProjectData) => getPriorityMeta(p.priority).level <= 2,
              },
              {
                id: 'focus-standard',
                label: 'Tinggi, Sedang & Standar (Tk. 3-6)',
                value: normalOther,
                color: '#0284c7',
                filterFn: (p: ProjectData) => getPriorityMeta(p.priority).level > 2,
              },
            ];
          },
        },
      ],
    },
  ], []);

  // Filter chart configs according to activeDomainFilter
  const visibleCharts = useMemo(() => {
    if (activeDomainFilter === 'all') return chartConfigs;
    return chartConfigs.filter((c) => c.tabKey === activeDomainFilter || c.id === activeDomainFilter);
  }, [chartConfigs, activeDomainFilter]);

  // Handler when user clicks on a slice
  const handleSliceClick = (
    chart: PieChartConfig,
    metricLabel: string,
    slice: PieChartSlice
  ) => {
    // If clicking same segment, toggle off
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
      showToast(`Menampilkan informasi untuk: "${slice.label}" (${slice.value} Proyek)`);
    }

    // Smooth scroll to inspect detail section
    setTimeout(() => {
      if (detailPanelRef.current) {
        detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Projects strictly matching the clicked segment
  const matchingProjects = useMemo(() => {
    if (!selectedSegment) return [];
    return projects.filter(selectedSegment.filterFn);
  }, [projects, selectedSegment]);

  // Filtered matching projects by search term
  const searchedMatchingProjects = useMemo(() => {
    if (!tableSearchTerm.trim()) return matchingProjects;
    const q = tableSearchTerm.toLowerCase();
    return matchingProjects.filter((p) => 
      (p.pmoId || '').toLowerCase().includes(q) ||
      (p.projectDescription || '').toLowerCase().includes(q) ||
      (p.projectId || '').toLowerCase().includes(q) ||
      (p.namaVendor || '').toLowerCase().includes(q) ||
      (p.picSectionHead || '').toLowerCase().includes(q) ||
      (p.areaKota || '').toLowerCase().includes(q) ||
      (p.zona || '').toLowerCase().includes(q)
    );
  }, [matchingProjects, tableSearchTerm]);

  // Paginated data for segment table
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
    const pullingCable = matchingProjects.filter((p) => p.statusConstruction === 'Pulling Cable').length;
    const pctOfAll = projects.length > 0 ? ((matchingProjects.length / projects.length) * 100).toFixed(1) : '0';

    return {
      totalFo,
      totalGalianDone,
      completedConstruction,
      pullingCable,
      pctOfAll,
    };
  }, [matchingProjects, projects.length]);

  // Export filtered segment projects to CSV
  const handleExportSegmentCsv = () => {
    if (!selectedSegment || matchingProjects.length === 0) return;
    const headers = [
      'No',
      'PMO ID',
      'Prioritas',
      'Deskripsi Proyek',
      'Project ID',
      'Vendor',
      'Zona',
      'Area',
      'Status Proyek',
      'Status Konstruksi',
      'PIC',
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
      `"${p.zona || ''}"`,
      `"${p.areaKota || ''}"`,
      `"${p.projectStatus || ''}"`,
      `"${p.statusConstruction || ''}"`,
      `"${p.picSectionHead || ''}"`,
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
    if (showToast) showToast(`Data segmen "${selectedSegment.sliceLabel}" berhasil diekspor.`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0 ring-1 ring-white/30">
            <PieChartIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Grafik Pie Chart Analitik & Status Prioritas Proyek
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                Total {projects.length} Proyek
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi proporsi proyek dan distribusi status prioritas. Klik segmen grafik untuk melihat rincian proyek.
            </p>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveDomainFilter('all');
              setSelectedSegment(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              activeDomainFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            Semua Grafik (7 Dimensi)
          </button>

          {chartConfigs.map((c) => {
            const isTabActive = activeDomainFilter === c.id || activeDomainFilter === c.tabKey;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveDomainFilter(c.id);
                  setSelectedSegment(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{c.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Pie Charts (6 Cards or Focused Single Card) */}
      <div className={`grid gap-4 ${
        visibleCharts.length === 1 
          ? 'grid-cols-1 max-w-4xl mx-auto' 
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {visibleCharts.map((chart) => {
          const selectedMetricKey = metricSelections[chart.id] || chart.metricOptions[0].key;
          const currentMetric = chart.metricOptions.find((m) => m.key === selectedMetricKey) || chart.metricOptions[0];
          const slices = currentMetric.getData(projects);
          const totalValue = slices.reduce((acc, s) => acc + s.value, 0);

          return (
            <div
              key={chart.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <chart.icon className="w-4 h-4 text-slate-700" />
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

                  {/* Sub-metric selector */}
                  {chart.metricOptions.length > 1 && (
                    <select
                      value={selectedMetricKey}
                      onChange={(e) => {
                        setMetricSelections((prev) => ({
                          ...prev,
                          [chart.id]: e.target.value,
                        }));
                        // Clear active selection if from this chart
                        if (selectedSegment?.chartId === chart.id) {
                          setSelectedSegment(null);
                        }
                      }}
                      className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shrink-0 max-w-[140px] truncate"
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

                {/* Interactive SVG Pie/Donut Chart */}
                <div className="py-2 flex items-center justify-center relative min-h-[200px]">
                  <InteractiveSvgDonut
                    slices={slices}
                    totalValue={totalValue}
                    activeSliceLabel={
                      selectedSegment?.chartId === chart.id ? selectedSegment.sliceLabel : null
                    }
                    onSliceClick={(slice) => handleSliceClick(chart, currentMetric.label, slice)}
                  />
                </div>
              </div>

              {/* Legend & Quick Clickable Segment Pills */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Klik Segmen untuk Rincian:
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
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-sky-400'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="truncate max-w-[120px]">{slice.label}</span>
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

      {/* DEDICATED INFORMATION SECTION FOR CLICKED SLICE ("hanya untuk yang di klik") */}
      {selectedSegment && (
        <div 
          ref={detailPanelRef}
          className="bg-white rounded-2xl border-2 border-sky-500 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ring-4 ring-sky-500/10"
        >
          {/* Header of Clicked Segment */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full ring-2 ring-white/80 shrink-0"
                style={{ backgroundColor: selectedSegment.color }}
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-sky-200 border border-white/20">
                    {selectedSegment.chartTitle} • {selectedSegment.metricLabel}
                  </span>
                  <span className="text-xs text-sky-300 font-mono">
                    Filter Aktif:
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span>{selectedSegment.sliceLabel}</span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    {matchingProjects.length} Proyek ({segmentKpis?.pctOfAll}% dari Total)
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportSegmentCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-lg transition-colors border border-white/20 cursor-pointer"
                title="Download data proyek segmen ini ke CSV"
              >
                <Download className="w-3.5 h-3.5 text-sky-300" />
                <span>Ekspor CSV Segmen</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSegment(null)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                title="Tutup rincian segmen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Segment Metric Summaries */}
          {segmentKpis && (
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Jumlah Proyek Terfilter
                </span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {matchingProjects.length} Proyek
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {segmentKpis.pctOfAll}% dari total 188 proyek
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Total Target Relokasi FO
                </span>
                <span className="text-base font-bold text-sky-700 font-mono">
                  {segmentKpis.totalFo.toLocaleString('id-ID')} m
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  panjang kabel fiber optik
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Realisasi Galian Selesai
                </span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {segmentKpis.totalGalianDone.toLocaleString('id-ID')} m
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  pekerjaan galian sipil
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">
                  Konstruksi Fisik
                </span>
                <span className="text-xs font-bold text-indigo-700 block">
                  {segmentKpis.completedConstruction} Selesai • {segmentKpis.pullingCable} Pulling
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  status lapangan
                </span>
              </div>
            </div>
          )}

          {/* Search bar inside the filtered segment */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearchTerm}
                onChange={(e) => {
                  setTableSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Cari dalam segmen "${selectedSegment.sliceLabel}"... (PMO ID, vendor, PIC, deskripsi)`}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>
                Menampilkan <strong>{searchedMatchingProjects.length}</strong> proyek khusus segmen ini
              </span>
              <button
                type="button"
                onClick={() => setSelectedSegment(null)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Table of Clicked Segment Projects */}
          <div className="overflow-x-auto custom-scrollbar max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100/90 text-slate-700 sticky top-0 z-10 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 text-center w-12">No</th>
                  <th className="px-3 py-2.5">PMO ID</th>
                  <th className="px-3 py-2.5">Prioritas</th>
                  <th className="px-3 py-2.5">Nama Proyek</th>
                  <th className="px-3 py-2.5">Vendor</th>
                  <th className="px-3 py-2.5">Area / Zona</th>
                  <th className="px-3 py-2.5">Status Proyek</th>
                  <th className="px-3 py-2.5">Status Konstruksi</th>
                  <th className="px-3 py-2.5">Dokumen</th>
                  <th className="px-3 py-2.5">PIC</th>
                  <th className="px-3 py-2.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {paginatedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400">
                      Tidak ada proyek yang sesuai dengan pencarian dalam segmen ini.
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map((proj, idx) => {
                    const rowNum = (currentPage - 1) * pageSize + idx + 1;
                    const docRec = documentStorageService.getDocumentRecord(proj);
                    const docCount = Object.keys(docRec.documents).length;

                    return (
                      <tr 
                        key={proj.id}
                        className="hover:bg-sky-50/50 transition-colors"
                      >
                        <td className="px-3 py-2.5 text-center font-mono text-slate-400">
                          {rowNum}
                        </td>
                        <td className="px-3 py-2.5 font-bold font-mono text-sky-800 whitespace-nowrap">
                          {proj.pmoId}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <PriorityBadge priority={proj.priority} size="xs" showLevel />
                        </td>
                        <td className="px-3 py-2.5 max-w-[240px]">
                          <span className="font-semibold text-slate-800 block truncate" title={proj.projectDescription}>
                            {proj.projectDescription}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {proj.projectId || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-slate-700 font-medium">
                            {proj.namaVendor || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-slate-600 block">{proj.areaKota || '-'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{proj.zona || '-'}</span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            proj.projectStatus === 'Completed' || proj.projectStatus === 'Done'
                              ? 'bg-emerald-100 text-emerald-800'
                              : proj.projectStatus?.includes('Review')
                              ? 'bg-amber-100 text-amber-800'
                              : proj.projectStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {proj.projectStatus || 'In Progress'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            proj.statusConstruction === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : proj.statusConstruction === 'Pulling Cable'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {proj.statusConstruction || 'In Progress'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            docCount >= DOCUMENT_SLOTS.length
                              ? 'bg-emerald-100 text-emerald-800'
                              : docCount > 0
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {docCount} / {DOCUMENT_SLOTS.length} Dokumen
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-slate-700 font-medium">
                          {proj.picSectionHead || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {onViewDetail && (
                              <button
                                type="button"
                                onClick={() => onViewDetail(proj)}
                                title="Lihat Rincian Lengkap Proyek"
                                className="p-1 text-slate-600 hover:text-sky-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onEditProject && (
                              <button
                                type="button"
                                onClick={() => onEditProject(proj)}
                                title="Edit Data Proyek"
                                className="p-1 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onJumpToTab && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Jump to the sheet where this chart belongs
                                  const targetTab = chartConfigs.find((c) => c.id === selectedSegment.chartId)?.tabKey || 'project-list';
                                  onJumpToTab(targetTab, proj);
                                }}
                                title="Buka Proyek di Sheet Terkait"
                                className="p-1 text-sky-600 hover:text-sky-900 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
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

          {/* Table Footer with Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Halaman {currentPage} dari {totalPages} ({searchedMatchingProjects.length} proyek)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Pure SVG Interactive Donut/Pie Chart Component
 * Ultra-fast hardware accelerated rendering without external dependencies
 */
interface InteractiveSvgDonutProps {
  slices: PieChartSlice[];
  totalValue: number;
  activeSliceLabel: string | null;
  onSliceClick: (slice: PieChartSlice) => void;
}

const InteractiveSvgDonut: React.FC<InteractiveSvgDonutProps> = ({
  slices,
  totalValue,
  activeSliceLabel,
  onSliceClick,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<PieChartSlice | null>(null);

  const radius = 75;
  const innerRadius = 46;
  const center = 100;

  // Calculate arc paths for each slice
  const pathData = useMemo(() => {
    if (totalValue === 0) return [];

    let startAngle = 0;
    return slices.map((slice) => {
      const angle = (slice.value / totalValue) * 360;
      const endAngle = startAngle + angle;

      // Handle full circle
      const isFull = angle >= 359.99;
      const actualEndAngle = isFull ? startAngle + 359.99 : endAngle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((actualEndAngle - 90) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const ix1 = center + innerRadius * Math.cos(endRad);
      const iy1 = center + innerRadius * Math.sin(endRad);
      const ix2 = center + innerRadius * Math.cos(startRad);
      const iy2 = center + innerRadius * Math.sin(startRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      const d = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix1} ${iy1}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
        'Z',
      ].join(' ');

      startAngle = endAngle;

      return {
        slice,
        d,
        angle,
      };
    });
  }, [slices, totalValue]);

  if (totalValue === 0) {
    return (
      <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
        Tidak Ada Data
      </div>
    );
  }

  const currentCenterSlice = hoveredSlice || slices.find((s) => s.label === activeSliceLabel) || null;

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        viewBox="0 0 200 200"
        className="w-48 h-48 overflow-visible"
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
                stroke={isActive ? '#0284c7' : '#ffffff'}
                strokeWidth={isActive ? 3 : 1.5}
                className="transition-all duration-200 cursor-pointer origin-center hover:opacity-90"
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(2, 132, 199, 0.5))' : isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none',
                  transform: isHovered || isActive ? 'scale(1.04)' : 'scale(1)',
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

      {/* Center Label inside Donut Hole */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
        {currentCenterSlice ? (
          <>
            <span
              className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[80px]"
              style={{ color: currentCenterSlice.color }}
            >
              {currentCenterSlice.label}
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 leading-none my-0.5">
              {currentCenterSlice.value}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {Math.round((currentCenterSlice.value / totalValue) * 100)}%
            </span>
          </>
        ) : (
          <>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Total
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 leading-none my-0.5">
              {totalValue}
            </span>
            <span className="text-[9px] text-slate-400">
              Proyek
            </span>
          </>
        )}
      </div>
    </div>
  );
};
