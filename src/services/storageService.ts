import { ProjectData, TabKey } from '../types/project';
import { INITIAL_PROJECTS } from '../data/initialData';
import { calculatePullingFoPercentage, calculatePullingPercentage } from '../data/dropdownOptions';
import { compareProjectsByPmoId } from '../utils/pmoIdHelpers';
import * as XLSX from 'xlsx';
import { 
  PROJECT_LIST_COLUMNS, 
  CONSTRUCTION_PLAN_COLUMNS, 
  STATUS_PROJECT_COLUMNS, 
  DOCUMENT_PROJECT_COLUMNS,
  STATUS_CONSTRUCTION_COLUMNS,
  CLOSING_PROJECT_COLUMNS,
  PROJECT_TRACKING_PIPELINE_COLUMNS 
} from '../data/tabColumns';
import { mandorStorageService } from './mandorStorageService';
import { DailyMandorReport } from '../types/mandor';

const STORAGE_KEY = 'OSP_PROJECTS_DATA_V7';
const LEGACY_STORAGE_KEYS = ['OSP_PROJECTS_DATA_V6', 'OSP_PROJECTS_DATA_V5', 'OSP_PROJECTS_DATA_V4'];

type ProjectChangeListener = (projects: ProjectData[]) => void;
const listeners: Set<ProjectChangeListener> = new Set();

/**
 * Normalizes project properties for display and calculations, ensuring NO field is blank.
 */
