import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel,
  Header, Footer, PageNumber,
} from "docx";
import { saveAs } from "file-saver";
import { PaymentScheduleItem, Fee } from "@/types/rent";
import { format } from "date-fns";
import { numberToWordsEn, numberToWordsAr } from "@/utils/numberToWords";
import { Language } from "@/hooks/useLanguage";

interface DocxData {
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
  language?: Language;
}

const BRAND_COLOR = "7A1A1A";
const GOLD_COLOR = "E8D5A3";
const GOLD_BG = "FFF8E1";
const LIGHT_BG = "F8F6F2";

const docLabels = {
  companyNameEn: { en: "ALYASSIA PROPERTIES L.L.C.", ar: "ALYASSIA PROPERTIES L.L.C." },
  companyNameAr: { en: "شركة الياسية للعقارات ش.ش ذ.م.م", ar: "شركة الياسية للعقارات ش.ش ذ.م.م" },
  docTitle: { en: "RENT STATEMENT", ar: "كشف إيجار" },
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
  reportDate: { en: "Report Date", ar: "تاريخ إعداد التقرير" },
  tenantSignature: { en: "Tenant Signature", ar: "توقيع المستأجر" },
  signatureLine: { en: "____________________________", ar: "____________________________" },
  signatureSection: { en: "Acknowledgement & Signature", ar: "الإقرار والتوقيع" },
  signatureAck: { en: "I, the undersigned tenant, acknowledge that I have reviewed the above rent details and payment schedule and agree to the terms stated.", ar: "أقر أنا المستأجر الموقع أدناه بأنني اطلعت على تفاصيل الإيجار وجدول الدفعات أعلاه وأوافق على الشروط المذكورة." },
  signatureName: { en: "Tenant Name:", ar: "اسم المستأجر:" },
  signatureDate: { en: "Date:", ar: "التاريخ:" },
  signatureSign: { en: "Signature:", ar: "التوقيع:" },
};

type DocLabelKey = keyof typeof docLabels;

function dl(key: DocLabelKey, lang: Language, bilingual: boolean): string {
  if (lang === "ar") return docLabels[key].ar;
  if (bilingual) return `${docLabels[key].en} / ${docLabels[key].ar}`;
  return docLabels[key].en;
}

