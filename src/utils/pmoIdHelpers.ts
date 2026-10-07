import { ProjectData } from '../types/project';

export type PmoOption = 'PMO-GOV' | 'PMO-FTTH' | 'PMO-IKR';

export const PMO_OPTIONS: { id: PmoOption; label: string; short: string; category: string; color: string; badgeBg: string; border: string; text: string }[] = [
  {
    id: 'PMO-GOV',
    label: 'PMO - GOV',
    short: 'GOV',
    category: 'GOV IPPJU',
    color: 'sky',
    badgeBg: 'bg-sky-50 text-sky-700',
    border: 'border-sky-300',
    text: 'text-sky-700',
  },
  {
    id: 'PMO-FTTH',
    label: 'PMO - FTTH',
    short: 'FTTH',
    category: 'FTTH',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 text-emerald-700',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
  },
  {
    id: 'PMO-IKR',
    label: 'PMO - IKR',
    short: 'IKR',
    category: 'IKR',
    color: 'purple',
    badgeBg: 'bg-purple-50 text-purple-700',
    border: 'border-purple-300',
    text: 'text-purple-700',
  },
];

/**
 * Detect PMO option type from PMO ID or Project Category
 */
export function getPmoOption(pmoId?: string, category?: string): PmoOption | 'OTHER' {
  const p = (pmoId || '').toUpperCase().trim();
  const c = (category || '').toUpperCase().trim();

  // Match FTTH
  if (p.includes('FTTH') || c.includes('FTTH')) return 'PMO-FTTH';

  // Match IKR
  if (p.includes('IKR') || c.includes('IKR')) return 'PMO-IKR';

  // Match GOV or standard defaults
  if (p.includes('GOV') || c.includes('GOV') || c.includes('SJUT') || c.includes('IPPJU') || c.includes('APJATEL') || c.includes('GOVERMENT')) {
    return 'PMO-GOV';
  }

  if (p.startsWith('PMO-GOV') || p.startsWith('PMO - GOV') || p.startsWith('GOV')) return 'PMO-GOV';
  if (p.startsWith('PMO-FTTH') || p.startsWith('PMO - FTTH') || p.startsWith('FTTH')) return 'PMO-FTTH';
  if (p.startsWith('PMO-IKR') || p.startsWith('PMO - IKR') || p.startsWith('IKR')) return 'PMO-IKR';

  return 'PMO-GOV'; // Default standard
}

/**
 * Rank weight for PMO ID options
 * 1 = PMO-GOV, 2 = PMO-FTTH, 3 = PMO-IKR, 4 = OTHER
 */
export function getPmoOptionRank(pmoId?: string, category?: string): number {
  const opt = getPmoOption(pmoId, category);
  switch (opt) {
    case 'PMO-GOV':
      return 1;
    case 'PMO-FTTH':
      return 2;
    case 'PMO-IKR':
      return 3;
    default:
      return 4;
  }
}

/**
 * Extracts number part from PMO ID for accurate sequential sorting
 */
export function extractPmoNumber(pmoId?: string): number {
  if (!pmoId) return 0;
  const match = pmoId.match(/\d+/g);
  if (!match || match.length === 0) return 0;
  // Use the last continuous number segment in the ID
  const lastNum = match[match.length - 1];
  return parseInt(lastNum, 10) || 0;
}

/**
 * Formats PMO ID cleanly according to user options
 */
export function formatPmoId(option: PmoOption, numOrSuffix: string | number): string {
  const str = String(numOrSuffix).trim();
  if (!str) return option;
  
  // If user already typed full ID like PMO-GOV-863
  if (str.toUpperCase().startsWith('PMO')) {
    return str;
  }
  
  // If user typed only a number like 863 or 001
  const num = parseInt(str.replace(/\D/g, ''), 10);
  if (!isNaN(num) && num > 0) {
    const padded = num < 100 ? String(num).padStart(3, '0') : String(num);
    return `${option}-${padded}`;
  }
  
  return `${option}-${str}`;
}

/**
 * Generates next sequential PMO ID based on existing projects
 */
export function generateNextPmoId(projects: ProjectData[], option: PmoOption): string {
  const matchingProjects = projects.filter((p) => getPmoOption(p.pmoId, p.projectCategory) === option);
  let maxNum = 0;
  matchingProjects.forEach((p) => {
    const num = extractPmoNumber(p.pmoId);
    if (num > maxNum) maxNum = num;
  });

  const nextNum = maxNum + 1;
  const padded = nextNum < 100 ? String(nextNum).padStart(3, '0') : String(nextNum);
  return `${option}-${padded}`;
}

/**
 * Master Comparator: Automatically sorts projects by PMO-ID option:
 * 1. PMO-GOV (and its numbers)
 * 2. PMO-FTTH (and its numbers)
 * 3. PMO-IKR (and its numbers)
 */
export function compareProjectsByPmoId(a: ProjectData, b: ProjectData): number {
  const rankA = getPmoOptionRank(a.pmoId, a.projectCategory);
  const rankB = getPmoOptionRank(b.pmoId, b.projectCategory);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  const numA = extractPmoNumber(a.pmoId);
  const numB = extractPmoNumber(b.pmoId);

  if (numA !== numB) {
    return numA - numB;
  }

  return (a.pmoId || '').localeCompare(b.pmoId || '', 'id-ID', { numeric: true });
}

/**
 * Sorts array of projects automatically based on PMO-ID options
 */
export function sortProjectsByPmoOption(projects: ProjectData[]): ProjectData[] {
  return [...projects].sort(compareProjectsByPmoId);
}