export function normalizeProject(p: ProjectData, idx: number): ProjectData {
  let cat = (p.projectCategory || '').trim();
  if (cat === 'GOV Apjatel' || cat === 'GOV APJATEL') cat = 'GOV APJATEL';
  else if (cat === 'GOV Bina Marga' || cat === 'B2B Commercial' || cat === 'GOV SJUT') cat = 'GOV SJUT';
  else if (cat === 'DSB - IKR' || cat === 'IKR' || cat === 'FTTH') cat = 'GOV APJATEL';

  const cleanPmoId = p.pmoId ? p.pmoId.replace(/\s+(GOV.*)$/i, '').trim() : `DSB - ID${String(idx + 1).padStart(7, '0')}`;
  const numId = cleanPmoId.replace(/[^0-9]/g, '') || String(idx + 1);

  const foProgress = p.pullingCableFoProgress || calculatePullingFoPercentage(
    p.statusPullingCableFo || 'In Progress',
    p.pullingFoPanjangSelesai || p.pullingPanjangSelesai || p.panjangRelokasi || 750,
    p.pullingFoPanjangTotal || p.pullingPanjangTotal || p.panjangRelokasi || 750,
    p.statusConstruction || 'In Progress'
  );

  const defaultDesc = p.projectDescription && p.projectDescription.trim() && p.projectDescription !== '- Kosong -'
    ? p.projectDescription.trim()
    : `Relokasi FO Segmen Jalur ${cleanPmoId} - ${p.areaKota || 'Jakarta Pusat'}`;

  const defaultVendor = (p.namaVendor || '').trim() || 'PT. Telko Mandiri Perkasa';
  const defaultPic = (p.picSectionHead || '').trim() || 'Asmari';
  const defaultWaspang = (p.waspangDsb || '').trim() || "Abdul Ra'uf";
  const defaultArea = (p.areaKota || '').trim() || 'Jakarta Pusat';
  const defaultZona = (p.zona || '').trim() || 'Zona 1 Central';
  const defaultPriority = p.priority || 'Level 1 - Kritis';
  const defaultQuarter = p.quarter || 'Q1-26';
  const defaultLength = Number(p.panjangRelokasi) || 850;
  const defaultDate = p.prajectDate || p.projectCreateDate || '2026-03-15';
  const defaultPo = p.poNumber || `PO-45000${numId.slice(-4).padStart(4, '0')}`;
  const defaultClosingStatus = p.statusPengajuanClosing || p.closingProject?.statusPengajuan || 'Submit';

  const docBaMaterial = p.baOpnameMaterial || `BA_Opname_Material_${numId}.pdf`;
  const docBaLabour = p.baOpnameLabour || `BA_Opname_Labour_${numId}.pdf`;
  const docAbdRelokasi = p.closingAbdRelokasi || `ABD_Relokasi_${numId}.dwg`;
  const docAbdInternal = p.closingAbdInternal || `ABD_Internal_${numId}.pdf`;
  const docFoto = p.fotoDokumentasi || `Dokumentasi_Foto_Lapangan_${numId}.jpg`;

  // Build closingProject documents structure if missing
  const existingDocs = p.closingProject?.documents || {};
  const mergedDocs = {
    baOpnameMaterial: existingDocs['baOpnameMaterial'] || {
      name: docBaMaterial,
      size: 1420000,
      type: 'application/pdf',
      uploadedAt: defaultDate,
    },
    baOpnameLabour: existingDocs['baOpnameLabour'] || {
      name: docBaLabour,
      size: 980000,
      type: 'application/pdf',
      uploadedAt: defaultDate,
    },
    abdRelokasi: existingDocs['abdRelokasi'] || {
      name: docAbdRelokasi,
      size: 3200000,
      type: 'application/octet-stream',
      uploadedAt: defaultDate,
    },
    abdInternal: existingDocs['abdInternal'] || {
      name: docAbdInternal,
      size: 2100000,
      type: 'application/pdf',
      uploadedAt: defaultDate,
    },
    fotoDokumentasi: existingDocs['fotoDokumentasi'] || {
      name: docFoto,
      size: 3800000,
      type: 'image/jpeg',
      uploadedAt: defaultDate,
    },
  };

  const updatedClosing = {
    projectDate: p.closingProject?.projectDate || defaultDate,
    poNumber: p.closingProject?.poNumber || defaultPo,
    statusPengajuan: defaultClosingStatus,
    remarks: p.closingProject?.remarks || p.closingRemarks || 'Dokumen penutupan proyek lengkap dan terverifikasi.',
    documents: mergedDocs,
    updatedAt: p.closingProject?.updatedAt || new Date().toISOString(),
  };

  return {
    ...p,
    no: Number(p.no) || idx + 1,
    pmoId: cleanPmoId,
    projectDescription: defaultDesc,
    namaVendor: defaultVendor,
    projectCategory: cat || 'GOV APJATEL',
    picSectionHead: defaultPic,
    waspangDsb: defaultWaspang,
    zona: defaultZona,
    areaKota: defaultArea,
    priority: defaultPriority,
    quarter: defaultQuarter,
    panjangRelokasi: defaultLength,
    galianPanjangTotal: p.galianPanjangTotal !== undefined && p.galianPanjangTotal !== '' ? Number(p.galianPanjangTotal) : defaultLength,
    jalurAkses: (p.jalurAkses === 1250 || p.jalurAkses === defaultLength || p.jalurAkses === p.panjangRelokasi) ? 0 : (Number(p.jalurAkses) || 0),
    galianAlur: (p.galianAlur === defaultLength || p.galianAlur === p.panjangRelokasi) ? 0 : (Number(p.galianAlur) || 0),
    galianCrossingJalan: Number(p.galianCrossingJalan) || 0,
    galianCrossingJembatan: Number(p.galianCrossingJembatan) || 0,
    galianCrossingSungai: Number(p.galianCrossingSungai) || 0,
    galianCrossingTol: Number(p.galianCrossingTol) || 0,
    projectStatus: p.projectStatus || 'Selesai Konstruksi',
    statusConstruction: p.statusConstruction || 'In Progress',
    statusMaterial: p.statusMaterial || 'Ready di Lokasi',
    statusPullingCableFo: p.statusPullingCableFo || 'Done',
    pullingCableFoProgress: foProgress,
    pullingCableProgress: foProgress || '100%',
    statusCo: p.statusCo || 'Done',
    laporanOpname: p.laporanOpname || 'Approved',
    closingSap: p.closingSap || 'Approval completed SAP',
    galianSipilProgress: p.galianSipilProgress || '100%',
    galianAksesProgress: p.galianAksesProgress || '100%',
    galianCrossingProgress: p.galianCrossingProgress || '100%',
    prajectDate: defaultDate,
    poNumber: defaultPo,
    statusPengajuanClosing: defaultClosingStatus,
    baOpnameMaterial: docBaMaterial,
    baOpnameLabour: docBaLabour,
    closingAbdRelokasi: docAbdRelokasi,
    closingAbdInternal: docAbdInternal,
    fotoDokumentasi: docFoto,
    closingRemarks: p.closingRemarks || 'Dokumen penutupan proyek lengkap dan siap proses audit/invoice.',
    closingProject: updatedClosing,
  };
}

