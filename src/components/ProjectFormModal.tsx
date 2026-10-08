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
  Cable
} from 'lucide-react';
import { 
  ProjectData, 
  HhItem, 
  PoleItem, 
  GalvanisItem,
  PullingFoItem,
  FatItem,
  FdtItem,
  SlackHangerItem,
  SplicingItem
} from '../types/project';
import { getPriorityMeta } from './PriorityBadge';
import { 
  PMO_OPTIONS, 
  getPmoOption, 
  PmoOption, 
  generateNextProjectId, 
  generateNextPmoId, 
  extractPmoNumber,
  ensureProjectDescriptionPrefix
} from '../utils/pmoIdHelpers';
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
  STATUS_PENGAJUAN_PROJECT_OPTIONS,
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

/**
 * Helper to calculate the next sequential PMO-ID based on existing projects.
 * Scans all PMO-IDs (e.g. PMO-GOV-001, PMO-GOV-862) to find the highest number,
 * then returns the next number in sequence (e.g. 863 -> PMO-GOV-863).
 */
export function getNextPmoIdInfo(projects: ProjectData[] = [], category = 'GOV IPPJU') {
  let maxPmoNumber = 0;
  for (const p of projects) {
    if (p.pmoId) {
      const match = p.pmoId.match(/\d+/g);
      if (match && match.length > 0) {
        const num = parseInt(match[match.length - 1], 10);
        if (!isNaN(num) && num > maxPmoNumber) {
          maxPmoNumber = num;
        }
      }
    }
  }

  const nextNumber = maxPmoNumber > 0 ? maxPmoNumber + 1 : (projects.length + 1);
  const pmoNumberStr = String(nextNumber).padStart(3, '0');
  const isIkr = category === 'DSB - IKR';
  const pmoId = isIkr ? `DSB-IKR-${pmoNumberStr}` : `GOV-ID-${pmoNumberStr}`;
  const projectId = generateNextProjectId(category, nextNumber);
  return {
    nextNumber,
    pmoNumberStr,
    pmoId,
    projectId,
    rawPmoId: pmoId
  };
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

  // Initialize or reset form data when opened
  useEffect(() => {
    if (isOpen) {
      setActiveFormTab(1);
      setErrors({});
      setSaveSuccessNotice(false);

      if (initialData) {
        const hhItems: HhItem[] = (initialData.installHhItems && initialData.installHhItems.length > 0)
          ? initialData.installHhItems
          : [{
              id: '1',
              type: initialData.installHhType || 'HH',
              size: initialData.installHhSize || '80x80',
              qty: initialData.installHhQty ?? ''
            }];

        const poleItems: PoleItem[] = (initialData.installPoleItems && initialData.installPoleItems.length > 0)
          ? initialData.installPoleItems
          : [{
              id: '1',
              type: initialData.installPoleType || 'Tiang 8',
              qty: initialData.installPoleQty ?? ''
            }];

        const galvItems: GalvanisItem[] = (initialData.installGalvanisItems && initialData.installGalvanisItems.length > 0)
          ? initialData.installGalvanisItems
          : [{
              id: '1',
              size: initialData.installGalvanisSize || '2"',
              length: initialData.installGalvanisLength ?? ''
            }];

        const pullingFoItems: PullingFoItem[] = (initialData.pullingFoItems && initialData.pullingFoItems.length > 0)
          ? initialData.pullingFoItems
          : [{
              id: '1',
              type: initialData.pullingFoType || 'Cable FO 24Core Loose Tube, Single Mode',
              length: initialData.pullingFoMeter ?? initialData.pullingFoPanjangTotal ?? initialData.panjangRelokasi ?? '',
              status: initialData.statusPullingCableFo || 'In Progress'
            }];

        const fatItems: FatItem[] = (initialData.installFatItems && initialData.installFatItems.length > 0)
          ? initialData.installFatItems
          : [{
              id: '1',
              type: initialData.installFatType || 'FAT 8 Core',
              qty: initialData.installFatQty ?? ''
            }];

        const fdtItems: FdtItem[] = (initialData.installFdtItems && initialData.installFdtItems.length > 0)
          ? initialData.installFdtItems
          : [{
              id: '1',
              type: initialData.installFdtType || 'FDT 96 Core',
              qty: initialData.installFdtQty ?? ''
            }];

        const slackItems: SlackHangerItem[] = (initialData.installSlackHangerItems && initialData.installSlackHangerItems.length > 0)
          ? initialData.installSlackHangerItems
          : [{
              id: '1',
              type: initialData.installSlackHangerType || 'Standard',
              qty: initialData.installSlackHangerQty ?? ''
            }];

        const splicingItems: SplicingItem[] = (initialData.splicingCableItems && initialData.splicingCableItems.length > 0)
          ? initialData.splicingCableItems
          : [{
              id: '1',
              type: 'Joint Closure 24 Core',
              qty: initialData.splicingCableQty ?? '',
              status: initialData.splicingCableStatus || 'Not Started'
            }];

        const pullingFoMeterVal = initialData.pullingFoMeter ?? initialData.pullingFoPanjangTotal ?? initialData.panjangRelokasi ?? '';

        setFormData({
          ...initialData,
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
        });
      } else {
        // Generate new project default template with automatic DSB-ID sequence
        const nextNo = (existingProjects?.length || totalProjects) + 1;
        const initialCategory = 'GOV IPPJU';
        const nextPmo = getNextPmoIdInfo(existingProjects || [], initialCategory);

        const defaultHh: HhItem[] = [{ id: '1', type: 'HH', size: '80x80', qty: '' }];
        const defaultPole: PoleItem[] = [{ id: '1', type: 'Tiang 8', qty: '' }];
        const defaultGalv: GalvanisItem[] = [{ id: '1', size: '2"', length: '' }];
        const defaultPullingFo: PullingFoItem[] = [{ id: '1', type: 'Cable FO 24Core Loose Tube, Single Mode', length: '', status: 'In Progress' }];
        const defaultFat: FatItem[] = [{ id: '1', type: 'FAT 8 Core', qty: '' }];
        const defaultFdt: FdtItem[] = [{ id: '1', type: 'FDT 96 Core', qty: '' }];
        const defaultSlack: SlackHangerItem[] = [{ id: '1', type: 'Standard', qty: '' }];
        const defaultSplicing: SplicingItem[] = [{ id: '1', type: 'Joint Closure 24 Core', qty: '', status: 'Not Started' }];

        setFormData({
          id: `proj-${Date.now()}`,
          no: nextNo,
          pmoId: nextPmo.pmoId,
          projectCategory: initialCategory,
          projectId: nextPmo.projectId,
          projectDescription: ensureProjectDescriptionPrefix('', initialCategory),
          zona: '',
          areaKota: 'Jakarta Pusat',
          projectStatus: 'Masih Review Dinas',
          priority: 'Normal',
          quarter: 'Q1-26',
          picSectionHead: 'Asmari',
          waspangDsb: 'Abdul Ra\'uf',
          namaVendor: 'BELUM ADA VENDOR',
          dateSuratPerintahRelokasi: '',
          bulan: '',
          tahun: '',
          panjangRelokasi: 0,
          apdRelokasi: '',
          kmzRelokasi: '',
          statusAudit: '',
          apdLinknet: '',
          statusSurvey: '',
          baSurvey: '',
          sphBoq: '',
          tanggalStartProject: '',
          tanggalEndProject: '',
          estimasiPemutusan: '',
          tanggalPemutusan: '',
          remarksPlan: '',
          statusPengajuanProject: '',
          projectCreateDate: '',
          mrNumber: '',
          planPengambilanMaterial: '',
          statusMaterialLocation: '',
          statusDokumenClosing: '',
          remarksProject: '',
          statusConstruction: 'Project Not Started',
          statusMaterial: 'Not Yet',
          statusPullingCableFo: 'Not Yet',
          pullingCableFoProgress: '0%',
          statusCo: 'Not Yet',
          laporanOpname: 'Not Yet',
          closingSap: 'Not Yet',
          projectSapId: '',
          kebutuhanMaterialPoSap: '',
          galianSipilProgress: '0%',
          galianAksesProgress: '',
          galianCrossingProgress: '',
          installHhProgress: '',
          installHhType: 'HH',
          installHhSize: '80x80',
          installHhQty: '',
          installHhItems: defaultHh,
          installPoleType: 'Tiang 8',
          installPoleQty: '',
          installPoleItems: defaultPole,
          installGalvanisSize: '2"',
          installGalvanisLength: '',
          installGalvanisItems: defaultGalv,
          pullingFoItems: defaultPullingFo,
          pullingFoMeter: '',
          pullingFoType: 'Cable FO 24Core Loose Tube, Single Mode',
          installFatQty: '',
          installFatType: 'FAT 8 Core',
          installFatItems: defaultFat,
          installFdtQty: '',
          installFdtType: 'FDT 96 Core',
          installFdtItems: defaultFdt,
          installSlackHangerQty: '',
          installSlackHangerType: 'Standard',
          installSlackHangerItems: defaultSlack,
          splicingCableQty: '',
          splicingCableStatus: 'Not Started',
          splicingCableItems: defaultSplicing,
          ftthIkrSpecProgress: '',
          installPoleProgress: '',
          galianPanjangSelesai: 0,
          galianPanjangTotal: 0,
          pullingPanjangSelesai: 0,
          pullingPanjangTotal: 0,
          pullingCableProgress: '0%',
          remarksConstruction: '',
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
      type: 'Cable FO 24Core Loose Tube, Single Mode',
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
      pullingFoType: newItems[0]?.type || 'Cable FO 24Core Loose Tube, Single Mode',
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
      pullingFoType: newItems[0]?.type || 'Cable FO 24Core Loose Tube, Single Mode',
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
      pullingFoType: newItems[0]?.type || 'Cable FO 24Core Loose Tube, Single Mode',
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
    if (!formData.projectDescription?.trim()) {
      newErrors.projectDescription = 'Deskripsi Project wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveFormTab(1); // Jump to tab 1 where core errors are
      return;
    }

    const payload: ProjectData = {
      ...(formData as ProjectData),
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {initialData ? `Edit Project: ${initialData.pmoId}` : 'Tambah Project Baru'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sistem 5 Tab Sheet Terintegrasi · Simpan otomatis ke database
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
        <div className="flex border-b border-slate-200 bg-slate-100/90 px-6 pt-2.5 overflow-x-auto scrollbar-none gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveFormTab(1)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 1
                ? 'bg-white text-sky-700 border-sky-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-sky-600" />
            <span>1. Tab Project List</span>
            {errors.pmoId || errors.projectDescription ? (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(2)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 2
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Tab Construction & Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(3)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 3
                ? 'bg-white text-amber-700 border-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Tab Status Project</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(4)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 4
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <HardHat className="w-3.5 h-3.5 text-emerald-600" />
            <span>4. Tab Status Construction</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFormTab(5)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeFormTab === 5
                ? 'bg-white text-purple-700 border-purple-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5 text-purple-600" />
            <span>5. Tab Tracking Pipeline</span>
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
                    <label className="text-xs font-semibold text-slate-700">
                      DSB - ID <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      Otomatis Terurut
                    </span>
                  </div>

                  {/* Quick DSB - ID Option Selector (GOV - ID, DSB - IKR) */}
                  <div className="flex items-center gap-1 mb-1.5">
                    {PMO_OPTIONS.map((opt) => {
                      const currentPmoOpt = getPmoOption(formData.pmoId, formData.projectCategory);
                      const isSelected = currentPmoOpt === opt.id;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            const curId = formData.pmoId || '';
                            const num = extractPmoNumber(curId) || formData.no || 1;
                            const padded = String(num).padStart(3, '0');
                            const newPmoId = `${opt.id}-${padded}`;
                            
                            handleChange('pmoId', newPmoId);
                            if (opt.id === 'DSB-IKR') {
                              handleChange('projectCategory', 'DSB - IKR');
                              handleChange('projectId', generateNextProjectId('DSB - IKR', num));
                              handleChange('projectDescription', ensureProjectDescriptionPrefix(formData.projectDescription, 'DSB - IKR'));
                              handleChange('projectSapId', 'DSB - IKR');
                            } else {
                              const targetCat = (formData.projectCategory === 'DSB - IKR' || !formData.projectCategory) ? 'GOV IPPJU' : formData.projectCategory;
                              handleChange('projectCategory', targetCat);
                              handleChange('projectId', generateNextProjectId(targetCat, num));
                              handleChange('projectDescription', ensureProjectDescriptionPrefix(formData.projectDescription, targetCat));
                              handleChange('projectSapId', 'GOV - ID');
                            }
                          }}
                          className={`flex-1 py-1 px-1.5 text-[10px] font-mono font-bold rounded border transition-all cursor-pointer text-center ${
                            isSelected
                              ? opt.id === 'DSB-IKR'
                                ? 'bg-purple-600 text-white border-purple-600 shadow-2xs ring-1 ring-purple-400'
                                : 'bg-sky-600 text-white border-sky-600 shadow-2xs ring-1 ring-sky-400'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={formData.pmoId || ''}
                    onChange={(e) => {
                      handleChange('pmoId', e.target.value);
                      const detected = getPmoOption(e.target.value);
                      if (detected === 'DSB-IKR' && formData.projectCategory !== 'DSB - IKR') {
                        handleChange('projectCategory', 'DSB - IKR');
                      }
                    }}
                    placeholder="e.g. GOV-ID-001, DSB-IKR-001"
                    className={`w-full px-3 py-1.5 text-xs rounded-md border font-mono font-medium ${
                      errors.pmoId ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                    } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                  />
                  {errors.pmoId && <p className="text-[11px] text-rose-500 mt-0.5">{errors.pmoId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Category</label>
                  <select
                    value={formData.projectCategory || 'GOV IPPJU'}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      handleChange('projectCategory', newCat);

                      const curPmo = formData.pmoId || '';
                      const num = extractPmoNumber(curPmo) || formData.no || 1;
                      const padded = String(num).padStart(3, '0');

                      if (newCat === 'DSB - IKR') {
                        if (formData.projectStatus === 'Review Dinas' || formData.projectStatus === 'Masih Review Dinas') {
                          handleChange('projectStatus', 'Project Not Started');
                        }
                        handleChange('pmoId', `DSB-IKR-${padded}`);
                        handleChange('projectId', generateNextProjectId('DSB - IKR', num));
                        handleChange('projectDescription', ensureProjectDescriptionPrefix(formData.projectDescription, 'DSB - IKR'));
                        handleChange('projectSapId', 'DSB - IKR');
                      } else {
                        // GOV Categories
                        handleChange('pmoId', `GOV-ID-${padded}`);
                        handleChange('projectId', generateNextProjectId(newCat, num));
                        handleChange('projectDescription', ensureProjectDescriptionPrefix(formData.projectDescription, newCat));
                        handleChange('projectSapId', 'GOV - ID');
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    {PROJECT_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project ID</label>
                  <input
                    type="text"
                    value={formData.projectId || ''}
                    onChange={(e) => handleChange('projectId', e.target.value)}
                    placeholder="e.g. GOV - FMI - DSB0000001, DSB - IKR0000001"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formData.projectCategory === 'DSB - IKR' ? 'Format: DSB - IKRxxxxxxx' : 'Format: GOV - FMI - DSBxxxxxxx'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.projectDescription || ''}
                  onChange={(e) => handleChange('projectDescription', e.target.value)}
                  placeholder={formData.projectCategory === 'DSB - IKR' ? 'e.g. [DSB-IKR] Cluster Ampera Raya' : 'e.g. [GOV-FMI_DSB] IPPJU Ampera Raya'}
                  className={`w-full px-3 py-1.5 text-xs rounded-md border ${
                    errors.projectDescription ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  } focus:outline-none focus:ring-1 focus:ring-sky-500`}
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Otomatis diawali <span className="font-mono font-semibold text-sky-700">{formData.projectCategory === 'DSB - IKR' ? '[DSB-IKR]' : '[GOV-FMI_DSB]'}</span>
                </p>
                {errors.projectDescription && (
                  <p className="text-[11px] text-rose-500 mt-0.5">{errors.projectDescription}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                    Waspang DSB
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
            </div>
          )}

          {/* TAB 2: CONSTRUCTION & PLAN */}
          {activeFormTab === 2 && (() => {
            const isDsbIkr = formData.projectCategory === 'DSB - IKR' || formData.projectCategory === 'IKR';
            const isFtthOrIkr = isDsbIkr || formData.projectCategory === 'FTTH';
            return (
              <div className="space-y-4">
                <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800 flex items-center justify-between">
                  <span className="font-semibold">Detail Perencanaan & Kontraktor (Sheet 2: Construction & Plan).</span>
                  {isFtthOrIkr && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                      Mode {formData.projectCategory} ({isDsbIkr ? 'Surat Kesepakatan Kerja' : 'Tanggal PO'} & Tanpa Pemutusan)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isDsbIkr ? 'Nama Pelaksana' : 'Nama Vendor'}
                    </label>
                    {isDsbIkr ? (
                      <input
                        type="text"
                        value={formData.namaVendor || ''}
                        onChange={(e) => handleChange('namaVendor', e.target.value)}
                        placeholder="e.g. Bpk. Wahyu / PT. Pelaksana"
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                      />
                    ) : (
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
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isDsbIkr ? 'Tanggal Surat Kesepakatan Kerja' : (isFtthOrIkr ? 'Tanggal PO' : 'Date Surat Perintah Relokasi')}
                    </label>
                    <input
                      type="date"
                      value={formData.dateSuratPerintahRelokasi || ''}
                      onChange={(e) => handleChange('dateSuratPerintahRelokasi', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan</label>
                    <select
                      value={formData.bulan || 'November'}
                      onChange={(e) => handleChange('bulan', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    >
                      {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun</label>
                    <select
                      value={formData.tahun || '2024'}
                      onChange={(e) => handleChange('tahun', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono cursor-pointer"
                    >
                      {TAHUN_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Panjang Cable FO & Galian Sipil */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-amber-600" />
                      <span>Panjang Cable FO & Galian Sipil</span>
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Otomatis Terhubung ke Tab Status Construction
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                        Target Meter FO (Pulling Cable FO)
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
                        Target Meter (Galian Sipil)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isDsbIkr ? 'APD Segment' : (isFtthOrIkr ? 'APD' : 'APD Relokasi')}
                    </label>
                    <select
                      value={formData.apdRelokasi || 'Belum ada'}
                      onChange={(e) => handleChange('apdRelokasi', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {getApdOptions(formData.projectCategory).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isDsbIkr ? 'KMZ Segment' : (isFtthOrIkr ? 'KMZ' : 'KMZ Relokasi')}
                    </label>
                    <select
                      value={formData.kmzRelokasi || 'Belum ada'}
                      onChange={(e) => handleChange('kmzRelokasi', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {getKmzOptions(formData.projectCategory).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Audit</label>
                    <select
                      value={formData.statusAudit || 'Not Yet'}
                      onChange={(e) => handleChange('statusAudit', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {STATUS_AUDIT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Survey, BA Survey & SPH/BOQ (APD Internal removed if FTTH / IKR) */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFtthOrIkr ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-3.5`}>
                  {!isFtthOrIkr && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">APD Internal</label>
                      <select
                        value={formData.apdLinknet || 'Not Yet'}
                        onChange={(e) => handleChange('apdLinknet', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                      >
                        {APD_LINKNET_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Survey</label>
                    <select
                      value={formData.statusSurvey || 'Not Yet'}
                      onChange={(e) => handleChange('statusSurvey', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {STATUS_SURVEY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">BA Survey</label>
                    <select
                      value={formData.baSurvey || 'Not Yet'}
                      onChange={(e) => handleChange('baSurvey', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {BA_SURVEY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SPH / BOQ</label>
                    <select
                      value={formData.sphBoq || 'Not Yet'}
                      onChange={(e) => handleChange('sphBoq', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                    >
                      {SPH_BOQ_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Project Timeline Dates */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFtthOrIkr ? 'md:grid-cols-2' : 'md:grid-cols-4'} gap-3.5`}>
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

                  {!isFtthOrIkr && (
                    <>
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
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Plan)</label>
                  <textarea
                    rows={2}
                    value={formData.remarksPlan || ''}
                    onChange={(e) => handleChange('remarksPlan', e.target.value)}
                    placeholder="Catatan perencanaan, perizinan, vendor..."
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            );
          })()}

          {/* TAB 3: STATUS PROJECT */}
          {activeFormTab === 3 && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800">
                Pengajuan Project, MR/PO, dan Closing Dokumen (Sheet 3: Status Project).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Pengambilan Material</label>
                  <select
                    value={formData.planPengambilanMaterial || 'Not Yet'}
                    onChange={(e) => handleChange('planPengambilanMaterial', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
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
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_MATERIAL_LOCATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Project & Closing)</label>
                <textarea
                  rows={2}
                  value={formData.remarksProject || ''}
                  onChange={(e) => handleChange('remarksProject', e.target.value)}
                  placeholder="Catatan pengajuan project, MR/PO, approval..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: STATUS CONSTRUCTION */}
          {activeFormTab === 4 && (() => {
            const isDsbIkr = formData.projectCategory === 'DSB - IKR' || formData.projectCategory === 'IKR';
            const isFtthOrIkr = isDsbIkr || formData.projectCategory === 'FTTH';
            return (
              <div className="space-y-4">
                <div className="bg-sky-50/70 border border-sky-200/80 rounded-lg p-3 text-xs text-sky-800 flex items-center justify-between">
                  <span>Progress Pelaksanaan Fisik & SAP (Sheet 4: Status Construction).</span>
                  {isFtthOrIkr && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                      Kategori {formData.projectCategory} (Spesifikasi {isDsbIkr ? 'IKR' : 'FTTH/IKR'} Aktif)
                    </span>
                  )}
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Construction</label>
                  <select
                    value={formData.statusConstruction || 'Project Not Started'}
                    onChange={(e) => handleChange('statusConstruction', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Status Pulling FO</label>
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
                      FO: {formData.pullingCableFoProgress || '0%'}
                    </span>
                  </div>
                  <select
                    value={formData.statusPullingCableFo || 'Not Yet'}
                    onChange={(e) => handleChange('statusPullingCableFo', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
                  >
                    {STATUS_PULLING_CABLE_FO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status CO</label>
                  <select
                    value={formData.statusCo || 'Not Yet'}
                    onChange={(e) => handleChange('statusCo', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {STATUS_CO_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Laporan Opname</label>
                  <select
                    value={formData.laporanOpname || 'Not Yet'}
                    onChange={(e) => handleChange('laporanOpname', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                  >
                    {LAPORAN_OPNAME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isDsbIkr ? 'DSB - IKR' : (formData.projectCategory?.startsWith('GOV') || formData.pmoId?.startsWith('GOV')) ? 'GOV - ID' : 'Project SAP ID / GOV - ID'}
                  </label>
                  <input
                    type="text"
                    value={formData.projectSapId || ((formData.projectCategory?.startsWith('GOV') || formData.pmoId?.startsWith('GOV')) ? 'GOV - ID' : isDsbIkr ? 'DSB - IKR' : '')}
                    onChange={(e) => handleChange('projectSapId', e.target.value)}
                    placeholder={isDsbIkr ? 'DSB-IKR-001' : 'GOV-ID-001'}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-medium"
                  />
                </div>
              </div>

              {/* FTTH & IKR Dedicated Specification Configurator */}
              {isFtthOrIkr && (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                    <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Cable className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Spesifikasi Teknis FTTH / IKR (Pulling FO, FAT, FDT, Spalcing & Slak Hanger)</span>
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
                              value={it.type || 'Cable FO 24Core Loose Tube, Single Mode'}
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
              )}

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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Construction)</label>
                <textarea
                  rows={2}
                  value={formData.remarksConstruction || ''}
                  onChange={(e) => handleChange('remarksConstruction', e.target.value)}
                  placeholder="Catatan kendala galian, perizinan malam, tim pelaksana..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Pipeline & Evaluasi</label>
                <textarea
                  rows={2}
                  value={formData.remarksConstruction || ''}
                  onChange={(e) => handleChange('remarksConstruction', e.target.value)}
                  placeholder="Catatan mitigasi risiko, koordinasi antar instansi..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                <span>Tab Sebelumnya</span>
              </button>
            )}

            {activeFormTab < 5 && (
              <button
                type="button"
                onClick={() => setActiveFormTab((prev) => Math.min(5, prev + 1))}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Tab Selanjutnya</span>
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
