/**
 * Standardized dropdown option constants based on business operational requirements
 */

// Zona: jabo 1, jabo 2, jabo 3
export const ZONA_OPTIONS = [
  'Jabo 1',
  'Jabo 2',
  'Jabo 3',
] as const;

// Tahun: list of relevant years
export const TAHUN_OPTIONS = [
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
  '2027',
] as const;

// APD Relokasi (GOV): Ada, Belum ada
export const APD_RELOKASI_OPTIONS = [
  'Ada',
  'Belum ada',
] as const;

// APD for FTTH & IKR: Ada, Belum ada
export const APD_FTTH_IKR_OPTIONS = [
  'Ada',
  'Belum ada',
] as const;

// KMZ Relokasi (GOV): Ada, Belum ada
export const KMZ_RELOKASI_OPTIONS = [
  'Ada',
  'Belum ada',
] as const;

// KMZ for FTTH & IKR: Ada, Belum ada
export const KMZ_FTTH_IKR_OPTIONS = [
  'Ada',
  'Belum ada',
] as const;

export function getApdOptions(_category?: string): readonly string[] {
  return APD_RELOKASI_OPTIONS;
}

export function getKmzOptions(_category?: string): readonly string[] {
  return KMZ_RELOKASI_OPTIONS;
}

// Priority options
export const PRIORITY_OPTIONS = [
  'Critical',
  'Urgent',
  'Top Priority',
  'High',
  'Medium',
  'Normal',
  'Low',
  'P1',
  'P2',
  'P3',
] as const;

// APD Internal: Not Yet, Request, Release
export const APD_INTERNAL_OPTIONS = [
  'Not Yet',
  'Request',
  'Release',
] as const;
export const APD_LINKNET_OPTIONS = APD_INTERNAL_OPTIONS;

// Status Survey: Not Yet, Done survey
export const STATUS_SURVEY_OPTIONS = [
  'Not Yet',
  'Done survey',
] as const;

// BA Survey: Not Yet, Ada
export const BA_SURVEY_OPTIONS = [
  'Not Yet',
  'Ada',
] as const;

// SPH / BOQ: Not Yet, Submit, Release
export const SPH_BOQ_OPTIONS = [
  'Not Yet',
  'Submit',
  'Release',
] as const;

// Status Project Master Options
export const PROJECT_STATUS_OPTIONS = [
  'Done (Civil Work)',
  'Done (Completed)',
  'Done (Pulling)',
  'In Progress',
  'Masih Review Dinas',
  'Not Started',
  'Project Cancel',
] as const;

export const FTTH_IKR_PROJECT_STATUS_OPTIONS = PROJECT_STATUS_OPTIONS;

// Helper to get project status options
export function getProjectStatusOptions(_category?: string): readonly string[] {
  return PROJECT_STATUS_OPTIONS;
}

// Status PO: Not Yet, Cancel, Release
export const STATUS_PO_OPTIONS = [
  'Not Yet',
  'Cancel',
  'Release',
] as const;

// Status Pengajuan PO / MR (Combined legacy list with full options)
export const STATUS_PENGAJUAN_PO_OPTIONS = [
  'Not Yet',
  'Cancel',
  'Release',
  'Approved',
  'Released',
  'Submit',
  'N/A',
] as const;

// Status Pengajuan Project: Not Yet, Project Cancel, Release, Submit
export const STATUS_PENGAJUAN_PROJECT_OPTIONS = [
  'Not Yet',
  'Project Cancel',
  'Release',
  'Submit',
] as const;

// Plan Pengambilan Material: Not Yet, Warehouse Inhouse, Warehouse User
export const PLAN_PENGAMBILAN_MATERIAL_OPTIONS = [
  'Not Yet',
  'Warehouse Inhouse',
  'Warehouse User',
] as const;

// Status Material Location: Not Yet, Warehouse Inhouse, Warehouse User, Warehouse Vendor
export const STATUS_MATERIAL_LOCATION_OPTIONS = [
  'Not Yet',
  'Warehouse Inhouse',
  'Warehouse User',
  'Warehouse Vendor',
] as const;

