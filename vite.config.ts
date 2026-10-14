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
                const { to, cc, subject, body: msgBody, dispatchType, pmoId, projectId, documents } = payload;

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');

                if (!to || !to.trim()) {
                  res.statusCode = 400;
                  return res.end(JSON.stringify({ success: false, error: 'Alamat email penerima (To) wajib diisi.' }));
                }

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

                const attachments = (documents || [])
                  .filter((doc: any) => doc.dataUrl && doc.dataUrl.includes(','))
                  .map((doc: any) => {
                    const base64Content = doc.dataUrl!.split(',')[1];
                    return {
                      filename: doc.name,
                      content: Buffer.from(base64Content, 'base64'),
                    };
                  });

                if (smtpHost && smtpUser && smtpPass) {
                  const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpSecure,
                    auth: { user: smtpUser, pass: smtpPass },
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
                      note: 'Email berhasil dikirimkan via SMTP Server.',
                    })
                  );
                }

                // Simulated response in dev when SMTP env vars are not set
                res.statusCode = 200;
                return res.end(
                  JSON.stringify({
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
                    note: 'Permintaan email valid & siap dikirim. Untuk pengiriman riil via mail server, atur SMTP_HOST, SMTP_USER, SMTP_PASS di Environment Variables Vercel atau file .env.',
                  })
                );
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, error: err.message || 'Error processing email endpoint' }));
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
