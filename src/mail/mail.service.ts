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

  async sendOrderApproved(opts: {
    to: string;
    patientName: string;
    orderNum: number;
    testName: string;
    approvedAt: string;
    reportUrl?: string;
    labName?: string;
  }): Promise<void> {
    if (!this.transporter) return;

    const { to, patientName, orderNum, testName, approvedAt, reportUrl, labName = 'LabOps Laboratory' } = opts;
    const from = this.config.get<string>('MAIL_FROM') ?? `"${labName}" <noreply@labops.local>`;

    const reportButton = reportUrl
      ? `
      <div style="text-align:center;margin:28px 0 8px;">
        <a href="${reportUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:0.2px;">
          View Report
        </a>
      </div>`
      : '';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Approved</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#16a34a;padding:32px 40px;text-align:center;">
      <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;font-size:28px;margin-bottom:12px;">&#10003;</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${labName}</h1>
      <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">Laboratory Information System</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Order Approved</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
        Dear <strong style="color:#0f172a;">${patientName}</strong>, your test order has been reviewed and approved.
      </p>

      <!-- Info card -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:8px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:600;width:44%;">Order Number</td>
            <td style="padding:8px 0;">
              <span style="font-family:monospace;background:#dcfce7;color:#166534;padding:3px 10px;border-radius:6px;font-size:13px;font-weight:700;">#${orderNum}</span>
            </td>
          </tr>
          <tr style="border-top:1px solid #bbf7d0;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Test</td>
            <td style="padding:8px 0;color:#0f172a;font-weight:600;">${testName}</td>
          </tr>
          <tr style="border-top:1px solid #bbf7d0;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Approved At</td>
            <td style="padding:8px 0;color:#0f172a;">${approvedAt}</td>
          </tr>
        </table>
      </div>

      ${reportButton}

      <p style="font-size:13px;color:#64748b;line-height:1.6;margin:24px 0 0;">
        If you have any questions about your order, please contact us directly.
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
        subject: `Order #${orderNum} Approved — ${testName}`,
        html,
      });
      this.logger.log(`Order approved email sent to ${to} (order #${orderNum})`);
    } catch (err) {
      this.logger.error(`Failed to send order approved email to ${to}: ${err}`);
    }
  }

  async sendOrderRejected(opts: {
    to: string;
    patientName: string;
    orderNum: number;
    testName: string;
    labName?: string;
  }): Promise<void> {
    if (!this.transporter) return;

    const { to, patientName, orderNum, testName, labName = 'LabOps Laboratory' } = opts;
    const from = this.config.get<string>('MAIL_FROM') ?? `"${labName}" <noreply@labops.local>`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Rejected</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#dc2626;padding:32px 40px;text-align:center;">
      <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;font-size:28px;margin-bottom:12px;">&#10007;</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${labName}</h1>
      <p style="margin:6px 0 0;color:#fecaca;font-size:13px;">Laboratory Information System</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Order Could Not Be Processed</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
        Dear <strong style="color:#0f172a;">${patientName}</strong>, we are sorry to inform you that your test order could not be approved at this time.
      </p>

      <!-- Info card -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:600;width:44%;">Order Number</td>
            <td style="padding:8px 0;">
              <span style="font-family:monospace;background:#fee2e2;color:#991b1b;padding:3px 10px;border-radius:6px;font-size:13px;font-weight:700;">#${orderNum}</span>
            </td>
          </tr>
          <tr style="border-top:1px solid #fecaca;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Test</td>
            <td style="padding:8px 0;color:#0f172a;font-weight:600;">${testName}</td>
          </tr>
          <tr style="border-top:1px solid #fecaca;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Status</td>
            <td style="padding:8px 0;">
              <span style="background:#fee2e2;color:#991b1b;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Rejected</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 8px;">
        Please contact our team for more information regarding the reason for this decision or to place a new order.
      </p>
      <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;">
        We apologise for any inconvenience caused.
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
        subject: `Order #${orderNum} Could Not Be Processed — ${testName}`,
        html,
      });
      this.logger.log(`Order rejected email sent to ${to} (order #${orderNum})`);
    } catch (err) {
      this.logger.error(`Failed to send order rejected email to ${to}: ${err}`);
    }
  }

  async sendReportReady(opts: {
    to: string;
    patientName: string;
    orderNum: number;
    testName: string;
    reportUrl: string;
    expiresInDays?: number;
    labName?: string;
  }): Promise<void> {
    if (!this.transporter) return;

    const { to, patientName, orderNum, testName, reportUrl, expiresInDays, labName = 'LabOps Laboratory' } = opts;
    const from = this.config.get<string>('MAIL_FROM') ?? `"${labName}" <noreply@labops.local>`;

    const expiryNote = expiresInDays != null
      ? `<p style="font-size:12px;color:#94a3b8;text-align:center;margin:12px 0 0;">This link will expire in <strong>${expiresInDays} day${expiresInDays === 1 ? '' : 's'}</strong>.</p>`
      : '';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Report Ready</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#2563eb;padding:32px 40px;text-align:center;">
      <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;line-height:56px;font-size:26px;margin-bottom:12px;">&#128196;</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${labName}</h1>
      <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">Laboratory Information System</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Your Report is Ready</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
        Dear <strong style="color:#0f172a;">${patientName}</strong>, your test report is now available and ready to view.
      </p>

      <!-- Info card -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px 24px;margin-bottom:8px;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr>
            <td style="padding:8px 0;color:#64748b;font-weight:600;width:44%;">Order Number</td>
            <td style="padding:8px 0;">
              <span style="font-family:monospace;background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:6px;font-size:13px;font-weight:700;">#${orderNum}</span>
            </td>
          </tr>
          <tr style="border-top:1px solid #bfdbfe;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Test</td>
            <td style="padding:8px 0;color:#0f172a;font-weight:600;">${testName}</td>
          </tr>
          <tr style="border-top:1px solid #bfdbfe;">
            <td style="padding:8px 0;color:#64748b;font-weight:600;">Status</td>
            <td style="padding:8px 0;">
              <span style="background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:700;">Ready</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- CTA button -->
      <div style="text-align:center;margin:28px 0 4px;">
        <a href="${reportUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:10px;letter-spacing:0.2px;">
          View Report
        </a>
      </div>
      ${expiryNote}

      <p style="font-size:13px;color:#64748b;line-height:1.6;margin:24px 0 0;">
        If the button does not work, copy and paste the following link into your browser:<br>
        <a href="${reportUrl}" style="color:#2563eb;word-break:break-all;font-size:12px;">${reportUrl}</a>
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
        subject: `Your Report is Ready — Order #${orderNum} (${testName})`,
        html,
      });
      this.logger.log(`Report ready email sent to ${to} (order #${orderNum})`);
    } catch (err) {
      this.logger.error(`Failed to send report ready email to ${to}: ${err}`);
    }
  }
}
