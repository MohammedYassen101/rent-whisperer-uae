import { TenantRecord } from "@/types/rent";
import { format } from "date-fns";

function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function printTenantPdf(record: TenantRecord): void {
  const html = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'none';">
      <title>Tenant Record - ${escapeHtml(record.tenantName)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; font-size: 13px; line-height: 1.5; }
        .header { text-align: center; border-bottom: 3px solid #7a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 26px; font-weight: 700; color: #7a1a1a; letter-spacing: 2px; }
        .company-name-ar { font-size: 18px; color: #7a1a1a; margin-top: 4px; direction: rtl; }
        .doc-title { font-size: 18px; font-weight: 600; color: #333; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .doc-date { font-size: 12px; color: #888; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 14px; font-weight: 700; color: #7a1a1a; border-bottom: 2px solid #e8d5a3; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
        .info-item { display: flex; gap: 8px; padding: 4px 0; }
        .info-label { color: #666; min-width: 140px; }
        .info-value { font-weight: 600; color: #1a1a1a; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e8d5a3; color: #888; font-size: 11px; }
        .footer .company { font-weight: 600; color: #7a1a1a; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">ALYASSIA PROPERTIES L.L.C.</div>
        <div class="company-name-ar">شركة الياسية للعقارات ش.ش ذ.م.م</div>
        <div class="doc-title">Tenant Record</div>
        <div class="doc-date">Generated on ${format(new Date(), "dd MMMM yyyy, hh:mm a")}</div>
      </div>

      <div class="section">
        <div class="section-title">Tenant Information</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Tenant Name:</span><span class="info-value">${escapeHtml(record.tenantName)}</span></div>
          <div class="info-item"><span class="info-label">Company:</span><span class="info-value">${escapeHtml(record.companyName || "—")}</span></div>
          <div class="info-item"><span class="info-label">Building:</span><span class="info-value">${escapeHtml(record.buildingName)}</span></div>
          <div class="info-item"><span class="info-label">Unit:</span><span class="info-value">${escapeHtml(record.unitNumber)}</span></div>
          <div class="info-item"><span class="info-label">Unit Type:</span><span class="info-value">${escapeHtml(record.unitType)}</span></div>
          <div class="info-item"><span class="info-label">Annual Rent:</span><span class="info-value">${formatAED(record.annualRent)}</span></div>
          <div class="info-item"><span class="info-label">Total Visits:</span><span class="info-value">${record.visitCount}</span></div>
          <div class="info-item"><span class="info-label">First Calculated:</span><span class="info-value">${format(new Date(record.calculatedAt), "dd MMM yyyy")}</span></div>
          <div class="info-item"><span class="info-label">Last Visit:</span><span class="info-value">${format(new Date(record.lastVisit), "dd MMM yyyy, hh:mm a")}</span></div>
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

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  }
}
