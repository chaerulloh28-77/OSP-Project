import { ProjectData } from '../types/project';

export type PmoOption = 'GOV-ID' | 'DSB-IKR' | 'PMO-GOV' | 'PMO-IKR';

export const PMO_OPTIONS: { id: PmoOption; label: string; short: string; category: string; color: string; badgeBg: string; border: string; text: string }[] = [
  {
    id: 'GOV-ID',
    label: 'GOV - ID',
    short: 'GOV',
    category: 'GOV IPPJU',
    color: 'sky',
    badgeBg: 'bg-sky-50 text-sky-700',
    border: 'border-sky-300',
    text: 'text-sky-700',
  },
  {
    id: 'DSB-IKR',
    label: 'DSB - IKR',
    short: 'DSB-IKR',
    category: 'DSB - IKR',
    color: 'purple',
    badgeBg: 'bg-purple-50 text-purple-700',
    border: 'border-purple-300',
    text: 'text-purple-700',
  },
];

/**
 * Detect PMO / DSB option type from DSB ID or Project Category
 */
export function getPmoOption(pmoId?: string, category?: string): PmoOption | 'OTHER' {
  const p = (pmoId || '').toUpperCase().trim();
  const c = (category || '').toUpperCase().trim();

  // Match DSB - IKR
  if (p.includes('IKR') || c.includes('IKR')) return 'DSB-IKR';

  // Match GOV or standard defaults
  return 'GOV-ID';
}

/**
 * Rank weight for DSB ID options
 * 1 = GOV-ID, 2 = DSB-IKR
 */
export function getPmoOptionRank(pmoId?: string, category?: string): number {
  const opt = getPmoOption(pmoId, category);
  switch (opt) {
    case 'GOV-ID':
    case 'PMO-GOV':
      return 1;
    case 'DSB-IKR':
    case 'PMO-IKR':
      return 2;
    default:
      return 3;
  }
}

/**
 * Extracts number part from DSB/PMO ID for accurate sequential sorting
 */
export function extractPmoNumber(pmoId?: string): number {
  if (!pmoId) return 0;
  const match = pmoId.match(/\d+/g);
  if (!match || match.length === 0) return 0;
  const lastNum = match[match.length - 1];
  return parseInt(lastNum, 10) || 0;
}

/**
 * Generates Project ID based on category and sequential number:
 * - GOV - ID (GOV IPPJU, GOV APJATEL, GOV SJUT): GOV - FMI - DSBxxxxxxx
 * - DSB - IKR (DSB - IKR): DSB - IKRxxxxxxx
 */
export function generateNextProjectId(category: string, num: number): string {
  const padded = String(num).padStart(7, '0');
  if (category === 'DSB - IKR') {
    return `DSB - IKR${padded}`;
  }
  return `GOV - FMI - DSB${padded}`;
}

/**
 * Formats DSB ID cleanly according to user options
 */
export function formatPmoId(option: PmoOption, numOrSuffix: string | number): string {
  const str = String(numOrSuffix).trim();
  if (!str) return option;
  
  if (str.toUpperCase().startsWith('GOV') || str.toUpperCase().startsWith('DSB') || str.toUpperCase().startsWith('PMO')) {
    return str;
  }
  
  const num = parseInt(str.replace(/\D/g, ''), 10);
  if (!isNaN(num) && num > 0) {
    const padded = num < 100 ? String(num).padStart(3, '0') : String(num);
    const prefix = option === 'DSB-IKR' ? 'DSB-IKR' : 'GOV-ID';
    return `${prefix}-${padded}`;
  }
  
  return `${option}-${str}`;
}

/**
 * Generates next sequential DSB ID based on existing projects
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
  const prefix = option === 'DSB-IKR' ? 'DSB-IKR' : 'GOV-ID';
  return `${prefix}-${padded}`;
}

/**
 * Master Comparator: Automatically sorts projects by DSB-ID option:
 * 1. GOV-ID (and its numbers)
 * 2. DSB-IKR (and its numbers)
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
 * Sorts array of projects automatically based on DSB-ID options
 */
export function sortProjectsByPmoOption(projects: ProjectData[]): ProjectData[] {
  return [...projects].sort(compareProjectsByPmoId);
}

/**
 * Ensures projectDescription starts with the correct required prefix:
 * - GOV - ID: [GOV-FMI_DSB]
 * - DSB - IKR: [DSB-IKR]
 */
export function ensureProjectDescriptionPrefix(desc: string = '', category?: string): string {
  const cat = (category || '').toUpperCase().trim();
  const isDsbIkr = cat === 'DSB - IKR' || cat.includes('IKR');
  
  const targetPrefix = isDsbIkr ? '[DSB-IKR]' : '[GOV-FMI_DSB]';
  const alternatePrefix = isDsbIkr ? '[GOV-FMI_DSB]' : '[DSB-IKR]';

  let current = desc.trim();

  // If empty, return target prefix with a trailing space
  if (!current) {
    return `${targetPrefix} `;
  }

  // If already starts with the correct target prefix
  if (current.startsWith(targetPrefix)) {
    return desc;
  }

  // If starts with alternate prefix, replace it
  if (current.startsWith(alternatePrefix)) {
    const rest = current.substring(alternatePrefix.length).trimStart();
    return rest ? `${targetPrefix} ${rest}` : `${targetPrefix} `;
  }

  // If no prefix attached yet, prepend target prefix
  return `${targetPrefix} ${current}`;
}
