import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, HeadingLevel,
  Header, Footer, PageNumber,
} from "docx";
import { saveAs } from "file-saver";
import { PaymentScheduleItem, Fee } from "@/types/rent";
import { format } from "date-fns";
import { numberToWordsEn, numberToWordsAr } from "@/utils/numberToWords";

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
}

const BRAND_COLOR = "7A1A1A";
const GOLD_COLOR = "E8D5A3";
const GOLD_BG = "FFF8E1";
const LIGHT_BG = "F8F6F2";

function fmtAED(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  const children: (Paragraph | Table)[] = [];

  // Header
  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "ALYASSIA PROPERTIES L.L.C.", font: "Arial", size: 36, bold: true, color: BRAND_COLOR })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "شركة الياسية للعقارات ش.ش ذ.م.م", font: "Arial", size: 28, color: BRAND_COLOR })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "RENT STATEMENT", font: "Arial", size: 28, bold: true, color: "333333" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_COLOR, space: 8 } }, children: [new TextRun({ text: `Generated on ${format(new Date(), "dd MMMM yyyy, hh:mm a")}`, font: "Arial", size: 18, color: "888888" })] }),
  );

  // Tenant Information
  children.push(sectionTitle("Tenant Information"));
  children.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [3000, 6360],
      rows: [
        infoRow("Tenant Name:", data.tenantName),
        infoRow("Company:", data.companyName || "—"),
        infoRow("Building:", data.buildingName),
        infoRow("Unit:", data.unitNumber),
        infoRow("Unit Type:", `${data.unitType}${data.area ? ` (${data.area} sqm)` : ""}`),
        infoRow("Lease Type:", data.leaseType),
        infoRow("Lease Period:", `${data.leaseStartDate} — ${data.leaseEndDate}`),
      ],
    }),
  );

  // Rent Summary
  children.push(sectionTitle("Rent Summary"));

  const summaryRows = [
    ["Annual Rent", fmtAED(data.annualRent)],
    ["Monthly Rent", fmtAED(data.monthlyRent)],
    [data.adminFeeLabel, fmtAED(data.adminFee)],
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
    children.push(...highlightBox("5% VAT on Commercial Rent (applied to first payment)", fmtAED(data.vatAmount)));
  }
  if (data.brokerFee > 0) {
    children.push(...highlightBox("Broker Fee (5% of Annual Rent) / عمولة الوساطة", fmtAED(data.brokerFee)));
  }
  children.push(...highlightBox("Security Deposit (5% of Annual Rent) / التأمين", fmtAED(data.securityDeposit)));

  // Payment Schedule
  children.push(sectionTitle(`Payment Schedule (${data.numPayments} Payment${data.numPayments > 1 ? "s" : ""})`));

  const headerCells = ["#", "Due Date", "Base Amount", "VAT (5%)", "Total"].map((text, i) =>
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
      fmtAED(item.baseAmount),
      item.includesVat ? fmtAED(item.vatAmount) : "—",
      fmtAED(item.amount),
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
          ...(i === 4 ? [
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: numberToWordsEn(item.amount), font: "Arial", size: 14, color: "666666" })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: numberToWordsAr(item.amount), font: "Arial", size: 14, color: "666666" })] }),
          ] : []),
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
          children: [new Paragraph({ children: [new TextRun({ text: "Total", font: "Arial", size: 20, bold: true })] })],
        }),
        new TableCell({
          borders: { ...cellBorders, top: { style: BorderStyle.SINGLE, size: 3, color: GOLD_COLOR } },
          width: { size: 2560, type: WidthType.DXA },
          margins: { top: 60, bottom: 60, left: 80, right: 80 },
          children: [
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmtAED(totalRent), font: "Arial", size: 20, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: numberToWordsEn(totalRent), font: "Arial", size: 14, color: "666666" })] }),
            new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: numberToWordsAr(totalRent), font: "Arial", size: 14, color: "666666" })] }),
          ],
        }),
      ],
    }),
  );

  children.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [800, 2000, 2200, 1800, 2560], rows: scheduleTableRows }));

  // First Cheque Value
  const firstPaymentAmount = data.schedule.length > 0 ? data.schedule[0].amount : 0;
  const firstChequeValue = firstPaymentAmount + data.securityDeposit + data.adminFee;
  children.push(
    new Paragraph({
      spacing: { before: 200 },
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, bottom: { style: BorderStyle.NONE, size: 0 }, left: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, right: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 } },
      children: [new TextRun({ text: "First Cheque Value / قيمة الشيك الأول", font: "Arial", size: 18, color: "2E7D32" })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.NONE, size: 0 }, left: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, right: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 } },
      children: [new TextRun({ text: "First Payment + Security Deposit + Administration Fee / الدفعة الأولى + التأمين + الرسوم الإدارية", font: "Arial", size: 14, color: "555555" })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, left: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, right: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 } },
      children: [new TextRun({ text: fmtAED(firstChequeValue), font: "Arial", size: 32, bold: true, color: "1B5E20" })],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, left: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, right: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 } },
      children: [
        new TextRun({ text: numberToWordsEn(firstChequeValue), font: "Arial", size: 14, color: "666666" }),
      ],
    }),
    new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: "E8F5E9" },
      border: { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, left: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 }, right: { style: BorderStyle.SINGLE, size: 1, color: "66BB6A", space: 1 } },
      children: [
        new TextRun({ text: numberToWordsAr(firstChequeValue), font: "Arial", size: 14, color: "666666" }),
      ],
    }),
  );

  // Additional Fees Schedule
  children.push(sectionTitle("Additional Fees Schedule"));

  const feeHeaderCells = ["Fee Description", "الوصف", "Amount (AED)"].map((text, i) =>
    new TableCell({
      borders: cellBorders,
      width: { size: [3800, 3360, 2200][i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: BRAND_COLOR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ alignment: i === 2 ? AlignmentType.RIGHT : AlignmentType.LEFT, children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })],
    }),
  );

  const feeTableRows = [new TableRow({ children: feeHeaderCells })];
  data.fees.forEach((fee, idx) => {
    const bg = idx % 2 === 0 ? "FFFFFF" : "FAFAFA";
    const amount = data.isCommercial ? fee.amountCommercial : fee.amountResidential;
    feeTableRows.push(
      new TableRow({
        children: [
          new TableCell({ borders: cellBorders, width: { size: 3800, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ children: [new TextRun({ text: fee.name, font: "Arial", size: 18 })] })] }),
          new TableCell({ borders: cellBorders, width: { size: 3360, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fee.nameAr, font: "Arial", size: 18 })] })] }),
          new TableCell({ borders: cellBorders, width: { size: 2200, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: bg }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmtAED(amount), font: "Arial", size: 18, bold: true })] })] }),
        ],
      }),
    );
  });

  children.push(new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3800, 3360, 2200], rows: feeTableRows }));

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
          margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 },
        },
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
