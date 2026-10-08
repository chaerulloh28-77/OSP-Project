import React, { useState, useMemo } from 'react';
import { 
  X, 
  Boxes, 
  HardHat, 
  Network, 
  Cable, 
  Hourglass, 
  Activity, 
  Ban, 
  CheckCircle2, 
  FileCheck2, 
  Zap, 
  Search, 
  Download, 
  FileSpreadsheet, 
  Building2, 
  UserCheck, 
  MapPin, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  Filter, 
  Clock,
  ArrowRight,
  Info,
  Calendar,
  Warehouse,
  ShieldAlert,
  Pickaxe,
  FileText
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { PriorityBadge } from './PriorityBadge';
import { storageService } from '../services/storageService';

export type KpiItemKey = 
  | 'total' 
  | 'construction' 
  | 'relokasi-fo' 
  | 'not-started' 
  | 'in-progress' 
  | 'cancelled' 
  | 'completed' 
  | 'mr-po' 
  | 'pulling-cable';

interface KpiItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemKey: KpiItemKey | null;
  projects: ProjectData[];
  onSelectProject?: (project: ProjectData) => void;
  onApplyFilterToMainTable?: (key: string, value: string) => void;
  showToast?: (msg: string) => void;
}

export const KpiItemDetailModal: React.FC<KpiItemDetailModalProps> = ({
  isOpen,
  onClose,
  itemKey,
  projects,
  onSelectProject,
  onApplyFilterToMainTable,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZonaFilter, setSelectedZonaFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Filter projects corresponding to the selected KPI item
  const kpiFilteredProjects = useMemo(() => {
    if (!itemKey) return [];

    switch (itemKey) {
      case 'total':
        return projects;

      case 'construction':
        return projects.filter(
          (p) =>
            p.statusConstruction === 'Pulling Cable' ||
            p.statusConstruction === 'Completed' ||
            p.statusConstruction === 'In Progress' ||
            p.projectStatus === 'In Progress' ||
            Number(p.pullingPanjangSelesai || 0) > 0 ||
            Number(p.pullingFoPanjangSelesai || 0) > 0
        );

      case 'relokasi-fo':
        return projects.filter((p) => Number(p.panjangRelokasi || 0) > 0);

      case 'not-started':
        return projects.filter(
          (p) => p.projectStatus === 'Project Not Started' || !p.projectStatus || p.projectStatus === 'Not Yet'
        );

      case 'in-progress':
        return projects.filter(
          (p) => p.projectStatus === 'In Progress' || p.statusConstruction === 'Pulling Cable'
        );

      case 'cancelled':
        return projects.filter(
          (p) =>
            p.projectStatus === 'Cancelled' ||
            p.projectStatus === 'Project Cancel' ||
            p.statusPengajuanProject === 'Project Cancel'
        );

      case 'completed':
        return projects.filter(
          (p) => p.projectStatus === 'Completed' || p.statusConstruction === 'Completed'
        );

      case 'mr-po':
        return projects.filter(
          (p) =>
            p.statusPengajuanProject === 'Approved' ||
            p.statusPengajuanProject === 'Release' ||
            p.statusPengajuanProject === 'Released' ||
            p.statusPengajuanPo === 'Approved' ||
            p.statusPengajuanPo === 'Released' ||
            p.statusPengajuanPo === 'Release' ||
            p.statusPengajuanMr === 'Approved' ||
            p.statusPengajuanMr === 'Released' ||
            p.statusPengajuanMr === 'Release'
        );

      case 'pulling-cable':
        return projects.filter(
          (p) =>
            p.statusConstruction === 'Pulling Cable' ||
            p.statusPullingCableFo === 'In Progress' ||
            p.statusPullingCableFo === 'Done' ||
            (Boolean(p.pullingCableProgress) && p.pullingCableProgress !== '0%' && p.pullingCableProgress !== 'N/A') ||
            (Boolean(p.pullingCableFoProgress) && p.pullingCableFoProgress !== '0%' && p.pullingCableFoProgress !== 'N/A') ||
            Number(p.pullingFoPanjangSelesai || 0) > 0 ||
            Number(p.pullingPanjangSelesai || 0) > 0
        );

      default:
        return projects;
    }
  }, [projects, itemKey]);

  // Unique filters for current KPI list
  const availableZonas = useMemo(() => {
    const set = new Set<string>();
    kpiFilteredProjects.forEach((p) => {
      if (p.zona) set.add(p.zona.trim());
    });
    return Array.from(set).sort();
  }, [kpiFilteredProjects]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    kpiFilteredProjects.forEach((p) => {
      if (p.projectCategory) set.add(p.projectCategory.trim());
    });
    return Array.from(set).sort();
  }, [kpiFilteredProjects]);

  // Final filtered list for display in table
  const displayProjects = useMemo(() => {
    return kpiFilteredProjects.filter((p) => {
      if (selectedZonaFilter !== 'all' && p.zona !== selectedZonaFilter) return false;
      if (selectedCategoryFilter !== 'all' && p.projectCategory !== selectedCategoryFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (p.pmoId || '').toLowerCase().includes(q) ||
        (p.projectDescription || '').toLowerCase().includes(q) ||
        (p.projectId || '').toLowerCase().includes(q) ||
        (p.namaVendor || '').toLowerCase().includes(q) ||
        (p.picSectionHead || '').toLowerCase().includes(q) ||
        (p.areaKota || '').toLowerCase().includes(q) ||
        (p.priority || '').toLowerCase().includes(q)
      );
    });
  }, [kpiFilteredProjects, selectedZonaFilter, selectedCategoryFilter, searchQuery]);

  if (!isOpen || !itemKey) return null;

  // Item metadata, titles, descriptions, icons and summary metrics
  const getItemDetails = () => {
    switch (itemKey) {
      case 'total': {
        const totalMetersFo = projects.reduce((acc, c) => acc + Number(c.panjangRelokasi || 0), 0);
        const totalMetersGalian = projects.reduce((acc, c) => acc + Number(c.galianPanjangTotal || 0), 0);
        const activeCount = projects.filter((p) => p.projectStatus === 'In Progress').length;
        const doneCount = projects.filter((p) => p.projectStatus === 'Completed').length;

        return {
          title: 'Total Project (Semua Proyek OSP Terdata)',
          subtitle: 'Ringkasan keseluruhan database paket proyek relokasi jaringan utilitas di seluruh zona.',
          badge: `${projects.length} Total Paket`,
          badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
          gradientBg: 'from-slate-900 via-sky-950 to-slate-900',
          accentColor: 'from-sky-500 to-blue-600',
          icon: Boxes,
          description: 'Metrik Total Project mencakup seluruh paket pekerjaan relokasi fiber optic dan galian yang terdaftar dalam sistem PMO OSP, baik yang sedang dalam antrean perencanaan, perizinan dinas, eksekusi fisik, maupun closing selesai.',
          insights: [
            { label: 'Total Paket Terdata', value: `${projects.length} paket`, desc: '100% database proyek aktif' },
            { label: 'Total Panjang Relokasi FO', value: `${totalMetersFo.toLocaleString('id-ID')} m`, desc: 'Kebutuhan bentangan FO' },
            { label: 'Total Target Galian', value: `${totalMetersGalian.toLocaleString('id-ID')} m`, desc: 'Pekerjaan sipil & galian' },
            { label: 'Rasio Proyek Selesai', value: `${projects.length > 0 ? Math.round((doneCount / projects.length) * 100) : 0}%`, desc: `${doneCount} dari ${projects.length} selesai` },
          ],
          filterKey: 'all',
          filterVal: '',
        };
      }

      case 'construction': {
        const withPulling = kpiFilteredProjects.filter((p) => p.statusConstruction === 'Pulling Cable' || p.statusPullingCableFo === 'In Progress').length;
        const completedConst = kpiFilteredProjects.filter((p) => p.statusConstruction === 'Completed').length;
        const totalGalian = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.galianPanjangTotal || 0), 0);

        return {
          title: 'Construction (Proyek Konstruksi Fisik Lapangan)',
          subtitle: 'Proyek yang telah memasuki tahapan konstruksi fisik: galian sipil, penanaman tiang/subduct, dan penarikan kabel.',
          badge: `${kpiFilteredProjects.length} Proyek Konstruksi`,
          badgeClass: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
          gradientBg: 'from-slate-900 via-amber-950 to-slate-900',
          accentColor: 'from-amber-500 to-orange-600',
          icon: HardHat,
          description: 'Tahapan Konstruksi menandakan pekerjaan fisik telah berjalan di lokasi proyek. Meliputi tim kontraktor vendor yang melakukan penggalian, instalasi FO, serta pengawasan lapangan oleh pengawas & PIC Section Head.',
          insights: [
            { label: 'Paket dalam Konstruksi', value: `${kpiFilteredProjects.length} paket`, desc: 'Pekerjaan fisik berjalan' },
            { label: 'Sedang Penarikan Kabel', value: `${withPulling} lokasi`, desc: 'Pulling Cable aktif di lapangan' },
            { label: 'Konstruksi Selesai', value: `${completedConst} paket`, desc: 'Fisik 100% tuntas' },
            { label: 'Panjang Galian Terkait', value: `${totalGalian.toLocaleString('id-ID')} m`, desc: 'Total volume sipil' },
          ],
          filterKey: 'statusConstruction',
          filterVal: 'Construction',
        };
      }

      case 'relokasi-fo': {
        const totalMeters = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.panjangRelokasi || 0), 0);
        const avgMeters = kpiFilteredProjects.length > 0 ? Math.round(totalMeters / kpiFilteredProjects.length) : 0;
        const finishedMeters = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.pullingFoPanjangSelesai || 0), 0);
        const progressPct = totalMeters > 0 ? Math.round((finishedMeters / totalMeters) * 100) : 0;

        return {
          title: 'Relokasi FO (Total Panjang Relokasi Fiber Optic)',
          subtitle: 'Akumulasi bentangan kabel Fiber Optic (FO) yang direlokasi untuk normalisasi utilitas kota.',
          badge: `${totalMeters.toLocaleString('id-ID')} Meter FO`,
          badgeClass: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
          gradientBg: 'from-slate-900 via-blue-950 to-slate-900',
          accentColor: 'from-blue-500 to-indigo-600',
          icon: Network,
          description: 'Relokasi FO mengukur total volume kabel serat optik yang perlu dipindahkan dari tiang lama ke jalur baru / subduct bawah tanah sesuai ketentuan Dinas Bina Marga dan APJATEL.',
          insights: [
            { label: 'Total Panjang Target FO', value: `${totalMeters.toLocaleString('id-ID')} m`, desc: 'Kebutuhan bentangan total' },
            { label: 'FO Selesai Ditarik', value: `${finishedMeters.toLocaleString('id-ID')} m`, desc: 'Progres fisik kabel selesai' },
            { label: 'Persentase Penarikan', value: `${progressPct}%`, desc: 'Rasio penyelesaian bentangan' },
            { label: 'Rata-rata per Paket', value: `${avgMeters.toLocaleString('id-ID')} m`, desc: 'Panjang rata-rata per jalur' },
          ],
          filterKey: 'panjangRelokasi',
          filterVal: 'Has Length',
        };
      }

      case 'not-started': {
        const count = kpiFilteredProjects.length;
        const waitingReview = kpiFilteredProjects.filter((p) => p.projectStatus && p.projectStatus.toLowerCase().includes('review')).length;

        return {
          title: 'Project Not Started (Proyek Belum Dimulai / Antrean)',
          subtitle: 'Paket proyek yang masih berada di tahap persiapan awal, review dinas, atau menunggu penerbitan PO/MR.',
          badge: `${count} Paket Belum Dimulai`,
          badgeClass: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
          gradientBg: 'from-slate-900 via-slate-800 to-slate-900',
          accentColor: 'from-slate-500 to-slate-700',
          icon: Hourglass,
          description: 'Project Not Started menunjukkan daftar proyek dalam pipeline yang belum dieksekusi di lapangan. Diperlukan koordinasi untuk percepatan approval izin dinas, survey bersama, dan alokasi tim vendor.',
          insights: [
            { label: 'Total Belum Mulai', value: `${count} paket`, desc: 'Menunggu inisiasi kerja' },
            { label: 'Dalam Review Dinas', value: `${waitingReview} paket`, desc: 'Menunggu izin perizinan' },
            { label: 'Rasio dari Total', value: `${projects.length > 0 ? Math.round((count / projects.length) * 100) : 0}%`, desc: 'Porsi backlog pipeline' },
            { label: 'Tindakan Disarankan', value: 'Follow up Izin & PO', desc: 'Percepatan kick-off' },
          ],
          filterKey: 'projectStatus',
          filterVal: 'Project Not Started',
        };
      }

      case 'in-progress': {
        const count = kpiFilteredProjects.length;
        const p1Count = kpiFilteredProjects.filter((p) => p.priority === 'Critical' || p.priority === 'P1').length;
        const activeMeters = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.panjangRelokasi || 0), 0);

        return {
          title: 'In Progress (Proyek Sedang Berjalan Aktif)',
          subtitle: 'Proyek yang saat ini sedang aktif dikerjakan oleh tim vendor di lapangan.',
          badge: `${count} Paket Aktif`,
          badgeClass: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
          gradientBg: 'from-slate-900 via-sky-950 to-slate-900',
          accentColor: 'from-sky-500 to-blue-600',
          icon: Activity,
          description: 'In Progress menandakan pekerjaan sedang berjalan live. Tim PMO mengontrol deviasi jadwal, progres penarikan harian, serta kepatuhan SOP keselamatan K3 di area publik.',
          insights: [
            { label: 'Proyek Berjalan Aktif', value: `${count} paket`, desc: 'Pekerjaan lapangan berlangsung' },
            { label: 'Prioritas Kritis / P1', value: `${p1Count} paket`, desc: 'Atensi khusus & percepatan' },
            { label: 'Total FO yang Dikerjakan', value: `${activeMeters.toLocaleString('id-ID')} m`, desc: 'Bentangan aktif berlangsung' },
            { label: 'Monitoring Status', value: 'Aktif Terpantau', desc: 'Update berkala harian' },
          ],
          filterKey: 'projectStatus',
          filterVal: 'In Progress',
        };
      }

      case 'cancelled': {
        const count = kpiFilteredProjects.length;
        const cancelledMeters = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.panjangRelokasi || 0), 0);

        return {
          title: 'Project Cancel (Proyek Dibatalkan)',
          subtitle: 'Paket relokasi yang dibatalkan karena perubahan desain kota, penundaan proyek dinas, atau efisiensi rute.',
          badge: `${count} Paket Dibatalkan`,
          badgeClass: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
          gradientBg: 'from-slate-900 via-rose-950 to-slate-900',
          accentColor: 'from-rose-500 to-red-600',
          icon: Ban,
          description: 'Project Cancel merekam histori proyek yang dihentikan secara resmi. Data tetap tersimpan untuk keperluan audit administrasi dan rekapitulasi anggaran perencanaan.',
          insights: [
            { label: 'Total Paket Dibatalkan', value: `${count} paket`, desc: 'Arsip proyek cancel' },
            { label: 'Volume FO Batal', value: `${cancelledMeters.toLocaleString('id-ID')} m`, desc: 'Panjang jalur dibatalkan' },
            { label: 'Status Material', value: 'Dikembalikan / Hold', desc: 'Logistik aman' },
            { label: 'Rasio Pembatalan', value: `${projects.length > 0 ? Math.round((count / projects.length) * 100) : 0}%`, desc: 'Tingkat pembatalan rendah' },
          ],
          filterKey: 'projectStatus',
          filterVal: 'Project Cancel',
        };
      }

      case 'completed': {
        const count = kpiFilteredProjects.length;
        const completedFoMeters = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.panjangRelokasi || 0), 0);
        const closingDone = kpiFilteredProjects.filter((p) => p.statusDokumenClosing && p.statusDokumenClosing.toLowerCase().includes('teco')).length;

        return {
          title: 'Completed (Proyek Selesai 100%)',
          subtitle: 'Paket proyek yang seluruh tahapan konstruksi fisiknya telah rampung dan siap atau sudah closing SAP.',
          badge: `${count} Paket Selesai`,
          badgeClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
          gradientBg: 'from-slate-900 via-emerald-950 to-slate-900',
          accentColor: 'from-emerald-500 to-teal-600',
          icon: CheckCircle2,
          description: 'Completed merupakan indikator keberhasilan eksekusi proyek. Seluruh kabel telah aktif terelokasi, hasil uji opname diterima, dan administrasi BAST / SAP siap diproses penagihan.',
          insights: [
            { label: 'Paket Tuntas 100%', value: `${count} paket`, desc: 'Konstruksi fisik rampung' },
            { label: 'Panjang FO Terselesaikan', value: `${completedFoMeters.toLocaleString('id-ID')} m`, desc: 'Infrastruktur beroperasi' },
            { label: 'Teco / Closing Selesai', value: `${closingDone} paket`, desc: 'Administrasi tuntas' },
            { label: 'Rasio Keberhasilan', value: `${projects.length > 0 ? Math.round((count / projects.length) * 100) : 0}%`, desc: 'Pencapaian target PMO' },
          ],
          filterKey: 'projectStatus',
          filterVal: 'Completed',
        };
      }

      case 'mr-po': {
        const count = kpiFilteredProjects.length;
        const warehouseUserCount = kpiFilteredProjects.filter((p) => p.planPengambilanMaterial === 'Warehouse User').length;
        const warehouseInhouseCount = kpiFilteredProjects.filter((p) => p.planPengambilanMaterial === 'Warehouse Inhouse').length;

        return {
          title: 'MR / PO (Material Request & Purchase Order Approved)',
          subtitle: 'Paket proyek dengan nomor MR atau PO yang telah disetujui untuk penarikan material logistik.',
          badge: `${count} Paket Approved`,
          badgeClass: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30',
          gradientBg: 'from-slate-900 via-indigo-950 to-slate-900',
          accentColor: 'from-indigo-500 to-purple-600',
          icon: FileCheck2,
          description: 'Status MR/PO Approved mengonfirmasi bahwa alokasi material kabel, closure, dan aksesoris tiang telah disetujui dan siap diambil di gudang logistik (Warehouse User / Warehouse Inhouse).',
          insights: [
            { label: 'MR / PO Approved', value: `${count} paket`, desc: 'Siap tarik material' },
            { label: 'Plan Warehouse User', value: `${warehouseUserCount} paket`, desc: 'Pengambilan gudang user' },
            { label: 'Plan Warehouse Inhouse', value: `${warehouseInhouseCount} paket`, desc: 'Pengambilan gudang inhouse' },
            { label: 'Kesiapan Logistik', value: '100% Release', desc: 'Material terverifikasi' },
          ],
          filterKey: 'statusPengajuanProject',
          filterVal: 'MR/PO Approved',
        };
      }

      case 'pulling-cable': {
        const count = kpiFilteredProjects.length;
        const foDoneCount = kpiFilteredProjects.filter((p) => p.statusPullingCableFo === 'Done').length;
        const totalTargetMeters = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.panjangRelokasi || 0), 0);
        const totalSelesaiMeters = kpiFilteredProjects.reduce((acc, c) => acc + Number(c.pullingFoPanjangSelesai || c.pullingPanjangSelesai || 0), 0);

        return {
          title: 'Pulling Cable (Penarikan Kabel FO Aktif)',
          subtitle: 'Aktivitas penggelaran kabel di lapangan oleh tim penarikan kontraktor vendor.',
          badge: `${count} Lokasi Pulling`,
          badgeClass: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
          gradientBg: 'from-slate-900 via-purple-950 to-slate-900',
          accentColor: 'from-purple-500 to-pink-600',
          icon: Zap,
          description: 'Pulling Cable merupakan inti eksekusi fisik. Melacak progres meter kabel yang sudah ditarik per hari, kesiapan join closure, dan terminasi OTB di titik ujung.',
          insights: [
            { label: 'Lokasi Aktif Pulling', value: `${count} lokasi`, desc: 'Tim lapangan bekerja' },
            { label: 'Pulling FO Selesai (Done)', value: `${foDoneCount} lokasi`, desc: 'Jalur kabel terpasang' },
            { label: 'Volume Tarik Selesai', value: `${totalSelesaiMeters.toLocaleString('id-ID')} m`, desc: 'Meter fisik selesai' },
            { label: 'Target Total Meter', value: `${totalTargetMeters.toLocaleString('id-ID')} m`, desc: 'Total target bentangan' },
          ],
          filterKey: 'statusPullingCableFo',
          filterVal: 'Pulling Cable',
        };
      }
    }
  };

  const details = getItemDetails();
  const HeaderIcon = details.icon;

  const handleExportThisKpi = () => {
    storageService.exportToExcel(kpiFilteredProjects);
    if (showToast) {
      showToast(`Data ${details.title.split('(')[0].trim()} (${kpiFilteredProjects.length} proyek) berhasil diekspor.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-6xl max-h-[94vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header Banner */}
        <div className={`p-5 sm:p-6 text-white bg-gradient-to-br ${details.gradientBg} border-b border-slate-800 shrink-0 relative overflow-hidden`}>
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${details.accentColor} flex items-center justify-center text-white shrink-0 shadow-lg ring-1 ring-white/20`}>
                <HeaderIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${details.badgeClass}`}>
                    {details.badge}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {kpiFilteredProjects.length} dari {projects.length} Total Proyek ({projects.length > 0 ? Math.round((kpiFilteredProjects.length / projects.length) * 100) : 0}%)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{details.title}</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                  {details.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
              title="Tutup Jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-slate-800/80">
            {details.insights.map((ins, idx) => (
              <div key={idx} className="bg-slate-900/60 backdrop-blur-xs p-2.5 rounded-xl border border-slate-800/90 flex flex-col justify-between">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider truncate">{ins.label}</span>
                <div className="mt-1">
                  <span className="text-base sm:text-lg font-extrabold font-mono text-white tracking-tight">{ins.value}</span>
                  <span className="block text-[10px] text-slate-400 truncate mt-0.5">{ins.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Bar inside Banner */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 text-[11px] min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{details.description}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onApplyFilterToMainTable && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyFilterToMainTable(details.filterKey, details.filterVal);
                    onClose();
                    if (showToast) {
                      showToast(`Filter "${details.title.split('(')[0].trim()}" diterapkan ke tabel utama.`);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Terapkan Filter ke Tabel Utama</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportThisKpi}
                disabled={kpiFilteredProjects.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-600/60 hover:bg-emerald-900 hover:text-white rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body: Project List & Breakdown Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4 bg-slate-50/60">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Daftar Proyek: {details.title.split('(')[0].trim()} ({displayProjects.length} Proyek)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gunakan pencarian atau filter zona/kategori untuk meninjau data spesifik.
                </p>
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Zona Filter */}
                {availableZonas.length > 0 && (
                  <select
                    value={selectedZonaFilter}
                    onChange={(e) => setSelectedZonaFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="all">Semua Zona ({availableZonas.length})</option>
                    {availableZonas.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                )}

                {/* Category Filter */}
                {availableCategories.length > 0 && (
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="all">Semua Kategori ({availableCategories.length})</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}

                {/* Search Box */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari PMO ID, Project, Vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Projects List */}
            {displayProjects.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Tidak ada proyek yang sesuai dengan filter.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Coba reset kata kunci pencarian atau ubah filter zona/kategori.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {displayProjects.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-2xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                  >
                    {/* Left details */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {proj.pmoId}
                        </span>
                        <span className="font-bold text-slate-900 truncate">
                          {proj.projectDescription}
                        </span>
                        
                        <PriorityBadge priority={proj.priority || 'Normal'} size="xs" showLevel />

                        {proj.projectCategory && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                            {proj.projectCategory}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>Vendor: <strong className="text-slate-700">{proj.namaVendor || '-'}</strong></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span>PIC: <strong className="text-slate-700">{proj.picSectionHead || '-'}</strong></span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>Zona: <strong className="text-slate-700">{proj.zona || '-'} • {proj.areaKota || '-'}</strong></span>
                        </span>
                      </div>

                      {/* Extra metrics per item type */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10.5px]">
                        {Number(proj.panjangRelokasi || 0) > 0 && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
                            FO: {Number(proj.panjangRelokasi).toLocaleString('id-ID')} m
                          </span>
                        )}
                        {proj.projectStatus && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            Status: {proj.projectStatus}
                          </span>
                        )}
                        {proj.statusConstruction && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                            Konstruksi: {proj.statusConstruction}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right action */}
                    {onSelectProject && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProject(proj);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0 self-end md:self-center"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Lihat Rincian</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-100/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
            <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span className="truncate">
              Informasi terintegrasi secara dinamis sesuai metrik <strong>{details.title.split('(')[0].trim()}</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0 self-end sm:self-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
