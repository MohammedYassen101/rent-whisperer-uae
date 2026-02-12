import { MaintenanceRequest } from "@/types/rent";
import { format } from "date-fns";

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function printMaintenanceRequest(req: MaintenanceRequest): void {
  const priorityColors: Record<string, string> = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626',
  };
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    completed: '#22c55e',
  };

  const html = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Maintenance Request - ${escapeHtml(req.tenantName)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; font-size: 14px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px solid #7a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: 700; color: #7a1a1a; letter-spacing: 2px; }
        .company-name-ar { font-size: 16px; color: #7a1a1a; margin-top: 4px; direction: rtl; }
        .doc-title { font-size: 18px; font-weight: 600; color: #333; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .doc-date { font-size: 12px; color: #888; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 700; color: #7a1a1a; border-bottom: 2px solid #e8d5a3; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
        .info-item { display: flex; gap: 8px; padding: 6px 0; }
        .info-label { color: #666; min-width: 140px; }
        .info-value { font-weight: 600; color: #1a1a1a; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: #fff; }
        .description-box { background: #f8f6f2; border-radius: 8px; padding: 16px; margin-top: 12px; border-left: 4px solid #7a1a1a; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e8d5a3; color: #888; font-size: 11px; }
        .footer .company { font-weight: 600; color: #7a1a1a; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${window.location.origin}/logo.png" alt="Alyassia Properties" style="max-width: 180px; margin: 0 auto 12px; display: block;" />
        <div class="company-name">ALYASSIA PROPERTIES L.L.C.</div>
        <div class="company-name-ar">شركة الياسية للعقارات ش.ش ذ.م.م</div>
        <div class="doc-title">Maintenance Request</div>
        <div class="doc-date">Printed on ${format(new Date(), "dd MMMM yyyy, hh:mm a")}</div>
      </div>

      <div class="section">
        <div class="section-title">Request Details</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Tenant Name:</span><span class="info-value">${escapeHtml(req.tenantName)}</span></div>
          <div class="info-item"><span class="info-label">Company:</span><span class="info-value">${escapeHtml(req.companyName || "—")}</span></div>
          <div class="info-item"><span class="info-label">Building:</span><span class="info-value">${escapeHtml(req.building)}</span></div>
          <div class="info-item"><span class="info-label">Unit:</span><span class="info-value">${escapeHtml(req.unitNumber)}</span></div>
          <div class="info-item"><span class="info-label">Submitted:</span><span class="info-value">${format(new Date(req.submittedAt), "dd MMM yyyy, hh:mm a")}</span></div>
          <div class="info-item">
            <span class="info-label">Priority:</span>
            <span class="info-value"><span class="badge" style="background:${priorityColors[req.priority] || '#888'}">${req.priority.toUpperCase()}</span></span>
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span>
            <span class="info-value"><span class="badge" style="background:${statusColors[req.status] || '#888'}">${req.status.toUpperCase()}</span></span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Description</div>
        <div class="description-box">
          <p>${escapeHtml(req.description)}</p>
        </div>
      </div>

      <div class="footer">
        <p class="company">Alyassia Properties L.L.C. | شركة الياسية للعقارات</p>
        <p>Omniah Tower, Mezzanine floor, 28 Al Bahhar St, Al Hisn, Al Markaziyah West, Abu Dhabi, UAE</p>
        <p>Tel: +971 2 667 3444 | Email: info@alyassiaproperties.ae</p>
      </div>
    </body>
    </html>
  `;

  const viewWindow = window.open("", "_blank", "width=800,height=600");
  if (viewWindow) {
    viewWindow.document.write(html);
    viewWindow.document.close();
  }
}
