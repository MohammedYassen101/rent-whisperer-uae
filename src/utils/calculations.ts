import { addMonths } from "date-fns";
import { PaymentScheduleItem, RentCalculation } from "@/types/rent";

export function calculateRent(
  annualRent: number,
  numPayments: number,
  isCommercial: boolean
): RentCalculation {
  const vatRate = isCommercial ? 0.05 : 0;
  const vatAmount = annualRent * vatRate;
  const paymentAmount = annualRent / numPayments;
  const firstPayment = paymentAmount + vatAmount;

  return {
    annualRent,
    monthlyRent: annualRent / 12,
    paymentAmount,
    vatRate,
    vatAmount,
    firstPayment,
    subsequentPayments: paymentAmount,
    numPayments,
    isCommercial,
  };
}

export function generatePaymentSchedule(
  leaseStartDate: Date,
  numPayments: number,
  rentCalc: RentCalculation
): PaymentScheduleItem[] {
  const schedule: PaymentScheduleItem[] = [];
  const monthsBetween = 12 / numPayments;

  for (let i = 0; i < numPayments; i++) {
    const paymentDate = addMonths(leaseStartDate, i * monthsBetween);
    const isFirst = i === 0;
    const vatAmount = isFirst ? rentCalc.vatAmount : 0;
    const baseAmount = rentCalc.paymentAmount;

    schedule.push({
      paymentNumber: i + 1,
      date: paymentDate,
      amount: baseAmount + vatAmount,
      includesVat: isFirst && rentCalc.vatAmount > 0,
      vatAmount,
      baseAmount,
    });
  }

  return schedule;
}

export function formatAED(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