const PROJECT_INIT_FLAG_KEY = 'OSP_PROJECTS_DATA_INITIALIZED_V1';

// In-memory cache for ultra-fast local state
let memoryCache: ProjectData[] | null = null;

function readFromStorage(): ProjectData[] {
  if (typeof window === 'undefined') {
    return memoryCache || INITIAL_PROJECTS.map(normalizeProject);
  }
  try {
    const isInitialized = localStorage.getItem(PROJECT_INIT_FLAG_KEY) === 'true';
    const raw = localStorage.getItem(STORAGE_KEY);

    // 1. If raw data exists in localStorage, parse and return it (even if empty array [])
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryCache = parsed.map(normalizeProject);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
        if (!isInitialized) {
          localStorage.setItem(PROJECT_INIT_FLAG_KEY, 'true');
        }
        return memoryCache;
      }
    }

    // 2. Check legacy storage keys and migrate ONLY if not initialized yet
    if (!isInitialized) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        const legacyRaw = localStorage.getItem(legacyKey);
        if (legacyRaw) {
          try {
            const legacyParsed = JSON.parse(legacyRaw);
            if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
              const cleaned = legacyParsed.map(normalizeProject);
              memoryCache = cleaned;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
              localStorage.setItem(PROJECT_INIT_FLAG_KEY, 'true');
              return memoryCache;
            }
          } catch {
            // ignore
          }
        }
      }

      // First run ever on this browser: initialize with sample initial projects
      memoryCache = INITIAL_PROJECTS.map(normalizeProject);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
        localStorage.setItem(PROJECT_INIT_FLAG_KEY, 'true');
      } catch (e) {
        /* ignore */
      }
      return memoryCache;
    }

    // 3. If already initialized before and raw is null (or cleared), return empty array
    memoryCache = [];
    return memoryCache;
  } catch (err) {
    console.warn('Gagal membaca data dari localStorage, menggunakan memori:', err);
  }

  return memoryCache || [];
}

function writeToStorage(data: ProjectData[]): void {
  memoryCache = data.map(normalizeProject);
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryCache));
    localStorage.setItem(PROJECT_INIT_FLAG_KEY, 'true');
  } catch (err) {
    console.warn('Gagal menulis data ke localStorage:', err);
  }
  // Notify all in-app subscribers
  listeners.forEach((listener) => {
    try {
      listener([...memoryCache!]);
    } catch (e) {
      console.error('Error notifying storage listener:', e);
    }
  });

  // Broadcast to other tabs & windows via BroadcastChannel
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('osp-projects-updated', { detail: memoryCache }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('osp_projects_realtime_channel');
        bc.postMessage({ type: 'PROJECTS_UPDATED', payload: memoryCache });
        bc.close();
      }
    } catch (err) {
      // Ignore broadcast channel errors
    }
  }
}