function fmtAED(amount: number, lang: Language = "en"): string {
  if (lang === "ar") return `${amount.toLocaleString("ar-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} درهم`;
  return `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function amountWordsParagraphs(amount: number, lang: Language, bilingual: boolean): Paragraph[] {
  if (lang === "ar") {
    return [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: numberToWordsAr(amount), font: "Arial", size: 14, color: "666666" })] })];
  }
  return [
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: numberToWordsEn(amount), font: "Arial", size: 14, color: "666666" })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: numberToWordsAr(amount), font: "Arial", size: 14, color: "666666" })] }),
  ];
}

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function infoRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorders,
        width: { size: 3000, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: label, color: "666666", font: "Arial", size: 20 })] })],
      }),
      new TableCell({
        borders: noBorders,
        width: { size: 6360, type: WidthType.DXA },
        children: [new Paragraph({ children: [new TextRun({ text: value, bold: true, font: "Arial", size: 20 })] })],
      }),
    ],
  });
}

function highlightBox(label: string, value: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 120 },
      shading: { type: ShadingType.CLEAR, fill: GOLD_BG },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 }, left: { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 }, right: { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 } },
      children: [new TextRun({ text: label, font: "Arial", size: 18, color: "8A6D2B" })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: GOLD_BG },
      border: { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 }, left: { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 }, right: { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 } },
      children: [new TextRun({ text: value, font: "Arial", size: 32, bold: true, color: BRAND_COLOR })],
    }),
  ];
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: GOLD_COLOR, space: 4 } },
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: BRAND_COLOR })],
  });
}

export async function exportDocx(data: DocxData): Promise<void> {
  const lang = data.language || "en";
  const isAr = lang === "ar";
  const bilingual = !isAr;
  const children: (Paragraph | Table)[] = [];

  const adminFeeLabel = data.leaseType === "New Lease"
    ? dl("newLeaseAdminFee", lang, bilingual)
    : dl("renewalAdminFee", lang, bilingual);

  const leaseTypeDisplay = data.leaseType === "New Lease"
    ? dl("newLease", lang, bilingual)
    : dl("renewal", lang, bilingual);

  // Header
  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: isAr ? docLabels.companyNameAr.ar : docLabels.companyNameEn.en, font: "Arial", size: 36, bold: true, color: BRAND_COLOR })] }),
  );
  if (!isAr) {
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: docLabels.companyNameAr.ar, font: "Arial", size: 28, color: BRAND_COLOR })] }));
  }
  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: dl("docTitle", lang, bilingual), font: "Arial", size: 28, bold: true, color: "333333" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_COLOR, space: 8 } }, children: [new TextRun({ text: `${dl("generatedOn", lang, bilingual)} ${format(new Date(), "dd MMMM yyyy, hh:mm a")}`, font: "Arial", size: 18, color: "888888" })] }),
  );

  // Report preparation date
  children.push(
    new Paragraph({
      spacing: { before: 80, after: 200 },
      alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
      children: [
        new TextRun({ text: `${dl("reportDate", lang, bilingual)}: `, font: "Arial", size: 20, bold: true, color: "333333" }),
        new TextRun({ text: format(new Date(), "dd / MM / yyyy"), font: "Arial", size: 20, color: "1A1A1A" }),
      ],
    }),
  );

  // Tenant Information
  children.push(sectionTitle(dl("tenantInfo", lang, bilingual)));
  children.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        infoRow(dl("tenantName", lang, bilingual), data.tenantName),
        infoRow(dl("company", lang, bilingual), data.companyName || "—"),
        infoRow(dl("building", lang, bilingual), data.buildingName),
        infoRow(dl("unit", lang, bilingual), data.unitNumber),
        infoRow(dl("unitType", lang, bilingual), `${data.unitType}${data.area ? ` (${data.area} sqm)` : ""}`),
        infoRow(dl("leaseType", lang, bilingual), leaseTypeDisplay),
        infoRow(dl("leasePeriod", lang, bilingual), `${data.leaseStartDate} — ${data.leaseEndDate}`),
      ],
    }),
  );

  // Rent Summary
  children.push(sectionTitle(dl("rentSummary", lang, bilingual)));

  const summaryRows = [
    [dl("annualRent", lang, bilingual), fmtAED(data.annualRent, lang)],
    [dl("monthlyRent", lang, bilingual), fmtAED(data.monthlyRent, lang)],
    [adminFeeLabel, fmtAED(data.adminFee, lang)],
  ];

  children.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3120, 3120, 3120],
      rows: [
        new TableRow({
          children: summaryRows.map(([label, value]) =>
            new TableCell({
              borders: cellBorders,
              width: { size: 3120, type: WidthType.DXA },
              shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 16, color: "888888" })] }),
                new Paragraph({ children: [new TextRun({ text: value, font: "Arial", size: 24, bold: true })] }),
              ],
            }),
          ),
        }),
      ],
    }),
  );

  if (data.vatAmount > 0) {
    children.push(...highlightBox(dl("vatLabel", lang, bilingual), fmtAED(data.vatAmount, lang)));
  }
  if (data.brokerFee > 0) {
    children.push(...highlightBox(dl("brokerFeeLabel", lang, bilingual), fmtAED(data.brokerFee, lang)));
  }
  const hideSecurityDeposit = data.isCommercial && data.leaseType === "Renewal";
  if (!hideSecurityDeposit) {
    children.push(...highlightBox(dl("securityDeposit", lang, bilingual), fmtAED(data.securityDeposit, lang)));
  }

  // Payment Schedule
  const paymentsWord = data.numPayments > 1 ? (isAr ? "دفعات" : "Payments") : (isAr ? "دفعة" : "Payment");
  children.push(sectionTitle(`${dl("paymentSchedule", lang, bilingual)} (${data.numPayments} ${paymentsWord})`));

  const headerTexts = [dl("paymentHash", lang, bilingual), dl("dueDate", lang, bilingual), dl("baseAmount", lang, bilingual), dl("vat5", lang, bilingual), dl("total", lang, bilingual)];
  const headerCells = headerTexts.map((text, i) =>
    new TableCell({
      borders: cellBorders,
      width: { size: [800, 2000, 2200, 1800, 2560][i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: BRAND_COLOR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ alignment: i >= 2 ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })],
    }),
  );

  const scheduleTableRows = [new TableRow({ children: headerCells })];

  data.schedule.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const bg = item.includesVat ? GOLD_BG : isEven ? "FFFFFF" : "FAFAFA";
    const cells = [
      String(item.paymentNumber),
      format(item.date, "dd MMM yyyy"),
      fmtAED(item.baseAmount, lang),
      item.includesVat ? fmtAED(item.vatAmount, lang) : "—",
      fmtAED(item.amount, lang),
    ].map((text, i) =>
      new TableCell({
        borders: cellBorders,
        width: { size: [800, 2000, 2200, 1800, 2560][i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: bg },
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [
          new Paragraph({
            alignment: i >= 2 ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [new TextRun({ text, font: "Arial", size: 18, bold: i === 4 })],
          }),
          ...(i === 4 ? amountWordsParagraphs(item.amount, lang, bilingual) : []),
        ],
      }),
    );
    scheduleTableRows.push(new TableRow({ children: cells }));
  });

  // Total row
  const totalRent = data.schedule.reduce((sum, item) => sum + item.amount, 0);
  scheduleTableRows.push(
    new TableRow({
      children: [
        new TableCell({
          borders: { ...cellBorders, top: { style: BorderStyle.SINGLE, size: 3, color: GOLD_COLOR } },
          width: { size: 6800, type: WidthType.DXA },
          columnSpan: 4,
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [new Paragraph({ children: [new TextRun({ text: dl("total", lang, bilingual), font: "Arial", size: 20, bold: true })] })],
        }),
        new TableCell({
          borders: { ...cellBorders, top: { style: BorderStyle.SINGLE, size: 3, color: GOLD_COLOR } },
          width: { size: 2560, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmtAED(totalRent, lang), font: "Arial", size: 20, bold: true })] }),
            ...amountWordsParagraphs(totalRent, lang, bilingual),
          ],
        }),
      ],
    }),
  );

  children.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [800, 2000, 2200, 1800, 2560], rows: scheduleTableRows }));

  // First Cheque Value
  const firstPaymentAmount = data.schedule.length > 0 ? data.schedule[0].amount : 0;
  const firstChequeValue = firstPaymentAmount + (hideSecurityDeposit ? 0 : data.securityDeposit) + data.adminFee;
  const greenBorderSide = { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 };
  const greenBorderNone = { style: BorderStyle.NONE, size: 0 };
  children.push(
    new Paragraph({
      spacing: { before: 200 },
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: greenBorderSide, bottom: greenBorderNone, left: greenBorderSide, right: greenBorderSide },
      children: [new TextRun({ text: dl("firstCheque", lang, bilingual), font: "Arial", size: 18, color: "2E7D32" })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: greenBorderNone, bottom: greenBorderNone, left: greenBorderSide, right: greenBorderSide },
      children: [new TextRun({ text: dl("firstChequeDesc", lang, bilingual), font: "Arial", size: 14, color: "555555" })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: greenBorderNone, bottom: greenBorderNone, left: greenBorderSide, right: greenBorderSide },
      children: [new TextRun({ text: fmtAED(firstChequeValue, lang), font: "Arial", size: 32, bold: true, color: "1B5E20" })],
    }),
  );
  if (isAr) {
    children.push(
      new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
        border: { top: greenBorderNone, bottom: greenBorderSide, left: greenBorderSide, right: greenBorderSide },
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: numberToWordsAr(firstChequeValue), font: "Arial", size: 14, color: "666666" })],
      }),
    );
  } else {
    children.push(
      new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
        border: { top: greenBorderNone, bottom: greenBorderNone, left: greenBorderSide, right: greenBorderSide },
        children: [new TextRun({ text: numberToWordsEn(firstChequeValue), font: "Arial", size: 14, color: "666666" })],
      }),
      new Paragraph({
        shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
        border: { top: greenBorderNone, bottom: greenBorderSide, left: greenBorderSide, right: greenBorderSide },
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: numberToWordsAr(firstChequeValue), font: "Arial", size: 14, color: "666666" })],
      }),
    );
  }

  // Additional Fees Schedule
  children.push(sectionTitle(dl("additionalFees", lang, bilingual)));

  const feeHeaderTexts = isAr
    ? [dl("feeDesc", lang, bilingual), dl("amountAED", lang, bilingual)]
    : [dl("feeDesc", lang, bilingual), "الوصف", dl("amountAED", lang, bilingual)];

  const feeColWidths = isAr ? [7160, 2200] : [3800, 3360, 2200];

  const feeHeaderCells = feeHeaderTexts.map((text, i) =>
    new TableCell({
      borders: cellBorders,
      width: { size: feeColWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: BRAND_COLOR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ alignment: i === feeHeaderTexts.length - 1 ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })],
    }),
  );

  const feeTableRows = [new TableRow({ children: feeHeaderCells })];
  data.fees.forEach((fee, idx) => {
    const bg = idx % 2 === 0 ? "FFFFFF" : "FAFAFA";
    const amount = data.isCommercial ? fee.amountCommercial : fee.amountResidential;

    if (isAr) {
      feeTableRows.push(
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, width: { size: 7160, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fee.nameAr, font: "Arial", size: 18 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmtAED(amount, lang), font: "Arial", size: 18, bold: true })] })] }),
          ],
        }),
      );
    } else {
      feeTableRows.push(
        new TableRow({
          children: [
            new TableCell({ borders: cellBorders, width: { size: 3800, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: fee.name, font: "Arial", size: 18 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fee.nameAr, font: "Arial", size: 18 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmtAED(amount, lang), font: "Arial", size: 18, bold: true })] })] }),
          ],
        }),
      );
    }
  });

  children.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: feeColWidths, rows: feeTableRows }));

  // Signature Section
  const sigAlign = isAr ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const sigBorderSide = { style: BorderStyle.SINGLE, size: 1, color: GOLD_COLOR, space: 1 };
  const sigBorderNone = { style: BorderStyle.NONE, size: 0 };

  children.push(
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    new Paragraph({
      spacing: { before: 100 },
      shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
      border: { top: sigBorderSide, bottom: sigBorderNone, left: sigBorderSide, right: sigBorderSide },
      alignment: sigAlign,
      children: [new TextRun({ text: dl("signatureSection", lang, bilingual), font: "Arial", size: 22, bold: true, color: BRAND_COLOR })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
      border: { top: sigBorderNone, bottom: sigBorderNone, left: sigBorderSide, right: sigBorderSide },
      alignment: sigAlign,
      spacing: { after: 200 },
      children: [new TextRun({ text: dl("signatureAck", lang, bilingual), font: "Arial", size: 16, color: "555555" })],
    }),
  );

  // Signature fields as a table
  const sigLine = "____________________________";
  const sigFieldRows = [
    { label: dl("signatureName", lang, bilingual), value: data.tenantName },
    { label: dl("signatureDate", lang, bilingual), value: sigLine },
    { label: dl("signatureSign", lang, bilingual), value: sigLine },
  ];

  const sigFieldBorder = { style: BorderStyle.NONE, size: 0 };
  const sigFieldBorders = { top: sigFieldBorder, bottom: sigFieldBorder, left: sigFieldBorder, right: sigFieldBorder };

  const sigTableRows = sigFieldRows.map((field) =>
    new TableRow({
      children: [
        new TableCell({
          borders: sigFieldBorders,
          width: { size: 2400, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
          margins: { top: 80, bottom: 80, left: 120, right: 40 },
          children: [new Paragraph({ alignment: sigAlign, children: [new TextRun({ text: field.label, font: "Arial", size: 18, bold: true, color: "444444" })] })],
        }),
        new TableCell({
          borders: sigFieldBorders,
          width: { size: 6960, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
          margins: { top: 80, bottom: 80, left: 40, right: 120 },
          children: [new Paragraph({ alignment: sigAlign, children: [new TextRun({ text: field.value, font: "Arial", size: 18, color: "333333" })] })],
        }),
      ],
    }),
  );

  children.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [2400, 6960],
      rows: sigTableRows,
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
      border: { top: sigBorderNone, bottom: sigBorderSide, left: sigBorderSide, right: sigBorderSide },
      children: [new TextRun({ text: " ", font: "Arial", size: 8 })],
    }),
  );

  // Footer
  children.push(
    new Paragraph({ spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 3, color: GOLD_COLOR, space: 8 } }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Alyassia Properties L.L.C. | شركة الياسية للعقارات", font: "Arial", size: 18, bold: true, color: BRAND_COLOR })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Omniah Tower, Mezzanine floor, 28 Al Bahhar St, Al Hisn, Al Markaziyah West, Abu Dhabi, UAE", font: "Arial", size: 16, color: "888888" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tel: +971 2 667 3444 | Email: info@alyassiaproperties.ae", font: "Arial", size: 16, color: "888888" })] }),
  );

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({ spacing: { before: 200 }, border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 8 } }, children: [] }),
            new Paragraph({
              alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
              spacing: { after: 40 },
              children: [new TextRun({ text: dl("tenantSignature", lang, bilingual), font: "Arial", size: 18, color: "666666" })],
            }),
            new Paragraph({
              alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: [new TextRun({ text: dl("signatureLine", lang, bilingual), font: "Arial", size: 20, color: "333333" })],
            }),
          ],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  const fileName = `Rent_Statement_${data.tenantName.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.docx`;
  saveAs(buffer, fileName);
}

// Export DOCX from a TenantRecord (used in admin dashboard)
export async function exportDocxFromRecord(record: { tenantName: string; companyName: string; buildingName: string; unitNumber: string; unitType: string; annualRent: number; calculatedAt: string }): Promise<void> {
  const { calculateRent, generatePaymentSchedule } = await import("@/utils/calculations");
  const { fees } = await import("@/data/fees");
  const { addMonths } = await import("date-fns");

  const isCommercial = ["Office", "Showroom", "Shop"].includes(record.unitType);
  const numPayments = 4;
  const leaseStart = new Date(record.calculatedAt);
  const leaseEnd = addMonths(leaseStart, 12);

  const calculation = calculateRent(record.annualRent, numPayments, isCommercial);
  const schedule = generatePaymentSchedule(leaseStart, numPayments, calculation);

  const adminFee = fees.find((f) => f.id === "admin");
  const adminFeeAmount = adminFee ? (isCommercial ? adminFee.amountCommercial : adminFee.amountResidential) : 0;
  const adminFeeLabel = adminFee?.name || "Admin Fee";

  await exportDocx({
    tenantName: record.tenantName,
    companyName: record.companyName || "",
    buildingName: record.buildingName,
    unitNumber: record.unitNumber,
    unitType: record.unitType,
    annualRent: record.annualRent,
    monthlyRent: calculation.monthlyRent,
    vatAmount: calculation.vatAmount,
    brokerFee: calculation.brokerFee,
    securityDeposit: calculation.securityDeposit,
    adminFee: adminFeeAmount,
    adminFeeLabel,
    numPayments,
    schedule,
    fees,
    leaseStartDate: format(leaseStart, "dd MMM yyyy"),
    leaseEndDate: format(leaseEnd, "dd MMM yyyy"),
    leaseType: isCommercial ? "Commercial" : "Residential",
    isCommercial,
  });
}