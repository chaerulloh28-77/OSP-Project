import { 
  DailyMandorReport, 
  DEFAULT_MANDORS, 
  HhInstallItem 
} from '../types/mandor';

const MANDOR_LIST_KEY = 'OSP_MANDOR_LIST_V1';
const MANDOR_REPORTS_KEY = 'OSP_MANDOR_REPORTS_V1';

type MandorChangeListener = () => void;
const listeners: Set<MandorChangeListener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying mandor listener:', e);
    }
  });
}

// Initial realistic sample data
const INITIAL_DAILY_REPORTS: DailyMandorReport[] = [
  {
    id: 'dm-001',
    date: new Date().toISOString().split('T')[0],
    mandorName: 'Mandor Danil',
    segmentRelokasi: 'Relokasi FO Segmen Jl. Sudirman - Semanggi Subseksi A',
    areaKota: 'Jakarta Selatan',
    statusProject: 'In Progress',
    teamName: 'Tim Sinar Jaya 1',
    manPowerCount: 8,
    vendorName: 'PT. ARKOM',
    hhInstallItems: [
      { id: 'hh-1', itemType: 'HH', specSize: '100x100', installedQty: 4, planQty: 6 },
      { id: 'hh-2', itemType: 'HS', specSize: '80x80', installedQty: 2, planQty: 2 },
      { id: 'hh-3', itemType: 'HG', specSize: 'Galvanis 2"', installedQty: 1, planQty: 2 },
    ],
    targetMeter: 1200,
    meterSelesai: 850,
    remarks: 'Pengerjaan galian sipil HH berjalan lancar, kendala kemacetan lalulintas jam sibuk sore hari.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dm-002',
    date: new Date().toISOString().split('T')[0],
    mandorName: 'Mandor Joko',
    segmentRelokasi: 'Penarikan Kabel FO Segment Gatot Subroto - Kuningan',
    areaKota: 'Jakarta Selatan',
    statusProject: 'In Progress',
    teamName: 'Tim Mandiri Utomo 2',
    manPowerCount: 10,
    vendorName: 'PT. RPA',
    hhInstallItems: [
      { id: 'hh-4', itemType: 'HH', specSize: '110x110', installedQty: 5, planQty: 5 },
      { id: 'hh-5', itemType: 'HS', specSize: '90x90', installedQty: 3, planQty: 4 },
    ],
    targetMeter: 1500,
    meterSelesai: 1100,
    remarks: 'Instalasi HH selesai 100% untuk titik S1-S5. Lanjut persiapan penarikan kabel besok.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dm-003',
    date: new Date().toISOString().split('T')[0],
    mandorName: 'Mandor Ari',
    segmentRelokasi: 'Relokasi FO Terpadu Dinas Bina Marga Pasar Minggu',
    areaKota: 'Jakarta Selatan',
    statusProject: 'Done',
    teamName: 'Tim Citra Perkasa',
    manPowerCount: 6,
    vendorName: 'PT. NETCO',
    hhInstallItems: [
      { id: 'hh-6', itemType: 'HH', specSize: '80x80', installedQty: 3, planQty: 3 },
      { id: 'hh-7', itemType: 'HG', specSize: 'Galvanis 4"', installedQty: 2, planQty: 2 },
    ],
    targetMeter: 800,
    meterSelesai: 800,
    remarks: 'Pekerjaan selesai penuh. Serah terima lokasi bersama Waspang DSB & Waslap Dinas.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dm-004',
    date: new Date().toISOString().split('T')[0],
    mandorName: 'Mandor Yudi',
    segmentRelokasi: 'Pemasangan HH & Crossing FO Tambun Bekasi Sub-Segmen 3',
    areaKota: 'Bekasi',
    statusProject: 'In Progress',
    teamName: 'Tim Bekasi Perkasa',
    manPowerCount: 7,
    vendorName: 'PT. CAESAR',
    hhInstallItems: [
      { id: 'hh-8', itemType: 'HH', specSize: '120x120', installedQty: 2, planQty: 4 },
      { id: 'hh-9', itemType: 'HS', specSize: '80x80', installedQty: 4, planQty: 6 },
    ],
    targetMeter: 1000,
    meterSelesai: 620,
    remarks: 'Izin crossing jalan kabupaten telah didapatkan, proses cor beton casing HH selesai.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dm-005',
    date: new Date().toISOString().split('T')[0],
    mandorName: 'Mandor Suprianto',
    segmentRelokasi: 'Relokasi FO APJATEL Tomang - Grogol Jakarta Barat',
    areaKota: 'Jakarta Barat',
    statusProject: 'Not Yet',
    teamName: 'Tim Barat Mandiri',
    manPowerCount: 5,
    vendorName: 'PT. LISMA',
    hhInstallItems: [
      { id: 'hh-10', itemType: 'HH', specSize: '100x100', installedQty: 0, planQty: 5 },
      { id: 'hh-11', itemType: 'HS', specSize: '80x80', installedQty: 0, planQty: 3 },
    ],
    targetMeter: 900,
    meterSelesai: 0,
    remarks: 'Menunggu drop material Handhole & Pipa Galvanis dari gudang utama.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mandorStorageService = {
  // Load list of mandors
  getMandors(): string[] {
    if (typeof window === 'undefined') return [...DEFAULT_MANDORS];
    try {
      const stored = localStorage.getItem(MANDOR_LIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed reading mandor list from local storage:', e);
    }
    // Default fallback
    this.saveMandors([...DEFAULT_MANDORS]);
    return [...DEFAULT_MANDORS];
  },

  // Save mandor list
  saveMandors(mandors: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MANDOR_LIST_KEY, JSON.stringify(mandors));
      window.dispatchEvent(new CustomEvent('mandor-storage-updated'));
      notifyListeners();
    } catch (e) {
      console.error('Failed saving mandor list:', e);
    }
  },

  // Add a new mandor dynamically
  addMandor(newMandorName: string): string[] {
    const trimmed = newMandorName.trim();
    if (!trimmed) return this.getMandors();
    const current = this.getMandors();
    if (!current.includes(trimmed)) {
      const updated = [...current, trimmed];
      this.saveMandors(updated);
      return updated;
    }
    return current;
  },

  // Delete a mandor dynamically
  deleteMandor(mandorName: string): string[] {
    const current = this.getMandors();
    const updated = current.filter((m) => m !== mandorName);
    this.saveMandors(updated);
    return updated;
  },

  // Get daily reports
  getReports(): DailyMandorReport[] {
    if (typeof window === 'undefined') return INITIAL_DAILY_REPORTS;
    try {
      const stored = localStorage.getItem(MANDOR_REPORTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed reading daily mandor reports:', e);
    }
    // Initialize with default reports
    this.saveReports(INITIAL_DAILY_REPORTS);
    return INITIAL_DAILY_REPORTS;
  },

  // Save reports
  saveReports(reports: DailyMandorReport[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MANDOR_REPORTS_KEY, JSON.stringify(reports));
      window.dispatchEvent(new CustomEvent('mandor-storage-updated'));
      notifyListeners();
    } catch (e) {
      console.error('Failed saving daily mandor reports:', e);
    }
  },

  // Add report
  addReport(reportData: Omit<DailyMandorReport, 'id' | 'createdAt' | 'updatedAt'>): DailyMandorReport {
    const reports = this.getReports();
    const now = new Date().toISOString();
    const newReport: DailyMandorReport = {
      ...reportData,
      id: `dm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };

    // Auto-ensure mandor is in mandor list
    if (reportData.mandorName) {
      this.addMandor(reportData.mandorName);
    }

    const updated = [newReport, ...reports];
    this.saveReports(updated);
    return newReport;
  },

  // Update report
  updateReport(id: string, updatedFields: Partial<DailyMandorReport>): DailyMandorReport | null {
    const reports = this.getReports();
    let updatedReport: DailyMandorReport | null = null;
    const updated = reports.map((r) => {
      if (r.id === id) {
        updatedReport = {
          ...r,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
        return updatedReport;
      }
      return r;
    });

    if (updatedReport) {
      this.saveReports(updated);
    }
    return updatedReport;
  },

  // Delete report
  deleteReport(id: string): void {
    const reports = this.getReports();
    const updated = reports.filter((r) => r.id !== id);
    this.saveReports(updated);
  },

  // Real-time synchronization listener
  subscribe(callback: MandorChangeListener): () => void {
    listeners.add(callback);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === MANDOR_REPORTS_KEY || e.key === MANDOR_LIST_KEY) {
        callback();
      }
    };

    const handleCustomEvent = () => {
      callback();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('mandor-storage-updated', handleCustomEvent);
    }

    return () => {
      listeners.delete(callback);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('mandor-storage-updated', handleCustomEvent);
      }
    };
  },
};
