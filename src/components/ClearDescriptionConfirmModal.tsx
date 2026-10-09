import React from 'react';
import { Eraser, AlertCircle } from 'lucide-react';

interface ClearDescriptionConfirmModalProps {
  isOpen: boolean;
  totalProjects: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearDescriptionConfirmModal: React.FC<ClearDescriptionConfirmModalProps> = ({
  isOpen,
  totalProjects,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Eraser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Bersihkan Project Description</h3>
              <p className="text-xs text-slate-500">Hapus & bersihkan seluruh data dalam kolom Project Description</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-950">
                  Data pada kolom Project Description untuk {totalProjects} proyek akan dibersihkan (dikosongkan).
                </span>
                <p className="text-[11px] text-amber-800 mt-1">
                  Semua data proyek lainnya (PMO ID, Status, Vendor, Area, Progres FO/Sipil, dll) tetap aman dan tidak akan terhapus.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Ya, Bersihkan Project Description</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
