/**
 * Definition of Project Data and Tab Column Configurations
 */

export interface HhItem {
  id: string;
  type: string; // HH, HB, MH
  size: string; // 80x80, 90x90, 100x100, 110x110, 120x120
  qty: number | string;
}

export interface PoleItem {
  id: string;
  type: string; // Tiang 7, Tiang 8, Tiang 9
  qty: number | string;
}

export interface GalvanisItem {
  id: string;
  size: string; // 2", 4", 6"
  length: number | string; // Meter
}

export interface PullingFoItem {
  id: string;
  type: string; // Cable FO 2 core Flat Type (Underground), Cable FO 2 core Flat Type (Aerial), Cable Fiber Optic 6 Core, Cable FO 12Core Loose Tube, Single Mode, Cable FO 24Core Loose Tube, Single Mode, Cable FO 48Core Loose Tube, Single Mode
  length: number | string; // Meter
  status?: string; // Done, In Progress, Not Started
}

export interface FatItem {
  id: string;
  type: string; // FAT 8 Core, FAT 16 Core, FAT 24 Core, FAT 32 Core, FAT 48 Core
  qty: number | string; // pcs
}

export interface FdtItem {
  id: string;
  type: string; // FDT 48 Core, FDT 96 Core, FDT 144 Core, FDT 288 Core
  qty: number | string; // pcs
}

export interface SlackHangerItem {
  id: string;
  type: string; // Standard, Bulat, Silang, Double Hanger
  qty: number | string; // pcs
}

export interface SplicingItem {
  id: string;
  type: string; // Joint Closure 12C, Joint Closure 24C, Joint Closure 48C, Joint Closure 96C, Splicing Core
  qty: number | string; // Core / Joint count
  status?: string; // Done, In Progress, Not Started
}

export interface ProjectData {
  id: string; // Internal unique identifier
  no: number;
  
  // Tab 1: Project List Core Info
  pmoId: string; // "PMO - ID", e.g. PMO-GOV-001
  projectCategory: string; // "Project Category", e.g. GOV IPPJU, GOV Apjatel
  projectId: string; // "Project ID", e.g. GOV0000747
  projectDescription: string; // "Project Description", e.g. [Z1-GOV] IPPJU Ampera Raya
  zona: string; // "Zona", e.g. Jabo 1
  areaKota: string; // "Area/Kota", e.g. Central, West, East, South, North
  projectStatus: string; // "Project Status", e.g. Masih Review Dinas, In Progress, Cancelled, Done
  quarter: string; // "Quarter", e.g. Q1-26, Q2-26, Q3-26, Q4-26, -
  picSectionHead: string; // "PIC / Section Head", e.g. Mega
  priority?: string; // "Status Prioritas", e.g. Critical, High, Medium, Low, Normal

  // Tab 2: Construction & Plan (from Image 2)
  namaVendor: string; // "Nama Vendor", e.g. PT.NATAMA, PT.RPA, PT.ARKON, Belum Ada Vendor
  dateSuratPerintahRelokasi: string; // "Date Surat Perintah Relokasi", e.g. 2026-07-18
  bulan: string; // "Bulan", e.g. November, Januari
  tahun: string; // "Tahun", e.g. 2023, 2024
  panjangRelokasi: number | string; // "Panjang Relokasi FO", e.g. 10000, 8500, 2600
  panjangRelokasiCoax?: number | string; // "Panjang Relokasi COAX", e.g. 3500, 1200
  apdRelokasi: string; // "APD Relokasi", e.g. Belum, Sudah
  kmzRelokasi: string; // "KMZ Relokasi", e.g. Belum, Sudah
  statusAudit: string; // "Status Audit", e.g. Belum, Belum di Audit, Sudah Audit
  apdLinknet: string; // "APD Internal", e.g. Not Yet, Done
  statusSurvey: string; // "Status Survey", e.g. Belum, In Progress, Selesai
  baSurvey: string; // "BA Survey", e.g. Belum ada BA, Sudah BA
  ceMaterial: string; // "CE Material"
  sphBoq: string; // "SPH/BOQ"
  ceLn: string; // "CE LN"
  apdLn: string; // "APD LN", e.g. 0
  timelineRelokasi: string; // "Timeline Relokasi"
  tanggalStartProject: string; // "Tanggal Start Project"
  tanggalEndProject: string; // "Tanggal End Project"
  estimasiPemutusan: string; // "Estimasi Pemutusan"
  tanggalPemutusan: string; // "Tanggal Pemutusan"
  remarksPlan: string; // "Remarks" in Tab 2

  // Tab 3: Status Project (from Image 3)
  statusPengajuanProject: string; // "Status Pengajuan Project", e.g. NOSA, Project Cancel, Submitted
  projectCreateDate?: string; // "Project Create Date", e.g. 2026-03-15
  mrNumber?: string; // "MR Number", e.g. 99434
  tanggalPengajuanMr?: string; // "Tanggal Pengajuan MR" (Legacy)
  tanggalPengajuanPo?: string; // "Tanggal Pengajuan PO" (Legacy)
  statusPengajuanMr?: string; // "Status Pengajuan MR" (Legacy)
  statusPengajuanPo?: string; // "Status Pengajuan PO" (Legacy)
  poNumber?: string; // "PO Number" (Legacy)
  planPengambilanMaterial: string; // "Plan Pengambilan Material"
  statusMaterialLocation: string; // "Status Material Location"
  pengajuanProjectRemarks: string; // "Pengajuan Project Remarks"
  statusMaterialReturn: string; // "Status Material Return"
  tanggalPlanReturn: string; // "Tanggal Plan Return"
  tanggalReturn: string; // "Tanggal Return"
  statusDokumenClosing: string; // "Status Dokumen Closing"
  closingRemarks: string; // "Closing Remarks"
  preProjectRemarks: string; // "Pre-Project Remarks"
  remarksProject: string; // "Remarks" in Tab 3

