export interface HhInstallItem {
  id: string;
  itemType: string; // HH, HS, HG or custom (Handhole, Handhole Small, Handhole Galvanis)
  specSize?: string; // 80x80, 90x90, 100x100, 110x110, 120x120
  installedQty: number; // Jumlah Unit terinstal
  planQty: number; // Target / Plan Unit
}

export type MandorProjectStatus = 'Not Yet' | 'In Progress' | 'Done';

export interface DailyMandorReport {
  id: string;
  date: string; // YYYY-MM-DD
  mandorName: string; // Mandor Danil, Mandor Joko, Mandor Ari, Mandor Yudi, Mandor Suprianto, custom
  segmentRelokasi: string; // Description / Segment Relokasi
  areaKota: string; // Area / Kota
  statusProject: MandorProjectStatus; // Not Yet, In Progress, Done
  teamName: string; // e.g. Team 1, Team Alpha
  manPowerCount: number; // Jumlah person dalam 1 team
  vendorName: string; // Vendor name
  
  // Install HH, Pole & Galvanis (Multi-Item & Jumlah)
  hhInstallItems: HhInstallItem[];
  
  // Jalur Akses & Sub-Kategori Progress Galian Harian (m)
  targetMeter: number; // Target Meter
  meterSelesai: number; // Meter selesai
  galianAlur?: number;
  jalurAkses?: number;
  galianCrossingJalan?: number;
  galianCrossingJembatan?: number;
  galianCrossingSungai?: number;
  galianCrossingTol?: number;
  
  remarks: string; // Remarks / Catatan Harian
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_MANDORS = [
  'Mandor Danil',
  'Mandor Joko',
  'Mandor Ari',
  'Mandor Yudi',
  'Mandor Suprianto',
] as const;

export function calculateHhSummary(items: HhInstallItem[]) {
  if (!items || items.length === 0) {
    return {
      summaryLabel: 'Belum ada item HH/HS/HG',
      totalInstalled: 0,
      totalPlan: 0,
    };
  }

  let totalInstalled = 0;
  let totalPlan = 0;
  const parts: string[] = [];

  items.forEach((item) => {
    const inst = Number(item.installedQty) || 0;
    const plan = Number(item.planQty) || 0;
    totalInstalled += inst;
    totalPlan += plan;

    const label = item.specSize ? `${item.itemType} (${item.specSize})` : item.itemType;
    parts.push(`${label}: ${inst}/${plan} Unit`);
  });

  return {
    summaryLabel: parts.join(' | '),
    totalInstalled,
    totalPlan,
  };
}

export function calculateJalurAkses(targetMeter: number, meterSelesai: number) {
  const target = Number(targetMeter) || 0;
  const selesai = Number(meterSelesai) || 0;
  const belumSelesai = Math.max(0, target - selesai);
  const percentage = target > 0 ? Math.min(100, Math.round((selesai / target) * 100)) : 0;

  return {
    targetMeter: target,
    meterSelesai: selesai,
    meterBelumSelesai: belumSelesai,
    percentage,
    summaryText: target > 0 
      ? `${selesai.toLocaleString()}m Selesai / ${belumSelesai.toLocaleString()}m Belum Selesai (Target ${target.toLocaleString()}m - ${percentage}%)`
      : 'Target meter belum ditentukan',
  };
}
