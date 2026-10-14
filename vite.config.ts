import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import nodemailer from 'nodemailer';

function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/send-email')) {
          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            return res.end();
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const payload = JSON.parse(body || '{}');
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

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');

                if (!to || !to.trim()) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Alamat email penerima (To) wajib diisi.' }));
                }

                if (!subject || !subject.trim()) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Subjek email wajib diisi.' }));
                }

                if (!msgBody || !msgBody.trim()) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Isi pesan email wajib diisi.' }));
                }

                const ccList: string[] = Array.isArray(cc)
                  ? cc.map((c) => String(c).trim()).filter(Boolean)
                  : typeof cc === 'string'
                  ? cc.split(/[,;]/).map((c) => c.trim()).filter(Boolean)
                  : [];

                const attachments = (documents || [])
                  .filter((doc: any) => doc.dataUrl && doc.dataUrl.includes(','))
                  .map((doc: any) => {
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

                  res.statusCode = 200;
                  return res.end(
                    JSON.stringify({
                      success: true,
                      messageId: info.messageId,
                      transport: fallbackReason ? 'ethereal_fallback' : 'ethereal_test',
                      to: to.trim(),
                      cc: ccList,
                      subject: subject.trim(),
                      testMessageUrl: previewUrl || undefined,
                      sentAt: new Date().toISOString(),
                      note,
                    })
                  );
                };

                // Mode 1: Explicit Instant Ethereal Test Server
                if (useTestAccount) {
                  try {
                    return await dispatchViaEthereal();
                  } catch (etherealErr: any) {
                    console.error('Ethereal test account error:', etherealErr);
                  }
                }

                // Mode 2: Real SMTP Server Dispatch
                const smtpHost = (smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
                const smtpPort = smtpConfig?.port ? Number(smtpConfig.port) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587);
                const smtpUser = (smtpConfig?.user || process.env.SMTP_USER || '').trim();
                const smtpPass = (smtpConfig?.pass || process.env.SMTP_PASS || '').trim();
                const smtpSecure = smtpConfig?.secure !== undefined ? Boolean(smtpConfig.secure) : (process.env.SMTP_SECURE === 'true' || smtpPort === 465);
                const fromAddress = (smtpConfig?.from || process.env.SMTP_FROM || smtpUser || 'PMO Relokasi Fiber <no-reply@dsb.id>').trim();

                if (!smtpPass) {
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

                  res.statusCode = 200;
                  return res.end(
                    JSON.stringify({
                      success: true,
                      messageId: info.messageId,
                      transport: 'smtp',
                      to: to.trim(),
                      cc: ccList,
                      subject: subject.trim(),
                      sentAt: new Date().toISOString(),
                      note: 'Email berhasil dikirimkan via SMTP Server ke seluruh penerima & CC!',
                    })
                  );
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
                res.statusCode = 500;
                return res.end(
                  JSON.stringify({
                    success: false,
                    error: err?.message || 'Terjadi kesalahan sistem saat memproses pengiriman email.',
                  })
                );
              }
            });
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