  // Tab 4: Status Construction (from Image 4)
  statusConstruction: string; // "Status Construction", e.g. Project Not Started, Pulling Cable, Project Cancel, Completed
  statusLabor: string; // "Status Labor", e.g. N/A, Assigned
  statusMaterial: string; // "Status Material", e.g. N/A, Released, No Need MR
  statusPullingCableFo: string; // "Status Pulling Cable FO", e.g. In Progress, Done, Not Started
  pullingFoPanjangSelesai?: number | string; // Meter selesai FO
  pullingFoPanjangTotal?: number | string; // Target meter FO
  pullingCableFoProgress?: string; // "Pulling Cable FO Progress (Otomatis)", e.g. 100%, 50%, 0%
  statusPullingCableCoax: string; // "Status Pulling Cable Coax", e.g. Done, In Progress, N/A
  pullingCoaxPanjangSelesai?: number | string; // Meter selesai COAX
  pullingCoaxPanjangTotal?: number | string; // Target meter COAX
  pullingCableCoaxProgress?: string; // "Pulling Cable COAX Progress (Otomatis)", e.g. 100%, 50%, 0%
  statusCo: string; // "Status CO", e.g. In Progress, Done, N/A
  statusCoCoax: string; // "Status CO Coax"
  laporanOpname: string; // "Laporan Opname", e.g. Not Yet, Submitted, Approved
  closingSap: string; // "Closing SAP", e.g. Yes, No
  kebutuhanMaterialPoSap: string; // "Kebutuhan Material PO SAP"
  galianSipilProgress: string; // "Galian Sipil Progress", e.g. 45%, Done, Not Yet
  galianAksesProgress: string; // "Galian Akses Progress"
  galianCrossingProgress: string; // "Galian Crossing Progress"
  installHhProgress: string; // "Install HH Progress"
  installHhType?: string; // HH, HB, MH
  installHhSize?: string; // 80x80, 90x90, 100x100, 110x110, 120x120
  installHhQty?: number | string; // Unit
  installHhItems?: HhItem[]; // Multiple HH, HB, MH items
  installPoleType?: string; // Tiang 7, Tiang 8, Tiang 9
  installPoleQty?: number | string; // Ea
  installPoleItems?: PoleItem[]; // Multiple Pole items
  installGalvanisSize?: string; // 2", 4", 6"
  installGalvanisLength?: number | string; // Meter
  installGalvanisItems?: GalvanisItem[]; // Multiple Galvanis items
  installPoleProgress: string; // "Install Pole Progress"
  
  // FTTH & IKR Specifications (Sheet 4: Status Construction)
  pullingFoMeter?: number | string; // Pulling Cable FO (meter)
  pullingFoType?: string; // Pulling Cable FO Type
  pullingFoItems?: PullingFoItem[]; // Multiple Pulling Cable FO items
  installFatQty?: number | string; // Instal FAT (pcs)
  installFatType?: string; // FAT Type (e.g. FAT 8 Core, FAT 16 Core)
  installFatItems?: FatItem[]; // Multiple FAT items
  installFdtQty?: number | string; // Install FDT (pcs)
  installFdtType?: string; // FDT Type (e.g. FDT 48 Core, FDT 96 Core)
  installFdtItems?: FdtItem[]; // Multiple FDT items
  splicingCableQty?: number | string; // Splicing Cable (core / joints)
  splicingCableStatus?: string; // Status Splicing Cable (Done, In Progress, Not Started)
  splicingCableItems?: SplicingItem[]; // Multiple Splicing items
  installSlackHangerQty?: number | string; // Instal Slak hanger (pcs)
  installSlackHangerType?: string; // Slak Hanger type (e.g. Bulat, Silang, Standard)
  installSlackHangerItems?: SlackHangerItem[]; // Multiple Slack Hanger items
  ftthIkrSpecProgress?: string; // "Ringkasan Spesifikasi FTTH / IKR"
  
  galianPanjangSelesai?: number | string; // Meter galian selesai
  galianPanjangTotal?: number | string; // Total meter target galian
  pullingPanjangSelesai?: number | string; // Meter pulling selesai
  pullingPanjangTotal?: number | string; // Total meter target pulling
  pullingCableProgress: string; // "Pulling Cable Progress"
  projectSapId: string; // "Project SAP ID", e.g. GOV0000747
  remarksConstruction: string; // "Remarks" in Tab 4
  pipelineStage?: string; // Pipeline Tracking Stage

  // System metadata
  updatedAt: string;
}

export type TabKey = 
  | 'project-list' 
  | 'construction-plan' 
  | 'status-project' 
  | 'status-construction' 
  | 'project-tracking-pipeline'
  | 'upload-document'
  | 'pie-chart-analytics';

export interface ColumnDefinition {
  key: keyof ProjectData;
  label: string;
  width?: string;
  isNumeric?: boolean;
  align?: 'left' | 'center' | 'right';
  badgeType?: 'status' | 'category' | 'vendor' | 'default';
}

export type PicSectionHead = string;

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
export type PriorityLevel = typeof PRIORITY_OPTIONS[number];

export interface BackupSnapshot {
  timestamp: string;
  count: number;
  data: ProjectData[];
  reason: string;
}
