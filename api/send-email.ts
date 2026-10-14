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
    const { to, cc, subject, body, dispatchType, pmoId, projectId, documents } = payload;

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

    if (!body || !body.trim()) {
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

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
    const fromAddress = process.env.SMTP_FROM || smtpUser || 'PMO Relokasi Fiber <no-reply@linknet.co.id>';

    // Prepare attachments if dataUrl is provided
    const attachments = (documents || [])
      .filter((doc) => doc.dataUrl && doc.dataUrl.includes(','))
      .map((doc) => {
        const base64Content = doc.dataUrl!.split(',')[1];
        return {
          filename: doc.name,
          content: Buffer.from(base64Content, 'base64'),
        };
      });

    // If SMTP credentials are fully provided, perform real SMTP dispatch
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to: to.trim(),
        cc: ccList.length > 0 ? ccList : undefined,
        subject: subject.trim(),
        text: body,
        html: `<div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${body}</div>`,
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
        note: 'Email berhasil dikirimkan via SMTP Server.',
      });
    }

    // Fallback when SMTP environment variables are not yet configured in Vercel:
    // We return a validated success response so user can test without breaking, with clear guidance.
    return res.status(200).json({
      success: true,
      simulated: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      transport: 'simulated_smtp',
      to: to.trim(),
      cc: ccList,
      subject: subject.trim(),
      dispatchType: dispatchType || 'pengajuan-material',
      pmoId: pmoId || '-',
      projectId: projectId || '-',
      documentsCount: documents?.length || 0,
      sentAt: new Date().toISOString(),
      note: 'Permintaan email valid & siap dikirim. Untuk pengiriman riil via mail server, atur SMTP_HOST, SMTP_USER, SMTP_PASS di Environment Variables Vercel.',
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Terjadi kesalahan pada server saat mengirim email.',
    });
  }
}
