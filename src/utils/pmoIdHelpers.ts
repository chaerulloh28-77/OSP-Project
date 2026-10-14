import { ProjectData } from '../types/project';

export type PmoOption = 'DSB-ID';

export const PMO_OPTIONS: { id: PmoOption; label: string; short: string; category: string; color: string; badgeBg: string; border: string; text: string }[] = [
  {
    id: 'DSB-ID',
    label: 'DSB - ID',
    short: 'DSB',
    category: 'GOV IPPJU',
    color: 'sky',
    badgeBg: 'bg-sky-50 text-sky-700',
    border: 'border-sky-300',
    text: 'text-sky-700',
  },
];

/**
 * Detect PMO / DSB option type
 */
export function getPmoOption(_pmoId?: string, _category?: string): PmoOption {
  return 'DSB-ID';
}

/**
 * Rank weight for DSB ID options
 */
export function getPmoOptionRank(_pmoId?: string, _category?: string): number {
  return 1;
}

/**
 * Extracts number part from DSB ID or Project ID for accurate sequential sorting
 * Handles formats like: "DSB-001", "DSB-0000001", "GOV - FMI - DSB0000001", "GOV0000001", "DSB - ID - GOV0000001"
 */
export function extractPmoNumber(pmoId?: string): number {
  if (!pmoId) return 0;
  const str = String(pmoId).trim();
  if (!str) return 0;

  // 1. First priority: match digits immediately following DSB or GOV
  // e.g. "DSB-001", "DSB0000001", "GOV-001", "GOV0000001", "DSB - ID - GOV0000001"
  const dsbMatch = str.match(/DSB\s*[-_]?\s*(\d+)/i);
  if (dsbMatch && dsbMatch[1]) {
    const val = parseInt(dsbMatch[1], 10);
    if (!isNaN(val)) return val;
  }

  const govMatch = str.match(/GOV\s*[-_]?\s*(\d+)/i);
  if (govMatch && govMatch[1]) {
    const val = parseInt(govMatch[1], 10);
    if (!isNaN(val)) return val;
  }

  // 2. Second priority: look at all digit blocks in the string
  const allDigitBlocks = str.match(/\d+/g);
  if (!allDigitBlocks || allDigitBlocks.length === 0) return 0;

  // Filter out 4-digit year numbers (2020-2039) if there are other digit blocks
  const nonYearBlocks = allDigitBlocks.filter(b => {
    const v = parseInt(b, 10);
    return !(b.length === 4 && v >= 2020 && v <= 2039);
  });

  const blocksToUse = nonYearBlocks.length > 0 ? nonYearBlocks : allDigitBlocks;

  let chosen = 0;
  for (const block of blocksToUse) {
    const val = parseInt(block, 10);
    if (!isNaN(val) && val > 0) {
      chosen = val;
    }
  }

  return chosen;
}

/**
 * Generates Project ID based on DSB - ID input:
 * Example: DSB-001 -> GOV - FMI - DSB0000001
 * Example: DSB-015 -> GOV - FMI - DSB0000015
 * Example: 1 -> GOV - FMI - DSB0000001
 */
export function generateNextProjectId(pmoIdOrCategory: string, numInput?: number): string {
  let num = numInput;
  if (num === undefined || num === 0) {
    num = extractPmoNumber(pmoIdOrCategory);
  }

  if (num && num > 0) {
    const padded = String(num).padStart(7, '0');
    return `GOV - FMI - DSB${padded}`;
  }

  const clean = pmoIdOrCategory ? pmoIdOrCategory.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  if (clean) {
    return `GOV - FMI - ${clean}`;
  }

  return 'GOV - FMI - DSB0000001';
}

/**
 * Formats DSB ID cleanly (e.g. 1 -> DSB - ID0000001, 15 -> DSB - ID0000015, "DSB-1" -> "DSB - ID0000001")
 */
export function formatPmoId(_option: PmoOption, numOrSuffix: string | number): string {
  const str = String(numOrSuffix).trim();
  if (!str) return 'DSB - ID0000001';

  const numPart = extractPmoNumber(str);
  if (numPart > 0) {
    const padded = String(numPart).padStart(7, '0');
    if (/DSB\s*-\s*ID\s*-\s*/i.test(str)) {
      return `DSB - ID - GOV${padded}`;
    }
    if (/DSB\s*-\s*ID/i.test(str)) {
      return `DSB - ID${padded}`;
    }
    return `DSB - ID${padded}`;
  }

  if (str.toUpperCase().startsWith('DSB-') || str.toUpperCase().startsWith('DSB -')) {
    return str.toUpperCase();
  }

  return `DSB - ID${str}`;
}

/**
 * Generates next sequential DSB ID based on existing projects (e.g., DSB - ID0000001, DSB - ID0000002)
 */
export function generateNextPmoId(projects: ProjectData[] = []): string {
  let maxNum = 0;
  projects.forEach((p) => {
    const numPmo = extractPmoNumber(p.pmoId);
    const numProj = extractPmoNumber(p.projectId);
    const highest = Math.max(numPmo, numProj);
    if (highest > maxNum) maxNum = highest;
  });

  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(7, '0');
  return `DSB - ID${padded}`;
}

/**
 * Master Comparator: Automatically sorts projects by DSB-ID sequentially (DSB-001, DSB-002, etc.)
 */
export function compareProjectsByPmoId(a: ProjectData, b: ProjectData): number {
  const numA = Math.max(extractPmoNumber(a.pmoId), extractPmoNumber(a.projectId));
  const numB = Math.max(extractPmoNumber(b.pmoId), extractPmoNumber(b.projectId));

  if (numA !== numB) {
    return numA - numB;
  }

  return (a.pmoId || '').localeCompare(b.pmoId || '', 'id-ID', { numeric: true });
}

/**
 * Sorts array of projects automatically based on DSB-ID
 */
export function sortProjectsByPmoOption(projects: ProjectData[]): ProjectData[] {
  return [...projects].sort(compareProjectsByPmoId);
}

/**
 * Returns project description / segment relokasi as clean string
 */
export function ensureProjectDescriptionPrefix(desc: string = '', _category?: string): string {
  return desc ? desc.trim() : '';
}

