import { ProjectData } from '../types/project';

/**
 * Helper utility functions for Dashboard Overview & 5-Dimension Pie Chart Inspections
 */

// Helper to get formatted Galvanis installation summary (2", 4", 6")
export function getGalvanisSummary(p: ProjectData): string {
  if (p.installGalvanisItems && p.installGalvanisItems.length > 0) {
    const parts = p.installGalvanisItems
      .filter((g) => Number(g.length || 0) > 0)
      .map((g) => `${g.size}: ${g.length}m`);
    if (parts.length > 0) return parts.join(', ');
  }
  if (p.installGalvanisSize) {
    return `${p.installGalvanisSize}${p.installGalvanisLength ? ` (${p.installGalvanisLength}m)` : ''}`;
  }
  return '2": 0m, 4": 0m, 6": 0m';
}

// Helper to get formatted Handhole (HH) installation summary (40x60, HS 60x60, HG 80x80)
export function getHhSummary(p: ProjectData): string {
  if (p.installHhItems && p.installHhItems.length > 0) {
    const parts = p.installHhItems
      .filter((h) => Number(h.qty || 0) > 0)
      .map((h) => `${h.type || 'HH'} ${h.size}: ${h.qty} unit`);
    if (parts.length > 0) return parts.join(', ');
  }
  if (p.installHhSize || p.installHhType) {
    return `${p.installHhType || 'HH'} ${p.installHhSize || '60x60'} (${p.installHhQty || 1} unit)`;
  }
  if (p.installHhProgress && p.installHhProgress !== '0%' && p.installHhProgress !== 'Not Yet') {
    return `HH Progress: ${p.installHhProgress}`;
  }
  return 'HH 40x60: 0, HS 60x60: 0, HG 80x80: 0';
}

// Helper to get Tutup HH installation summary
export function getTutupHhSummary(p: ProjectData): string {
  const hh = getHhSummary(p);
  if (hh.includes('unit') || hh.includes('Progress')) {
    return `Tutup ${hh}`;
  }
  return 'Tutup HH 40x60: 0, 60x60: 0, 80x80: 0';
}

// Helper to format Pulling Cable Start date
export function getPullingStartDate(p: ProjectData): string {
  if (p.tanggalStartProject && p.tanggalStartProject !== '-') return p.tanggalStartProject;
  if (p.dateSuratPerintahRelokasi && p.dateSuratPerintahRelokasi !== '-') return p.dateSuratPerintahRelokasi;
  return '-';
}

// Helper to format Pulling Cable End date
export function getPullingEndDate(p: ProjectData): string {
  if (p.tanggalEndProject && p.tanggalEndProject !== '-') return p.tanggalEndProject;
  if (p.tanggalPemutusan && p.tanggalPemutusan !== '-') return p.tanggalPemutusan;
  return '-';
}

// Helper for Ready to CO status
export function getReadyToCoStatus(p: ProjectData): string {
  if (p.statusCo && p.statusCo !== 'N/A') return p.statusCo;
  if (p.statusConstruction === 'Completed') return 'Ready CO';
  if (p.pullingCableFoProgress === '100%') return 'Ready CO';
  return 'Not Ready';
}

// Helper for Phase CO status
export function getPhaseCoStatus(p: ProjectData): string {
  if (p.statusCo && p.statusCo.includes('Phase')) return p.statusCo;
  if (p.statusCo === 'Done') return 'Phase CO 2 (Final)';
  if (p.statusCo === 'In Progress') return 'Phase CO 1 (Initial)';
  return 'Phase 0 (Pre-CO)';
}

// Helper for ABD status
export function getAbdStatus(p: ProjectData): string {
  if (p.apdRelokasi && p.apdRelokasi !== '-') return p.apdRelokasi;
  if (p.apdLinknet && p.apdLinknet !== '-') return p.apdLinknet;
  if (p.apdLn && p.apdLn !== '-') return p.apdLn;
  return 'Belum ABD';
}

// Helper for BAST status
export function getBastStatus(p: ProjectData): string {
  if (p.baSurvey && p.baSurvey !== '-') return p.baSurvey;
  if (p.laporanOpname && p.laporanOpname !== '-') return p.laporanOpname;
  return 'Belum BAST';
}

// Helper for TECO Done status
export function getTecoDoneStatus(p: ProjectData): string {
  if (p.closingSap === 'Yes' || p.closingSap === 'Done' || p.closingSap === 'TECO Done') return 'TECO Selesai';
  if (p.statusDokumenClosing === 'Completed') return 'TECO Selesai';
  return 'Belum TECO';
}

// Helper for Invoice status
export function getInvoiceStatus(p: ProjectData): string {
  if (p.sphBoq && p.sphBoq !== '-') return p.sphBoq;
  if (p.remarksProject && p.remarksProject.toLowerCase().includes('invoice')) return p.remarksProject;
  if (p.statusDokumenClosing === 'Completed') return 'Invoice Issued';
  return 'Pending Invoice';
}
