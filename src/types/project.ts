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

// Cut Over (Status CO) Specification Types
export interface CoCableJointItem {
  id: string;
  cableExisting: string; // Cable FO Existing
  cableNewJumper: string; // Cable FO New Jumper
  notes?: string;
}

export interface CoPhaseItem {
  id: string;
  phaseName: string; // Phase CO 1, Phase CO 2, etc.
  tanggal: string; // Tanggal pelaksanaan Phase CO (YYYY-MM-DD)
  status?: string; // Done, In Progress, Scheduled
  notes?: string;
}

export interface ProjectData {
  id: string; // Internal unique identifier
  no: number;
  
  // Tab 1: Project List Core Info
  pmoId: string; // "DSB - ID", e.g. GOV-ID-001 or DSB-IKR-001
  projectCategory: string; // "Project Category", e.g. GOV IPPJU, GOV APJATEL, GOV SJUT, DSB - IKR
  projectId: string; // "Project ID", e.g. GOV - FMI - DSB0000001 or DSB - IKR0000001
  projectDescription: string; // "Project Description"
  zona?: string; // "Zona" (Opsional / Legacy)
  areaKota: string; // "Area/Kota", e.g. Jakarta Pusat, Jakarta Selatan, dll
  projectStatus: string; // "Project Status", e.g. Masih Review Dinas, In Progress, Cancelled, Done
  quarter: string; // "Quarter", e.g. Q1-26, Q2-26, Q3-26, Q4-26, -
  picSectionHead: string; // "PIC Govrel", e.g. Asmari, Dwi, Fredy, etc.
  waspangDsb?: string; // "Waspang DSB / PIC Internal", e.g. Abdul Ra'uf, Alfy, Amir, etc.
  priority?: string; // "Status Prioritas", e.g. Critical, High, Medium, Low, Normal

  // Dates & Document Upload Fields for Project List
  tanggalSuratDinas?: string;
  docSuratDinas?: string;
  tanggalSurveyBersama?: string;
  docSurveyBersama?: string;
  tanggalSuratRekomter?: string;
  docSuratRekomter?: string;
  tanggalSuratPenunjukanVendor?: string;
  docSuratPenunjukanVendor?: string;
  docApdRelokasi?: string;
  docKmzRelokasi?: string;
  docApdInternal?: string;
  docTimeline?: string;
  remarks?: string;

  // Tab 2: Construction & Plan
  namaVendor: string; // "Nama Vendor", e.g. PT.NATAMA, PT.RPA, PT.ARKON, Belum Ada Vendor
  dateSuratPerintahRelokasi?: string; // (Optional / Legacy)
  bulan?: string; // (Optional / Legacy)
  tahun?: string; // (Optional / Legacy)
  panjangRelokasi: number | string; // "Panjang Relokasi FO"
  jalurAkses?: number | string; // "Jalur Akses" (meter)
  apdRelokasi?: string; // (Optional / Legacy)
  kmzRelokasi?: string; // (Optional / Legacy)
  statusAudit?: string; // "Status Audit"
  apdLinknet?: string; // (Optional / Legacy)
  statusSurvey?: string; // (Optional / Legacy)
  baSurvey?: string; // (Optional / Legacy)
  ceMaterial?: string; // "CE Material"
  sphBoq?: string; // (Optional / Legacy)
  ceLn?: string; // "CE LN"
  apdLn?: string; // "APD LN"
  timelineRelokasi?: string; // "Timeline Relokasi"
  tanggalStartProject?: string; // "Tanggal Start Project"
  tanggalEndProject?: string; // "Tanggal End Project"
  estimasiPemutusan?: string; // "Estimasi Pemutusan"
  tanggalPemutusan?: string; // "Tanggal Pemutusan"
  remarksPlan?: string; // "Remarks" in Tab 2