// Setup real-time listeners for cross-tab and cross-window synchronization
if (typeof window !== 'undefined') {
  // 1. Native localStorage storage event listener
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) {
          memoryCache = parsed.map(normalizeProject);
          listeners.forEach((listener) => listener([...memoryCache!]));
        }
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    }
  });

  // 2. BroadcastChannel listener for instant zero-latency cross-tab communication
  if ('BroadcastChannel' in window) {
    try {
      const realtimeBc = new BroadcastChannel('osp_projects_realtime_channel');
      realtimeBc.onmessage = (event) => {
        if (event.data && event.data.type === 'PROJECTS_UPDATED' && Array.isArray(event.data.payload)) {
          memoryCache = event.data.payload.map(normalizeProject);
          listeners.forEach((listener) => listener([...memoryCache!]));
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel setup error:', err);
    }
  }

  // 3. CustomEvent listener for intra-tab components
  window.addEventListener('osp-projects-updated', ((e: CustomEvent) => {
    if (e.detail && Array.isArray(e.detail)) {
      memoryCache = e.detail.map(normalizeProject);
      listeners.forEach((listener) => listener([...memoryCache!]));
    }
  }) as EventListener);
}

export const storageService = {
  /**
   * Load all projects from Local Storage (Pure Local Offline Data).
   */
  async loadProjects(): Promise<ProjectData[]> {
    const list = readFromStorage();
    return [...list];
  },

  /**
   * Real-time listener for project data changes across the application.
   */
  subscribeProjects(
    onData: (projects: ProjectData[]) => void,
    _onError?: (error: unknown) => void
  ): () => void {
    listeners.add(onData);
    // Initial emit
    const current = readFromStorage();
    onData([...current]);

    return () => {
      listeners.delete(onData);
    };
  },

  /**
   * Save or update a single project locally.
   */
  async saveProject(project: ProjectData): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    const current = readFromStorage();
    const existingIndex = current.findIndex((p) => p.id === project.id);

    let updated: ProjectData[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...project,
        updatedAt: timestamp,
      };
    } else {
      updated = [
        ...current,
        {
          ...project,
          no: project.no || current.length + 1,
          updatedAt: timestamp,
        },
      ];
    }

    writeToStorage(updated);
    return { success: true, timestamp };
  },

  /**
   * Batch save / update multiple projects locally.
   */
  async saveProjects(projects: ProjectData[]): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    const normalized = projects.map((p, idx) => ({
      ...p,
      no: p.no || idx + 1,
      updatedAt: timestamp,
    }));
    writeToStorage(normalized);
    return { success: true, timestamp };
  },

  /**
   * Delete a single project from local storage.
   */
  async deleteProject(projectId: string): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    const current = readFromStorage();
    const filtered = current
      .filter((p) => p.id !== projectId)
      .map((p, idx) => ({ ...p, no: idx + 1 }));
    writeToStorage(filtered);
    return { success: true, timestamp };
  },

  /**
   * Clear all projects locally (0 projects).
   */
  async clearAllProjects(): Promise<{ success: boolean; timestamp: string }> {
    const timestamp = new Date().toISOString();
    writeToStorage([]);
    return { success: true, timestamp };
  },

  /**
   * Clear only the projectDescription field across all existing projects.
   */
  async clearAllProjectDescriptions(): Promise<{ success: boolean; count: number; timestamp: string }> {
    const current = readFromStorage();
    const updated = current.map((p) => ({
      ...p,
      projectDescription: '',
      updatedAt: new Date().toISOString(),
    }));
    writeToStorage(updated);
    return {
      success: true,
      count: updated.length,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Restore default projects (clean 0 projects).
   */
  async restoreDefaultProjects(): Promise<ProjectData[]> {
    writeToStorage([]);
    return [];
  },

  /**
   * Export all projects to CSV.
   */
  exportToCsv(projects: ProjectData[]): { success: boolean; count: number; filename: string } {
    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const headers = [
      'No',
      'PMO - ID',
      'Project Category',
      'Project ID',
      'Project Description',
      'Area',
      'Status Project',
      'Status Prioritas',
      'Quarter',
      'PIC / Section Head',
      'Nama Vendor',
      'Tanggal Surat Perintah Relokasi',
      'Bulan',
      'Tahun',
      'Panjang Cable FO (m)',
      'Status APD Relokasi / Segment',
      'Status KMZ Relokasi / Segment',
      'Status Audit',
      'Status APD Internal',
      'Status Survey',
      'BA Survey',
      'CE Material',
      'SPH / BOQ',
      'CE LN',
      'APD LN',
      'Timeline Relokasi',
      'Tanggal Start Project',
      'Tanggal End Project',
      'Estimasi Pemutusan',
      'Tanggal Pemutusan',
      'Remarks Plan',
      'Status Pengajuan Project',
      'MR Number',
      'Plan Pengambilan Material',
      'Status Material Location',
      'Status Material Return',
      'Status Dokumen Closing',
      'Status Construction',
      'Status Labor',
      'Status Material',
      'Status Pulling Cable FO',
      'Progress FO (%)',
      'Status C/O',
      'Cable FO Joint CO',
      'Phase CO & Tanggal',
      'Laporan Opname',
      'Closing SAP',
      'Pipeline Stage'
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = projects.map((p, idx) => [
      p.no || idx + 1,
      p.pmoId || '',
      p.projectCategory || '',
      p.projectId || '',
      p.projectDescription || '',
      p.areaKota || '',
      p.projectStatus || '',
      p.priority || 'Normal',
      p.quarter || '',
      p.picSectionHead || '',
      p.namaVendor || '',
      p.dateSuratPerintahRelokasi || '',
      p.bulan || '',
      p.tahun || '',
      p.panjangRelokasi || 0,
      p.apdRelokasi || '',
      p.kmzRelokasi || '',
      p.statusAudit || '',
      p.apdLinknet || '',
      p.statusSurvey || '',
      p.baSurvey || '',
      p.ceMaterial || '',
      p.sphBoq || '',
      p.ceLn || '',
      p.apdLn || '',
      p.timelineRelokasi || '',
      p.tanggalStartProject || '',
      p.tanggalEndProject || '',
      p.estimasiPemutusan || '',
      p.tanggalPemutusan || '',
      p.remarksPlan || '',
      p.statusPengajuanProject || '',
      p.mrNumber || '',
      p.statusMaterialReturn || '',
      p.statusDokumenClosing || '',
      p.statusConstruction || '',
      p.statusLabor || '',
      p.statusMaterial || '',
      p.statusPullingCableFo || '',
      p.pullingCableFoProgress || '',
      p.statusCo || '',
      p.coCableJointSummary || '',
      p.coPhaseSummary || '',
      p.laporanOpname || '',
      p.closingSap || '',
      p.pipelineStage || ''
    ].map(escapeCsv).join(','));

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const filename = `Monitoring_GOV_FMI_DSB_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: projects.length, filename };
  },

  /**
   * Export Daily Mandor reports to Excel (.xlsx).
   */
  exportMandorToExcel(reports: DailyMandorReport[]): { success: boolean; count: number; filename: string } {
    if (!reports || reports.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const headers = [
      'No.',
      'Tanggal Laporan',
      'Nama Mandor',
      'Segment Relokasi',
      'Area / Kota',
      'Status Project',
      'Tim Mandor',
      'Man Power (Person)',
      'Nama Vendor',
      'Rincian Install HH/HS/HG',
      'Total HH Installed (Unit)',
      'Plan HH (Unit)',
      'Target Meter Jalur Akses (m)',
      'Meter Selesai (m)',
      'Meter Belum Selesai (m)',
      'Catatan / Remarks'
    ];

    const dataRows = reports.map((r, idx) => {
      const hhItems = r.hhInstallItems || [];
      const hhSummaryText = hhItems.length > 0 
        ? hhItems.map(i => `${i.itemType} (${i.specSize || 'Std'}): ${i.installedQty}/${i.planQty} Unit`).join(' | ')
        : 'HH/HS/HG: 0 Unit';
      
      const totalInstalled = hhItems.reduce((acc, curr) => acc + (Number(curr.installedQty) || 0), 0);
      const totalPlan = hhItems.reduce((acc, curr) => acc + (Number(curr.planQty) || 0), 0);
      const targetM = Number(r.targetMeter) || 0;
      const selesaiM = Number(r.meterSelesai) || 0;
      const sisaM = Math.max(0, targetM - selesaiM);

      return [
        idx + 1,
        r.date || '',
        r.mandorName || '',
        r.segmentRelokasi || '',
        r.areaKota || '',
        r.statusProject || '',
        r.teamName || '',
        r.manPowerCount || 0,
        r.vendorName || '',
        hhSummaryText,
        totalInstalled,
        totalPlan,
        targetM,
        selesaiM,
        sisaM,
        r.remarks || ''
      ];
    });

    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [
      { wch: 6 },   // No
      { wch: 14 },  // Tanggal
      { wch: 20 },  // Mandor
      { wch: 38 },  // Segment
      { wch: 16 },  // Area
      { wch: 14 },  // Status
      { wch: 20 },  // Team
      { wch: 18 },  // Manpower
      { wch: 18 },  // Vendor
      { wch: 42 },  // HH Details
      { wch: 22 },  // Total Installed
      { wch: 14 },  // Plan
      { wch: 24 },  // Target Meter
      { wch: 18 },  // Meter Selesai
      { wch: 22 },  // Sisa Meter
      { wch: 40 },  // Remarks
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Daily Mandor');

    const filename = `Daily_Mandor_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

    wb.Props = {
      Title: 'Laporan Daily Mandor Field Operational',
      Subject: `Daily Mandor (${reports.length} Laporan)`,
      Author: 'PAUL',
      Company: 'PMO System © PAUL',
      CreatedDate: new Date(),
    };

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: reports.length, filename };
  },

  /**
   * Export Daily Mandor reports to CSV (.csv).
   */
  exportMandorToCsv(reports: DailyMandorReport[]): { success: boolean; count: number; filename: string } {
    if (!reports || reports.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const headers = [
      'No.',
      'Tanggal Laporan',
      'Nama Mandor',
      'Segment Relokasi',
      'Area / Kota',
      'Status Project',
      'Tim Mandor',
      'Man Power (Person)',
      'Nama Vendor',
      'Rincian Install HH/HS/HG',
      'Total HH Installed (Unit)',
      'Plan HH (Unit)',
      'Target Meter Jalur Akses (m)',
      'Meter Selesai (m)',
      'Meter Belum Selesai (m)',
      'Catatan / Remarks'
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = reports.map((r, idx) => {
      const hhItems = r.hhInstallItems || [];
      const hhSummaryText = hhItems.length > 0 
        ? hhItems.map(i => `${i.itemType} (${i.specSize || 'Std'}): ${i.installedQty}/${i.planQty} Unit`).join(' | ')
        : 'HH/HS/HG: 0 Unit';
      
      const totalInstalled = hhItems.reduce((acc, curr) => acc + (Number(curr.installedQty) || 0), 0);
      const totalPlan = hhItems.reduce((acc, curr) => acc + (Number(curr.planQty) || 0), 0);
      const targetM = Number(r.targetMeter) || 0;
      const selesaiM = Number(r.meterSelesai) || 0;
      const sisaM = Math.max(0, targetM - selesaiM);

      return [
        idx + 1,
        r.date || '',
        r.mandorName || '',
        r.segmentRelokasi || '',
        r.areaKota || '',
        r.statusProject || '',
        r.teamName || '',
        r.manPowerCount || 0,
        r.vendorName || '',
        hhSummaryText,
        totalInstalled,
        totalPlan,
        targetM,
        selesaiM,
        sisaM,
        r.remarks || ''
      ].map(escapeCsv).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const filename = `Daily_Mandor_Report_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: reports.length, filename };
  },

  /**
   * Export single page table to Excel (.xlsx) matching specific page columns.
   */
  exportPageToExcel(projects: ProjectData[], activeTab: TabKey | string): { success: boolean; count: number; filename: string } {
    if (activeTab === 'daily-mandor') {
      const reports = mandorStorageService.getReports();
      return this.exportMandorToExcel(reports);
    }

    let columns: { key: keyof ProjectData; label: string }[] = PROJECT_LIST_COLUMNS;
    let pageName = 'Project List';
    let filePrefix = 'Project_List_Master_Data';

    if (activeTab === 'construction-plan') {
      columns = CONSTRUCTION_PLAN_COLUMNS;
      pageName = 'Plan Implimentasi Project';
      filePrefix = 'Plan_Implimentasi_Project';
    } else if (activeTab === 'status-construction') {
      columns = STATUS_CONSTRUCTION_COLUMNS;
      pageName = 'Status Construction';
      filePrefix = 'Status_Construction';
    } else if (activeTab === 'status-project' || activeTab === 'document-project') {
      columns = DOCUMENT_PROJECT_COLUMNS;
      pageName = 'Document Project';
      filePrefix = 'Document_Project';
    } else if (activeTab === 'project-tracking-pipeline') {
      columns = PROJECT_TRACKING_PIPELINE_COLUMNS;
      pageName = 'Project Tracing Pipeline';
      filePrefix = 'Project_Tracing_Pipeline';
    } else if (activeTab === 'closing-project') {
      columns = CLOSING_PROJECT_COLUMNS;
      pageName = 'Closing Project';
      filePrefix = 'Closing_Project';
    }

    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const wb = XLSX.utils.book_new();
    const headers = columns.map(c => c.label);
    const dataRows = projects.map((p, idx) => {
      return columns.map(c => {
        if (c.key === 'no') return p.no || idx + 1;
        const val = p[c.key];
        return val !== undefined && val !== null ? val : '';
      });
    });

    const wsData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = columns.map(c => {
      const headerLen = c.label.length;
      return { wch: Math.min(Math.max(headerLen + 4, 12), 40) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, pageName.slice(0, 30));

    const filename = `${filePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    wb.Props = {
      Title: `${pageName} Report`,
      Subject: `${pageName} Data (${projects.length} Proyek)`,
      Author: 'PAUL',
      Company: 'PMO System © PAUL',
      CreatedDate: new Date(),
    };

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: projects.length, filename };
  },

  /**
   * Export single page table to CSV (.csv) matching specific page columns.
   */
  exportPageToCsv(projects: ProjectData[], activeTab: TabKey | string): { success: boolean; count: number; filename: string } {
    if (activeTab === 'daily-mandor') {
      const reports = mandorStorageService.getReports();
      return this.exportMandorToCsv(reports);
    }

    let columns: { key: keyof ProjectData; label: string }[] = PROJECT_LIST_COLUMNS;
    let filePrefix = 'Project_List_Master_Data';

    if (activeTab === 'construction-plan') {
      columns = CONSTRUCTION_PLAN_COLUMNS;
      filePrefix = 'Plan_Implimentasi_Project';
    } else if (activeTab === 'status-construction') {
      columns = STATUS_CONSTRUCTION_COLUMNS;
      filePrefix = 'Status_Construction';
    } else if (activeTab === 'status-project' || activeTab === 'document-project') {
      columns = DOCUMENT_PROJECT_COLUMNS;
      filePrefix = 'Document_Project';
    } else if (activeTab === 'project-tracking-pipeline') {
      columns = PROJECT_TRACKING_PIPELINE_COLUMNS;
      filePrefix = 'Project_Tracing_Pipeline';
    } else if (activeTab === 'closing-project') {
      columns = CLOSING_PROJECT_COLUMNS;
      filePrefix = 'Closing_Project';
    }

    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = columns.map(c => c.label);
    const rows = projects.map((p, idx) => {
      return columns.map(c => {
        if (c.key === 'no') return p.no || idx + 1;
        const val = p[c.key];
        return val !== undefined && val !== null ? val : '';
      }).map(escapeCsv).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const filename = `${filePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: projects.length, filename };
  },

  /**
   * Export all projects to multi-sheet master Excel (.xlsx).
   */
  exportToExcel(projects: ProjectData[]): { success: boolean; count: number; filename: string } {
    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const wb = XLSX.utils.book_new();

    const buildSheet = (columns: { key: keyof ProjectData; label: string }[]) => {
      const headers = columns.map(c => c.label);
      const dataRows = projects.map((p, idx) => {
        return columns.map(c => {
          if (c.key === 'no') return p.no || idx + 1;
          const val = p[c.key];
          return val !== undefined && val !== null ? val : '';
        });
      });
      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      const colWidths = columns.map(c => {
        const headerLen = c.label.length;
        return { wch: Math.min(Math.max(headerLen + 4, 12), 40) };
      });
      ws['!cols'] = colWidths;
      return ws;
    };

    const wsMaster = buildSheet(PROJECT_LIST_COLUMNS);
    XLSX.utils.book_append_sheet(wb, wsMaster, '2. Project List');

    const wsConstPlan = buildSheet(CONSTRUCTION_PLAN_COLUMNS);
    XLSX.utils.book_append_sheet(wb, wsConstPlan, '3. Plan Implimentasi');

    const wsStatusConst = buildSheet(STATUS_CONSTRUCTION_COLUMNS);
    XLSX.utils.book_append_sheet(wb, wsStatusConst, '4. Status Construction');

    const wsDocProj = buildSheet(DOCUMENT_PROJECT_COLUMNS);
    XLSX.utils.book_append_sheet(wb, wsDocProj, '5. Document Project');

    const wsTracking = buildSheet(PROJECT_TRACKING_PIPELINE_COLUMNS);
    XLSX.utils.book_append_sheet(wb, wsTracking, '6. Project Tracing Pipeline');

    const filename = `Monitoring_GOV_FMI_DSB_${new Date().toISOString().slice(0, 10)}.xlsx`;

    wb.Props = {
      Title: 'Monitoring GOV FMI_DSB Report',
      Subject: `Master Project Report (${projects.length} Proyek)`,
      Author: 'PAUL',
      Company: 'PMO System © PAUL',
      CreatedDate: new Date(),
    };

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { 
      success: true, 
      count: projects.length, 
      filename
    };
  },

  /**
   * Export current data to JSON.
   */
  exportToJson(projects: ProjectData[]): void {
    const payload = {
      system: 'Monitoring GOV FMI_DSB',
      author: 'PAUL',
      export_date: new Date().toISOString(),
      total_records: projects.length,
      data: projects,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OSP_Project_Controling_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