// Status Pengajuan Closing Project: Not Yet, Submit, Approval BALAP, Approval BAST, Teco Done, Invoice
export const STATUS_PENGAJUAN_CLOSING_OPTIONS = [
  'Not Yet',
  'Submit',
  'Approval BALAP',
  'Approval BAST',
  'Teco Done',
  'Invoice',
] as const;

// Status Dokumen Closing:
// Approval BALAP, Approval BAST, Approval completed SAP, Completed waspang mobility, Not Yet, Submit dokumen SAP, Teco done
export const STATUS_DOKUMEN_CLOSING_OPTIONS = [
  'Approval BALAP',
  'Approval BAST',
  'Approval completed SAP',
  'Completed waspang mobility',
  'Not Yet',
  'Submit dokumen SAP',
  'Teco done',
  'Invoice',
] as const;

// Status Audit: Done, In Progress, Not Yet
export const STATUS_AUDIT_OPTIONS = [
  'Done',
  'In Progress',
  'Not Yet',
] as const;

// Status Material: No need MR, Not Yet, Release
export const STATUS_MATERIAL_OPTIONS = [
  'No need MR',
  'Not Yet',
  'Release',
] as const;

// Status Pulling Cable FO: Done, In Progress, Not Started, Not Yet
export const STATUS_PULLING_CABLE_FO_OPTIONS = [
  'Done',
  'In Progress',
  'Not Started',
  'Not Yet',
] as const;

import type { CoCableJointItem, CoPhaseItem } from '../types/project';

// Status CO: Done, In Progress, Not Yet
export const STATUS_CO_OPTIONS = [
  'Done',
  'In Progress',
  'Not Yet',
] as const;

// Cable FO Options for Cut Over (Existing & New Jumper)
export const CABLE_FO_CO_OPTIONS = [
  'Cable 12 FO',
  'Cable 24 FO',
  'Cable 48 FO',
  'Cable 96 FO',
  'Cable 144 FO',
  'Cable 288 FO',
  'Cable 12 Core',
  'Cable FO 2 core Flat Type (Aerial)',
  'Cable FO 2 core Flat Type (Underground)',
  'Cable Fiber Optic 6 Core',
  'Cable FO 12Core Loose Tube, Single Mode',
  'Cable FO 24Core Loose Tube, Single Mode',
  'Cable FO 48Core Loose Tube, Single Mode',
] as const;

// Status Phase CO
export const PHASE_CO_STATUS_OPTIONS = [
  'Done',
  'In Progress',
  'Scheduled',
  'Pending',
] as const;

// Helper to format Cable FO Joint summary: "Cable FO Existing di-joint dengan Cable FO New Jumper"
export function formatCoCableJointSummary(items: CoCableJointItem[]): string {
  if (!items || items.length === 0) return '';
  return items
    .filter((it) => it.cableExisting || it.cableNewJumper)
    .map((it, idx) => `${idx + 1}. ${it.cableExisting || 'FO'} di-joint dgn ${it.cableNewJumper || 'FO'}`)
    .join('; ');
}

// Helper to format Phase CO summary: "Phase CO 1 (YYYY-MM-DD), Phase CO 2 (YYYY-MM-DD)"
export function formatCoPhaseSummary(items: CoPhaseItem[]): string {
  if (!items || items.length === 0) return '';
  return items
    .filter((it) => it.phaseName || it.tanggal)
    .map((it) => `${it.phaseName || 'Phase CO'}${it.tanggal ? ` di tgl ${it.tanggal}` : ''}`)
    .join(', ');
}

// Laporan Opname: Not Yet, Done
export const LAPORAN_OPNAME_OPTIONS = [
  'Not Yet',
  'Done',
] as const;

