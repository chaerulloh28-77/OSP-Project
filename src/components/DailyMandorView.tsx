import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  HardHat, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Activity, 
  Building2, 
  Sparkles, 
  X, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Ruler, 
  FileText, 
  UserPlus, 
  RefreshCw,
  Box,
  CheckSquare,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Save,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { 
  DailyMandorReport, 
  HhInstallItem, 
  MandorProjectStatus, 
  calculateHhSummary, 
  calculateJalurAkses 
} from '../types/mandor';
import { mandorStorageService } from '../services/mandorStorageService';
import { storageService } from '../services/storageService';
import { ProjectData } from '../types/project';
import { AREA_KOTA_OPTIONS, VENDOR_OPTIONS } from '../data/dropdownOptions';

interface DailyMandorViewProps {
  projects: ProjectData[];
  onShowToast?: (message: string) => void;
  isNeonMode?: boolean;
}

// Helper to extract numeric team number from team string
function parseTeamNumber(teamStr: string): number {
  if (!teamStr) return 1;
  const match = teamStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

export const DailyMandorView: React.FC<DailyMandorViewProps> = ({
  projects,
  onShowToast,
  isNeonMode = true,
}) => {
  // Master Mandor List & Daily Reports State
  const [mandors, setMandors] = useState<string[]>([]);
  const [reports, setReports] = useState<DailyMandorReport[]>([]);
  
  // Selection & Filters
  const [selectedMandor, setSelectedMandor] = useState<string>('ALL'); // 'ALL' or specific mandor name
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingReport, setEditingReport] = useState<DailyMandorReport | null>(null);

  const [isAddMandorModalOpen, setIsAddMandorModalOpen] = useState<boolean>(false);
  const [newMandorInput, setNewMandorInput] = useState<string>('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [mandorToDelete, setMandorToDelete] = useState<string | null>(null);

  // Form Fields State for Modal
  const [formData, setFormData] = useState<{
    date: string;
    mandorName: string;
    segmentRelokasi: string;
    areaKota: string;
    statusProject: MandorProjectStatus;
    teamNumber: number;
    teamName: string;
    manPowerCount: number;
    vendorName: string;
    hhInstallItems: HhInstallItem[];
    targetMeter: number;
    meterSelesai: number;
    remarks: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    mandorName: '',
    segmentRelokasi: '',
    areaKota: 'Jakarta Selatan',
    statusProject: 'In Progress',
    teamNumber: 1,
    teamName: 'Team 1',
    manPowerCount: 6,
    vendorName: VENDOR_OPTIONS[0] || 'PT. ARKON',
    hhInstallItems: [
      { id: 'hh-init-1', itemType: 'HH', specSize: '80x80', installedQty: 2, planQty: 4 },
      { id: 'hh-init-2', itemType: 'HS', specSize: '60x60', installedQty: 1, planQty: 2 },
    ],
    targetMeter: 1000,
    meterSelesai: 500,
    remarks: '',
  });

  // Load and Subscribe to Mandor Storage
  const loadData = useCallback(() => {
    try {
      const list = mandorStorageService.getMandors();
      const data = mandorStorageService.getReports();
      setMandors(list || []);
      setReports(data || []);
    } catch (err) {
      console.error('Error loading mandor data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = mandorStorageService.subscribe(() => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Handle Add New Mandor
  const handleAddMandorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMandorInput.trim()) return;
    const updated = mandorStorageService.addMandor(newMandorInput.trim());
    setMandors(updated);
    setSelectedMandor(newMandorInput.trim());
    if (onShowToast) onShowToast(`Mandor '${newMandorInput.trim()}' berhasil ditambahkan!`);
    setNewMandorInput('');
  };

  // Handle Delete Mandor
  const handleDeleteMandor = (targetMandorName: string) => {
    const updated = mandorStorageService.deleteMandor(targetMandorName);
    setMandors(updated);
    if (selectedMandor === targetMandorName) {
      setSelectedMandor('ALL');
    }
    setMandorToDelete(null);
    if (onShowToast) onShowToast(`Mandor Pelaksana '${targetMandorName}' telah berhasil dihapus.`);
  };

  // Open Form Modal for Create (Input)
  const handleOpenCreateModal = () => {
    const defaultMandor = selectedMandor !== 'ALL' ? selectedMandor : (mandors[0] || 'Mandor Danil');
    setEditingReport(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      mandorName: defaultMandor,
      segmentRelokasi: '',
      areaKota: 'Jakarta Selatan',
      statusProject: 'In Progress',
      teamNumber: 1,
      teamName: 'Team 1',
      manPowerCount: 6,
      vendorName: VENDOR_OPTIONS[0] || 'PT. ARKON',
      hhInstallItems: [
        { id: `item-${Date.now()}-1`, itemType: 'HH', specSize: '80x80', installedQty: 2, planQty: 4 },
        { id: `item-${Date.now()}-2`, itemType: 'HS', specSize: '60x60', installedQty: 1, planQty: 2 },
      ],
      targetMeter: 1000,
      meterSelesai: 500,
      remarks: '',
    });
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditModal = (report: DailyMandorReport) => {
    setEditingReport(report);
    const num = parseTeamNumber(report.teamName);
    setFormData({
      date: report.date,
      mandorName: report.mandorName,
      segmentRelokasi: report.segmentRelokasi,
      areaKota: report.areaKota,
      statusProject: report.statusProject,
      teamNumber: num,
      teamName: report.teamName || `Team ${num}`,
      manPowerCount: report.manPowerCount,
      vendorName: report.vendorName,
      hhInstallItems: report.hhInstallItems && report.hhInstallItems.length > 0 
        ? JSON.parse(JSON.stringify(report.hhInstallItems))
        : [{ id: `item-${Date.now()}`, itemType: 'HH', specSize: '80x80', installedQty: 0, planQty: 1 }],
      targetMeter: report.targetMeter,
      meterSelesai: report.meterSelesai,
      remarks: report.remarks,
    });
    setIsFormModalOpen(true);
  };

  // Form Field Change Handlers for Multi-Item
  const handleAddHhItem = () => {
    setFormData((prev) => ({
      ...prev,
      hhInstallItems: [
        ...prev.hhInstallItems,
        {
          id: `hh-${Date.now()}-${Math.random()}`,
          itemType: 'HH',
          specSize: '80x80',
          installedQty: 0,
          planQty: 2,
        },
      ],
    }));
  };

  const handleRemoveHhItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      hhInstallItems: prev.hhInstallItems.filter((i) => i.id !== id),
    }));
  };

  const handleHhItemChange = (id: string, field: keyof HhInstallItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      hhInstallItems: prev.hhInstallItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  // Save Form Modal (CRUD - Simpan / Update)
  const handleSaveReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mandorName || !formData.segmentRelokasi) {
      alert('Mohon isi nama Mandor dan Segment Relokasi.');
      return;
    }

    const payload = {
      ...formData,
      teamName: `Team ${formData.teamNumber}`,
    };

    if (editingReport) {
      mandorStorageService.updateReport(editingReport.id, payload);
      if (onShowToast) onShowToast(`Laporan harian ${formData.mandorName} berhasil diperbarui!`);
    } else {
      mandorStorageService.addReport(payload);
      if (onShowToast) onShowToast(`Laporan harian ${formData.mandorName} berhasil ditambahkan!`);
    }

    setIsFormModalOpen(false);
  };

  // Delete Report (CRUD - Hapus)
  const handleDeleteReport = (id: string) => {
    mandorStorageService.deleteReport(id);
    setDeleteConfirmId(null);
    if (onShowToast) onShowToast('Laporan daily mandor telah berhasil dihapus.');
  };

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedMandor !== 'ALL' && r.mandorName !== selectedMandor) {
        return false;
      }
      if (statusFilter !== 'ALL' && r.statusProject !== statusFilter) {
        return false;
      }
      if (dateFilter && r.date !== dateFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchMandor = r.mandorName.toLowerCase().includes(q);
        const matchSegment = r.segmentRelokasi.toLowerCase().includes(q);
        const matchArea = r.areaKota.toLowerCase().includes(q);
        const matchVendor = r.vendorName.toLowerCase().includes(q);
        const matchTeam = r.teamName.toLowerCase().includes(q);
        const matchRemarks = r.remarks.toLowerCase().includes(q);
        if (!matchMandor && !matchSegment && !matchArea && !matchVendor && !matchTeam && !matchRemarks) {
          return false;
        }
      }
      return true;
    });
  }, [reports, selectedMandor, statusFilter, dateFilter, searchTerm]);

  // Overall Calculated Aggregates (Otomatis)
  const stats = useMemo(() => {
    let totalManPower = 0;
    let totalHhInstalled = 0;
    let totalHhPlan = 0;
    let totalTargetMeter = 0;
    let totalMeterSelesai = 0;
    let countInProg = 0;
    let countDone = 0;

    filteredReports.forEach((r) => {
      totalManPower += Number(r.manPowerCount) || 0;
      
      const hhCalc = calculateHhSummary(r.hhInstallItems);
      totalHhInstalled += hhCalc.totalInstalled;
      totalHhPlan += hhCalc.totalPlan;

      const jalur = calculateJalurAkses(r.targetMeter, r.meterSelesai);
      totalTargetMeter += jalur.targetMeter;
      totalMeterSelesai += jalur.meterSelesai;

      if (r.statusProject === 'In Progress') countInProg++;
      if (r.statusProject === 'Done') countDone++;
    });

    const totalMeterBelumSelesai = Math.max(0, totalTargetMeter - totalMeterSelesai);
    const overallMeterPercent = totalTargetMeter > 0 
      ? Math.min(100, Math.round((totalMeterSelesai / totalTargetMeter) * 100)) 
      : 0;

    const overallHhPercent = totalHhPlan > 0
      ? Math.min(100, Math.round((totalHhInstalled / totalHhPlan) * 100))
      : 0;

    return {
      reportCount: filteredReports.length,
      totalManPower,
      totalHhInstalled,
      totalHhPlan,
      overallHhPercent,
      totalTargetMeter,
      totalMeterSelesai,
      totalMeterBelumSelesai,
      overallMeterPercent,
      countInProg,
      countDone,
    };
  }, [filteredReports]);

  // Dynamic live summary in form modal
  const liveFormHhSummary = useMemo(() => {
    return calculateHhSummary(formData.hhInstallItems);
  }, [formData.hhInstallItems]);

  const liveFormJalurSummary = useMemo(() => {
    return calculateJalurAkses(formData.targetMeter, formData.meterSelesai);
  }, [formData.targetMeter, formData.meterSelesai]);

  // Pure White Input Styling Override
  const whiteInputStyle: React.CSSProperties = {
    color: '#ffffff',
    backgroundColor: '#1e293b',
    fontWeight: 700,
  };

  return (
    <div className={`space-y-6 pb-12 transition-all ${isNeonMode ? 'text-white' : 'text-slate-900 font-extrabold'}`}>
      {/* 1. Header & Live Status Banner (Symmetrical & High Aesthetics) */}
      <div className={`p-6 rounded-2xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden transition-all ${
        isNeonMode
          ? 'bg-gradient-to-r from-[#0b132b] via-[#0f172a] to-[#111c38] border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.25)] text-white'
          : 'bg-white border-slate-300 shadow-sm text-slate-900'
      }`}>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-xl ring-4 ring-cyan-400/30 shrink-0">
            <HardHat className="w-7 h-7 text-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className={`text-2xl font-black tracking-tight ${isNeonMode ? 'text-white drop-shadow' : 'text-slate-900'}`}>
                Daily Mandor & Operational Field Report
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-slate-950 shadow-md border-2 border-white">
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                Real-Time Online
              </span>
            </div>
            <p className={`text-xs font-extrabold mt-1 ${isNeonMode ? 'text-slate-200' : 'text-slate-800'}`}>
              Sistem Pengendalian Laporan Mandor, Personil, Install HH/HS/HG (Unit) & Progress Jalur Akses Real-Time
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => {
              const res = storageService.exportMandorToExcel(reports);
              if (res.success) {
                alert(`File Excel Daily Mandor berhasil diunduh (${res.count} laporan).`);
              } else {
                alert('Tidak ada laporan Daily Mandor untuk diekspor.');
              }
            }}
            title="Unduh laporan Daily Mandor dalam format Excel (.xlsx)"
            className="px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-2 border-emerald-500/80 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const res = storageService.exportMandorToCsv(reports);
              if (res.success) {
                alert(`File CSV Daily Mandor berhasil diunduh (${res.count} laporan).`);
              } else {
                alert('Tidak ada laporan Daily Mandor untuk diekspor.');
              }
            }}
            title="Unduh laporan Daily Mandor dalam format CSV (.csv)"
            className="px-3.5 py-2.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border-2 border-sky-500/80 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddMandorModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-[#1e293b] hover:bg-slate-700 text-white border-2 border-sky-400 text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-sky-300" />
            + Mandor
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-black transition-all shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center gap-2 cursor-pointer border-2 border-white hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            + Input Daily Mandor
          </button>
        </div>
      </div>

      {/* 2. Mandor Selection Tabs Bar (Symmetrical & Proportional) */}
      <div className="bg-[#0f172a] p-3 rounded-2xl border-2 border-slate-600 shadow-xl flex items-center gap-2.5 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setSelectedMandor('ALL')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm ${
            selectedMandor === 'ALL'
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] ring-2 ring-white scale-105'
              : 'text-white bg-[#1e293b] hover:bg-slate-700 border-2 border-slate-500'
          }`}
        >
          <Users className="w-4 h-4" />
          Semua Mandor
          <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-950 text-white font-black">
            {reports.length}
          </span>
        </button>

        {mandors.map((m) => {
          const count = reports.filter((r) => r.mandorName === m).length;
          const isSelected = selectedMandor === m;

          return (
            <div
              key={m}
              onClick={() => setSelectedMandor(m)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] ring-2 ring-white scale-105'
                  : 'bg-[#1e293b] text-white hover:bg-slate-700 border-2 border-slate-500'
              }`}
            >
              <HardHat className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{m}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                isSelected ? 'bg-slate-950 text-white' : 'bg-slate-800 text-white'
              }`}>
                {count}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMandorToDelete(m);
                }}
                className={`ml-0.5 p-1 rounded-md transition-colors ${
                  isSelected 
                    ? 'hover:bg-rose-600 hover:text-white text-slate-900/80' 
                    : 'hover:bg-rose-600 hover:text-white text-slate-400'
                }`}
                title={`Hapus ${m}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setIsAddMandorModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-black text-white hover:text-cyan-200 bg-sky-950 border-2 border-dashed border-sky-400 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ml-auto shadow"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          ( Kelola / Tambah Mandor )
        </button>
      </div>

      {/* 3. Real-Time Symmetrical 4-KPI Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Mandor & Team Man Power */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border-2 border-cyan-500/80 shadow-lg relative overflow-hidden group hover:border-cyan-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Total Team & Personil
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-400 text-slate-950 font-black flex items-center justify-center shadow">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.totalManPower}</span>
            <span className="text-xs font-black text-cyan-300">Person (Man Power)</span>
          </div>
          <p className="text-[11px] text-slate-200 font-extrabold mt-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Tersebar di {stats.reportCount} lokasi pekerjaan aktif
          </p>
        </div>

        {/* Card 2: Install HH, HS, HG (Unit) Summary */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border-2 border-amber-500 shadow-lg relative overflow-hidden group hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Install HH, HS, HG (Unit)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">{stats.totalHhInstalled}</span>
            <span className="text-xs font-black text-white">/ {stats.totalHhPlan} Unit Terinstal</span>
            <span className="text-xs font-black text-amber-300 ml-auto">{stats.overallHhPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden border border-slate-600">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.overallHhPercent}%` }}
            />
          </div>
        </div>

        {/* Card 3: Jalur Akses Meter Selesai vs Target */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border-2 border-emerald-500 shadow-lg relative overflow-hidden group hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Jalur Akses (Meter)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center shadow">
              <Ruler className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-300">{stats.totalMeterSelesai.toLocaleString()}</span>
            <span className="text-xs font-black text-white">/ {stats.totalTargetMeter.toLocaleString()} m</span>
            <span className="text-xs font-black text-emerald-300 ml-auto">{stats.overallMeterPercent}%</span>
          </div>
          <p className="text-[11px] text-white mt-2 flex items-center justify-between font-black">
            <span>Belum Selesai: <strong className="text-rose-400 font-black">{stats.totalMeterBelumSelesai.toLocaleString()} m</strong></span>
          </p>
        </div>

        {/* Card 4: Status Project Breakdown */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border-2 border-slate-600 shadow-lg relative overflow-hidden group hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Status Pekerjaan
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-400 text-slate-950 font-black flex items-center justify-center shadow">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-black gap-1.5 mt-1">
            <div className="bg-slate-800 px-3 py-1.5 rounded-xl text-white border border-slate-500 shadow-sm">
              Not Yet: <span className="text-white font-black">{stats.reportCount - stats.countInProg - stats.countDone}</span>
            </div>
            <div className="bg-amber-950 px-3 py-1.5 rounded-xl text-amber-300 border border-amber-400 shadow-sm">
              In Prog: <span className="text-white font-black">{stats.countInProg}</span>
            </div>
            <div className="bg-emerald-950 px-3 py-1.5 rounded-xl text-emerald-300 border border-emerald-400 shadow-sm">
              Done: <span className="text-white font-black">{stats.countDone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Controls, Search & Filter Bar */}
      <div className="bg-[#0f172a] p-4 rounded-2xl border-2 border-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            style={whiteInputStyle}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Segment Relokasi, Area, Vendor, atau Remarks..."
            className="w-full border-2 border-slate-400 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-black placeholder-slate-300 focus:outline-none focus:border-cyan-400 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-rose-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#1e293b] border-2 border-slate-500 px-3 py-1.5 rounded-xl shadow-sm">
            <Filter className="w-4 h-4 text-cyan-400" />
            <select
              style={whiteInputStyle}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-black focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f172a] text-white font-bold">Semua Status</option>
              <option value="Not Yet" className="bg-[#0f172a] text-white font-bold">Not Yet</option>
              <option value="In Progress" className="bg-[#0f172a] text-white font-bold">In Progress</option>
              <option value="Done" className="bg-[#0f172a] text-white font-bold">Done</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#1e293b] border-2 border-slate-500 px-3 py-1.5 rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <input
              type="date"
              style={whiteInputStyle}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs text-white font-black focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-amber-300 hover:text-white text-xs font-black ml-1"
                title="Reset Tanggal"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Daily Mandor Logs Table (Laporan Daily Mandor) */}
      <div className="bg-[#0f172a] rounded-2xl border-2 border-slate-600 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-slate-600 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Daftar Laporan Daily Mandor ({filteredReports.length})
            </h2>
          </div>
          <span className="text-xs text-white font-bold bg-slate-800 px-3 py-1 rounded-xl border border-slate-600">
            Mandor Aktif: <strong className="text-cyan-300 font-black">{selectedMandor === 'ALL' ? 'Semua' : selectedMandor}</strong>
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-16 text-center text-white space-y-3 bg-[#0f172a]">
            <HardHat className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <p className="text-sm font-black text-white">Belum ada laporan harian mandor yang sesuai.</p>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl text-xs transition-all inline-flex items-center gap-2 shadow-lg border-2 border-white"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              Buat Laporan Mandor Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black border-b-2 border-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-4 w-12 text-center">No.</th>
                  <th className="py-4 px-4 min-w-[140px]">Mandor & Tanggal</th>
                  <th className="py-4 px-4 min-w-[220px]">Segment Relokasi & Area</th>
                  <th className="py-4 px-4 min-w-[140px]">Vendor & Team</th>
                  <th className="py-4 px-4 min-w-[110px] text-center">Status Project</th>
                  <th className="py-4 px-4 min-w-[250px]">
                    Install HH, HS, HG (Unit)
                    <span className="block text-[10px] font-bold text-amber-300 normal-case">Label Ringkasan & Total Otomatis</span>
                  </th>
                  <th className="py-4 px-4 min-w-[220px]">
                    Jalur Akses (Otomatis)
                    <span className="block text-[10px] font-bold text-emerald-300 normal-case">Meter Selesai & Belum Selesai</span>
                  </th>
                  <th className="py-4 px-4 min-w-[180px]">Remarks</th>
                  <th className="py-4 px-4 w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-white font-bold">
                {filteredReports.map((report, idx) => {
                  const hhCalc = calculateHhSummary(report.hhInstallItems);
                  const jalurCalc = calculateJalurAkses(report.targetMeter, report.meterSelesai);

                  return (
                    <tr 
                      key={report.id}
                      className="hover:bg-slate-800/90 transition-colors bg-[#0f172a]"
                    >
                      <td className="py-4 px-4 text-center font-mono font-black text-white">
                        {idx + 1}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-black text-amber-300 text-xs flex items-center gap-1.5">
                          <HardHat className="w-4 h-4 text-amber-400 shrink-0" />
                          {report.mandorName}
                        </div>
                        <div className="text-[11px] text-white font-bold mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-300" />
                          {report.date}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-black text-white text-xs">
                          {report.segmentRelokasi}
                        </div>
                        <div className="text-[11px] text-sky-300 font-bold mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          {report.areaKota}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-900 text-white border border-blue-400 text-[11px] font-black shadow-sm">
                          {report.vendorName}
                        </span>
                        <div className="text-[11px] text-white font-extrabold mt-1.5 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-300" />
                          {report.teamName} ({report.manPowerCount} Person)
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {report.statusProject === 'Done' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-400 text-slate-950 shadow border border-white">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Done
                          </span>
                        )}
                        {report.statusProject === 'In Progress' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow border border-white">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            In Progress
                          </span>
                        )}
                        {report.statusProject === 'Not Yet' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-slate-700 text-white border border-slate-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Not Yet
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="bg-[#1e293b] p-2.5 rounded-xl border-2 border-amber-500 space-y-1 shadow-sm">
                          <div className="text-[11px] text-amber-200 font-extrabold truncate" title={hhCalc.summaryLabel}>
                            {hhCalc.summaryLabel}
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-black border-t border-slate-600 pt-1 text-amber-300">
                            <span>Total Terinstal:</span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded text-white border border-amber-400">
                              {hhCalc.totalInstalled} / {hhCalc.totalPlan} Unit
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="bg-[#1e293b] p-2.5 rounded-xl border-2 border-emerald-500 space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] font-black">
                            <span className="text-emerald-300">
                              Selesai: {jalurCalc.meterSelesai.toLocaleString()} m
                            </span>
                            <span className="text-rose-400">
                              Belum: {jalurCalc.meterBelumSelesai.toLocaleString()} m
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-600">
                            <div 
                              className="bg-emerald-400 h-full rounded-full transition-all"
                              style={{ width: `${jalurCalc.percentage}%` }}
                            />
                          </div>

                          <div className="text-[10px] text-white font-bold flex items-center justify-between">
                            <span>Target: {jalurCalc.targetMeter.toLocaleString()} m</span>
                            <span className="font-black text-emerald-300">{jalurCalc.percentage}%</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <p className="text-white text-[11px] font-bold line-clamp-2" title={report.remarks}>
                          {report.remarks || '-'}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(report)}
                            title="Edit Laporan"
                            className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black border border-white transition-all cursor-pointer shadow hover:scale-105 active:scale-95"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(report.id)}
                            title="Hapus Laporan"
                            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black border border-white transition-all cursor-pointer shadow hover:scale-105 active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Add / Edit Daily Mandor Report Form (SYMMETRICAL, EYE-CATCHING, HIGH-CONTRAST) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f172a] border-2 border-cyan-400 rounded-3xl max-w-2xl w-full shadow-[0_0_60px_rgba(6,182,212,0.45)] overflow-hidden my-6">
            {/* Modal Header Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 px-6 py-4 border-b-2 border-cyan-400/80 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-lg ring-2 ring-white">
                  <HardHat className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    {editingReport ? 'Edit Laporan Daily Mandor' : 'Input Laporan Daily Mandor Baru'}
                  </h3>
                  <p className="text-xs text-cyan-200 font-extrabold mt-0.5">
                    Lengkapi detail pekerjaan harian mandor, personil, install HH & jalur akses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white hover:text-rose-400 p-2 rounded-xl hover:bg-slate-800 border-2 border-slate-600 transition-all cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveReportSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto custom-scrollbar bg-[#0f172a]">
              {/* Section 1: Informasi Mandor & Tanggal (Symmetrical Grid 2 Column) */}
              <div className="bg-[#141e33] p-4 rounded-2xl border-2 border-slate-600 space-y-3 shadow-md">
                <div className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  1. Informasi Mandor & Tanggal Laporan
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                      Mandor Pelaksana <span className="text-rose-400">*</span>
                    </label>
                    <select
                      style={whiteInputStyle}
                      value={formData.mandorName}
                      onChange={(e) => setFormData({ ...formData, mandorName: e.target.value })}
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner cursor-pointer"
                      required
                    >
                      {mandors.map((m) => (
                        <option key={m} value={m} className="bg-[#0f172a] text-white font-bold py-1">
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                      Tanggal Laporan <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      style={whiteInputStyle}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner cursor-pointer"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Segment Relokasi & Area (Symmetrical Grid) */}
              <div className="bg-[#141e33] p-4 rounded-2xl border-2 border-slate-600 space-y-3 shadow-md">
                <div className="text-xs font-black text-sky-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  2. Detail Pekerjaan Segment Relokasi & Area
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                      Segment Relokasi <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      style={whiteInputStyle}
                      value={formData.segmentRelokasi}
                      onChange={(e) => setFormData({ ...formData, segmentRelokasi: e.target.value })}
                      placeholder="misal: Relokasi FO Segmen Jl. Sudirman - Semanggi"
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black placeholder-slate-300 focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                      Area / Kota <span className="text-rose-400">*</span>
                    </label>
                    <select
                      style={whiteInputStyle}
                      value={formData.areaKota}
                      onChange={(e) => setFormData({ ...formData, areaKota: e.target.value })}
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner cursor-pointer"
                    >
                      {AREA_KOTA_OPTIONS.map((a) => (
                        <option key={a} value={a} className="bg-[#0f172a] text-white font-bold py-1">
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Status, Team (Input Angka) & Vendor (Symmetrical Grid 3 Column) */}
              <div className="bg-[#141e33] p-4 rounded-2xl border-2 border-slate-600 space-y-3 shadow-md">
                <div className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-700 pb-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  3. Status Project, Team No & Vendor
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                      Status Project <span className="text-rose-400">*</span>
                    </label>
                    <select
                      style={whiteInputStyle}
                      value={formData.statusProject}
                      onChange={(e) => setFormData({ ...formData, statusProject: e.target.value as MandorProjectStatus })}
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner cursor-pointer"
                    >
                      <option value="Not Yet" className="bg-[#0f172a] text-white font-bold">Not Yet</option>
                      <option value="In Progress" className="bg-[#0f172a] text-white font-bold">In Progress</option>
                      <option value="Done" className="bg-[#0f172a] text-white font-bold">Done</option>
                    </select>
                  </div>

                  {/* Team No. (INPUT ANGKA) & Man Power (Person) */}
                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                      Team (Angka) & Personil
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-cyan-300 pointer-events-none">Team</span>
                        <input
                          type="number"
                          min="1"
                          style={{ ...whiteInputStyle, paddingLeft: '3.2rem' }}
                          value={formData.teamNumber}
                          onChange={(e) => {
                            const num = Number(e.target.value) || 1;
                            setFormData({ 
                              ...formData, 
                              teamNumber: num, 
                              teamName: `Team ${num}` 
                            });
                          }}
                          placeholder="1"
                          className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl py-2.5 text-xs text-white font-black focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          style={whiteInputStyle}
                          value={formData.manPowerCount}
                          onChange={(e) => setFormData({ ...formData, manPowerCount: Number(e.target.value) || 1 })}
                          placeholder="Person"
                          className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-2.5 py-2.5 text-xs text-white font-black text-center focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                      Vendor <span className="text-rose-400">*</span>
                    </label>
                    <select
                      style={whiteInputStyle}
                      value={formData.vendorName}
                      onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner cursor-pointer"
                    >
                      {VENDOR_OPTIONS.map((v) => (
                        <option key={v} value={v} className="bg-[#0f172a] text-white font-bold py-1">
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Install HH, HS, HG (Unit) Multi-Item (Symmetrical Row Layout) */}
              <div className="bg-[#141e33] p-4.5 rounded-2xl border-2 border-amber-500 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b-2 border-amber-500/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-amber-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      4. Install HH, HS, HG (Unit) - Multi-Item
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddHhItem}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md border border-white hover:bg-amber-300"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    + Tambah Item
                  </button>
                </div>

                {/* Multi-Item Dynamic Rows */}
                <div className="space-y-3">
                  {formData.hhInstallItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2.5 items-center bg-[#0f172a] p-3.5 rounded-xl border-2 border-amber-500/60 shadow-sm">
                      <div className="col-span-3">
                        <label className="text-[10px] text-white font-black uppercase block mb-1">Tipe Item</label>
                        <select
                          style={whiteInputStyle}
                          value={item.itemType}
                          onChange={(e) => handleHhItemChange(item.id, 'itemType', e.target.value)}
                          className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-lg px-2.5 py-2 text-xs text-white font-black focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                          <option value="HH" className="bg-[#0f172a] text-white font-bold">HH (Handhole)</option>
                          <option value="HS" className="bg-[#0f172a] text-white font-bold">HS (Handhole Small)</option>
                          <option value="HG" className="bg-[#0f172a] text-white font-bold">HG (Handhole Galvanis)</option>
                        </select>
                      </div>

                      {/* Ukuran Spec Dropdown (40x60, 60x60, 80x80) */}
                      <div className="col-span-3">
                        <label className="text-[10px] text-white font-black uppercase block mb-1">Ukuran / Spec</label>
                        <select
                          style={whiteInputStyle}
                          value={item.specSize || '80x80'}
                          onChange={(e) => handleHhItemChange(item.id, 'specSize', e.target.value)}
                          className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-lg px-2.5 py-2 text-xs text-white font-black focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                          <option value="40x60" className="bg-[#0f172a] text-white font-bold">40x60</option>
                          <option value="60x60" className="bg-[#0f172a] text-white font-bold">60x60</option>
                          <option value="80x80" className="bg-[#0f172a] text-white font-bold">80x80</option>
                          <option value="100x100" className="bg-[#0f172a] text-white font-bold">100x100</option>
                          <option value="110x110" className="bg-[#0f172a] text-white font-bold">110x110</option>
                          <option value="120x120" className="bg-[#0f172a] text-white font-bold">120x120</option>
                          <option value="2 inch" className="bg-[#0f172a] text-white font-bold">2 inch (Galvanis)</option>
                          <option value="4 inch" className="bg-[#0f172a] text-white font-bold">4 inch (Galvanis)</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-white font-black uppercase block mb-1">Terinstal</label>
                        <input
                          type="number"
                          min="0"
                          style={whiteInputStyle}
                          value={item.installedQty}
                          onChange={(e) => handleHhItemChange(item.id, 'installedQty', Number(e.target.value) || 0)}
                          className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-lg px-2 py-2 text-xs text-white text-center font-black focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-white font-black uppercase block mb-1">Plan Unit</label>
                        <input
                          type="number"
                          min="0"
                          style={whiteInputStyle}
                          value={item.planQty}
                          onChange={(e) => handleHhItemChange(item.id, 'planQty', Number(e.target.value) || 0)}
                          className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-lg px-2 py-2 text-xs text-white text-center font-black focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 text-right pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveHhItem(item.id)}
                          className="text-white hover:text-rose-200 bg-rose-600 hover:bg-rose-500 p-2 rounded-xl border border-white transition-colors cursor-pointer shadow"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Automatic Summary Indicators Bar */}
                <div className="bg-[#0a0f1d] p-3.5 rounded-2xl border-2 border-amber-400 text-xs space-y-2 shadow-md">
                  <div className="text-white font-black uppercase tracking-wider flex items-center justify-between">
                    <span>Label Ringkasan Install HH (Otomatis):</span>
                  </div>
                  <div className="text-amber-300 font-mono text-xs font-black bg-[#1e293b] p-3 rounded-xl border border-slate-500">
                    {liveFormHhSummary.summaryLabel}
                  </div>
                  <div className="flex items-center justify-between font-black text-amber-300 pt-1 text-xs">
                    <span>Total HH, HS, HG Terinstal & Plan (Otomatis):</span>
                    <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-lg font-black shadow">
                      {liveFormHhSummary.totalInstalled} / {liveFormHhSummary.totalPlan} Unit
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 5: Jalur Akses (Otomatis) */}
              <div className="bg-[#141e33] p-4.5 rounded-2xl border-2 border-emerald-500 space-y-3.5 shadow-lg">
                <div className="flex items-center gap-2 border-b-2 border-emerald-500/50 pb-2.5">
                  <Ruler className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    5. Jalur Akses (Otomatis)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-white uppercase mb-1.5">
                      Target Meter (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      style={whiteInputStyle}
                      value={formData.targetMeter}
                      onChange={(e) => setFormData({ ...formData, targetMeter: Number(e.target.value) || 0 })}
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-white uppercase mb-1.5">
                      Meter Selesai (m)
                    </label>
                    <input
                      type="number"
                      min="0"
                      style={whiteInputStyle}
                      value={formData.meterSelesai}
                      onChange={(e) => setFormData({ ...formData, meterSelesai: Number(e.target.value) || 0 })}
                      className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Automatic Calculated Jalur Akses Summary */}
                <div className="bg-[#0a0f1d] p-3.5 rounded-2xl border-2 border-emerald-400 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div>
                    <span className="text-white block text-[10px] font-black uppercase">Belum Selesai (Otomatis):</span>
                    <span className="text-rose-400 font-black text-base">
                      {liveFormJalurSummary.meterBelumSelesai.toLocaleString()} meter
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white block text-[10px] font-black uppercase">Progress Ringkasan:</span>
                    <span className="text-emerald-300 font-black text-xs">
                      {liveFormJalurSummary.summaryText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 6: Remarks / Catatan Harian Pekerjaan */}
              <div className="bg-[#141e33] p-4 rounded-2xl border-2 border-slate-600 space-y-2 shadow-md">
                <label className="block text-xs font-black text-white uppercase tracking-wider mb-1.5">
                  6. Remarks / Catatan Harian Pekerjaan
                </label>
                <textarea
                  rows={3}
                  style={whiteInputStyle}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Catatan kondisi lapangan, kendala cuaca, atau informasi progres harian..."
                  className="w-full bg-[#1e293b] border-2 border-slate-400 rounded-xl p-3.5 text-xs text-white font-black placeholder-slate-300 focus:border-cyan-400 focus:bg-[#0f172a] focus:outline-none shadow-inner"
                />
              </div>

              {/* Modal Footer Action Buttons */}
              <div className="pt-4 border-t-2 border-slate-600 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black border-2 border-slate-400 transition-all cursor-pointer shadow-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 text-xs font-black shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all cursor-pointer border-2 border-white flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  {editingReport ? 'Simpan Perubahan' : 'Tambah Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Kelola & Tambah Mandor Modal */}
      {isAddMandorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border-2 border-sky-400 rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(56,189,248,0.5)] p-6 space-y-5">
            <div className="flex items-center justify-between border-b-2 border-slate-600 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Kelola & Tambah Mandor</h3>
                  <p className="text-xs text-slate-300">Tambah mandor baru atau hapus mandor pelaksana dari sistem</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMandorModalOpen(false)}
                className="text-white hover:text-rose-400 p-1.5 rounded-xl border border-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Tambah Mandor Baru */}
            <form onSubmit={handleAddMandorSubmit} className="space-y-3 bg-[#1e293b] p-4 rounded-2xl border border-slate-600">
              <label className="block text-xs font-black text-white uppercase tracking-wider">
                Tambah Mandor Pelaksana Baru <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  style={whiteInputStyle}
                  value={newMandorInput}
                  onChange={(e) => setNewMandorInput(e.target.value)}
                  placeholder="misal: Mandor Budi, Mandor Rian..."
                  className="flex-1 bg-[#0f172a] border-2 border-slate-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-black placeholder-slate-300 focus:border-sky-400 focus:outline-none shadow-inner"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-black shadow-lg border-2 border-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>
            </form>

            {/* Daftar Mandor Pelaksana Aktif */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-200">
                <span>Daftar Mandor Pelaksana ({mandors.length})</span>
                <span className="text-[11px] text-slate-400 font-normal">Klik tombol hapus untuk mengeluarkan mandor</span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {mandors.map((m) => {
                  const count = reports.filter((r) => r.mandorName === m).length;
                  return (
                    <div
                      key={m}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#1e293b] border border-slate-700 hover:border-slate-500 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold">
                          <HardHat className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-white block">{m}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{count} Laporan Harian Terkait</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMandorToDelete(m);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                        title={`Hapus ${m}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t-2 border-slate-700">
              <button
                type="button"
                onClick={() => setIsAddMandorModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-black hover:bg-slate-700 border border-slate-500 cursor-pointer"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border-2 border-rose-500 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.5)]">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-slate-950 flex items-center justify-center mx-auto border-2 border-white font-black shadow-lg">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Konfirmasi Hapus Laporan</h3>
            <p className="text-xs text-white font-bold">
              Apakah Anda yakin ingin menghapus laporan daily mandor ini? Data yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-black hover:bg-slate-700 border border-slate-500"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteReport(deleteConfirmId)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg border-2 border-white"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {mandorToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border-2 border-rose-500 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(244,63,94,0.5)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Hapus Mandor Pelaksana</h3>
                  <p className="text-xs text-rose-300 font-bold">{mandorToDelete}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMandorToDelete(null)}
                className="text-white hover:text-rose-400 p-1.5 rounded-xl border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                Apakah Anda yakin ingin menghapus Mandor Pelaksana <strong className="text-amber-400">{mandorToDelete}</strong> dari daftar?
              </p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 font-medium">
                ⚠️ Catatan: Mandor tidak akan muncul lagi di opsi filter tab atau form laporan baru. Laporan harian historis yang sudah dibuat sebelumnya tetap aman tersimpan.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-slate-700">
              <button
                type="button"
                onClick={() => setMandorToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-black hover:bg-slate-700 border border-slate-500 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMandor(mandorToDelete)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg border-2 border-rose-300 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus Mandor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
