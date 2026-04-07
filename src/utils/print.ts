import { PaymentScheduleItem, Fee } from "@/types/rent";
import { format } from "date-fns";
import { numberToWordsEn, numberToWordsAr } from "@/utils/numberToWords";
import { Language } from "@/hooks/useLanguage";

interface PrintData {
  tenantName: string;
  companyName: string;
  buildingName: string;
  unitNumber: string;
  unitType: string;
  area?: number;
  annualRent: number;
  monthlyRent: number;
  vatAmount: number;
  brokerFee: number;
  securityDeposit: number;
  adminFee: number;
  adminFeeLabel: string;
  numPayments: number;
  schedule: PaymentScheduleItem[];
  fees: Fee[];
  leaseStartDate: string;
  leaseEndDate: string;
  leaseType: string;
  isCommercial: boolean;
  language: Language;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAEDAr(amount: number): string {
  return `${amount.toLocaleString("ar-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} درهم`;
}

// Labels map
const labels = {
  companyName: { en: "ALYASSIA PROPERTIES L.L.C.", ar: "شركة الياسية للعقارات ش.ش ذ.م.م" },
  docTitle: { en: "Rent Statement", ar: "كشف إيجار" },
  generatedOn: { en: "Generated on", ar: "تم الإنشاء في" },
  tenantInfo: { en: "Tenant Information", ar: "بيانات المستأجر" },
  tenantName: { en: "Tenant Name:", ar: "اسم المستأجر:" },
  company: { en: "Company:", ar: "الشركة:" },
  building: { en: "Building:", ar: "المبنى:" },
  unit: { en: "Unit:", ar: "الوحدة:" },
  unitType: { en: "Unit Type:", ar: "نوع الوحدة:" },
  leaseType: { en: "Lease Type:", ar: "نوع الإيجار:" },
  leasePeriod: { en: "Lease Period:", ar: "فترة العقد:" },
  rentSummary: { en: "Rent Summary", ar: "ملخص الإيجار" },
  annualRent: { en: "Annual Rent", ar: "الإيجار السنوي" },
  monthlyRent: { en: "Monthly Rent", ar: "الإيجار الشهري" },
  vatLabel: { en: "5% VAT on Commercial Rent (applied to first payment)", ar: "ضريبة القيمة المضافة 5% على الإيجار التجاري (تُطبق على الدفعة الأولى)" },
  brokerFeeLabel: { en: "Broker Fee (5% of Annual Rent)", ar: "عمولة الوسيط (5% من الإيجار السنوي)" },
  securityDeposit: { en: "Security Deposit (5% of Annual Rent)", ar: "التأمين (5% من الإيجار السنوي)" },
  paymentSchedule: { en: "Payment Schedule", ar: "جدول الدفعات" },
  payment: { en: "Payment", ar: "الدفعة" },
  paymentHash: { en: "#", ar: "#" },
  dueDate: { en: "Due Date", ar: "تاريخ الاستحقاق" },
  baseAmount: { en: "Base Amount", ar: "المبلغ الأساسي" },
  vat5: { en: "VAT (5%)", ar: "ضريبة (5%)" },
  total: { en: "Total", ar: "الإجمالي" },
  additionalFees: { en: "Additional Fees Schedule", ar: "جدول الرسوم الإضافية" },
  feeDesc: { en: "Fee Description", ar: "وصف الرسم" },
  amountAED: { en: "Amount (AED)", ar: "المبلغ (درهم)" },
  newLease: { en: "New Lease", ar: "عقد جديد" },
  renewal: { en: "Renewal", ar: "تجديد" },
  newLeaseAdminFee: { en: "New Lease Administration Fee", ar: "رسوم إدارية (عقد جديد)" },
  renewalAdminFee: { en: "Renewal Administration Fee", ar: "رسوم إدارية (تجديد)" },
  firstCheque: { en: "First Cheque Value", ar: "قيمة الشيك الأول" },
  firstChequeDesc: { en: "First Payment + Security Deposit + Administration Fee", ar: "الدفعة الأولى + التأمين + الرسوم الإدارية" },
};

type LabelKey = keyof typeof labels;

function l(key: LabelKey, lang: Language, showBilingual: boolean): string {
  if (lang === "ar") return labels[key].ar;
  if (showBilingual) return `${labels[key].en} / ${labels[key].ar}`;
  return labels[key].en;
}

function amountDisplay(amount: number, lang: Language, showBilingual: boolean): string {
  if (lang === "ar") return formatAEDAr(amount);
  return formatAED(amount);
}

function amountWordsHtml(amount: number, lang: Language, showBilingual: boolean): string {
  if (lang === "ar") {
    return `<div class="amount-words" style="direction:rtl;text-align:right;">${numberToWordsAr(amount)}</div>`;
  }
  // English page: show both
  return `
    <div class="amount-words">${numberToWordsEn(amount)}</div>
    <div class="amount-words" style="direction:rtl;text-align:right;">${numberToWordsAr(amount)}</div>
  `;
}

export function printReceipt(data: PrintData): void {
  const lang = data.language;
  const isAr = lang === "ar";
  const showBilingual = !isAr; // English page = bilingual
  const dir = isAr ? "rtl" : "ltr";
  const amountAlign = isAr ? "left" : "right";
  const fontFamily = isAr
    ? "'Segoe UI', 'Arial', Tahoma, sans-serif"
    : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

  const adminFeeLabel = data.leaseType === "New Lease"
    ? l("newLeaseAdminFee", lang, showBilingual)
    : l("renewalAdminFee", lang, showBilingual);

  const leaseTypeDisplay = data.leaseType === "New Lease"
    ? l("newLease", lang, showBilingual)
    : l("renewal", lang, showBilingual);

  const scheduleRows = data.schedule
    .map(
      (item) => `
    <tr class="${item.includesVat ? "vat-row" : ""}">
      <td>${item.paymentNumber}</td>
      <td>${format(item.date, "dd MMM yyyy")}</td>
      <td class="amount">${amountDisplay(item.baseAmount, lang, showBilingual)}</td>
      <td class="amount">${item.includesVat ? amountDisplay(item.vatAmount, lang, showBilingual) : "—"}</td>
      <td class="amount">
        <strong>${amountDisplay(item.amount, lang, showBilingual)}</strong>
        ${amountWordsHtml(item.amount, lang, showBilingual)}
      </td>
    </tr>
  `
    )
    .join("");

  const totalRent = data.schedule.reduce((sum, item) => sum + item.amount, 0);

  const feeRows = data.fees
    .map(
      (fee) => `
    <tr>
      <td>${isAr ? fee.nameAr : (showBilingual ? `${fee.name} / ${fee.nameAr}` : fee.name)}</td>
      <td class="amount">${amountDisplay(data.isCommercial ? fee.amountCommercial : fee.amountResidential, lang, showBilingual)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${isAr ? "ar" : "en"}">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src * data:; script-src 'none';">
      <title>${l("companyName", lang, false)} - ${l("docTitle", lang, false)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: ${fontFamily}; padding: 40px; color: #1a1a1a; font-size: 13px; line-height: 1.5; direction: ${dir}; }
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
        th { background: #7a1a1a; color: #fff; padding: 10px 12px; text-align: ${isAr ? "right" : "left"}; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 8px 12px; border-bottom: 1px solid #eee; }
        tr:nth-child(even) { background: #fafafa; }
        .vat-row { background: #fff8e1 !important; }
        .vat-row td { font-weight: 600; }
        .amount { text-align: ${amountAlign}; font-variant-numeric: tabular-nums; }
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
        ${isAr
          ? `<div class="company-name" style="direction:rtl;">${labels.companyName.ar}</div>`
          : `<div class="company-name">${labels.companyName.en}</div>
             <div class="company-name-ar">${labels.companyName.ar}</div>`
        }
        <div class="doc-title">${l("docTitle", lang, showBilingual)}</div>
        <div class="doc-date">${l("generatedOn", lang, showBilingual)} ${format(new Date(), "dd MMMM yyyy, hh:mm a")}</div>
      </div>

      <div class="section">
        <div class="section-title">${l("tenantInfo", lang, showBilingual)}</div>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">${l("tenantName", lang, showBilingual)}</span><span class="info-value">${escapeHtml(data.tenantName)}</span></div>
          <div class="info-item"><span class="info-label">${l("company", lang, showBilingual)}</span><span class="info-value">${escapeHtml(data.companyName || "—")}</span></div>
          <div class="info-item"><span class="info-label">${l("building", lang, showBilingual)}</span><span class="info-value">${escapeHtml(data.buildingName)}</span></div>
          <div class="info-item"><span class="info-label">${l("unit", lang, showBilingual)}</span><span class="info-value">${escapeHtml(data.unitNumber)}</span></div>
          <div class="info-item"><span class="info-label">${l("unitType", lang, showBilingual)}</span><span class="info-value">${escapeHtml(data.unitType)}${data.area ? ` (${data.area} sqm)` : ""}</span></div>
          <div class="info-item"><span class="info-label">${l("leaseType", lang, showBilingual)}</span><span class="info-value">${leaseTypeDisplay}</span></div>
          <div class="info-item"><span class="info-label">${l("leasePeriod", lang, showBilingual)}</span><span class="info-value">${escapeHtml(data.leaseStartDate)} — ${escapeHtml(data.leaseEndDate)}</span></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">${l("rentSummary", lang, showBilingual)}</div>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">${l("annualRent", lang, showBilingual)}</div>
            <div class="value">${amountDisplay(data.annualRent, lang, showBilingual)}</div>
          </div>
          <div class="summary-card">
            <div class="label">${l("monthlyRent", lang, showBilingual)}</div>
            <div class="value">${amountDisplay(data.monthlyRent, lang, showBilingual)}</div>
          </div>
          <div class="summary-card">
            <div class="label">${adminFeeLabel}</div>
            <div class="value">${amountDisplay(data.adminFee, lang, showBilingual)}</div>
          </div>
        </div>
        ${data.vatAmount > 0
          ? `<div class="highlight-box">
            <div class="label">${l("vatLabel", lang, showBilingual)}</div>
            <div class="value">${amountDisplay(data.vatAmount, lang, showBilingual)}</div>
          </div>` : ""}
        ${data.brokerFee > 0
          ? `<div class="highlight-box" style="margin-top:8px;">
            <div class="label">${l("brokerFeeLabel", lang, showBilingual)}</div>
            <div class="value">${amountDisplay(data.brokerFee, lang, showBilingual)}</div>
          </div>` : ""}
        <div class="highlight-box" style="margin-top:8px;">
          <div class="label">${l("securityDeposit", lang, showBilingual)}</div>
          <div class="value">${amountDisplay(data.securityDeposit, lang, showBilingual)}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">${l("paymentSchedule", lang, showBilingual)} (${data.numPayments} ${isAr ? (data.numPayments > 1 ? "دفعات" : "دفعة") : (data.numPayments > 1 ? "Payments" : "Payment")})</div>
        <table>
          <thead>
            <tr>
              <th>${l("paymentHash", lang, showBilingual)}</th>
              <th>${l("dueDate", lang, showBilingual)}</th>
              <th class="amount">${l("baseAmount", lang, showBilingual)}</th>
              <th class="amount">${l("vat5", lang, showBilingual)}</th>
              <th class="amount">${l("total", lang, showBilingual)}</th>
            </tr>
          </thead>
          <tbody>
            ${scheduleRows}
            <tr class="total-row">
              <td colspan="4">${l("total", lang, showBilingual)}</td>
              <td class="amount">
                <strong>${amountDisplay(totalRent, lang, showBilingual)}</strong>
                ${amountWordsHtml(totalRent, lang, showBilingual)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">${l("additionalFees", lang, showBilingual)}</div>
        <table>
          <thead>
            <tr>
              <th>${l("feeDesc", lang, showBilingual)}</th>
              <th class="amount">${l("amountAED", lang, showBilingual)}</th>
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

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 400);
  }
}
