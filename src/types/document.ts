/**
 * Types and Configurations for "Upload Document" Tab
 */

export interface UploadedFileMeta {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  dataUrl?: string; // base64 representation for download/preview
  notes?: string;   // catatan tambahan / nomor surat / keterangan
  customName?: string; // nama kustom / alias dokumen
  updatedAt?: string;  // waktu pembaruan terakhir
}

export type DocumentTypeKey =
  | 'mr'
  | 'suratDinas'
  | 'rekomtek'
  | 'suratPenunjukanVendor'
  | 'apdRelokasi'
  | 'apdLinknet'
  | 'kmzRelokasi'
  | 'baSurveyInternal'
  | 'formBoq'
  | 'timelineRelokasi'
  | 'timelineInternal'
  // FTTH & IKR specific keys:
  | 'spk'
  | 'baSurvey'
  | 'timeline';

export type DocumentFormatType = 'pdf' | 'kmz' | 'excel' | 'image' | 'file';

export interface DocumentSlotDefinition {
  key: DocumentTypeKey;
  num: number;
  label: string;
  accept: string;
  fileHint: string;
  category: 'perizinan' | 'teknis' | 'survey' | 'komersial';
  formatBadge: string;
  iconType: DocumentFormatType;
}

// 1. Standar Dokumen Pemerintah (GOV IPPJU, GOV APJATEL, GOV SJUT) - 11 Dokumen
export const GOV_DOCUMENT_SLOTS: DocumentSlotDefinition[] = [
  {
    key: 'mr',
    num: 1,
    label: 'MR',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Gambar / Excel',
    category: 'komersial',
    formatBadge: 'PDF / Scan',
    iconType: 'pdf',
  },
  {
    key: 'suratDinas',
    num: 2,
    label: 'Surat Dinas',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Gambar Scan',
    category: 'perizinan',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'rekomtek',
    num: 3,
    label: 'Rekomtek',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Gambar Scan',
    category: 'perizinan',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'suratPenunjukanVendor',
    num: 4,
    label: 'Surat Penunjukan Vendor Apjatel',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Gambar Scan',
    category: 'perizinan',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'apdRelokasi',
    num: 5,
    label: 'APD Relokasi',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Gambar / Excel',
    category: 'teknis',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'apdLinknet',
    num: 6,
    label: 'APD Internal',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Gambar / Excel',
    category: 'teknis',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'kmzRelokasi',
    num: 7,
    label: 'KMZ Relokasi',
    accept: '.kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml,application/pdf,.pdf',
    fileHint: 'KMZ / KML / PDF GIS',
    category: 'teknis',
    formatBadge: 'KMZ / KML',
    iconType: 'kmz',
  },
  {
    key: 'baSurveyInternal',
    num: 8,
    label: 'BA Survey Internal',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Foto Berita Acara',
    category: 'survey',
    formatBadge: 'PDF / Foto',
    iconType: 'pdf',
  },
  {
    key: 'formBoq',
    num: 9,
    label: 'Form BOQ Material & Labour',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'komersial',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
  {
    key: 'timelineRelokasi',
    num: 10,
    label: 'Timeline Relokasi',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'teknis',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
  {
    key: 'timelineInternal',
    num: 11,
    label: 'Timeline Internal',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'teknis',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
];

// 2. Standar Dokumen FTTH & IKR - 6 Dokumen:
// Surat Kesepakatan Kerja ( SPK ), APD FTTH / APD IKR, KMZ FTTH / KMZ IKR, BA Survey, FORM BOQ MATERIAL DAN LABOUR, TIMELINE
export const FTTH_IKR_DOCUMENT_SLOTS: DocumentSlotDefinition[] = [
  {
    key: 'spk',
    num: 1,
    label: 'Surat Kesepakatan Kerja ( SPK )',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Scan / Foto SPK',
    category: 'perizinan',
    formatBadge: 'PDF / Scan',
    iconType: 'pdf',
  },
  {
    key: 'apdRelokasi',
    num: 2,
    label: 'APD FTTH / APD IKR',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
    fileHint: 'PDF / Gambar / Excel APD',
    category: 'teknis',
    formatBadge: 'PDF / Gambar',
    iconType: 'pdf',
  },
  {
    key: 'kmzRelokasi',
    num: 3,
    label: 'KMZ FTTH / KMZ IKR',
    accept: '.kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml,application/pdf,.pdf',
    fileHint: 'KMZ / KML / GIS',
    category: 'teknis',
    formatBadge: 'KMZ / KML',
    iconType: 'kmz',
  },
  {
    key: 'baSurveyInternal',
    num: 4,
    label: 'BA Survey',
    accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp',
    fileHint: 'PDF / Foto Berita Acara',
    category: 'survey',
    formatBadge: 'PDF / Foto',
    iconType: 'pdf',
  },
  {
    key: 'formBoq',
    num: 5,
    label: 'FORM BOQ MATERIAL DAN LABOUR',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'komersial',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
  {
    key: 'timelineRelokasi',
    num: 6,
    label: 'TIMELINE',
    accept: '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf',
    fileHint: 'File Excel (.xlsx/.xls) atau PDF',
    category: 'teknis',
    formatBadge: 'Excel / PDF',
    iconType: 'excel',
  },
];

/**
 * Returns the relevant document slots dynamically according to the project category.
 * If FTTH: returns 6 slots with APD FTTH & KMZ FTTH.
 * If IKR: returns 6 slots with APD IKR & KMZ IKR.
 * If FTTH/IKR generic: returns 6 slots with APD FTTH/IKR & KMZ FTTH/IKR.
 * Otherwise (GOV): returns 11 slots.
 */
export function getDocumentSlots(_category?: string): DocumentSlotDefinition[] {
  return GOV_DOCUMENT_SLOTS;
}

export const DOCUMENT_SLOTS = GOV_DOCUMENT_SLOTS;

export interface ProjectDocumentRecord {
  projectId: string; // Primary key (project id or pmoId)
  pmoId: string;
  projectDescription: string;
  sapProjectId: string;
  documents: Partial<Record<DocumentTypeKey, UploadedFileMeta>>;
  driveFolderUrl?: string; // Tautan Google Drive folder proyek
  updatedAt: string;
}

export interface EmailSharePayload {
  toEmail: string;
  ccEmail?: string;
  subject: string;
  message?: string;
  includeChecklist: boolean;
  includeDriveLink: boolean;
}

export interface DocumentProjectSlotDef {
  key: string;
  num: number;
  label: string;
  fileHint: string;
  accept: string;
}

// Slot List for 1. Pengajuan Material
export const PENGAJUAN_MATERIAL_SLOTS: DocumentProjectSlotDef[] = [
  { key: 'suratDinas', num: 1, label: 'Surat Dinas', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratRekomtek', num: 2, label: 'Surat Rekomtek', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratPenunjukanVendor', num: 3, label: 'Surat Penunjukan Vendor APJATEL', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratBaSurveyBersama', num: 4, label: 'Surat BA Survey Bersama', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratBaInternal', num: 5, label: 'Surat BA Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'apdRelokasi', num: 6, label: 'APD Relokasi', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'apdInternal', num: 7, label: 'APD Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'kmz', num: 8, label: 'KMZ', fileHint: 'KMZ / KML / Semua Format', accept: '*' },
  { key: 'formCeMaterial', num: 9, label: 'FORM CE Material', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'timelineRelokasi', num: 10, label: 'Timeline Relokasi', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'timelineInternal', num: 11, label: 'Timeline Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
];

// Slot List for 2. Pengajuan BOQ Labour
export const PENGAJUAN_BOQ_LABOUR_SLOTS: DocumentProjectSlotDef[] = [
  { key: 'suratDinas', num: 1, label: 'Surat Dinas', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratRekomtek', num: 2, label: 'Surat Rekomtek', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratPenunjukanVendor', num: 3, label: 'Surat Penunjukan Vendor APJATEL', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratBaSurveyBersama', num: 4, label: 'Surat BA Survey Bersama', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratBaInternal', num: 5, label: 'Surat BA Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'apdRelokasi', num: 6, label: 'APD Relokasi', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'apdInternal', num: 7, label: 'APD Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'kmz', num: 8, label: 'KMZ', fileHint: 'KMZ / KML / Semua Format', accept: '*' },
  { key: 'formBoqLabour', num: 9, label: 'FORM BOQ Labour', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'timelineRelokasi', num: 10, label: 'Timeline Relokasi', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'timelineInternal', num: 11, label: 'Timeline Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
];

// Slot List for 3. Pengajuan FORM CE Material & BOQ Labour
export const PENGAJUAN_CE_BOQ_SLOTS: DocumentProjectSlotDef[] = [
  { key: 'suratDinas', num: 1, label: 'Surat Dinas', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratRekomtek', num: 2, label: 'Surat Rekomtek', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratPenunjukanVendor', num: 3, label: 'Surat Penunjukan Vendor APJATEL', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratBaSurveyBersama', num: 4, label: 'Surat BA Survey Bersama', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'suratBaInternal', num: 5, label: 'Surat BA Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'apdRelokasi', num: 6, label: 'APD Relokasi', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'apdInternal', num: 7, label: 'APD Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'kmz', num: 8, label: 'KMZ', fileHint: 'KMZ / KML / Semua Format', accept: '*' },
  { key: 'formCeBoqLabour', num: 9, label: 'FORM CE Material & BOQ Labour', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'timelineRelokasi', num: 10, label: 'Timeline Relokasi', fileHint: 'Semua Format File (*.*)', accept: '*' },
  { key: 'timelineInternal', num: 11, label: 'Timeline Internal', fileHint: 'Semua Format File (*.*)', accept: '*' },
];

export interface DocumentProjectSubmission {
  status?: string;
  submissionDate?: string;
  remarks?: string;
  documents: Record<string, UploadedFileMeta | undefined>;
}

export interface DocumentProjectData {
  pengajuanMaterial?: DocumentProjectSubmission;
  pengajuanBoqLabour?: DocumentProjectSubmission;
  pengajuanCeAndBoqLabour?: DocumentProjectSubmission;
}

// Slot List for Closing Project
export const CLOSING_PROJECT_SLOTS: DocumentProjectSlotDef[] = [
  { key: 'baOpnameMaterial', num: 1, label: 'BA Opname Material', fileHint: 'Upload document semua jenis file (*.*)', accept: '*' },
  { key: 'baOpnameLabour', num: 2, label: 'BA Opname Labour', fileHint: 'Upload document semua jenis file (*.*)', accept: '*' },
  { key: 'abdRelokasi', num: 3, label: 'ABD Relokasi', fileHint: 'Upload document semua jenis file (*.*)', accept: '*' },
  { key: 'abdInternal', num: 4, label: 'ABD Internal', fileHint: 'Upload document semua jenis file (*.*)', accept: '*' },
  { key: 'fotoDokumentasi', num: 5, label: 'Foto Dokumentasi', fileHint: 'Upload document semua jenis file (Maksimal 4 MB)', accept: '*' },
];

export interface ClosingProjectData {
  projectDate?: string; // Praject Date
  poNumber?: string;    // No. PO
  statusPengajuan?: string; // Not Yet, Submit, Approval BALAP, Approval BAST, Teco Done, Invoice
  documents: Record<string, UploadedFileMeta | undefined>;
  remarks?: string;
  updatedAt?: string;
}

// ============================================================================
// EMAIL DISPATCH SYSTEM FOR DOCUMENT PROJECT
// ============================================================================
export type DocumentEmailDispatchType =
  | 'pengajuan-material'
  | 'pengajuan-boq'
  | 'pengajuan-material-and-boq'
  | 'closing-project';

export interface DocumentEmailDispatchRecord {
  id: string;
  projectId: string;
  pmoId: string;
  dispatchType: DocumentEmailDispatchType;
  dispatchTypeName: string; // e.g. "Pengajuan Material" | "Pengajuan BOQ Labour" | "Pengajuan Material & BOQ Labour" | "Closing Project"
  sentAt: string; // ISO string
  sentBy?: string;
  to: string; // primary recipient(s)
  cc: string[]; // array of CC email addresses
  subject: string;
  body: string;
  attachedDocumentKeys: string[];
  attachedDocumentNames: string[];
  status: 'sent' | 'client_opened' | 'failed';
  transportMethod: 'smtp_api' | 'client_mailto' | 'gmail_web';
  deliveryNote?: string;
}

export interface EmailDispatchContactSuggestion {
  name: string;
  email: string;
  role: string;
}

export const DEFAULT_EMAIL_CONTACT_SUGGESTIONS: EmailDispatchContactSuggestion[] = [
  { name: 'PIC Govrel (Gov Relation)', email: 'pic.govrel@linknet.co.id', role: 'PIC Govrel' },
  { name: 'Waspang Internal DSB', email: 'waspang.dsb@linknet.co.id', role: 'Pengawas DSB' },
  { name: 'Tim Finance & Invoicing', email: 'finance.closing@linknet.co.id', role: 'Finance / Invoice' },
  { name: 'Tim BAST & BALAP Approval', email: 'bast.approval@linknet.co.id', role: 'Approval BAST' },
  { name: 'Tim Procurement & Material', email: 'procurement.relokasi@linknet.co.id', role: 'Procurement' },
  { name: 'Tim Engineering & Planning', email: 'planning.fiber@linknet.co.id', role: 'Engineering' },
  { name: 'Mitra Vendor Pelaksana', email: 'vendor.operasional@mitra.com', role: 'Vendor Mitra' },
  { name: 'PMO Master Control', email: 'pmo.relokasi@linknet.co.id', role: 'PMO Lead' },
];


