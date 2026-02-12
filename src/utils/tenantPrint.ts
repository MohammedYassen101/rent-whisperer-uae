import { TenantRecord } from "@/types/rent";
import { calculateRent, generatePaymentSchedule, formatAED } from "@/utils/calculations";
import { fees } from "@/data/fees";
import { format, addMonths } from "date-fns";
import { numberToWordsEn, numberToWordsAr } from "@/utils/numberToWords";

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function fmtAED(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function printTenantPdf(record: TenantRecord): void {
  const isCommercial = ["Office", "Showroom", "Shop"].includes(record.unitType);
  const numPayments = 4;
  const leaseStart = new Date(record.calculatedAt);
  const leaseEnd = addMonths(leaseStart, 12);

  const calculation = calculateRent(record.annualRent, numPayments, isCommercial);
  const schedule = generatePaymentSchedule(leaseStart, numPayments, calculation);

  const scheduleRows = schedule
    .map(
      (item) => `
    <tr class="${item.includesVat ? "vat-row" : ""}">
      <td>${item.paymentNumber}</td>
      <td>${format(item.date, "dd MMM yyyy")}</td>
      <td class="amount">${fmtAED(item.baseAmount)}</td>
      <td class="amount">${item.includesVat ? fmtAED(item.vatAmount) : "—"}</td>
      <td class="amount">
        <strong>${fmtAED(item.amount)}</strong>
        <div class="amount-words">${numberToWordsEn(item.amount)}</div>
        <div class="amount-words" style="direction:rtl;text-align:right;">${numberToWordsAr(item.amount)}</div>
      </td>
    </tr>
  `
    )
    .join("");

  const totalRent = schedule.reduce((sum, item) => sum + item.amount, 0);

  const feeRows = fees
    .map(
      (fee) => `
    <tr>
      <td>${fee.name}</td>
      <td>${fee.nameAr}</td>
      <td class="amount">${fmtAED(isCommercial ? fee.amountCommercial : fee.amountResidential)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html dir="ltr" lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src * data:; script-src 'none';">
      <title>Alyassia Properties - Rent Statement - ${escapeHtml(record.tenantName)}</title>
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
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        th { background: #7a1a1a; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 8px 12px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #fafafa; }
        .vat-row { background: #fff8e1 !important; }
        .vat-row td { font-weight: 600; }
        .amount { text-align: right; font-variant-numeric: tabular-nums; }
        .amount-words { font-size: 9px; color: #666; font-weight: 400; margin-top: 2px; line-height: 1.3; }
        .total-row td { border-top: 2px solid #e8d5a3; padding-top: 10px; }
        .highlight-box { background: #fff8e1; border: 1px solid #e8d5a3; border-radius: 6px; padding: 12px 16px; margin-top: 12px; }
        .highlight-box .label { font-size: 11px; color: #8a6d2b; text-transform: uppercase; letter-spacing: 0.5px; }
        .highlight-box .value { font-size: 20px; font-weight: 700; color: #7a1a1a; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
        .summary-card { background: #f8f6f2; border-radius: 6px; padding: 12px; text-align: center; }
        .summary-card .label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-card .value { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-top: 2px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e8d5a3; color: #888; font-size: 11px; }
        .footer .company { font-weight: 600; color: #7a1a1a; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${window.location.origin}/logo.png" alt="Alyassia Properties" style="max-width: 200px; margin: 0 auto 12px; display: block;" />
        <div class="company-name">ALYASSIA PROPERTIES L.L.C.</div>
        <div class="company-name-ar">شركة الياسية للعقارات ش.ش ذ.م.م</div>
        <div class="doc-title">Rent Statement</div>
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
          <div class="info-item"><span class="info-label">Lease Period:</span><span class="info-value">${format(leaseStart, "dd MMM yyyy")} — ${format(leaseEnd, "dd MMM yyyy")}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Rent Summary</div>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Annual Rent</div>
            <div class="value">${fmtAED(calculation.annualRent)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Monthly Rent</div>
            <div class="value">${fmtAED(calculation.monthlyRent)}</div>
          </div>
        </div>
        ${
          calculation.vatAmount > 0
            ? `<div class="highlight-box">
            <div class="label">5% VAT on Commercial Rent (applied to first payment)</div>
            <div class="value">${fmtAED(calculation.vatAmount)}</div>
          </div>`
            : ""
        }
      </div>

      <div class="section">
        <div class="section-title">Payment Schedule (${numPayments} Payment${numPayments > 1 ? "s" : ""})</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Due Date</th>
              <th class="amount">Base Amount</th>
              <th class="amount">VAT (5%)</th>
              <th class="amount">Total</th>
            </tr>
          </thead>
          <tbody>
            ${scheduleRows}
            <tr class="total-row">
              <td colspan="4">Total</td>
              <td class="amount">${fmtAED(totalRent)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Additional Fees Schedule</div>
        <table>
          <thead>
            <tr>
              <th>Fee Description</th>
              <th>الوصف</th>
              <th class="amount">Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            ${feeRows}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p class="company">Alyassia Properties L.L.C. | شركة الياسية للعقارات</p>
        <p>Omniah Tower, Mezzanine floor, 28 Al Bahhar St, Al Hisn, Al Markaziyah West, Abu Dhabi, UAE</p>
        <p>Tel: +971 2 667 3444 | Email: info@alyassiaproperties.ae</p>
      </div>
    </body>
    </html>
  `;

  // Open view-only (no auto-print)
  const viewWindow = window.open("", "_blank", "width=900,height=700");
  if (viewWindow) {
    viewWindow.document.write(html);
    viewWindow.document.close();
  }
}
