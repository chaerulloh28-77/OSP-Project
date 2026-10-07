/**
 * Service for Managing Project Document Uploads & Storage
 * Handles PDF, KMZ, KML, Excel files with base64/blob storage,
 * fast memory cache, and pure local persistence without quota exceptions.
 * Includes Excel and CSV export for document completeness checklist.
 */

import { 
  DocumentTypeKey, 
  ProjectDocumentRecord, 
  UploadedFileMeta, 
  DOCUMENT_SLOTS, 
  getDocumentSlots 
} from '../types/document';
import { ProjectData } from '../types/project';
import * as XLSX from 'xlsx';

const DOCS_STORAGE_KEY = 'PMO_PROJECT_DOCUMENTS_V2';

class DocumentStorageService {
  private cache: Map<string, ProjectDocumentRecord> = new Map();
  private fileDataMap: Map<string, string> = new Map(); // In-memory dataUrl store
  private isLoaded = false;

  private getProjectKeys(project: { pmoId?: string; id?: string }): string[] {
    const keys: string[] = [];
    if (project.pmoId && project.pmoId.trim()) keys.push(project.pmoId.trim());
    if (project.id && project.id.trim() && !keys.includes(project.id.trim())) {
      keys.push(project.id.trim());
    }
    return keys.length > 0 ? keys : ['default_project'];
  }

  private findRecordInCache(project: { pmoId?: string; id?: string }): ProjectDocumentRecord | undefined {
    const keys = this.getProjectKeys(project);
    for (const k of keys) {
      const rec = this.cache.get(k);
      if (rec) return rec;
    }
    return undefined;
  }

  private saveRecordInCache(project: { pmoId?: string; id?: string }, record: ProjectDocumentRecord): void {
    const keys = this.getProjectKeys(project);
    for (const k of keys) {
      this.cache.set(k, record);
    }
  }

  private loadFromStorage(): Map<string, ProjectDocumentRecord> {
    if (this.isLoaded) return this.cache;

    try {
      if (typeof window === 'undefined') return this.cache;
      
      const raw = localStorage.getItem(DOCS_STORAGE_KEY);
      if (raw) {
        const parsed: Record<string, ProjectDocumentRecord> = JSON.parse(raw);
        Object.entries(parsed).forEach(([key, record]) => {
          this.cache.set(key, record);
          if (record.pmoId) this.cache.set(record.pmoId, record);
          if (record.projectId) this.cache.set(record.projectId, record);
        });
      }
      this.isLoaded = true;
    } catch (e) {
      console.warn('Gagal memuat dokumen dari localStorage:', e);
    }

    return this.cache;
  }

  private persist(): void {
    try {
      if (typeof window === 'undefined') return;
      const serializable: Record<string, ProjectDocumentRecord> = {};
      const savedProjectIds = new Set<string>();

      this.cache.forEach((rec) => {
        const uniqueKey = rec.pmoId || rec.projectId || 'proj';
        if (!savedProjectIds.has(uniqueKey)) {
          savedProjectIds.add(uniqueKey);
          // Strip large base64 dataUrl before saving to localStorage to prevent quota exhaustion
          const strippedDocs: Record<string, UploadedFileMeta> = {};
          Object.entries(rec.documents).forEach(([slot, fileMeta]) => {
            if (fileMeta) {
              const { dataUrl: _omitted, ...safeMeta } = fileMeta;
              strippedDocs[slot] = safeMeta;
            }
          });

          serializable[uniqueKey] = {
            ...rec,
            documents: strippedDocs,
          };
        }
      });

      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.warn('Gagal menyimpan cache dokumen ke localStorage:', e);
    }
  }

  // Get or initialize record for project
  public getDocumentRecord(projectOrId: ProjectData | { id?: string; pmoId?: string; projectId?: string; projectDescription?: string } | string): ProjectDocumentRecord {
    this.loadFromStorage();
    const project = typeof projectOrId === 'string'
      ? { id: projectOrId, pmoId: projectOrId, projectId: projectOrId, projectDescription: '' }
      : projectOrId;

    const existing = this.findRecordInCache(project);

    if (existing) {
      // Re-link memory dataUrls if available
      Object.keys(existing.documents).forEach((slotKey) => {
        const k = slotKey as DocumentTypeKey;
        const file = existing.documents[k];
        if (file && !file.dataUrl) {
          const memKey = `${project.pmoId || project.id}_${k}`;
          const inMem = this.fileDataMap.get(memKey);
          if (inMem) file.dataUrl = inMem;
        }
      });
      return existing;
    }

    const newRecord: ProjectDocumentRecord = {
      projectId: project.id || '',
      pmoId: project.pmoId || project.id || '',
      projectDescription: project.projectDescription || '',
      sapProjectId: project.projectId || '',
      documents: {},
      updatedAt: new Date().toISOString(),
    };

    this.saveRecordInCache(project, newRecord);
    return newRecord;
  }

