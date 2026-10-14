import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Building2, 
  Compass, 
  FolderGit2, 
  HardHat,
  FileCheck2,
  Activity,
  AlertCircle,
  GitCommit,
  Plus,
  Trash2,
  Cable,
  ShieldCheck,
  Upload,
  Calendar,
  GitMerge
} from 'lucide-react';
import { DocumentProjectManager } from './DocumentProjectManager';
import { 
  ProjectData, 
  HhItem, 
  PoleItem, 
  GalvanisItem,
  PullingFoItem,
  FatItem,
  FdtItem,
  SlackHangerItem,
  SplicingItem,
  CoCableJointItem,
  CoPhaseItem
} from '../types/project';
import { getPriorityMeta } from './PriorityBadge';
import { 
  PMO_OPTIONS, 
  getPmoOption, 
  PmoOption, 
  generateNextProjectId, 
  generateNextPmoId, 
  extractPmoNumber,
  formatPmoId,
  ensureProjectDescriptionPrefix
} from '../utils/pmoIdHelpers';

export function getNextPmoIdInfo(projects: ProjectData[] = []) {
  let maxPmoNumber = 0;
  for (const p of projects) {
    const numPmo = extractPmoNumber(p.pmoId);
    const numProj = extractPmoNumber(p.projectId);
    const highest = Math.max(numPmo, numProj);
    if (highest > maxPmoNumber) {
      maxPmoNumber = highest;
    }
  }

  const nextNumber = maxPmoNumber > 0 ? maxPmoNumber + 1 : (projects.length + 1);
  const pmoNumberStr = String(nextNumber).padStart(7, '0');
  const pmoId = `DSB - ID${pmoNumberStr}`;
  const projectId = generateNextProjectId(pmoId, nextNumber);
  return {
    nextNumber,
    pmoNumberStr,
    pmoId,
    projectId,
    rawPmoId: pmoId
  };
}
import {
  TAHUN_OPTIONS,
  PRIORITY_OPTIONS,
  PROJECT_CATEGORY_OPTIONS,
  AREA_KOTA_OPTIONS,
  PIC_GOVREL_OPTIONS,
  WASPANG_DSB_OPTIONS,
  VENDOR_OPTIONS,
  getProjectStatusOptions,
  FTTH_IKR_PROJECT_STATUS_OPTIONS,
  APD_RELOKASI_OPTIONS,
  KMZ_RELOKASI_OPTIONS,
  APD_FTTH_IKR_OPTIONS,
  KMZ_FTTH_IKR_OPTIONS,
  getApdOptions,
  getKmzOptions,
  APD_LINKNET_OPTIONS,
  STATUS_SURVEY_OPTIONS,
  BA_SURVEY_OPTIONS,
  SPH_BOQ_OPTIONS,
  STATUS_PO_OPTIONS,
  STATUS_PENGAJUAN_PROJECT_OPTIONS,
  STATUS_PENGAJUAN_CLOSING_OPTIONS,
  PLAN_PENGAMBILAN_MATERIAL_OPTIONS,
  STATUS_MATERIAL_LOCATION_OPTIONS,
  STATUS_DOKUMEN_CLOSING_OPTIONS,
  STATUS_AUDIT_OPTIONS,
  STATUS_MATERIAL_OPTIONS,
  STATUS_PULLING_CABLE_FO_OPTIONS,
  STATUS_CO_OPTIONS,
  LAPORAN_OPNAME_OPTIONS,
  CLOSING_SAP_OPTIONS,
  HH_TYPE_OPTIONS,
  HH_SIZE_OPTIONS,
  getHhTypeOptions,
  getHhSizeOptions,
  POLE_OPTIONS,
  GALVANIS_OPTIONS,
  PULLING_FO_CABLE_TYPE_OPTIONS,
  FAT_TYPE_OPTIONS,
  FDT_TYPE_OPTIONS,
  SLACK_HANGER_OPTIONS,
  SPLICING_TYPE_OPTIONS,
  SPLICING_STATUS_OPTIONS,
  CABLE_FO_CO_OPTIONS,
  PHASE_CO_STATUS_OPTIONS,
  formatCoCableJointSummary,
  formatCoPhaseSummary,
  calculateGalianPercentage,
  calculatePullingPercentage,
  calculatePullingFoPercentage,
} from '../data/dropdownOptions';

export const formatHhSummary = (items: HhItem[] = []): string => {
  const valid = items.filter(it => it.qty !== undefined && it.qty !== '' && Number(it.qty) > 0);
  if (valid.length === 0) return '';
  return valid.map(it => `${it.type} ${it.size} (${it.qty} Unit)`).join(', ');
};

export const formatPoleGalvanisSummary = (poles: PoleItem[] = [], galvs: GalvanisItem[] = []): string => {
  const validPoles = poles.filter(p => p.qty !== undefined && p.qty !== '' && Number(p.qty) > 0);
  const validGalvs = galvs.filter(g => g.length !== undefined && g.length !== '' && Number(g.length) > 0);
  const parts: string[] = [];
  if (validPoles.length > 0) {
    parts.push(validPoles.map(p => `${p.type} (${p.qty} Ea)`).join(', '));
  }
  if (validGalvs.length > 0) {
    parts.push(validGalvs.map(g => `Galv ${g.size} (${g.length}m)`).join(', '));
  }
  return parts.join(' | ');
};

export const formatPullingFoSummary = (items: PullingFoItem[] = []): string => {
  const valid = items.filter(it => it.length !== undefined && it.length !== '' && Number(it.length) > 0);
  if (valid.length === 0) return '';
  return valid.map(it => `${it.type} (${Number(it.length).toLocaleString('id-ID')}m)`).join(', ');
};

export const formatFatSummary = (items: FatItem[] = []): string => {
  const valid = items.filter(it => it.qty !== undefined && it.qty !== '' && Number(it.qty) > 0);
  if (valid.length === 0) return '';
  return valid.map(it => `${it.type} (${it.qty} Pcs)`).join(', ');
};

export const formatFdtSummary = (items: FdtItem[] = []): string => {
  const valid = items.filter(it => it.qty !== undefined && it.qty !== '' && Number(it.qty) > 0);
  if (valid.length === 0) return '';
  return valid.map(it => `${it.type} (${it.qty} Pcs)`).join(', ');
};

export const formatSlackHangerSummary = (items: SlackHangerItem[] = []): string => {
  const valid = items.filter(it => it.qty !== undefined && it.qty !== '' && Number(it.qty) > 0);
  if (valid.length === 0) return '';
  return valid.map(it => `Slak Hanger ${it.type} (${it.qty} Pcs)`).join(', ');
};

export const formatSplicingSummary = (items: SplicingItem[] = []): string => {
  const valid = items.filter(it => (it.qty !== undefined && it.qty !== '' && Number(it.qty) > 0) || (it.status && it.status !== 'Not Started'));
  if (valid.length === 0) return '';
  return valid.map(it => `${it.type}${it.qty ? ` (${it.qty} Core)` : ''}${it.status ? ` [${it.status}]` : ''}`).join(', ');
};

export const formatFtthIkrSpecSummary = (
  pullingFo: PullingFoItem[] | number | string = [],
  fatItems: FatItem[] = [],
  fdtItems: FdtItem[] = [],
  splicingItems: SplicingItem[] = [],
  slackHangerItems: SlackHangerItem[] = []
): string => {
  const parts: string[] = [];
  if (Array.isArray(pullingFo)) {
    const pullingStr = formatPullingFoSummary(pullingFo);
    if (pullingStr) {
      parts.push(`Pulling FO: ${pullingStr}`);
    }
  } else if (pullingFo !== undefined && pullingFo !== '' && Number(pullingFo) > 0) {
    parts.push(`Pulling FO: ${Number(pullingFo).toLocaleString('id-ID')}m`);
  }

  const fatStr = formatFatSummary(fatItems);
  if (fatStr) parts.push(`FAT: ${fatStr}`);
  
  const fdtStr = formatFdtSummary(fdtItems);
  if (fdtStr) parts.push(`FDT: ${fdtStr}`);
  
  const splStr = formatSplicingSummary(splicingItems);
  if (splStr) parts.push(`Splicing: ${splStr}`);
  
  const slkStr = formatSlackHangerSummary(slackHangerItems);
  if (slkStr) parts.push(slkStr);

  return parts.join(' | ');
};

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectData) => void;
  initialData?: ProjectData | null;
  totalProjects: number;
  existingProjects?: ProjectData[];
}



