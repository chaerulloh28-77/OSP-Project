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
export function getDocumentSlots(category?: string): DocumentSlotDefinition[] {
  if (category === 'FTTH') {
    return [
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
        label: 'APD FTTH',
        accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
        fileHint: 'PDF / Gambar / Excel APD FTTH',
        category: 'teknis',
        formatBadge: 'PDF / Gambar',
        iconType: 'pdf',
      },
      {
        key: 'kmzRelokasi',
        num: 3,
        label: 'KMZ FTTH',
        accept: '.kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml,application/pdf,.pdf',
        fileHint: 'KMZ / KML / GIS FTTH',
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
  }

  if (category === 'IKR') {
    return [
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
        label: 'APD IKR',
        accept: 'application/pdf,.pdf,image/*,.jpg,.jpeg,.png,.webp,.xlsx,.xls',
        fileHint: 'PDF / Gambar / Excel APD IKR',
        category: 'teknis',
        formatBadge: 'PDF / Gambar',
        iconType: 'pdf',
      },
      {
        key: 'kmzRelokasi',
        num: 3,
        label: 'KMZ IKR',
        accept: '.kmz,.kml,application/vnd.google-earth.kmz,application/vnd.google-earth.kml+xml,application/pdf,.pdf',
        fileHint: 'KMZ / KML / GIS IKR',
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
  }

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

export interface GoogleDriveSyncState {
  isSyncing: boolean;
  progress: number;
  stageMessage: string;
  driveFolderUrl?: string;
  error?: string;
}
