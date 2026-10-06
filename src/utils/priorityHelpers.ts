import { 
  Flame, 
  ShieldAlert, 
  Zap, 
  Sparkles,
  AlertTriangle, 
  Activity, 
  Check, 
  CheckCircle2, 
  ArrowDownRight,
  LucideIcon
} from 'lucide-react';
import { PriorityLevel } from '../types/project';

export interface PriorityMeta {
  level: number;
  tierName: string;
  levelName: string;
  badgeLabel: string;
  description: string;
  icon: LucideIcon;
  textColor: string;
  bgColor: string;
  borderColor: string;
  gradientBg: string;
  glowColor: string;
  ringColor: string;
  dotColor: string;
  hasPulseRing?: boolean;
  weight: number; // for sorting (100 highest -> 10 lowest)
}

export const getPriorityMeta = (priority?: string): PriorityMeta => {
  const p = (priority || 'Normal').trim();

  switch (p) {
    // === TINGKAT 1 (KRITIS): Critical / P1 (Aksen Merah / Flame dengan efek pulse ring & dot merah) ===
    case 'Critical':
      return {
        level: 1,
        tierName: 'Tingkat 1 • Kritis',
        levelName: 'Tingkat 1 • Kritis',
        badgeLabel: 'Critical',
        description: 'Tingkat 1 (Kritis): Penanganan darurat segera dengan dampak operasional langsung.',
        icon: Flame,
        textColor: 'text-rose-700',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-300',
        gradientBg: 'from-rose-500 to-red-600',
        glowColor: 'shadow-rose-500/25',
        ringColor: 'ring-rose-500/30',
        dotColor: 'bg-rose-600',
        hasPulseRing: true,
        weight: 100,
      };

    case 'P1':
      return {
        level: 1,
        tierName: 'Tingkat 1 • Kritis (P1)',
        levelName: 'Tingkat 1 • Kritis (P1)',
        badgeLabel: 'P1 - Kritis',
        description: 'Tingkat 1 (Kritis): Prioritas tertinggi level 1. Wajib diselesaikan hari ini.',
        icon: Flame,
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        gradientBg: 'from-red-600 to-rose-700',
        glowColor: 'shadow-red-500/25',
        ringColor: 'ring-red-500/30',
        dotColor: 'bg-red-600',
        hasPulseRing: true,
        weight: 95,
      };

    // === TINGKAT 2 (MENDESAK / UTAMA): Urgent (Aksen Oranye / Zap) & Top Priority (Aksen Ungu / Sparkles) ===
    case 'Urgent':
      return {
        level: 2,
        tierName: 'Tingkat 2 • Mendesak',
        levelName: 'Tingkat 2 • Mendesak',
        badgeLabel: 'Urgent',
        description: 'Tingkat 2 (Mendesak): Waktu penyelesaian sangat ketat dan perlu percepatan lapangan.',
        icon: Zap,
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        gradientBg: 'from-orange-500 to-amber-600',
        glowColor: 'shadow-orange-500/20',
        ringColor: 'ring-orange-500/30',
        dotColor: 'bg-orange-500',
        hasPulseRing: false,
        weight: 85,
      };

    case 'Top Priority':
      return {
        level: 2,
        tierName: 'Tingkat 2 • Utama',
        levelName: 'Tingkat 2 • Utama',
        badgeLabel: 'Top Priority',
        description: 'Tingkat 2 (Utama): Proyek prioritas utama pimpinan & eskalasi Dinas.',
        icon: Sparkles,
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-300',
        gradientBg: 'from-purple-600 to-indigo-600',
        glowColor: 'shadow-purple-500/20',
        ringColor: 'ring-purple-500/30',
        dotColor: 'bg-purple-500',
        hasPulseRing: false,
        weight: 80,
      };

    // === TINGKAT 3 (TINGGI): High / P2 (Aksen Amber / AlertTriangle) ===
    case 'High':
      return {
        level: 3,
        tierName: 'Tingkat 3 • Tinggi',
        levelName: 'Tingkat 3 • Tinggi',
        badgeLabel: 'High',
        description: 'Tingkat 3 (Tinggi): Masuk dalam jadwal eksekusi utama minggu ini.',
        icon: AlertTriangle,
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        gradientBg: 'from-amber-500 to-yellow-600',
        glowColor: 'shadow-amber-500/20',
        ringColor: 'ring-amber-500/30',
        dotColor: 'bg-amber-500',
        hasPulseRing: false,
        weight: 70,
      };

    case 'P2':
      return {
        level: 3,
        tierName: 'Tingkat 3 • Tinggi (P2)',
        levelName: 'Tingkat 3 • Tinggi (P2)',
        badgeLabel: 'P2 - Tinggi',
        description: 'Tingkat 3 (Tinggi): Prioritas level 2, percepatan pengajuan dan kesiapan kerja.',
        icon: AlertTriangle,
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        gradientBg: 'from-amber-500 to-yellow-600',
        glowColor: 'shadow-amber-500/20',
        ringColor: 'ring-amber-500/30',
        dotColor: 'bg-amber-500',
        hasPulseRing: false,
        weight: 65,
      };

    // === TINGKAT 4 (SEDANG): Medium / P3 (Aksen Biru Langit / Activity) ===
    case 'Medium':
      return {
        level: 4,
        tierName: 'Tingkat 4 • Sedang',
        levelName: 'Tingkat 4 • Sedang',
        badgeLabel: 'Medium',
        description: 'Tingkat 4 (Sedang): Penjadwalan reguler dengan waktu pengerjaan standar.',
        icon: Activity,
        textColor: 'text-sky-700',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        gradientBg: 'from-sky-500 to-blue-600',
        glowColor: 'shadow-sky-500/20',
        ringColor: 'ring-sky-500/30',
        dotColor: 'bg-sky-500',
        hasPulseRing: false,
        weight: 50,
      };

    case 'P3':
      return {
        level: 4,
        tierName: 'Tingkat 4 • Sedang (P3)',
        levelName: 'Tingkat 4 • Sedang (P3)',
        badgeLabel: 'P3 - Sedang',
        description: 'Tingkat 4 (Sedang): Prioritas level 3, progres standar sesuai antrean.',
        icon: Activity,
        textColor: 'text-sky-700',
        bgColor: 'bg-sky-50',
        borderColor: 'border-sky-300',
        gradientBg: 'from-sky-500 to-blue-600',
        glowColor: 'shadow-sky-500/20',
        ringColor: 'ring-sky-500/30',
        dotColor: 'bg-sky-500',
        hasPulseRing: false,
        weight: 45,
      };

    // === TINGKAT 5 (STANDAR): Normal (Aksen Biru Slate / Check) ===
    case 'Normal':
      return {
        level: 5,
        tierName: 'Tingkat 5 • Standar',
        levelName: 'Tingkat 5 • Standar',
        badgeLabel: 'Normal',
        description: 'Tingkat 5 (Standar): Alur proyek reguler standar tanpa eskalasi.',
        icon: Check,
        textColor: 'text-slate-700',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
        gradientBg: 'from-slate-600 to-slate-700',
        glowColor: 'shadow-slate-500/10',
        ringColor: 'ring-slate-400/20',
        dotColor: 'bg-slate-400',
        hasPulseRing: false,
        weight: 30,
      };

    // === TINGKAT 6 (RENDAH): Low (Aksen Abu-abu / ArrowDownRight) ===
    case 'Low':
    default:
      return {
        level: 6,
        tierName: 'Tingkat 6 • Rendah',
        levelName: 'Tingkat 6 • Rendah',
        badgeLabel: p === 'Low' ? 'Low' : p || 'Low',
        description: 'Tingkat 6 (Rendah): Prioritas fleksibel dapat dikerjakan setelah prioritas di atasnya.',
        icon: ArrowDownRight,
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        gradientBg: 'from-gray-500 to-zinc-600',
        glowColor: 'shadow-gray-500/10',
        ringColor: 'ring-gray-400/20',
        dotColor: 'bg-gray-400',
        hasPulseRing: false,
        weight: 10,
      };
  }
};

