import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('MAIL_HOST');
    const user = config.get<string>('MAIL_USER');
    const pass = config.get<string>('MAIL_PASS');

    if (!host || !user || !pass) {
      this.logger.warn('Mail not configured — MAIL_HOST / MAIL_USER / MAIL_PASS missing. Emails will be skipped.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: config.get<number>('MAIL_PORT') ?? 587,
      secure: config.get<string>('MAIL_SECURE', 'false') === 'true',
      auth: { user, pass },
    });
  }

  async sendPatientRegistration(opts: {
    to: string;
    patientName: string;
    patientCode: string;
    registrationDate: string;
    labName?: string;
  }): Promise<void> {
    if (!this.transporter) return;

    const { to, patientName, patientCode, registrationDate, labName = 'LabOps Laboratory' } = opts;
    const from = this.config.get<string>('MAIL_FROM') ?? `"${labName}" <noreply@labops.local>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Patient Registration</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#4f46e5;padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${labName}</h1>
      <p style="margin:6px 0 0;color:#c7d2fe;font-size:13px;">Laboratory Information System</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Registration Confirmed ✓</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
        Dear <strong style="color:#0f172a;">${patientName}</strong>, your patient profile has been successfully created in our system.
      </p>

      <!-- Info card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:600;width:44%;">Patient Name</td>
            <td style="padding:8px 0;color:#0f172a;font-weight:600;">${patientName}</td>
          </tr>
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Patient Code</td>
            <td style="padding:8px 0;">
              <span style="font-family:monospace;background:#e0e7ff;color:#3730a3;padding:3px 10px;border-radius:6px;font-size:13px;font-weight:700;">${patientCode}</span>
            </td>
          </tr>
          <tr style="border-top:1px solid #e2e8f0;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Registration Date</td>
            <td style="padding:8px 0;color:#0f172a;">${registrationDate}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 8px;">
        Please keep your <strong>Patient Code</strong> handy — you will need it when visiting our lab or referencing your reports.
      </p>
      <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;">
        If you have any questions, please contact us directly.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">
        This is an automated message from ${labName}. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: `Patient Registration Confirmed — ${patientCode}`,
        html,
      });
      this.logger.log(`Registration email sent to ${to} (${patientCode})`);
    } catch (err) {
      this.logger.error(`Failed to send registration email to ${to}: ${err}`);
      // Never throw — email failure must not break the patient creation flow
    }
  }
}
