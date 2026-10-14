import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';

interface SendEmailPayload {
  to: string;
  cc?: string[] | string;
  subject: string;
  body: string;
  dispatchType?: 'pengajuan-material' | 'pengajuan-boq' | 'pengajuan-material-and-boq' | 'closing-project';
  pmoId?: string;
  projectId?: string;
  projectDescription?: string;
  documents?: Array<{
    name: string;
    size?: number;
    dataUrl?: string;
  }>;
  smtpConfig?: {
    host?: string;
    port?: number | string;
    user?: string;
    pass?: string;
    from?: string;
    secure?: boolean;
  };
  useTestAccount?: boolean;
}

export default async function handler(req: Request, res: Response) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Gunakan metode POST untuk mengirim email.',
    });
  }

  try {
    const payload = (req.body || {}) as SendEmailPayload;
    const { 
      to, 
      cc, 
      subject, 
      body: msgBody, 
      dispatchType, 
      pmoId, 
      projectId, 
      documents, 
      smtpConfig, 
      useTestAccount 
    } = payload;

    if (!to || !to.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Alamat email penerima (To) wajib diisi.',
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Subjek email wajib diisi.',
      });
    }

    if (!msgBody || !msgBody.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Isi pesan email wajib diisi.',
      });
    }

    // Format CC list
    const ccList: string[] = Array.isArray(cc)
      ? cc.map((c) => String(c).trim()).filter(Boolean)
      : typeof cc === 'string'
      ? cc.split(/[,;]/).map((c) => c.trim()).filter(Boolean)
      : [];

    // Prepare attachments
    const attachments = (documents || [])
      .filter((doc) => doc.dataUrl && doc.dataUrl.includes(','))
      .map((doc) => {
        const base64Content = doc.dataUrl!.split(',')[1];
        return {
          filename: doc.name,
          content: Buffer.from(base64Content, 'base64'),
        };
      });

    // Helper function to dispatch via Ethereal Test Account
    const dispatchViaEthereal = async (fallbackReason?: string) => {
      const testAccount = await nodemailer.createTestAccount();
      const testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: `PMO Relokasi Fiber <${testAccount.user}>`,
        to: to.trim(),
        cc: ccList.length > 0 ? ccList : undefined,
        subject: subject.trim(),
        text: msgBody,
        html: `<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${msgBody}</div>`,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

      let note = 'Email berhasil dikirim via Server Testing Ethereal. Anda dapat melihat isi email asli di link preview yang disediakan!';
      if (fallbackReason) {
        note = `[Fallback Otomatis] ${fallbackReason} — Email dikirimkan secara otomatis via Server Testing Ethereal. Klik link preview untuk melihat isi email asli!`;
      }

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
        transport: fallbackReason ? 'ethereal_fallback' : 'ethereal_test',
        to: to.trim(),
        cc: ccList,
        subject: subject.trim(),
        testMessageUrl: previewUrl || undefined,
        sentAt: new Date().toISOString(),
        note,
      });
    };

    // Mode 1: Explicit Instant Ethereal Test Server
    if (useTestAccount) {
      try {
        return await dispatchViaEthereal();
      } catch (etherealErr: any) {
        console.error('Ethereal test account error:', etherealErr);
      }
    }

    // Mode 2: Real SMTP Server Dispatch (using client config or process.env)
    const smtpHost = (smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const smtpPort = smtpConfig?.port ? Number(smtpConfig.port) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);
    const smtpUser = (smtpConfig?.user || process.env.SMTP_USER || '').trim();
    const smtpPass = (smtpConfig?.pass || process.env.SMTP_PASS || '').trim();
    const smtpSecure = smtpConfig?.secure !== undefined ? Boolean(smtpConfig.secure) : (process.env.SMTP_SECURE === 'true' || smtpPort === 465);
    const fromAddress = (smtpConfig?.from || process.env.SMTP_FROM || smtpUser || 'PMO Relokasi Fiber <no-reply@dsb.id>').trim();

    if (!smtpPass) {
      // Fallback to Ethereal test server so user prompt doesn't fail
      return await dispatchViaEthereal('Password App Gmail belum diisi di Pengaturan SMTP');
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        tls: {
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: to.trim(),
        cc: ccList.length > 0 ? ccList : undefined,
        subject: subject.trim(),
        text: msgBody,
        html: `<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${msgBody}</div>`,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
        transport: 'smtp',
        to: to.trim(),
        cc: ccList,
        subject: subject.trim(),
        sentAt: new Date().toISOString(),
        note: 'Email berhasil dikirimkan via SMTP Server ke seluruh penerima & CC!',
      });
    } catch (smtpError: any) {
      console.warn('Real SMTP failed, falling back to Ethereal:', smtpError?.message);
      let reason = 'Autentikasi SMTP Gmail tidak berhasil (periksa 16-digit App Password)';
      if (smtpError?.message) {
        reason += `: ${smtpError.message}`;
      }
      return await dispatchViaEthereal(reason);
    }
  } catch (err: any) {
    console.error('SMTP send-email endpoint error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Terjadi kesalahan sistem saat memproses pengiriman email.',
    });
  }
}