export const PRIORITY_TIERS = [
  {
    tier: 1,
    title: 'Tingkat 1 (Kritis)',
    subtitle: 'Critical, P1',
    description: 'Aksen Merah / Flame dengan efek pulse ring & dot merah',
    color: 'rose',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    gradient: 'from-rose-500 to-red-600',
    icon: Flame,
    hasPulseRing: true,
    values: ['Critical', 'P1'],
  },
  {
    tier: 2,
    title: 'Tingkat 2 (Mendesak / Utama)',
    subtitle: 'Urgent (Zap), Top Priority (Sparkles)',
    description: 'Urgent (Oranye) & Top Priority (Ungu)',
    color: 'orange-purple',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-50/70',
    borderColor: 'border-orange-300',
    gradient: 'from-orange-500 via-amber-500 to-purple-600',
    icon: Zap,
    values: ['Urgent', 'Top Priority'],
  },
  {
    tier: 3,
    title: 'Tingkat 3 (Tinggi)',
    subtitle: 'High, P2',
    description: 'Aksen Amber / AlertTriangle',
    color: 'amber',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    gradient: 'from-amber-500 to-yellow-600',
    icon: AlertTriangle,
    values: ['High', 'P2'],
  },
  {
    tier: 4,
    title: 'Tingkat 4 (Sedang)',
    subtitle: 'Medium, P3',
    description: 'Aksen Biru Langit / Activity',
    color: 'sky',
    textColor: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    gradient: 'from-sky-500 to-blue-600',
    icon: Activity,
    values: ['Medium', 'P3'],
  },
  {
    tier: 5,
    title: 'Tingkat 5 (Standar)',
    subtitle: 'Normal',
    description: 'Aksen Biru Slate / Check',
    color: 'slate',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    gradient: 'from-slate-600 to-slate-700',
    icon: Check,
    values: ['Normal'],
  },
  {
    tier: 6,
    title: 'Tingkat 6 (Rendah)',
    subtitle: 'Low',
    description: 'Aksen Abu-abu / ArrowDownRight',
    color: 'gray',
    textColor: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    gradient: 'from-gray-500 to-zinc-600',
    icon: ArrowDownRight,
    values: ['Low'],
  },
];