  // Tab 5: Document Project (Pengajuan Material, BOQ Labour, CE & BOQ)
  documentProject?: import('./document').DocumentProjectData;
  statusPengajuanProject: string; // "Status Pengajuan Project", e.g. NOSA, Project Cancel, Submitted
  projectCreateDate?: string; // "Project Create Date", e.g. 2026-03-15
  mrNumber?: string; // "MR Number", e.g. 99434
  tanggalPengajuanMr?: string; // "Tanggal Pengajuan MR" (Legacy)
  tanggalPengajuanPo?: string; // "Tanggal Pengajuan PO" (Legacy)
  statusPengajuanMr?: string; // "Status Pengajuan MR" (Legacy)
  statusPengajuanPo?: string; // "Status Pengajuan PO" (Legacy)
  poNumber?: string; // "PO Number" (Legacy)
  planPengambilanMaterial?: string; // (Legacy)
  statusMaterialLocation?: string; // (Legacy)
  pengajuanProjectRemarks?: string; // "Pengajuan Project Remarks"
  statusMaterialReturn?: string; // "Status Material Return"
  tanggalPlanReturn?: string; // "Tanggal Plan Return"
  tanggalReturn?: string; // "Tanggal Return"
  statusDokumenClosing?: string; // "Status Dokumen Closing"
  closingRemarks?: string; // "Closing Remarks"
  preProjectRemarks?: string; // "Pre-Project Remarks"
  remarksProject?: string; // "Remarks" in Tab 5
  emailDispatchHistory?: import('./document').DocumentEmailDispatchRecord[];
  lastEmailDispatch?: import('./document').DocumentEmailDispatchRecord;

  // Tab 4: Status Construction (from Image 4)
  statusConstruction: string; // "Status Construction", e.g. Project Not Started, Pulling Cable, Project Cancel, Completed
  statusLabor: string; // "Status Labor", e.g. N/A, Assigned
  statusMaterial: string; // "Status Material", e.g. N/A, Released, No Need MR
  statusPullingCableFo: string; // "Status Pulling Cable FO", e.g. In Progress, Done, Not Started
  pullingFoPanjangSelesai?: number | string; // Meter selesai FO
  pullingFoPanjangTotal?: number | string; // Target meter FO
  pullingCableFoProgress?: string; // "Pulling Cable FO Progress (Otomatis)", e.g. 100%, 50%, 0%
  statusCo: string; // "Status CO", e.g. In Progress, Done, N/A
  coCableJointItems?: CoCableJointItem[]; // Cable FO Existing di joint dengan Cable FO New Jumper (tambah item)
  coCableJointSummary?: string; // Summary of cable joints
  cableFoExisting?: string; // Primary selection
  cableFoNewJumper?: string; // Primary selection
  coPhaseItems?: CoPhaseItem[]; // Phase CO 1 di tanggal ... (tambah item)
  coPhaseSummary?: string; // Summary of Phase CO & tanggal
  phaseCo1Date?: string; // Primary Phase CO 1 date
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
  pullingCableProgress?: string; // "Pulling Cable Progress"
  projectSapId?: string; // "Project SAP ID", e.g. GOV0000747
  pipelineStage?: string; // Pipeline Tracking Stage

  // Tab 7: Closing Project
  closingProject?: import('./document').ClosingProjectData;
  prajectDate?: string; // Praject Date / Project Date
  statusPengajuanClosing?: string; // Not Yet, Submit, Approval BALAP, Approval BAST, Teco Done, Invoice
  baOpnameMaterial?: string; // BA Opname Material doc note or file name
  baOpnameLabour?: string; // BA Opname Labour doc note or file name
  closingAbdRelokasi?: string; // ABD Relokasi doc note or file name
  closingAbdInternal?: string; // ABD Internal doc note or file name
  fotoDokumentasi?: string; // Foto Dokumentasi doc note or file name
  remarksConstruction?: string; // Catatan status construction & pipeline

  // System metadata
  updatedAt?: string;
}

export type TabKey = 
  | 'dashboard-overview'
  | 'project-list' 
  | 'construction-plan' 
  | 'status-construction' 
  | 'status-project' 
  | 'project-tracking-pipeline'
  | 'closing-project'
  | 'daily-mandor'
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