  // Clear all uploaded documents for a project
  public clearAllDocuments(project: ProjectData): boolean {
    this.loadFromStorage();
    const record = this.findRecordInCache(project);
    if (!record) return false;

    const pmoKey = project.pmoId || project.id;
    const slots = getDocumentSlots(project.projectCategory);
    slots.forEach((slot) => {
      this.fileDataMap.delete(`${pmoKey}_${slot.key}`);
    });

    record.documents = {};
    record.updatedAt = new Date().toISOString();
    this.saveRecordInCache(project, record);
    this.persist();
    return true;
  }

  // Trigger browser download for an uploaded file
  public downloadDocument(fileMeta: UploadedFileMeta): void {
    if (!fileMeta.dataUrl) {
      alert('File data tidak ditemukan untuk diunduh.');
      return;
    }
    const link = document.createElement('a');
    link.href = fileMeta.dataUrl;
    link.download = fileMeta.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Calculate high-level stats across all projects
  public getDocumentStats(projects: ProjectData[]) {
    this.loadFromStorage();
    let completeProjects = 0;
    let incompleteProjects = 0;
    let zeroProjects = 0;
    let totalUploadedDocs = 0;
    let maxDocsPossible = 0;

    projects.forEach((p) => {
      const { uploaded, total } = this.getUploadedCount(p);
      totalUploadedDocs += uploaded;
      maxDocsPossible += total;
      if (uploaded === total && total > 0) {
        completeProjects++;
      } else if (uploaded === 0) {
        zeroProjects++;
      } else {
        incompleteProjects++;
      }
    });

    const overallCompletenessPct = maxDocsPossible > 0 
      ? Math.round((totalUploadedDocs / maxDocsPossible) * 100) 
      : 0;

    return {
      totalProjects: projects.length,
      completeProjects,
      completedProjects: completeProjects,
      incompleteProjects,
      partiallyUploadedProjects: incompleteProjects,
      zeroProjects,
      zeroDocsProjects: zeroProjects,
      totalUploadedDocs,
      overallCompletenessPct,
    };
  }

  // Alias for backward compatibility
  public exportDocumentChecklist(projects: ProjectData[]): void {
    this.exportDocumentReportToCsv(projects);
  }

  // Save an uploaded document for a specific slot
  public saveDocument(
    project: ProjectData,
    slotKey: DocumentTypeKey,
    fileMeta: UploadedFileMeta
  ): ProjectDocumentRecord {
    this.loadFromStorage();
    const record = this.getDocumentRecord(project);

    // Save in memory store
    const pmoKey = project.pmoId || project.id;
    if (fileMeta.dataUrl) {
      this.fileDataMap.set(`${pmoKey}_${slotKey}`, fileMeta.dataUrl);
    }

    record.documents[slotKey] = {
      ...fileMeta,
      uploadedAt: fileMeta.uploadedAt || new Date().toISOString(),
    };
    record.updatedAt = new Date().toISOString();

    this.saveRecordInCache(project, record);
    this.persist();
    return record;
  }

  // Upload file asynchronously with progress simulation/feedback
  public async uploadDocument(
    project: ProjectData,
    slotKey: DocumentTypeKey,
    file: File,
    onProgress?: (progress: number, stage: string) => void
  ): Promise<{ success: boolean; meta?: UploadedFileMeta; error?: string }> {
    return new Promise((resolve) => {
      try {
        if (onProgress) onProgress(30, 'Membaca berkas...');
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          if (onProgress) onProgress(80, 'Menyimpan berkas...');
          const meta: UploadedFileMeta = {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            uploadedAt: new Date().toISOString(),
            dataUrl,
          };
          this.saveDocument(project, slotKey, meta);
          if (onProgress) onProgress(100, 'Berhasil disimpan');
          resolve({ success: true, meta });
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'Gagal membaca berkas dokumen.' });
        };
        reader.readAsDataURL(file);
      } catch (err) {
        resolve({ success: false, error: err instanceof Error ? err.message : 'Gagal upload file.' });
      }
    });
  }

  // Remove a document file from a project
  public removeDocument(project: ProjectData, slotKey: DocumentTypeKey): boolean {
    this.loadFromStorage();
    const record = this.findRecordInCache(project);

    if (record && record.documents[slotKey]) {
      delete record.documents[slotKey];
      record.updatedAt = new Date().toISOString();
      const pmoKey = project.pmoId || project.id;
      this.fileDataMap.delete(`${pmoKey}_${slotKey}`);
      this.saveRecordInCache(project, record);
      this.persist();
      return true;
    }

    return false;
  }

  // Edit / update metadata (notes, customName) for an existing uploaded document
  public updateDocumentMeta(
    project: ProjectData,
    slotKey: DocumentTypeKey,
    updates: { notes?: string; customName?: string }
  ): boolean {
    this.loadFromStorage();
    const record = this.findRecordInCache(project);
    if (!record || !record.documents[slotKey]) return false;

    const currentDoc = record.documents[slotKey]!;
    record.documents[slotKey] = {
      ...currentDoc,
      ...(updates.notes !== undefined ? { notes: updates.notes.trim() } : {}),
      ...(updates.customName !== undefined ? { customName: updates.customName.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };
    record.updatedAt = new Date().toISOString();

    this.saveRecordInCache(project, record);
    this.persist();
    return true;
  }

  // Calculate completeness percentage (0 - 100%)
  public getCompletenessPercentage(project: ProjectData): number {
    const record = this.getDocumentRecord(project);
    const slots = getDocumentSlots(project.projectCategory);
    const totalSlots = slots.length;
    let uploadedCount = 0;

    slots.forEach((slot) => {
      if (record.documents[slot.key]) {
        uploadedCount++;
      }
    });

    return totalSlots > 0 ? Math.round((uploadedCount / totalSlots) * 100) : 0;
  }

  // Count uploaded vs total
  public getUploadedCount(project: ProjectData): { uploaded: number; total: number } {
    const record = this.getDocumentRecord(project);
    const slots = getDocumentSlots(project.projectCategory);
    let uploaded = 0;
    slots.forEach((slot) => {
      if (record.documents[slot.key]) {
        uploaded++;
      }
    });
    return { uploaded, total: slots.length };
  }

  /**
   * Export Document Completeness Report to Excel (.xlsx)
   */
  public exportDocumentReportToExcel(projects: ProjectData[]): { success: boolean; count: number; filename: string } {
    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const headers = [
      'No',
      'PMO ID',
      'Project ID',
      'Nama Proyek',
      'Zona',
      'Area',
      'Vendor',
      'Status Konstruksi',
      'Kelengkapan (%)',
      'Jumlah Dokumen',
      ...DOCUMENT_SLOTS.map(s => `[${s.num}] ${s.label}`)
    ];

    const dataRows = projects.map((p, idx) => {
      const record = this.getDocumentRecord(p);
      const { uploaded, total } = this.getUploadedCount(p);
      const percentage = this.getCompletenessPercentage(p);

      const slotStatuses = DOCUMENT_SLOTS.map((slot) => {
        const doc = record.documents[slot.key];
        if (!doc) return 'Belum Ada';
        const name = doc.customName || doc.name;
        const notes = doc.notes ? ` (${doc.notes})` : '';
        return `Ada: ${name}${notes}`;
      });

      return [
        p.no || idx + 1,
        p.pmoId || '-',
        p.projectId || '-',
        p.projectDescription || '-',
        p.zona || '-',
        p.areaKota || '-',
        p.namaVendor || '-',
        p.statusConstruction || '-',
        `${percentage}%`,
        `${uploaded}/${total}`,
        ...slotStatuses
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    const colWidths = headers.map(h => ({ wch: Math.min(Math.max(h.length + 4, 12), 40) }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kelengkapan Dokumen');

    const filename = `Rekap_Kelengkapan_Dokumen_OSP_${new Date().toISOString().slice(0, 10)}.xlsx`;

    wb.Props = {
      Title: 'Rekap Kelengkapan Dokumen Proyek',
      Subject: `Data Berkas Dokumen Pendukung (${projects.length} Proyek)`,
      Author: 'PAUL',
      Company: 'PMO System © PAUL',
      CreatedDate: new Date(),
    };

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: projects.length, filename };
  }

  /**
   * Export Document Completeness Report to CSV
   */
  public exportDocumentReportToCsv(projects: ProjectData[]): { success: boolean; count: number; filename: string } {
    if (!projects || projects.length === 0) {
      return { success: false, count: 0, filename: '' };
    }

    const headers = [
      'No',
      'PMO ID',
      'Project ID',
      'Nama Proyek',
      'Zona',
      'Area',
      'Vendor',
      'Status Konstruksi',
      'Kelengkapan (%)',
      'Jumlah Dokumen',
      ...DOCUMENT_SLOTS.map(s => `[${s.num}] ${s.label}`)
    ];

    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = projects.map((p, idx) => {
      const record = this.getDocumentRecord(p);
      const { uploaded, total } = this.getUploadedCount(p);
      const percentage = this.getCompletenessPercentage(p);

      const slotStatuses = DOCUMENT_SLOTS.map((slot) => {
        const doc = record.documents[slot.key];
        if (!doc) return 'Belum Ada';
        const name = doc.customName || doc.name;
        const notes = doc.notes ? ` (${doc.notes})` : '';
        return `Ada: ${name}${notes}`;
      });

      return [
        p.no || idx + 1,
        p.pmoId || '-',
        p.projectId || '-',
        p.projectDescription || '-',
        p.zona || '-',
        p.areaKota || '-',
        p.namaVendor || '-',
        p.statusConstruction || '-',
        `${percentage}%`,
        `${uploaded}/${total}`,
        ...slotStatuses
      ].map(escapeCsv).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const filename = `Rekap_Kelengkapan_Dokumen_OSP_${new Date().toISOString().slice(0, 10)}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: projects.length, filename };
  }
}

export const documentStorageService = new DocumentStorageService();