// Closing SAP: Not Yet, In Progress, Done
export const CLOSING_SAP_OPTIONS = [
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Install HH & Pole Progress specifications
export const HH_TYPE_OPTIONS = ['HH', 'HS', 'HG'] as const;
export const HH_SIZE_OPTIONS = ['40x60', '60x60', '80x80'] as const;

export const HH_TYPE_DSB_IKR_OPTIONS = HH_TYPE_OPTIONS;
export const HH_SIZE_DSB_IKR_OPTIONS = HH_SIZE_OPTIONS;

export function getHhTypeOptions(_category?: string): readonly string[] {
  return HH_TYPE_OPTIONS;
}

export function getHhSizeOptions(_category?: string): readonly string[] {
  return HH_SIZE_OPTIONS;
}

// Pole (Ea): Tiang 7, Tiang 8, Tiang 9
export const POLE_OPTIONS = ['Tiang 7', 'Tiang 8', 'Tiang 9'] as const;

// Galvanis (meter): 2", 4", 6"
export const GALVANIS_OPTIONS = ['2"', '4"', '6"'] as const;

// FTTH & IKR Specification Options:
export const PULLING_FO_CABLE_TYPE_OPTIONS = [
  'Cable 12 Core',
  'Cable 24 FO',
  'Cable 48 FO',
  'Cable 96 FO',
  'Cable 144',
  'Cable 288',
  'Cable FO 2 core Flat Type (Underground)',
  'Cable FO 2 core Flat Type (Aerial)',
  'Cable Fiber Optic 6 Core',
  'Cable FO 12Core Loose Tube, Single Mode',
  'Cable FO 24Core Loose Tube, Single Mode',
  'Cable FO 48Core Loose Tube, Single Mode',
] as const;

// FAT (pcs): FAT 8 Core, FAT 16 Core, FAT 24 Core, FAT 32 Core, FAT 48 Core
export const FAT_TYPE_OPTIONS = [
  'FAT 8 Core',
  'FAT 16 Core',
  'FAT 24 Core',
  'FAT 32 Core',
  'FAT 48 Core',
] as const;

// FDT (pcs): FDT 48 Core, FDT 96 Core, FDT 144 Core, FDT 288 Core, FDT 576 Core
export const FDT_TYPE_OPTIONS = [
  'FDT 48 Core',
  'FDT 96 Core',
  'FDT 144 Core',
  'FDT 288 Core',
  'FDT 576 Core',
] as const;

// Slak Hanger (pcs): Standard, Bulat, Silang, Double Hanger
export const SLACK_HANGER_OPTIONS = [
  'Standard',
  'Bulat',
  'Silang',
  'Double Hanger',
] as const;

// Splicing Cable / Spalcing: Joint Closure & Splicing types
export const SPLICING_TYPE_OPTIONS = [
  'Joint Closure 12 Core',
  'Joint Closure 24 Core',
  'Joint Closure 48 Core',
  'Joint Closure 96 Core',
  'Joint Closure 144 Core',
  'Splicing FAT/FDT',
  'OTDR & Splicing',
] as const;

// Status Splicing: Done, In Progress, Not Started
export const SPLICING_STATUS_OPTIONS = [
  'Done',
  'In Progress',
  'Not Started',
] as const;

/**
 * Helper to calculate Galian Sipil Progress percentage automatically
 */
export function calculateGalianPercentage(statusConstruction: string, galianInput?: string | number): string {
  if (statusConstruction === 'Completed') return '100%';
  if (statusConstruction === 'Project Cancel' || statusConstruction === 'Cancelled') return '0%';
  if (galianInput === undefined || galianInput === null || galianInput === '') {
    if (statusConstruction === 'Pulling Cable') return '80%';
    if (statusConstruction === 'In Progress') return '40%';
    return '0%';
  }
  const str = String(galianInput).trim();
  if (str.endsWith('%')) {
    const num = parseFloat(str);
    if (!isNaN(num)) return `${Math.min(100, Math.max(0, Math.round(num)))}%`;
  }
  const num = parseFloat(str);
  if (!isNaN(num)) {
    if (num <= 1 && num > 0) return `${Math.round(num * 100)}%`;
    return `${Math.min(100, Math.max(0, Math.round(num)))}%`;
  }
  if (str.toLowerCase() === 'done' || str.toLowerCase() === 'selesai') return '100%';
  return '0%';
}

/**
 * Helper to calculate Pulling Cable FO Progress percentage automatically
 */
export function calculatePullingFoPercentage(
  statusFo: string,
  doneMeters?: number | string,
  totalMeters?: number | string,
  statusConstruction?: string
): string {
  if (statusConstruction === 'Completed') return '100%';
  if (statusConstruction === 'Project Cancel' || statusConstruction === 'Cancelled') return '0%';

  const sFo = (statusFo || '').trim();
  if (sFo === 'Done') return '100%';
  if (sFo === 'Not Started' || sFo === 'Not Yet') return '0%';

  const total = Number(totalMeters || 0);
  const done = Number(doneMeters || 0);
  if (total > 0 && done > 0) {
    const pct = Math.min(100, Math.max(0, Math.round((done / total) * 100)));
    return `${pct}%`;
  }

  if (sFo === 'In Progress') return '50%';
  return '0%';
}

/**
 * Helper to calculate Pulling Cable Progress percentage automatically
 */
export function calculatePullingPercentage(
  statusFo: string,
  statusConstruction?: string
): string {
  if (statusConstruction === 'Completed') return '100%';
  if (statusConstruction === 'Project Cancel' || statusConstruction === 'Cancelled') return '0%';

  const sFo = (statusFo || '').trim();
  if (sFo === 'Done') return '100%';
  if (sFo === 'In Progress') return '50%';
  if (statusConstruction === 'Pulling Cable') return '30%';
  return '0%';
}

// Project Categories: GOV APJATEL, GOV IPPJU, GOV SJUT, GOV PUPR KOTA, GOV PUPR KAB, GOV SDA DBM
export const PROJECT_CATEGORY_OPTIONS = [
  'GOV APJATEL',
  'GOV IPPJU',
  'GOV SJUT',
  'GOV PUPR KOTA',
  'GOV PUPR KAB',
  'GOV SDA DBM',
] as const;
export type ProjectCategory = typeof PROJECT_CATEGORY_OPTIONS[number];

// Area / Kota Options
export const AREA_KOTA_OPTIONS = [
  'Jakarta Pusat',
  'Jakarta Timur',
  'Jakarta Barat',
  'Jakarta Utara',
  'Jakarta Selatan',
  'Kota Bekasi',
  'Kab. Bekasi',
  'Kota Bogor',
  'Kab. Bogor',
  'Kota Tangerang',
  'Kab. Tangerang',
  'Cilegon',
  'Serang',
  'Banten',
] as const;

// PIC Govrel Options (Sorted Alphabetically based on master list)
export const PIC_GOVREL_OPTIONS = [
  'Agus Salim',
  'Asmari',
  'Budi',
  'Dwi',
  'Fredy',
  'Irvan',
  'Lintang',
  'Reza',
  'Reza Mahendra',
  'Riski',
  'Rizki',
  'Rizky',
  'Silmi',
  'Suhandi',
  'Topan',
  'Wendy',
  'Wili',
] as const;

// Waspang DSB Options (Sorted Alphabetically)
export const WASPANG_DSB_OPTIONS = [
  'Alfy',
  'Amir',
  'Dodo',
  'Hasan',
  'Krisna',
  'Lorenz',
  'Mardanih',
  'Suroso',
  'Wahyu',
] as const;

// Nama Vendor Options (42 Opsi Terurut Abjad & Kapital)
export const VENDOR_OPTIONS = [
  'BELUM ADA VENDOR',
  'PT.ANT',
  'PT.ARKON',
  'PT.BLAO',
  'PT.CAESAR',
  'PT.CAI',
  'PT.CAKRA',
  'PT.CAPER',
  'PT.CMT',
  'PT.CORE',
  'PT.CPS',
  'PT.DAVON',
  'PT.FBI',
  'PT.FIROPTIK',
  'PT.FISS',
  'PT.FITEL',
  'PT.GEMATI',
  'PT.INFRA LINTAS NUSANTARA',
  'PT.INTAN',
  'PT.JAN',
  'PT.JWS',
  'PT.LISMA',
  'PT.MANDAU',
  'PT.MAS',
  'PT.MENTARI',
  'PT.MITRA PATRIOT (PERSERODA)',
  'PT.MOTOTABIAN',
  'PT.MVT',
  'PT.NETCO',
  'PT.OLT',
  'PT.OPTICOM',
  'PT.PHPE',
  'PT.PRAGATA',
  'PT.RDM',
  'PT.REKATAMA',
  'PT.RIMH',
  'PT.RPA',
  'PT.SABA',
  'PT.SBKP',
  'PT.SCKP',
  'PT.SENTRATEL',
  'PT.TRP',
] as const;
export const NAMA_VENDOR_OPTIONS = VENDOR_OPTIONS;