export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalProjects,
  existingProjects,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<number>(1);
  const [formData, setFormData] = useState<Partial<ProjectData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [closingUploadError, setClosingUploadError] = useState<string | null>(null);

  // Initialize or reset form data when opened
  useEffect(() => {
    if (isOpen) {
      setActiveFormTab(1);
      setErrors({});
      setSaveSuccessNotice(false);

      const today = new Date().toISOString().split('T')[0];
      const nextMonthDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const cutEstDate = new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0];
      const cutActDate = new Date(Date.now() + 26 * 86400000).toISOString().split('T')[0];

      if (initialData) {
        const numId = initialData.pmoId?.replace(/[^0-9]/g, '') || String(initialData.no || 1);
        const hhItems: HhItem[] = (initialData.installHhItems && initialData.installHhItems.length > 0)
          ? initialData.installHhItems
          : [{
              id: '1',
              type: initialData.installHhType || 'HH',
              size: initialData.installHhSize || '80x80',
              qty: initialData.installHhQty ?? '2'
            }];

        const poleItems: PoleItem[] = (initialData.installPoleItems && initialData.installPoleItems.length > 0)
          ? initialData.installPoleItems
          : [{
              id: '1',
              type: initialData.installPoleType || 'Tiang 8',
              qty: initialData.installPoleQty ?? '6'
            }];

        const galvItems: GalvanisItem[] = (initialData.installGalvanisItems && initialData.installGalvanisItems.length > 0)
          ? initialData.installGalvanisItems
          : [{
              id: '1',
              size: initialData.installGalvanisSize || '2"',
              length: initialData.installGalvanisLength ?? '50'
            }];

        const pullingFoItems: PullingFoItem[] = (initialData.pullingFoItems && initialData.pullingFoItems.length > 0)
          ? initialData.pullingFoItems
          : [{
              id: '1',
              type: initialData.pullingFoType || 'Cable 24 FO',
              length: initialData.pullingFoMeter ?? initialData.pullingFoPanjangTotal ?? initialData.panjangRelokasi ?? 750,
              status: initialData.statusPullingCableFo || 'In Progress'
            }];

        const fatItems: FatItem[] = (initialData.installFatItems && initialData.installFatItems.length > 0)
          ? initialData.installFatItems
          : [{
              id: '1',
              type: initialData.installFatType || 'FAT 8 Core',
              qty: initialData.installFatQty ?? '4'
            }];

        const fdtItems: FdtItem[] = (initialData.installFdtItems && initialData.installFdtItems.length > 0)
          ? initialData.installFdtItems
          : [{
              id: '1',
              type: initialData.installFdtType || 'FDT 96 Core',
              qty: initialData.installFdtQty ?? '1'
            }];

        const slackItems: SlackHangerItem[] = (initialData.installSlackHangerItems && initialData.installSlackHangerItems.length > 0)
          ? initialData.installSlackHangerItems
          : [{
              id: '1',
              type: initialData.installSlackHangerType || 'Standard',
              qty: initialData.installSlackHangerQty ?? '4'
            }];

        const splicingItems: SplicingItem[] = (initialData.splicingCableItems && initialData.splicingCableItems.length > 0)
          ? initialData.splicingCableItems
          : [{
              id: '1',
              type: 'Joint Closure 24 Core',
              qty: initialData.splicingCableQty ?? '12',
              status: initialData.splicingCableStatus || 'In Progress'
            }];

        const coCableJointItems: CoCableJointItem[] = (initialData.coCableJointItems && initialData.coCableJointItems.length > 0)
          ? initialData.coCableJointItems
          : [{
              id: '1',
              cableExisting: initialData.cableFoExisting || 'Cable 24 FO',
              cableNewJumper: initialData.cableFoNewJumper || 'Cable 24 FO',
            }];

        const coPhaseItems: CoPhaseItem[] = (initialData.coPhaseItems && initialData.coPhaseItems.length > 0)
          ? initialData.coPhaseItems
          : [{
              id: '1',
              phaseName: 'Phase CO 1',
              tanggal: initialData.phaseCo1Date || today,
              status: 'In Progress',
            }];

        const pullingFoMeterVal = initialData.pullingFoMeter ?? initialData.pullingFoPanjangTotal ?? initialData.panjangRelokasi ?? 750;

        setFormData({
          ...initialData,
          projectDescription: initialData.projectDescription?.trim() || `Relokasi FO Segmen Jalur ${initialData.pmoId} - ${initialData.areaKota || 'Jakarta Pusat'}`,
          zona: initialData.zona?.trim() || 'Zona 1 Central',
          areaKota: initialData.areaKota?.trim() || 'Jakarta Pusat',
          projectCategory: initialData.projectCategory?.trim() || 'GOV APJATEL',
          projectStatus: initialData.projectStatus?.trim() || 'Review Dinas',
          priority: initialData.priority || 'Level 1 - Kritis',
          quarter: initialData.quarter || 'Q1-26',
          picSectionHead: initialData.picSectionHead?.trim() || 'Asmari',
          waspangDsb: initialData.waspangDsb?.trim() || "Abdul Ra'uf",
          namaVendor: initialData.namaVendor?.trim() || 'PT. Telko Mandiri Perkasa',
          dateSuratPerintahRelokasi: initialData.dateSuratPerintahRelokasi || today,
          bulan: initialData.bulan || 'Maret',
          tahun: initialData.tahun || '2026',
          panjangRelokasi: Number(initialData.panjangRelokasi) || 750,
          jalurAkses: initialData.jalurAkses || initialData.panjangRelokasi || 750,
          tanggalSuratDinas: initialData.tanggalSuratDinas || today,
          docSuratDinas: initialData.docSuratDinas || `Surat_Dinas_${numId}.pdf`,
          tanggalSurveyBersama: initialData.tanggalSurveyBersama || today,
          docSurveyBersama: initialData.docSurveyBersama || `BA_Survey_Bersama_${numId}.pdf`,
          tanggalSuratRekomter: initialData.tanggalSuratRekomter || today,
          docSuratRekomter: initialData.docSuratRekomter || `Rekomtek_Dinas_${numId}.pdf`,
          tanggalSuratPenunjukanVendor: initialData.tanggalSuratPenunjukanVendor || today,
          docSuratPenunjukanVendor: initialData.docSuratPenunjukanVendor || `SPK_Vendor_${numId}.pdf`,
          apdRelokasi: initialData.apdRelokasi || `APD_Relokasi_${numId}.pdf`,
          kmzRelokasi: initialData.kmzRelokasi || `Rute_KMZ_${numId}.kmz`,
          statusAudit: initialData.statusAudit || 'Review Audit',
          apdLinknet: initialData.apdLinknet || `APD_Internal_${numId}.pdf`,
          statusSurvey: initialData.statusSurvey || 'Survey Selesai',
          baSurvey: initialData.baSurvey || `BA_Survey_Bersama_${numId}.pdf`,
          ceMaterial: initialData.ceMaterial || `FORM_CE_Material_${numId}.pdf`,
          sphBoq: initialData.sphBoq || `SPH_BOQ_${numId}.xlsx`,
          tanggalStartProject: initialData.tanggalStartProject || today,
          tanggalEndProject: initialData.tanggalEndProject || nextMonthDate,
          estimasiPemutusan: initialData.estimasiPemutusan || cutEstDate,
          tanggalPemutusan: initialData.tanggalPemutusan || cutActDate,
          remarksPlan: initialData.remarksPlan || 'Koordinasi utilitas dan persiapan izin kerja Dishub',
          statusPengajuanProject: initialData.statusPengajuanProject || 'Submit',
          projectCreateDate: initialData.projectCreateDate || today,
          mrNumber: initialData.mrNumber || `MR-2026-00${numId}`,
          planPengambilanMaterial: initialData.planPengambilanMaterial || 'Gudang Cikarang',
          statusMaterialLocation: initialData.statusMaterialLocation || 'Sudah Di Lokasi Proyek',
          statusDokumenClosing: initialData.statusDokumenClosing || 'Proses Closing',
          remarksProject: initialData.remarksProject || 'Material kabel 24 FO dan pipa galvanis siap pasang',
          statusConstruction: initialData.statusConstruction || 'In Progress',
          statusLabor: initialData.statusLabor || 'Assigned & Active',
          statusMaterial: initialData.statusMaterial || 'Ready di Lokasi',
          statusPullingCableFo: initialData.statusPullingCableFo || 'In Progress',
          pullingCableFoProgress: initialData.pullingCableFoProgress || '50%',
          pullingFoPanjangSelesai: initialData.pullingFoPanjangSelesai || 375,
          pullingFoPanjangTotal: initialData.pullingFoPanjangTotal || 750,
          galianPanjangSelesai: initialData.galianPanjangSelesai || 375,
          galianPanjangTotal: initialData.galianPanjangTotal || 750,
          statusCo: initialData.statusCo || 'In Progress',
          laporanOpname: initialData.laporanOpname || 'Submitted',
          closingSap: initialData.closingSap || 'Submit dokumen SAP',
          projectSapId: initialData.projectSapId || `SAP-GOV${numId.padStart(5, '0')}`,
          kebutuhanMaterialPoSap: initialData.kebutuhanMaterialPoSap || `PO-MAT-${numId}`,
          galianSipilProgress: initialData.galianSipilProgress || '50%',
          galianAksesProgress: initialData.galianAksesProgress || '50%',
          galianCrossingProgress: initialData.galianCrossingProgress || '50%',
          prajectDate: initialData.prajectDate || initialData.projectCreateDate || today,
          poNumber: initialData.poNumber || `PO-45000${numId.slice(-4).padStart(4, '0')}`,
          statusPengajuanClosing: initialData.statusPengajuanClosing || initialData.closingProject?.statusPengajuan || 'Submit',
          baOpnameMaterial: initialData.baOpnameMaterial || `BA_Opname_Material_${numId}.pdf`,
          baOpnameLabour: initialData.baOpnameLabour || `BA_Opname_Labour_${numId}.pdf`,
          closingAbdRelokasi: initialData.closingAbdRelokasi || `ABD_Relokasi_${numId}.dwg`,
          closingAbdInternal: initialData.closingAbdInternal || `ABD_Internal_${numId}.pdf`,
          fotoDokumentasi: initialData.fotoDokumentasi || `Foto_Dokumentasi_${numId}.jpg`,
          closingRemarks: initialData.closingRemarks || 'Dokumen closing telah disiapkan lengkap untuk verifikasi',
          remarksConstruction: initialData.remarksConstruction || 'Pekerjaan konstruksi berjalan sesuai rencana',
          installHhItems: hhItems,
          installPoleItems: poleItems,
          installGalvanisItems: galvItems,
          pullingFoItems: pullingFoItems,
          installFatItems: fatItems,
          installFdtItems: fdtItems,
          installSlackHangerItems: slackItems,
          splicingCableItems: splicingItems,
          pullingFoMeter: pullingFoMeterVal,
          installHhProgress: initialData.installHhProgress || formatHhSummary(hhItems),
          installPoleProgress: initialData.installPoleProgress || formatPoleGalvanisSummary(poleItems, galvItems),
          ftthIkrSpecProgress: initialData.ftthIkrSpecProgress || formatFtthIkrSpecSummary(pullingFoItems, fatItems, fdtItems, splicingItems, slackItems),
          coCableJointItems: coCableJointItems,
          coCableJointSummary: initialData.coCableJointSummary || formatCoCableJointSummary(coCableJointItems),
          cableFoExisting: coCableJointItems[0]?.cableExisting || 'Cable 24 FO',
          cableFoNewJumper: coCableJointItems[0]?.cableNewJumper || 'Cable 24 FO',
          coPhaseItems: coPhaseItems,
          coPhaseSummary: initialData.coPhaseSummary || formatCoPhaseSummary(coPhaseItems),
          phaseCo1Date: coPhaseItems[0]?.tanggal || today,
        });
      } else {
        // Generate new project default template with automatic DSB-ID sequence and FULL non-blank values
        const nextNo = (existingProjects?.length || totalProjects) + 1;
        const initialCategory = 'GOV APJATEL';
        const nextPmo = getNextPmoIdInfo(existingProjects || []);
        const numId = String(nextNo).padStart(4, '0');

        const defaultHh: HhItem[] = [{ id: '1', type: 'HH', size: '80x80', qty: '2' }];
        const defaultPole: PoleItem[] = [{ id: '1', type: 'Tiang 8', qty: '6' }];
        const defaultGalv: GalvanisItem[] = [{ id: '1', size: '2"', length: '50' }];
        const defaultPullingFo: PullingFoItem[] = [{ id: '1', type: 'Cable 24 FO', length: '750', status: 'In Progress' }];
        const defaultFat: FatItem[] = [{ id: '1', type: 'FAT 8 Core', qty: '4' }];
        const defaultFdt: FdtItem[] = [{ id: '1', type: 'FDT 96 Core', qty: '1' }];
        const defaultSlack: SlackHangerItem[] = [{ id: '1', type: 'Standard', qty: '4' }];
        const defaultSplicing: SplicingItem[] = [{ id: '1', type: 'Joint Closure 24 Core', qty: '12', status: 'In Progress' }];
        const defaultCoCableJoints: CoCableJointItem[] = [
          { id: '1', cableExisting: 'Cable 24 FO', cableNewJumper: 'Cable 24 FO' }
        ];
        const defaultCoPhases: CoPhaseItem[] = [
          { id: '1', phaseName: 'Phase CO 1', tanggal: today, status: 'In Progress' }
        ];

        setFormData({
          id: `proj-${Date.now()}`,
          no: nextNo,
          pmoId: nextPmo.pmoId,
          projectCategory: initialCategory,
          projectId: nextPmo.projectId,
          projectDescription: `Relokasi FO Segmen Jalur ${nextPmo.pmoId} - Jakarta Pusat`,
          zona: 'Zona 1 Central',
          areaKota: 'Jakarta Pusat',
          projectStatus: 'Review Dinas',
          priority: 'Level 1 - Kritis',
          quarter: 'Q1-26',
          picSectionHead: 'Asmari',
          waspangDsb: "Abdul Ra'uf",
          namaVendor: 'PT. Telko Mandiri Perkasa',
          tanggalSuratDinas: today,
          docSuratDinas: `Surat_Dinas_${numId}.pdf`,
          tanggalSurveyBersama: today,
          docSurveyBersama: `BA_Survey_Bersama_${numId}.pdf`,
          tanggalSuratRekomter: today,
          docSuratRekomter: `Rekomtek_Dinas_${numId}.pdf`,
          tanggalSuratPenunjukanVendor: today,
          docSuratPenunjukanVendor: `SPK_Vendor_${numId}.pdf`,
          dateSuratPerintahRelokasi: today,
          bulan: 'Maret',
          tahun: '2026',
          panjangRelokasi: 750,
          jalurAkses: 750,
          apdRelokasi: `APD_Relokasi_${numId}.pdf`,
          kmzRelokasi: `Rute_KMZ_${numId}.kmz`,
          statusAudit: 'Review Audit',
          apdLinknet: `APD_Internal_${numId}.pdf`,
          statusSurvey: 'Survey Selesai',
          baSurvey: `BA_Survey_Bersama_${numId}.pdf`,
          ceMaterial: `FORM_CE_Material_${numId}.pdf`,
          sphBoq: `SPH_BOQ_${numId}.xlsx`,
          tanggalStartProject: today,
          tanggalEndProject: nextMonthDate,
          estimasiPemutusan: cutEstDate,
          tanggalPemutusan: cutActDate,
          remarksPlan: 'Koordinasi utilitas dan persiapan perizinan Dinas Perhubungan',
          statusPengajuanProject: 'Submit',
          projectCreateDate: today,
          mrNumber: `MR-2026-00${numId}`,
          planPengambilanMaterial: 'Gudang Cikarang',
          statusMaterialLocation: 'Sudah Di Lokasi Proyek',
          statusDokumenClosing: 'Proses Closing',
          remarksProject: 'Material kabel 24 FO dan pipa galvanis siap pasang',
          statusConstruction: 'In Progress',
          statusLabor: 'Assigned & Active',
          statusMaterial: 'Ready di Lokasi',
          statusPullingCableFo: 'In Progress',
          pullingCableFoProgress: '50%',
          pullingFoPanjangSelesai: 375,
          pullingFoPanjangTotal: 750,
          galianPanjangSelesai: 375,
          galianPanjangTotal: 750,
          statusCo: 'In Progress',
          laporanOpname: 'Submitted',
          closingSap: 'Submit dokumen SAP',
          projectSapId: `SAP-GOV${numId.padStart(5, '0')}`,
          kebutuhanMaterialPoSap: `PO-MAT-450012${numId}`,
          galianSipilProgress: '50%',
          galianAksesProgress: '50%',
          galianCrossingProgress: '50%',
          installHhProgress: 'HH 80x80 (2 Unit)',
          installHhType: 'HH',
          installHhSize: '80x80',
          installHhQty: '2',
          installHhItems: defaultHh,
          installPoleType: 'Tiang 8',
          installPoleQty: '6',
          installPoleItems: defaultPole,
          installGalvanisSize: '2"',
          installGalvanisLength: '50',
          installGalvanisItems: defaultGalv,
          pullingFoItems: defaultPullingFo,
          pullingFoMeter: 750,
          pullingFoType: 'Cable 24 FO',
          installFatQty: '4',
          installFatType: 'FAT 8 Core',
          installFatItems: defaultFat,
          installFdtQty: '1',
          installFdtType: 'FDT 96 Core',
          installFdtItems: defaultFdt,
          installSlackHangerQty: '4',
          installSlackHangerType: 'Standard',
          installSlackHangerItems: defaultSlack,
          splicingCableQty: '12',
          splicingCableStatus: 'In Progress',
          splicingCableItems: defaultSplicing,
          ftthIkrSpecProgress: 'Cable 24 FO (750m) | FAT 8 Core (4 Pcs) | FDT 96 Core (1 Pcs) | Splicing: Joint Closure 24 Core (12 Core) [In Progress]',
          installPoleProgress: 'Tiang 8 (6 Ea) + Galv 2" (50m)',
          pullingCableProgress: '50%',
          coCableJointItems: defaultCoCableJoints,
          coCableJointSummary: formatCoCableJointSummary(defaultCoCableJoints),
          cableFoExisting: 'Cable 24 FO',
          cableFoNewJumper: 'Cable 24 FO',
          coPhaseItems: defaultCoPhases,
          coPhaseSummary: formatCoPhaseSummary(defaultCoPhases),
          phaseCo1Date: today,
          prajectDate: today,
          poNumber: `PO-4500098${numId}`,
          statusPengajuanClosing: 'Submit',
          baOpnameMaterial: `BA_Opname_Material_${numId}.pdf`,
          baOpnameLabour: `BA_Opname_Labour_${numId}.pdf`,
          closingAbdRelokasi: `ABD_Relokasi_${numId}.dwg`,
          closingAbdInternal: `ABD_Internal_${numId}.pdf`,
          fotoDokumentasi: `Foto_Dokumentasi_${numId}.jpg`,
          closingRemarks: 'Dokumen pengajuan closing telah disiapkan lengkap untuk verifikasi',
          remarksConstruction: 'Konstruksi berjalan lancar sesuai target timeline',
          closingProject: {
            projectDate: today,
            poNumber: `PO-4500098${numId}`,
            statusPengajuan: 'Submit',
            remarks: 'Dokumen pengajuan closing telah disiapkan lengkap untuk verifikasi',
            documents: {
              baOpnameMaterial: { name: `BA_Opname_Material_${numId}.pdf`, size: 1420000, type: 'application/pdf', uploadedAt: today },
              baOpnameLabour: { name: `BA_Opname_Labour_${numId}.pdf`, size: 980000, type: 'application/pdf', uploadedAt: today },
              abdRelokasi: { name: `ABD_Relokasi_${numId}.dwg`, size: 3200000, type: 'application/octet-stream', uploadedAt: today },
              abdInternal: { name: `ABD_Internal_${numId}.pdf`, size: 2100000, type: 'application/pdf', uploadedAt: today },
              fotoDokumentasi: { name: `Foto_Dokumentasi_${numId}.jpg`, size: 3800000, type: 'image/jpeg', uploadedAt: today }
            }
          },
          updatedAt: new Date().toISOString()
        });
      }
    }
  }, [isOpen, initialData, totalProjects, existingProjects]);

  if (!isOpen) return null;

  // HH Multi-Item Handlers
  const handleAddHhItem = () => {
    const isDsbIkr = formData.projectCategory === 'DSB - IKR' || formData.projectCategory === 'IKR';
    const newItem: HhItem = {
      id: Date.now().toString(),
      type: isDsbIkr ? 'HG' : 'HH',
      size: '80x80',
      qty: '',
    };
    const newItems = [...(formData.installHhItems || []), newItem];
    const summary = formatHhSummary(newItems);
    setFormData((prev) => ({
      ...prev,
      installHhItems: newItems,
      installHhProgress: summary,
      installHhType: newItems[0]?.type || 'HH',
      installHhSize: newItems[0]?.size || '80x80',
      installHhQty: newItems[0]?.qty || '',
    }));
  };

  const handleUpdateHhItem = (id: string, field: keyof HhItem, val: string | number) => {
    const newItems = (formData.installHhItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const summary = formatHhSummary(newItems);
    setFormData((prev) => ({
      ...prev,
      installHhItems: newItems,
      installHhProgress: summary,
      installHhType: newItems[0]?.type || 'HH',
      installHhSize: newItems[0]?.size || '80x80',
      installHhQty: newItems[0]?.qty || '',
    }));
  };

  const handleRemoveHhItem = (id: string) => {
    const current = formData.installHhItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const summary = formatHhSummary(newItems);
    setFormData((prev) => ({
      ...prev,
      installHhItems: newItems,
      installHhProgress: summary,
      installHhType: newItems[0]?.type || 'HH',
      installHhSize: newItems[0]?.size || '80x80',
      installHhQty: newItems[0]?.qty || '',
    }));
  };

  // Pole Multi-Item Handlers
  const handleAddPoleItem = () => {
    const newItem: PoleItem = {
      id: Date.now().toString(),
      type: 'Tiang 8',
      qty: '',
    };
    const newItems = [...(formData.installPoleItems || []), newItem];
    const summary = formatPoleGalvanisSummary(newItems, formData.installGalvanisItems || []);
    setFormData((prev) => ({
      ...prev,
      installPoleItems: newItems,
      installPoleProgress: summary,
      installPoleType: newItems[0]?.type || 'Tiang 8',
      installPoleQty: newItems[0]?.qty || '',
    }));
  };

  const handleUpdatePoleItem = (id: string, field: keyof PoleItem, val: string | number) => {
    const newItems = (formData.installPoleItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const summary = formatPoleGalvanisSummary(newItems, formData.installGalvanisItems || []);
    setFormData((prev) => ({
      ...prev,
      installPoleItems: newItems,
      installPoleProgress: summary,
      installPoleType: newItems[0]?.type || 'Tiang 8',
      installPoleQty: newItems[0]?.qty || '',
    }));
  };

  const handleRemovePoleItem = (id: string) => {
    const current = formData.installPoleItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const summary = formatPoleGalvanisSummary(newItems, formData.installGalvanisItems || []);
    setFormData((prev) => ({
      ...prev,
      installPoleItems: newItems,
      installPoleProgress: summary,
      installPoleType: newItems[0]?.type || 'Tiang 8',
      installPoleQty: newItems[0]?.qty || '',
    }));
  };

  // Galvanis Multi-Item Handlers
  const handleAddGalvanisItem = () => {
    const newItem: GalvanisItem = {
      id: Date.now().toString(),
      size: '2"',
      length: '',
    };
    const newItems = [...(formData.installGalvanisItems || []), newItem];
    const summary = formatPoleGalvanisSummary(formData.installPoleItems || [], newItems);
    setFormData((prev) => ({
      ...prev,
      installGalvanisItems: newItems,
      installPoleProgress: summary,
      installGalvanisSize: newItems[0]?.size || '2"',
      installGalvanisLength: newItems[0]?.length || '',
    }));
  };

  const handleUpdateGalvanisItem = (id: string, field: keyof GalvanisItem, val: string | number) => {
    const newItems = (formData.installGalvanisItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const summary = formatPoleGalvanisSummary(formData.installPoleItems || [], newItems);
    setFormData((prev) => ({
      ...prev,
      installGalvanisItems: newItems,
      installPoleProgress: summary,
      installGalvanisSize: newItems[0]?.size || '2"',
      installGalvanisLength: newItems[0]?.length || '',
    }));
  };

  const handleRemoveGalvanisItem = (id: string) => {
    const current = formData.installGalvanisItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const summary = formatPoleGalvanisSummary(formData.installPoleItems || [], newItems);
    setFormData((prev) => ({
      ...prev,
      installGalvanisItems: newItems,
      installPoleProgress: summary,
      installGalvanisSize: newItems[0]?.size || '2"',
      installGalvanisLength: newItems[0]?.length || '',
    }));
  };

  // FTTH & IKR: Pulling Cable FO Multi-Item Handlers
  const handleAddPullingFoItem = () => {
    const newItem: PullingFoItem = {
      id: Date.now().toString(),
      type: 'Cable 24 FO',
      length: '',
      status: 'In Progress',
    };
    const newItems = [...(formData.pullingFoItems || []), newItem];
    const totalMeter = newItems.reduce((acc, curr) => acc + (Number(curr.length) || 0), 0);
    const summary = formatFtthIkrSpecSummary(
      newItems,
      formData.installFatItems || [],
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      pullingFoItems: newItems,
      pullingFoMeter: totalMeter > 0 ? totalMeter : (newItems[0]?.length || ''),
      pullingFoPanjangTotal: totalMeter > 0 ? totalMeter : (newItems[0]?.length || ''),
      ftthIkrSpecProgress: summary,
      pullingFoType: newItems[0]?.type || 'Cable 24 FO',
    }));
  };

  const handleUpdatePullingFoItem = (id: string, field: keyof PullingFoItem, val: string | number) => {
    const newItems = (formData.pullingFoItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const totalMeter = newItems.reduce((acc, curr) => acc + (Number(curr.length) || 0), 0);
    const summary = formatFtthIkrSpecSummary(
      newItems,
      formData.installFatItems || [],
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      pullingFoItems: newItems,
      pullingFoMeter: totalMeter > 0 ? totalMeter : (newItems[0]?.length || ''),
      pullingFoPanjangTotal: totalMeter > 0 ? totalMeter : (newItems[0]?.length || ''),
      ftthIkrSpecProgress: summary,
      pullingFoType: newItems[0]?.type || 'Cable 24 FO',
    }));
  };

  const handleRemovePullingFoItem = (id: string) => {
    const current = formData.pullingFoItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const totalMeter = newItems.reduce((acc, curr) => acc + (Number(curr.length) || 0), 0);
    const summary = formatFtthIkrSpecSummary(
      newItems,
      formData.installFatItems || [],
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      pullingFoItems: newItems,
      pullingFoMeter: totalMeter > 0 ? totalMeter : (newItems[0]?.length || ''),
      pullingFoPanjangTotal: totalMeter > 0 ? totalMeter : (newItems[0]?.length || ''),
      ftthIkrSpecProgress: summary,
      pullingFoType: newItems[0]?.type || 'Cable 24 FO',
    }));
  };

  // FTTH & IKR: FAT Multi-Item Handlers
  const handleAddFatItem = () => {
    const newItem: FatItem = {
      id: Date.now().toString(),
      type: 'FAT 8 Core',
      qty: '',
    };
    const newItems = [...(formData.installFatItems || []), newItem];
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      newItems,
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      installFatItems: newItems,
      ftthIkrSpecProgress: summary,
      installFatType: newItems[0]?.type || 'FAT 8 Core',
      installFatQty: newItems[0]?.qty || '',
    }));
  };

  const handleUpdateFatItem = (id: string, field: keyof FatItem, val: string | number) => {
    const newItems = (formData.installFatItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      newItems,
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      installFatItems: newItems,
      ftthIkrSpecProgress: summary,
      installFatType: newItems[0]?.type || 'FAT 8 Core',
      installFatQty: newItems[0]?.qty || '',
    }));
  };

  const handleRemoveFatItem = (id: string) => {
    const current = formData.installFatItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      newItems,
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      installFatItems: newItems,
      ftthIkrSpecProgress: summary,
      installFatType: newItems[0]?.type || 'FAT 8 Core',
      installFatQty: newItems[0]?.qty || '',
    }));
  };

  // FTTH & IKR: FDT Multi-Item Handlers
  const handleAddFdtItem = () => {
    const newItem: FdtItem = {
      id: Date.now().toString(),
      type: 'FDT 96 Core',
      qty: '',
    };
    const newItems = [...(formData.installFdtItems || []), newItem];
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      newItems,
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      installFdtItems: newItems,
      ftthIkrSpecProgress: summary,
      installFdtType: newItems[0]?.type || 'FDT 96 Core',
      installFdtQty: newItems[0]?.qty || '',
    }));
  };

  const handleUpdateFdtItem = (id: string, field: keyof FdtItem, val: string | number) => {
    const newItems = (formData.installFdtItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      newItems,
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      installFdtItems: newItems,
      ftthIkrSpecProgress: summary,
      installFdtType: newItems[0]?.type || 'FDT 96 Core',
      installFdtQty: newItems[0]?.qty || '',
    }));
  };

  const handleRemoveFdtItem = (id: string) => {
    const current = formData.installFdtItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      newItems,
      formData.splicingCableItems || [],
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      installFdtItems: newItems,
      ftthIkrSpecProgress: summary,
      installFdtType: newItems[0]?.type || 'FDT 96 Core',
      installFdtQty: newItems[0]?.qty || '',
    }));
  };

  // FTTH & IKR: Slack Hanger Multi-Item Handlers
  const handleAddSlackHangerItem = () => {
    const newItem: SlackHangerItem = {
      id: Date.now().toString(),
      type: 'Standard',
      qty: '',
    };
    const newItems = [...(formData.installSlackHangerItems || []), newItem];
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      newItems
    );
    setFormData((prev) => ({
      ...prev,
      installSlackHangerItems: newItems,
      ftthIkrSpecProgress: summary,
      installSlackHangerType: newItems[0]?.type || 'Standard',
      installSlackHangerQty: newItems[0]?.qty || '',
    }));
  };

  const handleUpdateSlackHangerItem = (id: string, field: keyof SlackHangerItem, val: string | number) => {
    const newItems = (formData.installSlackHangerItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      newItems
    );
    setFormData((prev) => ({
      ...prev,
      installSlackHangerItems: newItems,
      ftthIkrSpecProgress: summary,
      installSlackHangerType: newItems[0]?.type || 'Standard',
      installSlackHangerQty: newItems[0]?.qty || '',
    }));
  };

  const handleRemoveSlackHangerItem = (id: string) => {
    const current = formData.installSlackHangerItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      formData.installFdtItems || [],
      formData.splicingCableItems || [],
      newItems
    );
    setFormData((prev) => ({
      ...prev,
      installSlackHangerItems: newItems,
      ftthIkrSpecProgress: summary,
      installSlackHangerType: newItems[0]?.type || 'Standard',
      installSlackHangerQty: newItems[0]?.qty || '',
    }));
  };

  // FTTH & IKR: Splicing Multi-Item Handlers
  const handleAddSplicingItem = () => {
    const newItem: SplicingItem = {
      id: Date.now().toString(),
      type: 'Joint Closure 24 Core',
      qty: '',
      status: 'In Progress',
    };
    const newItems = [...(formData.splicingCableItems || []), newItem];
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      formData.installFdtItems || [],
      newItems,
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      splicingCableItems: newItems,
      ftthIkrSpecProgress: summary,
      splicingCableQty: newItems[0]?.qty || '',
      splicingCableStatus: newItems[0]?.status || 'In Progress',
    }));
  };

  const handleUpdateSplicingItem = (id: string, field: keyof SplicingItem, val: string | number) => {
    const newItems = (formData.splicingCableItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      formData.installFdtItems || [],
      newItems,
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      splicingCableItems: newItems,
      ftthIkrSpecProgress: summary,
      splicingCableQty: newItems[0]?.qty || '',
      splicingCableStatus: newItems[0]?.status || 'In Progress',
    }));
  };

  const handleRemoveSplicingItem = (id: string) => {
    const current = formData.splicingCableItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    const summary = formatFtthIkrSpecSummary(
      formData.pullingFoItems || formData.pullingFoMeter || [],
      formData.installFatItems || [],
      formData.installFdtItems || [],
      newItems,
      formData.installSlackHangerItems || []
    );
    setFormData((prev) => ({
      ...prev,
      splicingCableItems: newItems,
      ftthIkrSpecProgress: summary,
      splicingCableQty: newItems[0]?.qty || '',
      splicingCableStatus: newItems[0]?.status || 'In Progress',
    }));
  };

  // Status CO (Cut Over): Cable FO Existing di joint dgn Cable FO New Jumper Handlers
  const handleAddCoCableJointItem = () => {
    const newItem: CoCableJointItem = {
      id: Date.now().toString(),
      cableExisting: 'Cable 24 FO',
      cableNewJumper: 'Cable 24 FO',
    };
    const newItems = [...(formData.coCableJointItems || []), newItem];
    setFormData((prev) => ({
      ...prev,
      coCableJointItems: newItems,
      coCableJointSummary: formatCoCableJointSummary(newItems),
      cableFoExisting: newItems[0]?.cableExisting || '',
      cableFoNewJumper: newItems[0]?.cableNewJumper || '',
    }));
  };

  const handleUpdateCoCableJointItem = (id: string, field: keyof CoCableJointItem, val: string) => {
    const newItems = (formData.coCableJointItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    setFormData((prev) => ({
      ...prev,
      coCableJointItems: newItems,
      coCableJointSummary: formatCoCableJointSummary(newItems),
      cableFoExisting: newItems[0]?.cableExisting || '',
      cableFoNewJumper: newItems[0]?.cableNewJumper || '',
    }));
  };

  const handleRemoveCoCableJointItem = (id: string) => {
    const current = formData.coCableJointItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    setFormData((prev) => ({
      ...prev,
      coCableJointItems: newItems,
      coCableJointSummary: formatCoCableJointSummary(newItems),
      cableFoExisting: newItems[0]?.cableExisting || '',
      cableFoNewJumper: newItems[0]?.cableNewJumper || '',
    }));
  };

  // Status CO: Phase CO 1 di tanggal Handlers
  const handleAddCoPhaseItem = () => {
    const current = formData.coPhaseItems || [];
    const nextNum = current.length + 1;
    const newItem: CoPhaseItem = {
      id: Date.now().toString(),
      phaseName: `Phase CO ${nextNum}`,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'In Progress',
    };
    const newItems = [...current, newItem];
    setFormData((prev) => ({
      ...prev,
      coPhaseItems: newItems,
      coPhaseSummary: formatCoPhaseSummary(newItems),
      phaseCo1Date: newItems[0]?.tanggal || '',
    }));
  };

  const handleUpdateCoPhaseItem = (id: string, field: keyof CoPhaseItem, val: string) => {
    const newItems = (formData.coPhaseItems || []).map((it) => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    });
    setFormData((prev) => ({
      ...prev,
      coPhaseItems: newItems,
      coPhaseSummary: formatCoPhaseSummary(newItems),
      phaseCo1Date: newItems[0]?.tanggal || '',
    }));
  };

  const handleRemoveCoPhaseItem = (id: string) => {
    const current = formData.coPhaseItems || [];
    if (current.length <= 1) return;
    const newItems = current.filter((it) => it.id !== id);
    setFormData((prev) => ({
      ...prev,
      coPhaseItems: newItems,
      coPhaseSummary: formatCoPhaseSummary(newItems),
      phaseCo1Date: newItems[0]?.tanggal || '',
    }));
  };

  const handleClosingFileUpload = (
    slotKey: 'baOpnameMaterial' | 'baOpnameLabour' | 'abdRelokasi' | 'abdInternal' | 'fotoDokumentasi',
    file: File
  ) => {
    setClosingUploadError(null);
    const MAX_FOTO_SIZE = 4 * 1024 * 1024; // 4 MB
    if (slotKey === 'fotoDokumentasi' && file.size > MAX_FOTO_SIZE) {
      setClosingUploadError(
        `Peringatan: Ukuran berkas "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) melebihi batas maksimal 4 MB untuk Foto Dokumentasi. Silakan pilih berkas maks. 4 MB.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const fileMeta = {
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString().split('T')[0],
        dataUrl,
      };

      setFormData((prev) => {
        const existingClosing = prev.closingProject || {
          projectDate: prev.prajectDate || prev.projectCreateDate || '',
          poNumber: prev.poNumber || '',
          statusPengajuan: prev.statusPengajuanClosing || 'Not Yet',
          documents: {},
        };

        const updatedDocs = {
          ...(existingClosing.documents || {}),
          [slotKey]: fileMeta,
        };

        const updatedClosing = {
          ...existingClosing,
          documents: updatedDocs,
          updatedAt: new Date().toISOString(),
        };

        return {
          ...prev,
          closingProject: updatedClosing,
          baOpnameMaterial: slotKey === 'baOpnameMaterial' ? file.name : prev.baOpnameMaterial,
          baOpnameLabour: slotKey === 'baOpnameLabour' ? file.name : prev.baOpnameLabour,
          closingAbdRelokasi: slotKey === 'abdRelokasi' ? file.name : prev.closingAbdRelokasi,
          closingAbdInternal: slotKey === 'abdInternal' ? file.name : prev.closingAbdInternal,
          fotoDokumentasi: slotKey === 'fotoDokumentasi' ? file.name : prev.fotoDokumentasi,
        };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (field: keyof ProjectData, value: unknown) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // 1. Sync FO Relokasi with Target Meter FO
      if (field === 'panjangRelokasi') {
        const num = Number(value) || 0;
        updated.pullingFoPanjangTotal = num;
        if (!updated.galianPanjangTotal || Number(updated.galianPanjangTotal) === 0) {
          updated.galianPanjangTotal = num;
        }
      }
      if (field === 'pullingFoPanjangTotal') {
        updated.panjangRelokasi = Number(value) || 0;
        if (!updated.galianPanjangTotal || Number(updated.galianPanjangTotal) === 0) {
          updated.galianPanjangTotal = Number(value) || 0;
        }
      }

      // 3. Auto-compute Galian Sipil Progress if galian parameters or status changed
      if (
        field === 'statusConstruction' ||
        field === 'galianPanjangSelesai' ||
        field === 'galianPanjangTotal' ||
        field === 'panjangRelokasi' ||
        field === 'galianSipilProgress'
      ) {
        const totalTarget = Number(updated.galianPanjangTotal || updated.panjangRelokasi || 0);
        let doneMeters = Number(updated.galianPanjangSelesai || 0);

        if (field === 'galianSipilProgress') {
          const sVal = String(value || '').trim();
          if (sVal === '100%' || sVal.toLowerCase() === 'done' || sVal.toLowerCase() === 'completed') {
            if (totalTarget > 0) {
              doneMeters = totalTarget;
              updated.galianPanjangSelesai = totalTarget;
            }
          } else if (sVal.includes('%')) {
            const pct = parseInt(sVal, 10);
            if (!isNaN(pct) && totalTarget > 0) {
              doneMeters = Math.round((pct / 100) * totalTarget);
              updated.galianPanjangSelesai = doneMeters;
            }
          }
        } else if (totalTarget > 0 && doneMeters > 0) {
          const pct = Math.min(100, Math.round((doneMeters / totalTarget) * 100));
          updated.galianSipilProgress = `${pct}%`;
        } else if (doneMeters === 0) {
          updated.galianSipilProgress = '0%';
        }
      }

      // Auto-compute Pulling Cable Progress from FO status & length
      if (
        field === 'statusPullingCableFo' ||
        field === 'pullingFoPanjangSelesai' ||
        field === 'pullingFoPanjangTotal' ||
        field === 'statusConstruction' ||
        field === 'pullingPanjangSelesai' ||
        field === 'pullingPanjangTotal' ||
        field === 'panjangRelokasi'
      ) {
        const foTotal = Number(updated.pullingFoPanjangTotal || updated.pullingPanjangTotal || updated.panjangRelokasi || 0);
        let foDone = Number(updated.pullingFoPanjangSelesai || 0);

        if (field === 'statusPullingCableFo' && value === 'Done' && foDone === 0 && foTotal > 0) {
          foDone = foTotal;
          updated.pullingFoPanjangSelesai = foTotal;
        }

        // Auto compute FO progress
        updated.pullingCableFoProgress = calculatePullingFoPercentage(
          updated.statusPullingCableFo || 'Not Yet',
          foDone,
          foTotal,
          updated.statusConstruction
        );

        updated.pullingCableProgress = updated.pullingCableFoProgress || '0%';

        if (updated.pullingCableProgress === '100%' && updated.statusConstruction === 'Pulling Cable') {
          updated.statusPullingCableFo = 'Done';
        }
      }

      // Auto-generate installHhProgress label from specifications if edited
      if (field === 'installHhType' || field === 'installHhSize' || field === 'installHhQty') {
        const type = updated.installHhType || 'HH';
        const size = updated.installHhSize || '80x80';
        const qty = updated.installHhQty ? `${updated.installHhQty} Unit` : '';
        if (qty) {
          updated.installHhProgress = `${type} ${size} (${qty})`;
        }
      }

      // Auto-generate installPoleProgress label from pole & galvanis specifications if edited
      if (
        field === 'installPoleType' ||
        field === 'installPoleQty' ||
        field === 'installGalvanisSize' ||
        field === 'installGalvanisLength'
      ) {
        const poleType = updated.installPoleType || 'Tiang 8';
        const poleQty = updated.installPoleQty ? `${updated.installPoleQty} Ea` : '';
        const galvSize = updated.installGalvanisSize || '2"';
        const galvLen = updated.installGalvanisLength ? `${updated.installGalvanisLength}m` : '';
        const parts = [];
        if (poleQty) parts.push(`${poleType} (${poleQty})`);
        if (galvLen) parts.push(`Galv ${galvSize} (${galvLen})`);
        if (parts.length > 0) {
          updated.installPoleProgress = parts.join(' + ');
        }
      }

      return updated;
    });

    // Clear error for field if any
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleValidateAndSave = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pmoId?.trim()) {
      newErrors.pmoId = 'DSB - ID wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveFormTab(1); // Jump to tab 1 where core errors are
      return;
    }

    const cleanPmo = formatPmoId('DSB-ID', formData.pmoId || 'DSB-001');
    const cleanProj = (formData.projectId && formData.projectId.trim()) 
      ? formData.projectId.trim() 
      : generateNextProjectId(cleanPmo);

    const payload: ProjectData = {
      ...(formData as ProjectData),
      pmoId: cleanPmo,
      projectId: cleanProj,
      updatedAt: new Date().toISOString(),
    };

    onSave(payload);
    setSaveSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {initialData ? `Edit Project: ${initialData.pmoId}` : 'Tambah Project Baru'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sistem 5 Sheet Terintegrasi · Simpan otomatis ke database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Connected Form Tabs Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100/90 px-4 sm:px-6 pt-2.5 overflow-x-auto custom-scrollbar gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveFormTab(1)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
              activeFormTab === 1
                ? 'bg-white text-sky-700 border-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>1. Project List</span>
            {errors.pmoId || errors.projectDescription ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(2)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
              activeFormTab === 2
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>2. Plan Implementasi Project</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(3)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
              activeFormTab === 3
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>3. Status Construction</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(4)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
              activeFormTab === 4
                ? 'bg-white text-amber-700 border-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>4. Document Project</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(5)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
              activeFormTab === 5
                ? 'bg-white text-purple-700 border-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>5. Tracking Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(6)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap shrink-0 border-b-2 ${
              activeFormTab === 6
                ? 'bg-white text-teal-700 border-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>6. Closing Project</span>
          </button>
        </div>

        {/* Form Body - Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white space-y-4">
          {/* TAB 1: PROJECT LIST */}
          {activeFormTab === 1 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800">
                Informasi utama identitas project. Kolom ini terhubung langsung dengan Sheet 1 (Project List).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>DSB - ID</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 shadow-2xs">
                      Otomatis Terurut
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={formData.pmoId || ''}
                      onChange={(e) => {
                        const newPmo = e.target.value;
                        const autoProjectId = generateNextProjectId(newPmo);
                        setFormData(prev => ({
                          ...prev,
                          pmoId: newPmo,
                          projectId: autoProjectId,
                        }));
                      }}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val) {
                          const formattedPmo = formatPmoId('DSB-ID', val);
                          const formattedProj = generateNextProjectId(formattedPmo);
                          setFormData(prev => ({
                            ...prev,
                            pmoId: formattedPmo,
                            projectId: formattedProj,
                          }));
                        }
                      }}
                      placeholder="DSB - ID0000001"
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border font-mono font-bold text-slate-900 shadow-2xs transition-all ${
                        errors.pmoId 
                          ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-200' 
                          : 'border-sky-300 bg-sky-50/30 hover:border-sky-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.pmoId && <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.pmoId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Category</label>
                  <select
                    value={formData.projectCategory || 'GOV APJATEL'}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      handleChange('projectCategory', newCat);
                    }}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600 cursor-pointer font-semibold text-slate-800 bg-white shadow-2xs"
                  >
                    {PROJECT_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">Project ID</label>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 shadow-2xs">
                      Otomatis Terurut
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.projectId || ''}
                    onChange={(e) => handleChange('projectId', e.target.value)}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) {
                        const formattedProj = generateNextProjectId(val);
                        setFormData(prev => ({
                          ...prev,
                          projectId: formattedProj
                        }));
                      }
                    }}
                    placeholder="GOV - FMI - DSB0000001"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600 font-mono font-bold text-slate-900 bg-slate-50/30 hover:border-slate-400 focus:bg-white transition-all shadow-2xs"
                  />
                  <p className="text-[10px] font-medium text-slate-500 mt-1">
                    Format: GOV - FMI - DSB0000001
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Segment Relokasi
                  </label>
                  {formData.projectDescription && (
                    <button
                      type="button"
                      onClick={() => handleChange('projectDescription', '')}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Bersihkan</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.projectDescription || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => {
                      const autoProjId = (prev.projectId && prev.projectId.trim() !== '')
                        ? prev.projectId
                        : generateNextProjectId(prev.pmoId || 'DSB-ID-0000001');
                      return {
                        ...prev,
                        projectDescription: val,
                        projectId: autoProjId
                      };
                    });
                  }}
                  placeholder="Masukkan Segment Relokasi..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-xs"
                />
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 ${initialData ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3.5`}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Kota</label>
                  <select
                    value={formData.areaKota || 'Jakarta Pusat'}
                    onChange={(e) => handleChange('areaKota', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    {AREA_KOTA_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {initialData && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Project</label>
                    <select
                      value={formData.projectStatus || (formData.projectCategory === 'DSB - IKR' ? 'Project Not Started' : 'Masih Review Dinas')}
                      onChange={(e) => handleChange('projectStatus', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer"
                    >
                      {getProjectStatusOptions(formData.projectCategory).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Prioritas</label>
                  <select
                    value={formData.priority || 'Normal'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer"
                  >
                    {PRIORITY_OPTIONS.map((p) => {
                      const meta = getPriorityMeta(p);
                      return (
                        <option key={p} value={p}>
                          [L{meta.level}] {p} - {meta.levelName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quarter</label>
                  <select
                    value={formData.quarter || 'Q1-26'}
                    onChange={(e) => handleChange('quarter', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    <option value="Q1-26">Q1-26</option>
                    <option value="Q2-26">Q2-26</option>
                    <option value="Q3-26">Q3-26</option>
                    <option value="Q4-26">Q4-26</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Vendor
                  </label>
                  <select
                    value={formData.namaVendor || 'BELUM ADA VENDOR'}
                    onChange={(e) => handleChange('namaVendor', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer uppercase bg-white"
                  >
                    {formData.namaVendor && !VENDOR_OPTIONS.includes(formData.namaVendor as any) && (
                      <option value={formData.namaVendor}>{formData.namaVendor.toUpperCase()}</option>
                    )}
                    {VENDOR_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIC Govrel <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.picSectionHead || 'Asmari'}
                    onChange={(e) => handleChange('picSectionHead', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-medium cursor-pointer"
                  >
                    {PIC_GOVREL_OPTIONS.map((pic) => (
                      <option key={pic} value={pic}>
                        {pic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIC Internal (Waspang DSB)
                  </label>
                  <select
                    value={formData.waspangDsb || 'Abdul Ra\'uf'}
                    onChange={(e) => handleChange('waspangDsb', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white font-medium cursor-pointer"
                  >
                    {WASPANG_DSB_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Dates & File Upload Section */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-sky-600" />
                    <span>Dokumen Perizinan & File Lampiran Project</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                    Format File: PDF, KMZ, APD, DWG, PNG (Max 25MB)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Tanggal Surat Dinas & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">1. Tanggal Surat Dinas & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.tanggalSuratDinas || ''}
                        onChange={(e) => handleChange('tanggalSuratDinas', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500"
                      />
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docSuratDinas ? 'Ganti File' : 'Upload File'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleChange('docSuratDinas', file.name);
                          }}
                        />
                      </label>
                    </div>
                    {formData.docSuratDinas && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen: {formData.docSuratDinas}</span>
                      </p>
                    )}
                  </div>

                  {/* Tanggal Survey Bersama & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">2. Tanggal Survey Bersama & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.tanggalSurveyBersama || ''}
                        onChange={(e) => handleChange('tanggalSurveyBersama', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500"
                      />
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docSurveyBersama ? 'Ganti File' : 'Upload File'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleChange('docSurveyBersama', file.name);
                          }}
                        />
                      </label>
                    </div>
                    {formData.docSurveyBersama && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen: {formData.docSurveyBersama}</span>
                      </p>
                    )}
                  </div>

                  {/* Tanggal Surat Rekomter & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">3. Tanggal Surat Rekomter & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.tanggalSuratRekomter || ''}
                        onChange={(e) => handleChange('tanggalSuratRekomter', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500"
                      />
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docSuratRekomter ? 'Ganti File' : 'Upload File'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleChange('docSuratRekomter', file.name);
                          }}
                        />
                      </label>
                    </div>
                    {formData.docSuratRekomter && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen: {formData.docSuratRekomter}</span>
                      </p>
                    )}
                  </div>

                  {/* Tanggal Surat Penunjukan Vendor & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">4. Tanggal Penunjukan Vendor & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={formData.tanggalSuratPenunjukanVendor || ''}
                        onChange={(e) => handleChange('tanggalSuratPenunjukanVendor', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500"
                      />
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docSuratPenunjukanVendor ? 'Ganti File' : 'Upload File'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleChange('docSuratPenunjukanVendor', file.name);
                          }}
                        />
                      </label>
                    </div>
                    {formData.docSuratPenunjukanVendor && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen: {formData.docSuratPenunjukanVendor}</span>
                      </p>
                    )}
                  </div>

                  {/* APD Relokasi & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">5. APD Relokasi & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={formData.apdRelokasi || 'Belum ada'}
                        onChange={(e) => handleChange('apdRelokasi', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium"
                      >
                        <option value="Ada">Ada / Sudah</option>
                        <option value="Belum ada">Belum Ada</option>
                      </select>
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docApdRelokasi ? 'Ganti File' : 'Upload APD'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleChange('docApdRelokasi', file.name);
                              handleChange('apdRelokasi', 'Ada');
                            }
                          }}
                        />
                      </label>
                    </div>
                    {formData.docApdRelokasi && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen APD: {formData.docApdRelokasi}</span>
                      </p>
                    )}
                  </div>

                  {/* KMZ Relokasi & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">6. KMZ Relokasi & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={formData.kmzRelokasi || 'Belum ada'}
                        onChange={(e) => handleChange('kmzRelokasi', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium"
                      >
                        <option value="Ada">Ada / Sudah</option>
                        <option value="Belum ada">Belum Ada</option>
                      </select>
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docKmzRelokasi ? 'Ganti File' : 'Upload KMZ'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleChange('docKmzRelokasi', file.name);
                              handleChange('kmzRelokasi', 'Ada');
                            }
                          }}
                        />
                      </label>
                    </div>
                    {formData.docKmzRelokasi && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen KMZ: {formData.docKmzRelokasi}</span>
                      </p>
                    )}
                  </div>

                  {/* APD Internal & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">7. APD Internal & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={formData.apdLinknet || 'Not Yet'}
                        onChange={(e) => handleChange('apdLinknet', e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium"
                      >
                        <option value="Release">Release / Done</option>
                        <option value="Request">Request</option>
                        <option value="Not Yet">Not Yet</option>
                      </select>
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docApdInternal ? 'Ganti File' : 'Upload APD Internal'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleChange('docApdInternal', file.name);
                              handleChange('apdLinknet', 'Release');
                            }
                          }}
                        />
                      </label>
                    </div>
                    {formData.docApdInternal && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen APD Internal: {formData.docApdInternal}</span>
                      </p>
                    )}
                  </div>

                  {/* Timeline & Upload */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">8. Timeline & Upload Dokumen</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.timelineRelokasi || ''}
                        onChange={(e) => handleChange('timelineRelokasi', e.target.value)}
                        placeholder="Contoh: 30 Hari Kerja"
                        className="px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium"
                      />
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded border border-sky-200 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>{formData.docTimeline ? 'Ganti File' : 'Upload Timeline'}</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleChange('docTimeline', file.name);
                          }}
                        />
                      </label>
                    </div>
                    {formData.docTimeline && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        <span>Dokumen Timeline: {formData.docTimeline}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tanggal Start, End & Status Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Start Project</label>
                  <input
                    type="date"
                    value={formData.tanggalStartProject || ''}
                    onChange={(e) => handleChange('tanggalStartProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal End Project</label>
                  <input
                    type="date"
                    value={formData.tanggalEndProject || ''}
                    onChange={(e) => handleChange('tanggalEndProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Project</label>
                  <select
                    value={formData.projectStatus || 'Not Started'}
                    onChange={(e) => handleChange('projectStatus', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-bold cursor-pointer bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done (Civil Work)">Done - Civil Work</option>
                    <option value="Done (Pulling)">Done - Pulling Cable</option>
                    <option value="Done (Completed)">Done - Completed</option>
                    <option value="Masih Review Dinas">Masih Review Dinas</option>
                    <option value="Project Cancel">Project Cancel</option>
                  </select>
                </div>
              </div>

              {/* Textarea Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Remarks (Catatan Project)
                </label>
                <textarea
                  rows={3}
                  value={formData.remarksProject || formData.remarks || ''}
                  onChange={(e) => {
                    handleChange('remarksProject', e.target.value);
                    handleChange('remarks', e.target.value);
                  }}
                  placeholder="Masukkan catatan / keterangan tambahan terkait proyek..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CONSTRUCTION & PLAN */}
          {activeFormTab === 2 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800 flex items-center justify-between">
                <span className="font-semibold">Detail Perencanaan & Kontraktor (Sheet 2: Plan Implementasi Project).</span>
              </div>

              {/* Ringkasan & Identitas Plan Implementasi Project */}
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-3 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="flex items-center gap-1.5 text-sky-800">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Identitas Plan Implementasi Project</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal normal-case">
                    Sinkron otomatis dengan Project List & Status Construction
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Segment Relokasi */}
                  <div className="col-span-1 sm:col-span-2 md:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Segment Relokasi
                    </label>
                    <input
                      type="text"
                      value={formData.projectDescription || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => {
                          const autoProjId = (prev.projectId && prev.projectId.trim() !== '')
                            ? prev.projectId
                            : generateNextProjectId(prev.pmoId || 'DSB-ID-0000001');
                          return {
                            ...prev,
                            projectDescription: val,
                            projectId: autoProjId
                          };
                        });
                      }}
                      placeholder="Masukkan Segment Relokasi..."
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-xs"
                    />
                  </div>

                  {/* Area / Kota */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Area / Kota
                    </label>
                    <select
                      value={formData.areaKota || ''}
                      onChange={(e) => handleChange('areaKota', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium bg-white cursor-pointer"
                    >
                      <option value="">-- Pilih Area / Kota --</option>
                      {formData.areaKota && !AREA_KOTA_OPTIONS.includes(formData.areaKota as any) && (
                        <option value={formData.areaKota}>{formData.areaKota}</option>
                      )}
                      {AREA_KOTA_OPTIONS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nama Vendor */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nama Vendor
                    </label>
                    <select
                      value={formData.namaVendor || 'BELUM ADA VENDOR'}
                      onChange={(e) => handleChange('namaVendor', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium uppercase bg-white cursor-pointer"
                    >
                      {formData.namaVendor && !VENDOR_OPTIONS.includes(formData.namaVendor as any) && (
                        <option value={formData.namaVendor}>{formData.namaVendor.toUpperCase()}</option>
                      )}
                      {VENDOR_OPTIONS.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* PIC Govrel */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      PIC Govrel
                    </label>
                    <select
                      value={formData.picSectionHead || ''}
                      onChange={(e) => handleChange('picSectionHead', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium bg-white cursor-pointer"
                    >
                      <option value="">-- Pilih PIC Govrel --</option>
                      {formData.picSectionHead && !PIC_GOVREL_OPTIONS.includes(formData.picSectionHead as any) && (
                        <option value={formData.picSectionHead}>{formData.picSectionHead}</option>
                      )}
                      {PIC_GOVREL_OPTIONS.map((pic) => (
                        <option key={pic} value={pic}>{pic}</option>
                      ))}
                    </select>
                  </div>

                  {/* PIC Internal */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      PIC Internal (Waspang DSB)
                    </label>
                    <select
                      value={formData.waspangDsb || ''}
                      onChange={(e) => handleChange('waspangDsb', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium bg-white cursor-pointer"
                    >
                      <option value="">-- Pilih PIC Internal --</option>
                      {formData.waspangDsb && !WASPANG_DSB_OPTIONS.includes(formData.waspangDsb as any) && (
                        <option value={formData.waspangDsb}>{formData.waspangDsb}</option>
                      )}
                      {WASPANG_DSB_OPTIONS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project - ID (Auto-filled / editable) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Project - ID
                    </label>
                    <input
                      type="text"
                      value={formData.projectId || ''}
                      onChange={(e) => handleChange('projectId', e.target.value)}
                      placeholder="e.g. GOV - FMI - DSB0000001"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-mono font-semibold bg-slate-100 text-slate-800"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Otomatis terisi saat input Segment Relokasi
                    </span>
                  </div>

                  {/* Status Audit */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Status Audit
                    </label>
                    <select
                      value={formData.statusAudit || 'Not Yet'}
                      onChange={(e) => handleChange('statusAudit', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:ring-1 focus:ring-sky-500 font-medium bg-white cursor-pointer"
                    >
                      {STATUS_AUDIT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Panjang Cable FO, Jalur Akses & Galian Sipil */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-amber-600" />
                    <span>Panjang Cable FO, Jalur Akses & Galian Sipil</span>
                  </span>
                  <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Otomatis Terhubung ke Status Construction
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Panjang Cable FO (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.panjangRelokasi !== undefined ? formData.panjangRelokasi : ''}
                      onChange={(e) => handleChange('panjangRelokasi', e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 10000"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Target Meter FO
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Jalur Akses (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.jalurAkses !== undefined ? formData.jalurAkses : ''}
                      onChange={(e) => handleChange('jalurAkses', e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 150"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Jalur Akses dalam Meter
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Panjang Galian Sipil (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.galianPanjangTotal !== undefined ? formData.galianPanjangTotal : ''}
                      onChange={(e) => handleChange('galianPanjangTotal', e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 10000"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Target Meter Galian
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Items: HH, HS, HG (Unit) & Instal Galvanis (Meter) */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                    <span>Rencana HH, HS, HG & Instal Galvanis (Multi-Item)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-sky-700 font-semibold bg-sky-100/60 px-2 py-0.5 rounded">
                    Sheet 2: Plan Implementasi Project
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* 1. HH, HS, HG (Unit) */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <span>HH, HS, HG (Unit)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddHhItem}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded transition-colors cursor-pointer border border-sky-200"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Tambah Item</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                        {(formData.installHhItems && formData.installHhItems.length > 0
                          ? formData.installHhItems
                          : [{ id: '1', type: 'HH', size: '40x60', qty: '' }]
                        ).map((it, idx) => (
                          <div key={it.id || idx} className="p-2 bg-slate-50/90 rounded-md border border-slate-200 space-y-1.5">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tipe</label>
                                <select
                                  value={it.type || 'HH'}
                                  onChange={(e) => handleUpdateHhItem(it.id, 'type', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer"
                                >
                                  {HH_TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ukuran</label>
                                <select
                                  value={it.size || '40x60'}
                                  onChange={(e) => handleUpdateHhItem(it.id, 'size', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer"
                                >
                                  {HH_SIZE_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={it.qty || ''}
                                  onChange={(e) => handleUpdateHhItem(it.id, 'qty', e.target.value ? Number(e.target.value) : '')}
                                  placeholder="Jumlah unit"
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                                />
                              </div>
                              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Unit</span>
                              {(formData.installHhItems || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHhItem(it.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Hapus item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. Instal Galvanis (Meter) */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <span>Instal Galvanis (meter)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddGalvanisItem}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded transition-colors cursor-pointer border border-sky-200"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Tambah Item</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                        {(formData.installGalvanisItems && formData.installGalvanisItems.length > 0
                          ? formData.installGalvanisItems
                          : [{ id: '1', size: '2"', length: '' }]
                        ).map((it, idx) => (
                          <div key={it.id || idx} className="p-2 bg-slate-50/90 rounded-md border border-slate-200 space-y-1.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Ukuran Pipa</label>
                              <select
                                value={it.size || '2"'}
                                onChange={(e) => handleUpdateGalvanisItem(it.id, 'size', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer"
                              >
                                {GALVANIS_OPTIONS.map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={it.length || ''}
                                  onChange={(e) => handleUpdateGalvanisItem(it.id, 'length', e.target.value ? Number(e.target.value) : '')}
                                  placeholder="Panjang meter"
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                                />
                              </div>
                              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Meter</span>
                              {(formData.installGalvanisItems || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalvanisItem(it.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Hapus item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Project Timeline Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Start Project</label>
                    <input
                      type="date"
                      value={formData.tanggalStartProject || ''}
                      onChange={(e) => handleChange('tanggalStartProject', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal End Project</label>
                    <input
                      type="date"
                      value={formData.tanggalEndProject || ''}
                      onChange={(e) => handleChange('tanggalEndProject', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Estimasi Pemutusan</label>
                    <input
                      type="date"
                      value={formData.estimasiPemutusan || ''}
                      onChange={(e) => handleChange('estimasiPemutusan', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pemutusan</label>
                    <input
                      type="date"
                      value={formData.tanggalPemutusan || ''}
                      onChange={(e) => handleChange('tanggalPemutusan', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Remarks (Plan)</label>
                  <textarea
                    rows={2}
                    value={formData.remarksPlan || ''}
                    onChange={(e) => handleChange('remarksPlan', e.target.value)}
                    placeholder="Catatan perencanaan, perizinan, vendor..."
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-xs"
                  />
                </div>
              </div>
            )}

          {/* TAB 4: DOCUMENT PROJECT */}
          {activeFormTab === 4 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800">
                Pengelolaan & Pengungahan Dokumen Proyek (Sheet 5: Document Project - Pengajuan Material, BOQ Labour & CE/BOQ).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pengajuan Project</label>
                  <select
                    value={formData.statusPengajuanProject || 'Not Yet'}
                    onChange={(e) => handleChange('statusPengajuanProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_PENGAJUAN_PROJECT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status PO</label>
                  <select
                    value={formData.statusPengajuanPo || 'Not Yet'}
                    onChange={(e) => handleChange('statusPengajuanPo', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-bold text-slate-800"
                  >
                    {STATUS_PO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Create Date</label>
                  <input
                    type="date"
                    value={formData.projectCreateDate || ''}
                    onChange={(e) => handleChange('projectCreateDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MR Number</label>
                  <input
                    type="text"
                    value={formData.mrNumber || ''}
                    onChange={(e) => handleChange('mrNumber', e.target.value)}
                    placeholder="e.g. 99434"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Dokumen Closing</label>
                  <select
                    value={formData.statusDokumenClosing || 'Not Yet'}
                    onChange={(e) => handleChange('statusDokumenClosing', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_DOKUMEN_CLOSING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document Project Manager Upload Component */}
              <DocumentProjectManager
                project={formData as ProjectData}
                onUpdateProject={(updated) => setFormData(updated)}
              />

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Remarks (Document Project & Closing)</label>
                <textarea
                  rows={2}
                  value={formData.remarksProject || ''}
                  onChange={(e) => handleChange('remarksProject', e.target.value)}
                  placeholder="Catatan berkas dokumen pengajuan, approval, MR/PO..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 3: STATUS CONSTRUCTION */}
          {activeFormTab === 3 && (() => {
            const isDsbIkr = formData.projectCategory === 'DSB - IKR' || formData.projectCategory === 'IKR';
            const isFtthOrIkr = isDsbIkr || formData.projectCategory === 'FTTH';
            return (
              <div className="space-y-4">
                <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800 flex items-center justify-between">
                  <span>Progress Pelaksanaan Fisik & SAP (Sheet 3: Status Construction).</span>
                  {isFtthOrIkr && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                      Kategori {formData.projectCategory} (Spesifikasi {isDsbIkr ? 'IKR' : 'FTTH/IKR'} Aktif)
                    </span>
                  )}
                </div>

                {/* Ringkasan & Form Identitas Status Construction */}
                <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-3 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Atribut Utama (Status Construction)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Segment Relokasi</label>
                      <input
                        type="text"
                        value={formData.projectDescription || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            projectDescription: val,
                            projectId: prev.projectId && prev.projectId.trim() !== ''
                              ? prev.projectId
                              : generateNextProjectId(prev.pmoId || 'DSB-ID-0000001')
                          }));
                        }}
                        placeholder="Masukkan Segment Relokasi..."
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Kota</label>
                      <select
                        value={formData.areaKota || 'Jakarta Pusat'}
                        onChange={(e) => handleChange('areaKota', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                      >
                        {AREA_KOTA_OPTIONS.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Vendor</label>
                      <select
                        value={formData.namaVendor || 'BELUM ADA VENDOR'}
                        onChange={(e) => handleChange('namaVendor', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                      >
                        {VENDOR_OPTIONS.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PIC Govrel</label>
                      <select
                        value={formData.picSectionHead || 'Asmari'}
                        onChange={(e) => handleChange('picSectionHead', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                      >
                        {PIC_GOVREL_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PIC Internal (Waspang DSB)</label>
                      <select
                        value={formData.waspangDsb || 'Alfy'}
                        onChange={(e) => handleChange('waspangDsb', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                      >
                        {WASPANG_DSB_OPTIONS.map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-800">Project - ID</label>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded border border-sky-300">
                          Otomatis Terurut
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.projectId || ''}
                        onChange={(e) => handleChange('projectId', e.target.value)}
                        placeholder="GOV - FMI - DSB0000001"
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Construction</label>
                    <select
                      value={formData.statusConstruction || 'Project Not Started'}
                      onChange={(e) => handleChange('statusConstruction', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                    >
                      <option value="Project Not Started">Project Not Started</option>
                      <option value="Pulling Cable">Pulling Cable</option>
                      <option value="Project Cancel">Project Cancel</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Material</label>
                    <select
                      value={formData.statusMaterial || 'Not Yet'}
                      onChange={(e) => handleChange('statusMaterial', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {STATUS_MATERIAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Pengambilan Material</label>
                    <select
                      value={formData.planPengambilanMaterial || 'Not Yet'}
                      onChange={(e) => handleChange('planPengambilanMaterial', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {PLAN_PENGAMBILAN_MATERIAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Material Location</label>
                    <select
                      value={formData.statusMaterialLocation || 'Not Yet'}
                      onChange={(e) => handleChange('statusMaterialLocation', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {STATUS_MATERIAL_LOCATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Status Pulling FO</label>
                      <span className="text-[10px] font-bold font-mono px-1 py-0.2 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
                        {formData.pullingCableFoProgress || '0%'}
                      </span>
                    </div>
                    <select
                      value={formData.statusPullingCableFo || 'Not Yet'}
                      onChange={(e) => handleChange('statusPullingCableFo', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                    >
                      {STATUS_PULLING_CABLE_FO_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status CO</label>
                    <select
                      value={formData.statusCo || 'Not Yet'}
                      onChange={(e) => handleChange('statusCo', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-semibold text-slate-900"
                    >
                      {STATUS_CO_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

              {/* Dedicated Cut Over (Status CO) Configurator: Cable FO Joint & Phase CO */}
              <div className="bg-teal-50/70 border border-teal-200 rounded-lg p-3.5 space-y-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-teal-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-teal-600 text-white rounded-md shadow-2xs">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <span>Spesifikasi Cut Over (Status CO) - Joint Cable FO & Phase CO Pelaksanaan</span>
                      </h4>
                      <p className="text-[10px] text-teal-800 font-medium">
                        Konfigurasi Cable FO Existing di-joint dengan Cable FO New Jumper serta Tahapan Phase CO di tanggal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-teal-300 text-xs shadow-2xs">
                      <span className="font-semibold text-[11px] text-slate-700">Status Utama CO:</span>
                      <select
                        value={formData.statusCo || 'Not Yet'}
                        onChange={(e) => handleChange('statusCo', e.target.value)}
                        className="font-bold text-teal-950 bg-transparent focus:outline-none cursor-pointer text-xs"
                      >
                        {STATUS_CO_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1. Cable FO Existing dengan option Cable FO di joint dengan Cable FO New Jumper dengan option Cable FO (tambah item) */}
                <div className="bg-white p-3 rounded-lg border border-teal-200 space-y-3 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-teal-100">
                    <div className="flex items-center gap-2">
                      <Cable className="w-4 h-4 text-teal-600" />
                      <label className="text-xs font-bold text-teal-950">
                        Cable FO Existing di-joint dengan Cable FO New Jumper
                      </label>
                      <span className="text-[10px] font-mono font-bold bg-teal-100/80 text-teal-900 px-2 py-0.5 rounded border border-teal-300">
                        Total: {(formData.coCableJointItems || []).length} Item Joint
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCoCableJointItem}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-teal-300 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-700" />
                      <span>Tambah Item Cable FO</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(formData.coCableJointItems || []).map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="p-2.5 bg-slate-50/80 hover:bg-teal-50/40 rounded-lg border border-slate-200 hover:border-teal-300 transition-colors flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
                      >
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-mono font-bold text-[11px] flex items-center justify-center shadow-2xs">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Cable FO Existing */}
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            Cable FO Existing
                          </label>
                          <select
                            value={it.cableExisting || 'Cable 24 FO'}
                            onChange={(e) => handleUpdateCoCableJointItem(it.id, 'cableExisting', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                          >
                            {CABLE_FO_CO_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Connector: di joint dengan */}
                        <div className="flex items-center justify-center shrink-0 md:pt-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300 font-bold text-[10px] shadow-2xs whitespace-nowrap">
                            <GitMerge className="w-3 h-3 text-teal-700 shrink-0" />
                            <span>di joint dengan</span>
                          </span>
                        </div>

                        {/* Cable FO New Jumper */}
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            Cable FO New Jumper
                          </label>
                          <select
                            value={it.cableNewJumper || 'Cable 24 FO'}
                            onChange={(e) => handleUpdateCoCableJointItem(it.id, 'cableNewJumper', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                          >
                            {CABLE_FO_CO_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Action: Hapus baris */}
                        <div className="flex items-center justify-end md:pt-4">
                          {(formData.coCableJointItems || []).length > 1 ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveCoCableJointItem(it.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded transition-colors cursor-pointer"
                              title="Hapus baris joint ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="md:hidden text-[10px]">Hapus</span>
                            </button>
                          ) : (
                            <div className="w-7 md:block hidden" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary / Preview of Cable FO Joints */}
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-teal-900 mb-0.5">
                      Label Ringkasan Joint Cable FO (Otomatis & Tersinkronisasi)
                    </label>
                    <input
                      type="text"
                      value={formData.coCableJointSummary || ''}
                      onChange={(e) => handleChange('coCableJointSummary', e.target.value)}
                      placeholder="e.g. 1. Cable 24 FO di-joint dgn Cable 24 FO; 2. Cable 48 FO di-joint dgn Cable 48 FO"
                      className="w-full px-2.5 py-1.5 text-xs bg-teal-50/50 border border-teal-300 rounded font-semibold text-teal-950 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Phase CO 1 di tanggal (tambah item) */}
                <div className="bg-white p-3 rounded-lg border border-teal-200 space-y-3 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-teal-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <label className="text-xs font-bold text-sky-950">
                        Phase CO di Tanggal Pelaksanaan
                      </label>
                      <span className="text-[10px] font-mono font-bold bg-sky-100/80 text-sky-900 px-2 py-0.5 rounded border border-sky-300">
                        Total: {(formData.coPhaseItems || []).length} Tahapan
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCoPhaseItem}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 hover:text-sky-950 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-sky-300 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-sky-700" />
                      <span>Tambah Item Phase CO</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {(formData.coPhaseItems || []).map((ph, idx) => (
                      <div
                        key={ph.id || idx}
                        className="p-2.5 bg-slate-50/80 hover:bg-sky-50/40 rounded-lg border border-slate-200 hover:border-sky-300 transition-colors flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
                      >
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-mono font-bold text-[11px] flex items-center justify-center shadow-2xs">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Phase Name Input */}
                        <div className="flex-1 min-w-[150px]">
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            Tahap Cut Over
                          </label>
                          <input
                            type="text"
                            value={ph.phaseName || `Phase CO ${idx + 1}`}
                            onChange={(e) => handleUpdateCoPhaseItem(ph.id, 'phaseName', e.target.value)}
                            placeholder="e.g. Phase CO 1"
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
                          />
                        </div>

                        {/* di tanggal label & date picker */}
                        <div className="flex-1 min-w-[180px]">
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            di tanggal
                          </label>
                          <input
                            type="date"
                            value={ph.tanggal || ''}
                            onChange={(e) => handleUpdateCoPhaseItem(ph.id, 'tanggal', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
                          />
                        </div>

                        {/* Status Phase */}
                        <div className="w-full md:w-36 shrink-0">
                          <label className="block text-[11px] font-bold text-slate-800 mb-1">
                            Status Tahap
                          </label>
                          <select
                            value={ph.status || 'In Progress'}
                            onChange={(e) => handleUpdateCoPhaseItem(ph.id, 'status', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
                          >
                            {PHASE_CO_STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {/* Action: Hapus baris */}
                        <div className="flex items-center justify-end md:pt-4">
                          {(formData.coPhaseItems || []).length > 1 ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveCoPhaseItem(ph.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded transition-colors cursor-pointer"
                              title="Hapus tahap ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="md:hidden text-[10px]">Hapus</span>
                            </button>
                          ) : (
                            <div className="w-7 md:block hidden" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary / Preview of Phase CO */}
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-sky-950 mb-0.5">
                      Label Ringkasan Phase CO & Tanggal (Otomatis & Tersinkronisasi)
                    </label>
                    <input
                      type="text"
                      value={formData.coPhaseSummary || ''}
                      onChange={(e) => handleChange('coPhaseSummary', e.target.value)}
                      placeholder="e.g. Phase CO 1 di tgl 2026-03-25, Phase CO 2 di tgl 2026-03-30"
                      className="w-full px-2.5 py-1.5 text-xs bg-sky-50/50 border border-sky-300 rounded font-semibold text-sky-950 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated Pulling Cable FO & Aksesoris Specification Configurator */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Cable className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Spesifikasi Teknis Pulling Cable FO & Aksesoris (Tambah Item & Meter)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                    {formData.ftthIkrSpecProgress || 'Belum dikonfigurasi'}
                  </span>
                </div>

                  {/* Pulling Cable FO (Multi-Item with Cable Options & Meters) */}
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pulling Cable FO (meter)</span>
                        </label>
                        <span className="text-[10px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Total: {(formData.pullingFoItems || []).reduce((acc, curr) => acc + (Number(curr.length) || 0), 0).toLocaleString('id-ID')} m
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200">
                          <span className="font-semibold text-[10px]">Status Utama:</span>
                          <select
                            value={formData.statusPullingCableFo || 'Not Started'}
                            onChange={(e) => handleChange('statusPullingCableFo', e.target.value)}
                            className="px-1 py-0.5 text-[10px] border border-emerald-300 rounded bg-white focus:outline-none cursor-pointer font-medium"
                          >
                            {STATUS_PULLING_CABLE_FO_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPullingFoItem}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition-colors cursor-pointer border border-emerald-300"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah Pilihan Kabel FO</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(formData.pullingFoItems || []).map((it, idx) => (
                        <div key={it.id || idx} className="p-2 bg-slate-50/90 rounded border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                              Tipe Kabel FO #{idx + 1}
                            </label>
                            <select
                              value={it.type || 'Cable 24 FO'}
                              onChange={(e) => handleUpdatePullingFoItem(it.id, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium cursor-pointer"
                            >
                              {PULLING_FO_CABLE_TYPE_OPTIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                              Panjang (Meter)
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={it.length !== undefined ? it.length : ''}
                                onChange={(e) => handleUpdatePullingFoItem(it.id, 'length', e.target.value ? Number(e.target.value) : '')}
                                placeholder="Panjang (m)"
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                              />
                              <span className="text-[10px] text-slate-500 font-medium">m</span>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                              Status
                            </label>
                            <select
                              value={it.status || 'In Progress'}
                              onChange={(e) => handleUpdatePullingFoItem(it.id, 'status', e.target.value)}
                              className="w-full px-1.5 py-1 text-[11px] border border-slate-300 rounded bg-white font-medium cursor-pointer"
                            >
                              <option value="Not Started">Not Started</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>

                          <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                            {(formData.pullingFoItems || []).length > 1 ? (
                              <button
                                type="button"
                                onClick={() => handleRemovePullingFoItem(it.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer rounded hover:bg-rose-50"
                                title="Hapus Kabel FO"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">1</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4 Cards Grid for FAT, FDT, Splicing & Slack Hanger */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. Instal FAT (pcs) */}
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1 border-b border-emerald-100 mb-2">
                          <label className="text-[11px] font-bold text-slate-800">1. Instal FAT (pcs)</label>
                          <button
                            type="button"
                            onClick={handleAddFatItem}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah</span>
                          </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                          {(formData.installFatItems || []).map((it, idx) => (
                            <div key={it.id || idx} className="p-1.5 bg-slate-50/90 rounded border border-slate-200 space-y-1">
                              <select
                                value={it.type || 'FAT 8 Core'}
                                onChange={(e) => handleUpdateFatItem(it.id, 'type', e.target.value)}
                                className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded bg-white font-medium cursor-pointer"
                              >
                                {FAT_TYPE_OPTIONS.map((f) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={it.qty || ''}
                                  onChange={(e) => handleUpdateFatItem(it.id, 'qty', e.target.value ? Number(e.target.value) : '')}
                                  placeholder="Jumlah"
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                                />
                                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Pcs</span>
                                {(formData.installFatItems || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFatItem(it.id)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 2. Install FDT (pcs) */}
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1 border-b border-emerald-100 mb-2">
                          <label className="text-[11px] font-bold text-slate-800">2. Install FDT (pcs)</label>
                          <button
                            type="button"
                            onClick={handleAddFdtItem}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah</span>
                          </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                          {(formData.installFdtItems || []).map((it, idx) => (
                            <div key={it.id || idx} className="p-1.5 bg-slate-50/90 rounded border border-slate-200 space-y-1">
                              <select
                                value={it.type || 'FDT 96 Core'}
                                onChange={(e) => handleUpdateFdtItem(it.id, 'type', e.target.value)}
                                className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded bg-white font-medium cursor-pointer"
                              >
                                {FDT_TYPE_OPTIONS.map((f) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={it.qty || ''}
                                  onChange={(e) => handleUpdateFdtItem(it.id, 'qty', e.target.value ? Number(e.target.value) : '')}
                                  placeholder="Jumlah"
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                                />
                                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Pcs</span>
                                {(formData.installFdtItems || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFdtItem(it.id)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3. Spalcing Cable (Splicing Cable) */}
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1 border-b border-emerald-100 mb-2">
                          <label className="text-[11px] font-bold text-slate-800">3. Spalcing Cable</label>
                          <button
                            type="button"
                            onClick={handleAddSplicingItem}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah</span>
                          </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                          {(formData.splicingCableItems || []).map((it, idx) => (
                            <div key={it.id || idx} className="p-1.5 bg-slate-50/90 rounded border border-slate-200 space-y-1">
                              <select
                                value={it.type || 'Joint Closure 24 Core'}
                                onChange={(e) => handleUpdateSplicingItem(it.id, 'type', e.target.value)}
                                className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded bg-white font-medium cursor-pointer"
                              >
                                {SPLICING_TYPE_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <div className="grid grid-cols-2 gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={it.qty || ''}
                                  onChange={(e) => handleUpdateSplicingItem(it.id, 'qty', e.target.value ? Number(e.target.value) : '')}
                                  placeholder="Core"
                                  className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                                />
                                <select
                                  value={it.status || 'In Progress'}
                                  onChange={(e) => handleUpdateSplicingItem(it.id, 'status', e.target.value)}
                                  className="w-full px-1 py-1 text-[11px] border border-slate-300 rounded bg-white font-medium cursor-pointer"
                                >
                                  {SPLICING_STATUS_OPTIONS.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              </div>
                              {(formData.splicingCableItems || []).length > 1 && (
                                <div className="text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSplicingItem(it.id)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer text-[10px]"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. Instal Slak hanger (pcs) */}
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between pb-1 border-b border-emerald-100 mb-2">
                          <label className="text-[11px] font-bold text-slate-800">4. Instal Slak hanger (pcs)</label>
                          <button
                            type="button"
                            onClick={handleAddSlackHangerItem}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah</span>
                          </button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                          {(formData.installSlackHangerItems || []).map((it, idx) => (
                            <div key={it.id || idx} className="p-1.5 bg-slate-50/90 rounded border border-slate-200 space-y-1">
                              <select
                                value={it.type || 'Standard'}
                                onChange={(e) => handleUpdateSlackHangerItem(it.id, 'type', e.target.value)}
                                className="w-full px-1.5 py-1 text-xs border border-slate-300 rounded bg-white font-medium cursor-pointer"
                              >
                                {SLACK_HANGER_OPTIONS.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={it.qty || ''}
                                  onChange={(e) => handleUpdateSlackHangerItem(it.id, 'qty', e.target.value ? Number(e.target.value) : '')}
                                  placeholder="Jumlah"
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                                />
                                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Pcs</span>
                                {(formData.installSlackHangerItems || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSlackHangerItem(it.id)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-0.5">
                      Label Ringkasan Spesifikasi {isDsbIkr ? 'IKR' : 'FTTH / IKR'} (Otomatis)
                    </label>
                    <input
                      type="text"
                      value={formData.ftthIkrSpecProgress || ''}
                      onChange={(e) => handleChange('ftthIkrSpecProgress', e.target.value)}
                      placeholder="e.g. Pulling FO: 1500m | FAT: 8 Core (4 Pcs) | FDT: 96 Core (1 Pcs) | Splicing: 24 Core (Done) | Slak Hanger: (8 Pcs)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 rounded focus:outline-none font-mono text-emerald-950 font-medium"
                    />
                  </div>
                </div>

              {/* Install HH & Pole Progress Configurator with Multi-Item Selection */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-sky-600" />
                    <span>Spesifikasi Install HH, Pole & Galvanis (Multi-Item & Jumlah)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-sky-700 font-semibold bg-sky-100/60 px-2 py-0.5 rounded">
                    {formData.installHhProgress || 'Belum dikonfigurasi'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* 1. HH, HB, MH (Unit) */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-2">
                        <label className="text-[11px] font-bold text-slate-700">
                          {isDsbIkr ? '1. HG, HM, HS & Tutup (Unit)' : '1. HH, HB, MH (Unit)'}
                        </label>
                        <button
                          type="button"
                          onClick={handleAddHhItem}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah Item</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                        {(formData.installHhItems || []).map((it, idx) => (
                          <div key={it.id || idx} className="p-1.5 bg-slate-50/80 rounded border border-slate-200/80 space-y-1.5">
                            <div className="grid grid-cols-2 gap-1.5">
                              <select
                                value={it.type || (isDsbIkr ? 'HG' : 'HH')}
                                onChange={(e) => handleUpdateHhItem(it.id, 'type', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer"
                              >
                                {getHhTypeOptions(formData.projectCategory).map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                              <select
                                value={it.size || '80x80'}
                                onChange={(e) => handleUpdateHhItem(it.id, 'size', e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer"
                              >
                                {getHhSizeOptions(formData.projectCategory).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={it.qty || ''}
                                onChange={(e) => handleUpdateHhItem(it.id, 'qty', e.target.value ? Number(e.target.value) : '')}
                                placeholder="Jumlah unit"
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                              />
                              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Unit</span>
                              {(formData.installHhItems || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHhItem(it.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Hapus baris ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. Pole (Ea) */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-2">
                        <label className="text-[11px] font-bold text-slate-700">2. Pole / Tiang (Ea)</label>
                        <button
                          type="button"
                          onClick={handleAddPoleItem}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah Item</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                        {(formData.installPoleItems || []).map((it, idx) => (
                          <div key={it.id || idx} className="p-1.5 bg-slate-50/80 rounded border border-slate-200/80 space-y-1.5">
                            <select
                              value={it.type || 'Tiang 8'}
                              onChange={(e) => handleUpdatePoleItem(it.id, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium cursor-pointer"
                            >
                              {POLE_OPTIONS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={it.qty || ''}
                                onChange={(e) => handleUpdatePoleItem(it.id, 'qty', e.target.value ? Number(e.target.value) : '')}
                                placeholder="Jumlah tiang"
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                              />
                              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Ea</span>
                              {(formData.installPoleItems || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePoleItem(it.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Hapus baris ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Galvanis (Meter) */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-2">
                        <label className="text-[11px] font-bold text-slate-700">3. Galvanis (meter)</label>
                        <button
                          type="button"
                          onClick={handleAddGalvanisItem}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Tambah Item</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                        {(formData.installGalvanisItems || []).map((it, idx) => (
                          <div key={it.id || idx} className="p-1.5 bg-slate-50/80 rounded border border-slate-200/80 space-y-1.5">
                            <select
                              value={it.size || '2"'}
                              onChange={(e) => handleUpdateGalvanisItem(it.id, 'size', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer"
                            >
                              {GALVANIS_OPTIONS.map((g) => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={it.length || ''}
                                onChange={(e) => handleUpdateGalvanisItem(it.id, 'length', e.target.value ? Number(e.target.value) : '')}
                                placeholder="Panjang meter"
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                              />
                              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Meter</span>
                              {(formData.installGalvanisItems || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalvanisItem(it.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Hapus baris ini"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Label Ringkasan Install HH (Otomatis)</label>
                    <input
                      type="text"
                      value={formData.installHhProgress || ''}
                      onChange={(e) => handleChange('installHhProgress', e.target.value)}
                      placeholder="e.g. HH 80x80 (12 Unit)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Label Ringkasan Install Pole & Galvanis (Otomatis)</label>
                    <input
                      type="text"
                      value={formData.installPoleProgress || ''}
                      onChange={(e) => handleChange('installPoleProgress', e.target.value)}
                      placeholder="e.g. Tiang 7 (5 Ea), Tiang 8 (10 Ea) | Galv 2 (50m)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Progress Calculators (Galian & Pulling Cable FO) - Symmetrical 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {/* Auto Calculated Galian Sipil Progress */}
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/90 rounded-xl flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-indigo-200/60">
                      <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <span>Galian Sipil (Otomatis)</span>
                      </label>
                      <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-indigo-600 text-white rounded-full shadow-2xs">
                        {formData.galianSipilProgress || '0%'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] font-medium text-slate-600 block mb-1">Meter Selesai</span>
                        <input
                          type="number"
                          min="0"
                          value={formData.galianPanjangSelesai || ''}
                          onChange={(e) => handleChange('galianPanjangSelesai', e.target.value)}
                          placeholder="e.g. 800"
                          className="w-full px-2.5 py-1.5 text-xs border border-indigo-300/80 rounded-lg bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-slate-600 block mb-1">Target Meter</span>
                        <input
                          type="number"
                          min="0"
                          value={formData.galianPanjangTotal || formData.panjangRelokasi || ''}
                          onChange={(e) => handleChange('galianPanjangTotal', e.target.value)}
                          placeholder="e.g. 1000"
                          className="w-full px-2.5 py-1.5 text-xs border border-indigo-300/80 rounded-lg bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-indigo-200/50">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Progres Galian: <strong className="text-indigo-950 font-bold">{formData.galianSipilProgress || '0%'}</strong></span>
                      <span className="font-mono text-[10px] text-indigo-800 font-bold">{formData.galianSipilProgress || '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: formData.galianSipilProgress || '0%' }}
                      />
                    </div>
                    <p className="text-[10px] text-indigo-700/90 leading-tight">
                      Otomatis dari perbandingan meter selesai / target meter galian (atau status konstruksi).
                    </p>
                  </div>
                </div>

                {/* Auto Calculated Pulling Cable FO */}
                <div className="p-3.5 bg-sky-50/70 border border-sky-200/90 rounded-xl flex flex-col justify-between space-y-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-sky-200/60">
                      <label className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                        <span>Pulling Cable FO (Otomatis)</span>
                      </label>
                      <span className="px-2.5 py-0.5 text-xs font-bold font-mono bg-sky-600 text-white rounded-full shadow-2xs">
                        {formData.pullingCableFoProgress || '0%'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] font-medium text-slate-600 block mb-1">Meter Selesai FO</span>
                        <input
                          type="number"
                          min="0"
                          value={formData.pullingFoPanjangSelesai ?? ''}
                          onChange={(e) => handleChange('pullingFoPanjangSelesai', e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full px-2.5 py-1.5 text-xs border border-sky-300/80 rounded-lg bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-slate-600 block mb-1">Target Meter FO</span>
                        <input
                          type="number"
                          min="0"
                          value={formData.pullingFoPanjangTotal ?? formData.panjangRelokasi ?? ''}
                          onChange={(e) => handleChange('pullingFoPanjangTotal', e.target.value)}
                          placeholder="e.g. 1000"
                          className="w-full px-2.5 py-1.5 text-xs border border-sky-300/80 rounded-lg bg-white font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-sky-200/50">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Status FO: <strong className="text-sky-950 font-bold">{formData.statusPullingCableFo || 'Not Yet'}</strong></span>
                      <span className="font-mono text-[10px] text-sky-800 font-bold">{formData.pullingCableFoProgress || '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: formData.pullingCableFoProgress || '0%' }}
                      />
                    </div>
                    <p className="text-[10px] text-sky-700/90 leading-tight">
                      Otomatis dari perbandingan meter selesai / target meter FO (atau status FO).
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Pulling Cable Progress Combined */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-slate-800">Total Pulling Cable Progress (FO)</span>
                  <p className="text-[11px] text-slate-500">
                    Kombinasi otomatis progres FO ({formData.pullingCableFoProgress || '0%'}).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: formData.pullingCableProgress || '0%' }}
                    />
                  </div>
                  <span className="px-3 py-1 text-xs font-bold font-mono bg-emerald-600 text-white rounded-full">
                    {formData.pullingCableProgress || '0%'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Remarks (Construction)</label>
                <textarea
                  rows={2}
                  value={formData.remarksConstruction || ''}
                  onChange={(e) => handleChange('remarksConstruction', e.target.value)}
                  placeholder="Catatan kendala galian, perizinan malam, tim pelaksana..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-xs"
                />
              </div>
            </div>
          );
        })()}

          {/* TAB 5: PROJECT TRACKING PIPELINE */}
          {activeFormTab === 5 && (
            <div className="space-y-4">
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-lg p-3 text-xs text-purple-900">
                Ringkasan pipeline pelacakan menyeluruh. Kolom ini terhubung langsung dengan Sheet 5 (Project Tracking Pipeline).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Project</label>
                  <input
                    type="date"
                    value={formData.tanggalStartProject || ''}
                    onChange={(e) => handleChange('tanggalStartProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Project</label>
                  <input
                    type="date"
                    value={formData.tanggalEndProject || ''}
                    onChange={(e) => handleChange('tanggalEndProject', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Closing SAP</label>
                  <select
                    value={formData.closingSap || 'Not Yet'}
                    onChange={(e) => handleChange('closingSap', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {CLOSING_SAP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pulling Cable Progress</label>
                  <input
                    type="text"
                    value={formData.pullingCableProgress || ''}
                    onChange={(e) => handleChange('pullingCableProgress', e.target.value)}
                    placeholder="e.g. 75%, Selesai"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Galian Sipil Progress</label>
                  <input
                    type="text"
                    value={formData.galianSipilProgress || ''}
                    onChange={(e) => handleChange('galianSipilProgress', e.target.value)}
                    placeholder="e.g. 50%, Menunggu izin"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Catatan Pipeline & Evaluasi (Remarks)</label>
                <textarea
                  rows={2}
                  value={formData.remarksConstruction || ''}
                  onChange={(e) => handleChange('remarksConstruction', e.target.value)}
                  placeholder="Catatan mitigasi risiko, koordinasi antar instansi..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 shadow-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 6: CLOSING PROJECT */}
          {activeFormTab === 6 && (
            <div className="space-y-4">
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-lg p-3 text-xs text-teal-800">
                Informasi penutupan proyek: Praject Date, No. PO, Status Pengajuan, dan kelengkapan berkas closing (BA Opname Material/Labour, ABD Relokasi/Internal & Foto Dokumentasi). Data ini terhubung dengan Sheet 7 (Closing Project).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Praject Date (Tanggal Closing)</label>
                  <input
                    type="date"
                    value={formData.prajectDate || formData.projectCreateDate || ''}
                    onChange={(e) => {
                      handleChange('prajectDate', e.target.value);
                      if (formData.closingProject) {
                        handleChange('closingProject', {
                          ...formData.closingProject,
                          projectDate: e.target.value,
                        });
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. PO (Purchase Order)</label>
                  <input
                    type="text"
                    value={formData.poNumber || ''}
                    onChange={(e) => {
                      handleChange('poNumber', e.target.value);
                      if (formData.closingProject) {
                        handleChange('closingProject', {
                          ...formData.closingProject,
                          poNumber: e.target.value,
                        });
                      }
                    }}
                    placeholder="Contoh: PO-4500098231"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pengajuan</label>
                  <select
                    value={formData.statusPengajuanClosing || formData.closingProject?.statusPengajuan || 'Not Yet'}
                    onChange={(e) => {
                      handleChange('statusPengajuanClosing', e.target.value);
                      if (formData.closingProject) {
                        handleChange('closingProject', {
                          ...formData.closingProject,
                          statusPengajuan: e.target.value,
                        });
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                  >
                    {STATUS_PENGAJUAN_CLOSING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800">
                    Berkas Closing Project (Upload Dokumen Semua Jenis File *.*)
                  </h5>
                  <span className="text-[11px] text-teal-700 font-medium">
                    Foto Dokumentasi Maksimal 4 MB
                  </span>
                </div>

                {closingUploadError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{closingUploadError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. BA Opname Material */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">1. BA Opname Material</label>
                      {formData.baOpnameMaterial && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terpilih
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.baOpnameMaterial || ''}
                        onChange={(e) => handleChange('baOpnameMaterial', e.target.value)}
                        placeholder="Nama berkas BA Opname Material"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                      <label className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded border border-teal-200 cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleClosingFileUpload('baOpnameMaterial', file);
                          }}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Mendukung semua format file (*.*)</span>
                  </div>

                  {/* 2. BA Opname Labour */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">2. BA Opname Labour</label>
                      {formData.baOpnameLabour && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terpilih
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.baOpnameLabour || ''}
                        onChange={(e) => handleChange('baOpnameLabour', e.target.value)}
                        placeholder="Nama berkas BA Opname Labour"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                      <label className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded border border-teal-200 cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleClosingFileUpload('baOpnameLabour', file);
                          }}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Mendukung semua format file (*.*)</span>
                  </div>

                  {/* 3. ABD Relokasi */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">3. ABD Relokasi</label>
                      {formData.closingAbdRelokasi && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terpilih
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.closingAbdRelokasi || ''}
                        onChange={(e) => handleChange('closingAbdRelokasi', e.target.value)}
                        placeholder="Nama berkas ABD Relokasi"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                      <label className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded border border-teal-200 cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleClosingFileUpload('abdRelokasi', file);
                          }}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Mendukung semua format file (*.*)</span>
                  </div>

                  {/* 4. ABD Internal */}
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">4. ABD Internal</label>
                      {formData.closingAbdInternal && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terpilih
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.closingAbdInternal || ''}
                        onChange={(e) => handleChange('closingAbdInternal', e.target.value)}
                        placeholder="Nama berkas ABD Internal"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                      <label className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold rounded border border-teal-200 cursor-pointer transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleClosingFileUpload('abdInternal', file);
                          }}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Mendukung semua format file (*.*)</span>
                  </div>

                  {/* 5. Foto Dokumentasi */}
                  <div className="sm:col-span-2 bg-amber-50/50 p-3 rounded-lg border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-800">5. Foto Dokumentasi</label>
                        <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.2 rounded border border-amber-300">
                          Maksimal 4 MB
                        </span>
                      </div>
                      {formData.fotoDokumentasi && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Terpilih
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.fotoDokumentasi || ''}
                        onChange={(e) => handleChange('fotoDokumentasi', e.target.value)}
                        placeholder="Nama berkas Foto Dokumentasi Lapangan (PNG, JPG, PDF, ZIP)"
                        className="flex-1 px-2.5 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                      />
                      <label className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded cursor-pointer transition-colors shrink-0 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Foto (Maks 4 MB)</span>
                        <input
                          type="file"
                          accept="*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleClosingFileUpload('fotoDokumentasi', file);
                          }}
                        />
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Upload document dengan semua jenis file • Batas ukuran berkas maksimal 4 MB
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Catatan Closing Project (Remarks)</label>
                <textarea
                  rows={2}
                  value={formData.closingRemarks || ''}
                  onChange={(e) => handleChange('closingRemarks', e.target.value)}
                  placeholder="Catatan tambahan mengenai kelengkapan dokumen atau proses invoice..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 font-semibold placeholder:text-slate-900 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Tab Next / Prev Navigator */}
          <div className="flex items-center gap-1.5">
            {activeFormTab > 1 && (
              <button
                type="button"
                onClick={() => setActiveFormTab((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            {activeFormTab < 6 && (
              <button
                type="button"
                onClick={() => setActiveFormTab((prev) => Math.min(6, prev + 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Kembali & Simpan */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kembali / Batal
            </button>

            <button
              type="button"
              onClick={handleValidateAndSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-500 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              {saveSuccessNotice ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
