import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Package, 
  HardHat, 
  Layers, 
  ShieldCheck,
  UserCheck, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles,
  Paperclip,
  Share2
} from 'lucide-react';
import { ProjectData } from '../types/project';
import { 
  DocumentEmailDispatchType, 
  DocumentEmailDispatchRecord,
  PENGAJUAN_MATERIAL_SLOTS,
  PENGAJUAN_BOQ_LABOUR_SLOTS,
  PENGAJUAN_CE_BOQ_SLOTS,
  CLOSING_PROJECT_SLOTS,
  DEFAULT_EMAIL_CONTACT_SUGGESTIONS,
  UploadedFileMeta
} from '../types/document';

interface SendProjectDocumentEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData | null;
  initialDispatchType?: DocumentEmailDispatchType;
  onEmailSent?: (updatedProject: ProjectData, record: DocumentEmailDispatchRecord) => void;
  showToast: (msg: string) => void;
  isNeonMode?: boolean;
}

export const SendProjectDocumentEmailModal: React.FC<SendProjectDocumentEmailModalProps> = ({
  isOpen,
  onClose,
  project,
  initialDispatchType = 'pengajuan-material',
  onEmailSent,
  showToast,
  isNeonMode = false,
}) => {
  if (!isOpen || !project) return null;

  // Selected dispatch type
  const [dispatchType, setDispatchType] = useState<DocumentEmailDispatchType>(initialDispatchType);
  
  // Keep dispatchType synced when initialDispatchType prop changes or modal opens
  useEffect(() => {
    if (initialDispatchType) {
      setDispatchType(initialDispatchType);
    }
  }, [initialDispatchType, isOpen]);

  // Recipients
  const [toEmail, setToEmail] = useState<string>('chaerulloh28@gmail.com');
  const [ccList, setCcList] = useState<string[]>([
    'pic.govrel@linknet.co.id',
    'waspang.dsb@linknet.co.id',
    'finance.closing@linknet.co.id',
    'procurement.relokasi@linknet.co.id',
  ]);
  const [ccInput, setCcInput] = useState<string>('');

  // Email subject & body
  const [subject, setSubject] = useState<string>('');
  const [messageBody, setMessageBody] = useState<string>('');
  const [selectedDocKeys, setSelectedDocKeys] = useState<Record<string, boolean>>({});

  // Loading & status states
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });

  // Get uploaded docs by category (Material, BOQ, CE/BOQ, and Closing Project)
  const uploadedDocs = useMemo(() => {
    const dp = project.documentProject || {};
    
    // Fallback closing documents from project root fields if not yet in closingProject.documents
    const rawClosingDocs = project.closingProject?.documents || {};
    const closingDocs: Record<string, UploadedFileMeta | undefined> = { ...rawClosingDocs };
    const defaultDate = project.prajectDate || project.projectCreateDate || new Date().toISOString().split('T')[0];

    if (!closingDocs['baOpnameMaterial'] && project.baOpnameMaterial) {
      closingDocs['baOpnameMaterial'] = {
        name: project.baOpnameMaterial,
        size: 1420000,
        type: 'application/pdf',
        uploadedAt: defaultDate,
      };
    }
    if (!closingDocs['baOpnameLabour'] && project.baOpnameLabour) {
      closingDocs['baOpnameLabour'] = {
        name: project.baOpnameLabour,
        size: 980000,
        type: 'application/pdf',
        uploadedAt: defaultDate,
      };
    }
    if (!closingDocs['abdRelokasi'] && project.closingAbdRelokasi) {
      closingDocs['abdRelokasi'] = {
        name: project.closingAbdRelokasi,
        size: 3200000,
        type: 'application/octet-stream',
        uploadedAt: defaultDate,
      };
    }
    if (!closingDocs['abdInternal'] && project.closingAbdInternal) {
      closingDocs['abdInternal'] = {
        name: project.closingAbdInternal,
        size: 2100000,
        type: 'application/pdf',
        uploadedAt: defaultDate,
      };
    }
    if (!closingDocs['fotoDokumentasi'] && project.fotoDokumentasi) {
      closingDocs['fotoDokumentasi'] = {
        name: project.fotoDokumentasi,
        size: 3800000,
        type: 'image/jpeg',
        uploadedAt: defaultDate,
      };
    }

    return {
      material: dp.pengajuanMaterial?.documents || {},
      boq: dp.pengajuanBoqLabour?.documents || {},
      ceBoq: dp.pengajuanCeAndBoqLabour?.documents || {},
      closing: closingDocs,
    };
  }, [project]);

  // Determine current slots based on dispatch type
  const currentSlots = useMemo(() => {
    switch (dispatchType) {
      case 'pengajuan-material':
        return PENGAJUAN_MATERIAL_SLOTS;
      case 'pengajuan-boq':
        return PENGAJUAN_BOQ_LABOUR_SLOTS;
      case 'pengajuan-material-and-boq':
        return PENGAJUAN_CE_BOQ_SLOTS;
      case 'closing-project':
        return CLOSING_PROJECT_SLOTS;
      default:
        return PENGAJUAN_MATERIAL_SLOTS;
    }
  }, [dispatchType]);

  // Available uploaded files for current dispatch type
  const availableDocs = useMemo(() => {
    let docsMap: Record<string, UploadedFileMeta | undefined> = {};
    if (dispatchType === 'pengajuan-material') {
      docsMap = uploadedDocs.material;
    } else if (dispatchType === 'pengajuan-boq') {
      docsMap = uploadedDocs.boq;
    } else if (dispatchType === 'closing-project') {
      docsMap = uploadedDocs.closing;
    } else {
      docsMap = {
        ...uploadedDocs.material,
        ...uploadedDocs.boq,
        ...uploadedDocs.ceBoq,
      };
    }

    return currentSlots.map((slot) => {
      const doc = docsMap[slot.key];
      return {
        slot,
        doc,
        isUploaded: Boolean(doc && doc.name),
      };
    });
  }, [dispatchType, currentSlots, uploadedDocs]);

  // Initialize selected document checkboxes whenever dispatchType changes
  useEffect(() => {
    const initialSelected: Record<string, boolean> = {};
    availableDocs.forEach(({ slot, isUploaded }) => {
      initialSelected[slot.key] = isUploaded;
    });
    setSelectedDocKeys(initialSelected);
  }, [dispatchType, availableDocs]);

  // Generate dynamic subject and formal body template based on selected type
  useEffect(() => {
    const typeLabel = 
      dispatchType === 'pengajuan-material'
        ? 'Pengajuan Material'
        : dispatchType === 'pengajuan-boq'
        ? 'Pengajuan BOQ Labour'
        : dispatchType === 'closing-project'
        ? 'Closing Project'
        : 'Pengajuan Material & BOQ Labour';

    const pmoIdStr = project.pmoId || 'DSB-ID';
    const projIdStr = project.projectId || '-';
    const segmenStr = project.projectDescription || 'Relokasi FO Segmen';

    // Build uploaded & pending file list
    const uploadedFileList = availableDocs
      .filter(({ isUploaded, slot }) => isUploaded && selectedDocKeys[slot.key] !== false)
      .map(({ slot, doc }, idx) => `  ${idx + 1}. ${slot.label}: ${doc?.name || 'File terunggah'}`)
      .join('\n');

    const pendingFileList = availableDocs
      .filter(({ isUploaded }) => !isUploaded)
      .map(({ slot }) => `  - ${slot.label} (Belum diunggah)`)
      .join('\n');

    if (dispatchType === 'closing-project') {
      const poStr = project.closingProject?.poNumber || project.poNumber || `PO-45000${(pmoIdStr.replace(/[^0-9]/g, '') || '0001').slice(-4).padStart(4, '0')}`;
      const prajectDateStr = project.closingProject?.projectDate || project.prajectDate || new Date().toISOString().split('T')[0];
      const statusClosingStr = project.closingProject?.statusPengajuan || project.statusPengajuanClosing || 'Submit';
      const remarksClosingStr = project.closingProject?.remarks || project.closingRemarks || 'Dokumen penutupan proyek lengkap dan siap diproses.';

      const newSubject = `[CLOSING PROJECT] - ${pmoIdStr} (${projIdStr}) - ${segmenStr} - PO: ${poStr}`;
      setSubject(newSubject);

      const bodyText = `Yth. Tim Terkait / Management, Tim Finance & Invoicing,

Dengan hormat,
Melalui email ini kami menyampaikan berkas CLOSING PROJECT (Penutupan Proyek Relokasi FO) untuk proyek berikut:

RINGKASAN PENUTUPAN PROYEK:
- DSB - ID                 : ${pmoIdStr}
- Project ID               : ${projIdStr}
- Segment Relokasi         : ${segmenStr}
- Area / Kota              : ${project.areaKota || '-'}
- Kategori Proyek          : ${project.projectCategory || '-'}
- No. PO (Purchase Order)  : ${poStr}
- Praject Date (Tgl Closing): ${prajectDateStr}
- Status Pengajuan Closing : ${statusClosingStr}
- Vendor Pelaksana         : ${project.namaVendor || '-'}
- Waspang Internal DSB     : ${project.waspangDsb || '-'}
- PIC Govrel               : ${project.picSectionHead || '-'}
- Catatan Remarks Closing  : ${remarksClosingStr}
- Tanggal Pengiriman Email : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

DAFTAR BERKAS DOKUMEN CLOSING TERLAMPIR (${availableDocs.filter(d => selectedDocKeys[d.slot.key]).length} Berkas):
${uploadedFileList || '  (Tidak ada berkas yang dipilih)'}

${pendingFileList ? `STATUS BERKAS BELUM LENGKAP:\n${pendingFileList}\n` : ''}
PERMOHONAN TINDAK LANJUT:
Seluruh berkas administrasi dan fisik penutupan proyek di atas telah kami verifikasi secara internal. Mohon kiranya dapat ditindaklanjuti untuk proses validasi approval (Approval BALAP / Approval BAST / TECO Done) serta penerbitan tagihan (Invoice) sesuai prosedur yang berlaku.

Apabila terdapat verifikasi teknis atau berkas pendukung tambahan yang dibutuhkan, mohon untuk menghubungi kami.

Demikian permohonan Closing Project ini kami sampaikan. Atas perhatian, arahan, dan kerjasamanya kami ucapkan terima kasih.

Hormat kami,
Tim PMO & Engineering Relokasi FO
PT. Link Net Tbk / Proyek DSB GOV
Kontak: ${project.picSectionHead || 'Govrel Support'}`;

      setMessageBody(bodyText);
    } else {
      const newSubject = `[${typeLabel}] - ${pmoIdStr} (${projIdStr}) - ${segmenStr}`;
      setSubject(newSubject);

      const bodyText = `Yth. Tim Terkait / Management,

Dengan hormat,
Melalui email ini kami menyampaikan berkas ${typeLabel.toUpperCase()} untuk proyek relokasi fiber optic berikut:

RINGKASAN INFORMASI PROYEK:
- DSB - ID              : ${pmoIdStr}
- Project ID            : ${projIdStr}
- Segment Relokasi      : ${segmenStr}
- Area / Kota           : ${project.areaKota || '-'}
- Kategori Proyek       : ${project.projectCategory || '-'}
- Vendor Pelaksana      : ${project.namaVendor || '-'}
- PIC Govrel            : ${project.picSectionHead || '-'}
- Waspang Internal DSB  : ${project.waspangDsb || '-'}
- Status Proyek         : ${project.projectStatus || '-'}
- Tanggal Pengajuan     : ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

DAFTAR BERKAS DOKUMEN PENDUKUNG TERLAMPIR (${availableDocs.filter(d => selectedDocKeys[d.slot.key]).length} Berkas):
${uploadedFileList || '  (Tidak ada berkas yang dipilih)'}

${pendingFileList ? `STATUS BERKAS MENUNGGU / BELUM LENGKAP:\n${pendingFileList}\n` : ''}
CATATAN TAMBAHAN:
Mohon kiranya berkas ${typeLabel} ini dapat ditinjau dan diproses lebih lanjut untuk approval serta penerbitan dokumen kerja (MR/PO/SPK).

Apabila terdapat pertanyaan atau data pendukung tambahan yang dibutuhkan, mohon untuk menghubungi kami.

Demikian permohonan pengajuan ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.

Hormat kami,
Tim PMO & Engineering Relokasi FO
PT. Link Net Tbk / Proyek DSB GOV
Kontak: ${project.picSectionHead || 'Govrel Support'}`;

      setMessageBody(bodyText);
    }
  }, [dispatchType, project, availableDocs, selectedDocKeys]);

  // CC tag management
  const handleAddCc = (emailToAdd: string) => {
    const trimmed = emailToAdd.trim().toLowerCase();
    if (!trimmed) return;
    if (!ccList.includes(trimmed)) {
      setCcList([...ccList, trimmed]);
    }
    setCcInput('');
  };

  const handleRemoveCc = (indexToRemove: number) => {
    setCcList(ccList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCcKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      handleAddCc(ccInput);
    }
  };

  // Toggle document selection
  const handleToggleDocKey = (key: string) => {
    setSelectedDocKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Generate mailto link
  const generateMailtoUrl = () => {
    const toStr = encodeURIComponent(toEmail.trim());
    const ccStr = encodeURIComponent(ccList.join(', '));
    const subjectStr = encodeURIComponent(subject.trim());
    const bodyStr = encodeURIComponent(messageBody.trim());
    return `mailto:${toStr}?cc=${ccStr}&subject=${subjectStr}&body=${bodyStr}`;
  };

  // Generate web Gmail compose link
  const generateGmailUrl = () => {
    const toStr = encodeURIComponent(toEmail.trim());
    const ccStr = encodeURIComponent(ccList.join(', '));
    const subjectStr = encodeURIComponent(subject.trim());
    const bodyStr = encodeURIComponent(messageBody.trim());
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${toStr}&cc=${ccStr}&su=${subjectStr}&body=${bodyStr}`;
  };

  // Record dispatch in project
  const recordDispatch = (transport: 'smtp_api' | 'client_mailto' | 'gmail_web', status: 'sent' | 'client_opened') => {
    const typeLabel = 
      dispatchType === 'pengajuan-material'
        ? 'Pengajuan Material'
        : dispatchType === 'pengajuan-boq'
        ? 'Pengajuan BOQ Labour'
        : dispatchType === 'closing-project'
        ? 'Closing Project'
        : 'Pengajuan Material & BOQ Labour';

    const attachedKeys = Object.entries(selectedDocKeys)
      .filter(([_, isSelected]) => isSelected)
      .map(([k]) => k);

    const attachedNames = availableDocs
      .filter(({ slot }) => selectedDocKeys[slot.key])
      .map(({ doc, slot }) => doc?.name || slot.label);

    const newRecord: DocumentEmailDispatchRecord = {
      id: `disp-${Date.now()}`,
      projectId: project.id,
      pmoId: project.pmoId,
      dispatchType,
      dispatchTypeName: typeLabel,
      sentAt: new Date().toISOString(),
      to: toEmail.trim(),
      cc: ccList,
      subject: subject.trim(),
      body: messageBody,
      attachedDocumentKeys: attachedKeys,
      attachedDocumentNames: attachedNames,
      status,
      transportMethod: transport,
    };

    const existingHistory = project.emailDispatchHistory || [];
    const updatedHistory = [newRecord, ...existingHistory];

    const updatedProject: ProjectData = {
      ...project,
      emailDispatchHistory: updatedHistory,
      lastEmailDispatch: newRecord,
    };

    if (onEmailSent) {
      onEmailSent(updatedProject, newRecord);
    }

    return newRecord;
  };

  // Submit via Serverless API (/api/send-email)
  const handleSendViaApi = async () => {
    if (!toEmail.trim()) {
      showToast('Harap masukkan alamat email penerima (To)');
      return;
    }

    setIsSending(true);
    setSendStatus({ type: 'idle' });

    try {
      const selectedAttachments = availableDocs
        .filter(({ slot, isUploaded }) => isUploaded && selectedDocKeys[slot.key])
        .map(({ doc }) => ({
          name: doc?.name || 'Dokumen',
          size: doc?.size,
          dataUrl: doc?.dataUrl,
        }));

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toEmail.trim(),
          cc: ccList,
          subject: subject.trim(),
          body: messageBody,
          dispatchType,
          pmoId: project.pmoId,
          projectId: project.projectId,
          projectDescription: project.projectDescription,
          documents: selectedAttachments,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        recordDispatch('smtp_api', 'sent');
        setSendStatus({
          type: 'success',
          message: data.simulated
            ? 'Email berkas closing/pengajuan tervalidasi dan siap terkirim via serverless Vercel (Mode Simulasi aktif tanpa SMTP).'
            : 'Email berkas closing/pengajuan berhasil dikirimkan via SMTP Serverless ke seluruh penerima & CC!',
        });
        showToast(`Email ${dispatchType} berhasil dikirim ke ${toEmail}!`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(data.error || 'Gagal mengirim email.');
      }
    } catch (err: any) {
      console.warn('Fallback: Serverless API error or offline mode, falling back to client mailto', err);
      // Fallback: offer client mailto
      setSendStatus({
        type: 'error',
        message: err.message || 'Koneksi ke endpoint /api/send-email belum aktif. Anda dapat menggunakan tombol "Kirim via Client Mail (Outlook / Gmail)" di bawah ini.',
      });
      showToast('Gagal mengirim via API. Gunakan opsi Kirim via Client / Gmail.');
    } finally {
      setIsSending(false);
    }
  };

  // Send via Mail Client (Outlook / Default app)
  const handleSendViaClient = () => {
    if (!toEmail.trim()) {
      showToast('Harap masukkan alamat email penerima (To)');
      return;
    }
    recordDispatch('client_mailto', 'client_opened');
    window.location.href = generateMailtoUrl();
    showToast('Membuka aplikasi email client bawaan...');
  };

  // Open in Gmail Web Compose
  const handleSendViaGmail = () => {
    if (!toEmail.trim()) {
      showToast('Harap masukkan alamat email penerima (To)');
      return;
    }
    recordDispatch('gmail_web', 'client_opened');
    window.open(generateGmailUrl(), '_blank');
    showToast('Membuka Gmail Web Compose...');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border ${
        isNeonMode ? 'bg-[#0b1329] border-sky-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isNeonMode ? 'bg-[#0f1b3b] border-slate-800' : 'bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 via-indigo-600 to-teal-600 text-white flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Kirim Dokumen & Closing Project via Email
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                  {project.pmoId}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Pilih opsi pengajuan (Material, BOQ Labour, Gabungan, atau Closing Project) dan tentukan alamat CC penerima
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Message Alert */}
          {sendStatus.type === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-900 font-semibold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sendStatus.message}</span>
            </div>
          )}
          {sendStatus.type === 'error' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-900 font-medium shadow-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{sendStatus.message}</span>
            </div>
          )}

          {/* 1. Tipe Pengiriman (Pilihan Sesuai Permintaan User) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Pilih Kategori Dokumen yang Ingin Dikirimkan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Option 1: Pengajuan Material */}
              <button
                type="button"
                onClick={() => setDispatchType('pengajuan-material')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatchType === 'pengajuan-material'
                    ? 'bg-sky-50/90 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${dispatchType === 'pengajuan-material' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                    {Object.values(uploadedDocs.material).filter(Boolean).length} / 11 Berkas
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Hanya Pengajuan Material</h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-tight">
                    Surat dinas, rekomtek, APD, KMZ, dan Form CE Material
                  </p>
                </div>
              </button>

              {/* Option 2: Pengajuan BOQ Labour */}
              <button
                type="button"
                onClick={() => setDispatchType('pengajuan-boq')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatchType === 'pengajuan-boq'
                    ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${dispatchType === 'pengajuan-boq' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <HardHat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {Object.values(uploadedDocs.boq).filter(Boolean).length} / 11 Berkas
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Hanya Pengajuan BOQ Labour</h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-tight">
                    Surat dinas, rekomtek, BA survey, APD, dan Form BOQ Labour
                  </p>
                </div>
              </button>

              {/* Option 3: Pengajuan Material & BOQ Labour (Lengkap) */}
              <button
                type="button"
                onClick={() => setDispatchType('pengajuan-material-and-boq')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatchType === 'pengajuan-material-and-boq'
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${dispatchType === 'pengajuan-material-and-boq' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Paket Gabungan
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Material & BOQ Labour</h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-tight">
                    Paket gabungan pengajuan Material sekaligus BOQ Labour
                  </p>
                </div>
              </button>

              {/* Option 4: Closing Project (BA Opname, ABD, Foto Dokumentasi, No. PO) */}
              <button
                type="button"
                onClick={() => setDispatchType('closing-project')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  dispatchType === 'closing-project'
                    ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${dispatchType === 'closing-project' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
                    {Object.values(uploadedDocs.closing).filter(Boolean).length} / 5 Berkas
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Closing Project</h4>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-tight">
                    BA Opname Mat/Lab, ABD Relokasi/Internal, Foto, PO & Status
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Form Penerima (To) & CC Berbagai Email */}
          <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 space-y-3">
            {/* Field To (Penerima Utama) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Kepada / Alamat Penerima (To): <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  Email PIC / Verifikator / Mitra
                </span>
              </div>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="misal: chaerulloh28@gmail.com atau pic.govrel@linknet.co.id"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
              />
            </div>

            {/* Field CC (Multi-Email dengan Chips) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Tembusan / CC ke Berbagai Alamat Email:
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  {ccList.length} Alamat Email di-CC
                </span>
              </div>

              {/* CC Tags Container */}
              <div className="p-2 bg-white border border-slate-300 rounded-lg min-h-[44px] flex flex-wrap items-center gap-1.5 shadow-2xs">
                {ccList.map((email, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-sky-900 border border-sky-300 text-[11px] font-semibold"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCc(idx)}
                      className="text-sky-600 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                      title="Hapus CC"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="email"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={handleCcKeyDown}
                  onBlur={() => {
                    if (ccInput.trim()) {
                      handleAddCc(ccInput);
                    }
                  }}
                  placeholder="Ketik email lalu tekan Enter atau koma..."
                  className="flex-1 min-w-[200px] px-2 py-1 text-xs text-slate-900 font-medium focus:outline-none bg-transparent"
                />
              </div>

              {/* Quick Suggestion Chips for CC */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span className="text-[10px] font-bold text-slate-500">Tambah Cepat CC:</span>
                {DEFAULT_EMAIL_CONTACT_SUGGESTIONS.map((contact, idx) => {
                  const isAdded = ccList.includes(contact.email.toLowerCase());
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isAdded) {
                          setCcList(ccList.filter((c) => c !== contact.email.toLowerCase()));
                        } else {
                          handleAddCc(contact.email);
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {isAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                      <span>{contact.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field Subjek Email */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Subjek Email:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs"
              />
            </div>
          </div>

          {/* 3. Checklist Dokumen yang Disertakan */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Paperclip className="w-4 h-4 text-sky-600" />
                <span>Dokumen yang Divalidasi & Disertakan dalam Email ({availableDocs.filter(d => selectedDocKeys[d.slot.key]).length} Terpilih):</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const all: Record<string, boolean> = {};
                    availableDocs.forEach(d => { all[d.slot.key] = true; });
                    setSelectedDocKeys(all);
                  }}
                  className="text-[10px] text-sky-700 hover:underline font-bold cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    const none: Record<string, boolean> = {};
                    availableDocs.forEach(d => { none[d.slot.key] = false; });
                    setSelectedDocKeys(none);
                  }}
                  className="text-[10px] text-slate-500 hover:underline font-semibold cursor-pointer"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 pt-1">
              {availableDocs.map(({ slot, doc, isUploaded }) => {
                const isSelected = selectedDocKeys[slot.key] !== false;
                return (
                  <label
                    key={slot.key}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                      isSelected && isUploaded
                        ? 'bg-sky-50/70 border-sky-300 text-sky-950 font-semibold'
                        : isUploaded
                        ? 'bg-slate-50 border-slate-200 text-slate-700 font-medium'
                        : 'bg-slate-50/50 border-slate-200 opacity-60 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleDocKey(slot.key)}
                      className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-bold text-slate-900">{slot.num}. {slot.label}</div>
                      {isUploaded ? (
                        <div className="text-[10px] text-emerald-700 truncate font-mono">
                          ✓ {doc?.name} ({doc?.size ? `${Math.round(doc.size / 1024)} KB` : 'Tersedia'})
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic">Belum diunggah</div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Isi Pesan / Message Body (Editable) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Isi Pesan Email (Dapat Diedit Sesuai Kebutuhan):
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Format Resmi Indonesia</span>
            </div>
            <textarea
              rows={8}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 leading-relaxed font-mono shadow-2xs"
            />
          </div>

          {/* Riwayat Pengiriman Sebelumnya jika ada */}
          {project.emailDispatchHistory && project.emailDispatchHistory.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Riwayat Pengiriman Email Dokumen Proyek Ini ({project.emailDispatchHistory.length} kali terkirim):</span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {project.emailDispatchHistory.map((hist, idx) => (
                  <div key={hist.id || idx} className="text-[10px] p-1.5 bg-white rounded border border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                        {hist.dispatchTypeName}
                      </span>
                      <span className="text-slate-600 truncate font-semibold">Ke: {hist.to}</span>
                      {hist.cc && hist.cc.length > 0 && (
                        <span className="text-slate-400 text-[9px]">(CC: {hist.cc.length})</span>
                      )}
                    </div>
                    <span className="text-slate-500 font-mono text-[9px] shrink-0">
                      {new Date(hist.sentAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with 3 Sending Methods */}
        <div className={`px-5 py-3.5 border-t flex flex-wrap items-center justify-between gap-2.5 ${
          isNeonMode ? 'bg-[#0f1b3b] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            {/* Method 2: Client Mailto */}
            <button
              type="button"
              onClick={handleSendViaClient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Buka email di aplikasi Outlook / Apple Mail / default client Anda"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Buka di Mail App / Outlook</span>
            </button>

            {/* Method 3: Gmail Web */}
            <button
              type="button"
              onClick={handleSendViaGmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Buka compose langsung di Gmail Web"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Buka di Gmail Web</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {/* Method 1: Primary Serverless Dispatch */}
            <button
              type="button"
              onClick={handleSendViaApi}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirimkan via Serverless...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Email Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
