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

// APD for FTTH & IKR: APD FTTH, APD IKR, Belum ada, Ada
export const APD_FTTH_IKR_OPTIONS = [
  'APD FTTH',
  'APD IKR',
  'Belum ada',
] as const;

// KMZ Relokasi (GOV): Ada, Belum ada
export const KMZ_RELOKASI_OPTIONS = [
  'Ada',
  'Belum ada',
] as const;

// KMZ for FTTH & IKR: KMZ FTTH, KMZ IKR, Belum ada, Ada
export const KMZ_FTTH_IKR_OPTIONS = [
  'KMZ FTTH',
  'KMZ IKR',
  'Belum ada',
] as const;

export function getApdOptions(category?: string): readonly string[] {
  const cat = (category || '').toUpperCase().trim();
  if (cat === 'FTTH' || cat === 'IKR') {
    return APD_FTTH_IKR_OPTIONS;
  }
  return APD_RELOKASI_OPTIONS;
}

export function getKmzOptions(category?: string): readonly string[] {
  const cat = (category || '').toUpperCase().trim();
  if (cat === 'FTTH' || cat === 'IKR') {
    return KMZ_FTTH_IKR_OPTIONS;
  }
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

// Status Project Master Options (including Review Dinas & Masih Review Dinas)
export const PROJECT_STATUS_OPTIONS = [
  'Project Not Started',
  'In Progress',
  'Review Dinas',
  'Masih Review Dinas',
  'Cancelled',
  'Completed',
] as const;

// Specific Project Status Options for FTTH & IKR
export const FTTH_IKR_PROJECT_STATUS_OPTIONS = [
  'Project Not Started',
  'In Progress',
  'Canceled',
  'Completed',
] as const;

// Helper to get conditional project status options based on category
export function getProjectStatusOptions(category?: string): readonly string[] {
  const cat = (category || '').toUpperCase().trim();
  if (cat === 'FTTH' || cat === 'IKR') {
    return FTTH_IKR_PROJECT_STATUS_OPTIONS;
  }
  return PROJECT_STATUS_OPTIONS;
}

// Status Pengajuan PO / MR: Not Yet, Submit, Approved, Release, Released, N/A
export const STATUS_PENGAJUAN_PO_OPTIONS = [
  'Not Yet',
  'Submit',
  'Approved',
  'Release',
  'Released',
  'N/A',
] as const;

// Status Pengajuan Project: Not Yet, Submit, Release, Project Cancel
export const STATUS_PENGAJUAN_PROJECT_OPTIONS = [
  'Not Yet',
  'Submit',
  'Release',
  'Project Cancel',
] as const;

// Plan Pengambilan Material: Not Yet, Warehouse User, Warehouse Inhouse
export const PLAN_PENGAMBILAN_MATERIAL_OPTIONS = [
  'Not Yet',
  'Warehouse User',
  'Warehouse Inhouse',
] as const;

// Status Material Location: Not Yet, Warehouse User, Warehouse Inhouse, Warehouse Vendor
export const STATUS_MATERIAL_LOCATION_OPTIONS = [
  'Not Yet',
  'Warehouse User',
  'Warehouse Inhouse',
  'Warehouse Vendor',
] as const;

// Status Dokumen Closing:
// Not Yet, Completed waspang mobility, Submit dokumen SAP, Approval completed SAP, Approval BALAP, Approval BAST, Teco done
export const STATUS_DOKUMEN_CLOSING_OPTIONS = [
  'Not Yet',
  'Completed waspang mobility',
  'Submit dokumen SAP',
  'Approval completed SAP',
  'Approval BALAP',
  'Approval BAST',
  'Teco done',
] as const;

// Status Audit: Not Yet, In Progress, Done
export const STATUS_AUDIT_OPTIONS = [
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Status Material: Not Yet, No need MR, Release
export const STATUS_MATERIAL_OPTIONS = [
  'Not Yet',
  'No need MR',
  'Release',
] as const;

// Status Pulling Cable FO: Not Started, Not Yet, In Progress, Done
export const STATUS_PULLING_CABLE_FO_OPTIONS = [
  'Not Started',
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Status Pulling Cable COAX: No COAX, N/A, Not Yet, In Progress, Done
export const STATUS_PULLING_CABLE_COAX_OPTIONS = [
  'No COAX',
  'N/A',
  'Not Yet',
  'In Progress',
  'Done',
] as const;

// Status CO: Not Yet, In Progress, Done
export const STATUS_CO_OPTIONS = [
  'Not Yet',
  'In Progress',
  'Done',
] as const;

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
// HH, HB, MH (Unit): 80x80, 90x90, 100x100, 110x110, 120x120
export const HH_TYPE_OPTIONS = ['HH', 'HB', 'MH'] as const;
export const HH_SIZE_OPTIONS = ['80x80', '90x90', '100x100', '110x110', '120x120'] as const;

// Pole (Ea): Tiang 7, Tiang 8, Tiang 9
export const POLE_OPTIONS = ['Tiang 7', 'Tiang 8', 'Tiang 9'] as const;

// Galvanis (meter): 2", 4", 6"
export const GALVANIS_OPTIONS = ['2"', '4"', '6"'] as const;

// FTTH & IKR Specification Options:
// Pulling Cable FO Options:
export const PULLING_FO_CABLE_TYPE_OPTIONS = [
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
 * Helper to calculate Galian Sipil Progress percentage automatically:
 * Based on inputs: target (meters or segments), progress done, or status stages.
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
 * Helper to calculate Pulling Cable FO Progress percentage automatically:
 * Based on statusPullingCableFo, meters, or statusConstruction
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
 * Helper to calculate Pulling Cable COAX Progress percentage automatically:
 * Based on statusPullingCableCoax, meters, or statusConstruction
 */
export function calculatePullingCoaxPercentage(
  statusCoax: string,
  doneMeters?: number | string,
  totalMeters?: number | string,
  statusConstruction?: string
): string {
  // Option 'No COAX' or 'N/A' is explicitly set to 0% (not applicable)
  const sCoax = (statusCoax || '').trim().toLowerCase();
  if (sCoax === 'no coax' || sCoax === 'n/a' || !sCoax) return '0%';

  if (statusConstruction === 'Completed') return '100%';
  if (statusConstruction === 'Project Cancel' || statusConstruction === 'Cancelled') return '0%';

  if (sCoax === 'done') return '100%';
  if (sCoax === 'not started' || sCoax === 'not yet') return '0%';

  const total = Number(totalMeters || 0);
  const done = Number(doneMeters || 0);
  if (total > 0 && done > 0) {
    const pct = Math.min(100, Math.max(0, Math.round((done / total) * 100)));
    return `${pct}%`;
  }

  if (sCoax === 'in progress') return '50%';
  return '0%';
}

/**
 * Helper to calculate Pulling Cable Progress percentage automatically:
 * Computed from statusPullingCableFo, statusPullingCableCoax, and statusConstruction
 */
export function calculatePullingPercentage(
  statusFo: string,
  statusCoax: string,
  statusConstruction?: string
): string {
  if (statusConstruction === 'Completed') return '100%';
  if (statusConstruction === 'Project Cancel' || statusConstruction === 'Cancelled') return '0%';

  const sFo = (statusFo || '').trim();
  const sCoax = (statusCoax || '').trim().toLowerCase();
  const isCoaxNotApplicable = sCoax === 'no coax' || sCoax === 'n/a' || !sCoax;

  // When Coax is N/A or No COAX, FO determines 100% of pulling progress
  if (isCoaxNotApplicable) {
    if (sFo === 'Done') return '100%';
    if (sFo === 'In Progress') return '50%';
    if (statusConstruction === 'Pulling Cable') return '30%';
    return '0%';
  }

  // When both FO and COAX are active
  if (sFo === 'Done' && sCoax === 'done') {
    return '100%';
  }

  let foWeight = 0;
  if (sFo === 'Done') foWeight = 60;
  else if (sFo === 'In Progress') foWeight = 30;

  let coaxWeight = 0;
  if (sCoax === 'done') coaxWeight = 40;
  else if (sCoax === 'in progress') coaxWeight = 20;

  if (sFo === 'Done' && sCoax !== 'done') {
    return `${Math.min(100, 60 + coaxWeight)}%`;
  }

  if ((sFo === 'Not Yet' || sFo === 'Not Started') && (sCoax === 'not yet' || sCoax === 'not started')) {
    if (statusConstruction === 'Pulling Cable') return '25%';
    return '0%';
  }

  const total = Math.min(100, foWeight + coaxWeight);
  return `${total}%`;
}

// Project Categories: GOV IPPJU, GOV APJATEL, GOV SJUT, FTTH, IKR
export const PROJECT_CATEGORY_OPTIONS = [
  'GOV IPPJU',
  'GOV APJATEL',
  'GOV SJUT',
  'FTTH',
  'IKR',
] as const;
export type ProjectCategory = typeof PROJECT_CATEGORY_OPTIONS[number];

