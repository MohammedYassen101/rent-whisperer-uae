import { addMonths } from "date-fns";
import { PaymentScheduleItem, RentCalculation } from "@/types/rent";

export function calculateRent(
  annualRent: number,
  numPayments: number,
  isCommercial: boolean,
  hasBrokerFee: boolean = false
): RentCalculation {
  const vatRate = isCommercial ? 0.05 : 0;
  const vatAmount = annualRent * vatRate;
  const brokerFee = hasBrokerFee ? annualRent * 0.05 : 0;
  const securityDeposit = annualRent * 0.05;
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
    brokerFee,
    securityDeposit,
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
      year: 1,
    });
  }

  return schedule;
}

/**
 * Generate a multi-year payment schedule for commercial contracts.
 * Each subsequent year applies a 5% increase on the previous year's rent.
 * VAT is applied to the first payment of each year.
 */
export function generateMultiYearSchedule(
  leaseStartDate: Date,
  numPayments: number,
  baseAnnualRent: number,
  leaseYears: number,
  isCommercial: boolean,
  hasBrokerFee: boolean = false
): { schedules: PaymentScheduleItem[]; yearlyRents: number[] } {
  const allPayments: PaymentScheduleItem[] = [];
  const yearlyRents: number[] = [];
  let paymentCounter = 0;

  for (let year = 0; year < leaseYears; year++) {
    const yearRent = Math.round(baseAnnualRent * Math.pow(1.05, year) * 100) / 100;
    yearlyRents.push(yearRent);
    const yearStartDate = addMonths(leaseStartDate, year * 12);
    const calc = calculateRent(yearRent, numPayments, isCommercial, year === 0 ? hasBrokerFee : false);
    const monthsBetween = 12 / numPayments;

    for (let i = 0; i < numPayments; i++) {
      paymentCounter++;
      const paymentDate = addMonths(yearStartDate, i * monthsBetween);
      const isFirst = i === 0;
      const vatAmount = isFirst ? calc.vatAmount : 0;
      const baseAmount = calc.paymentAmount;

      allPayments.push({
        paymentNumber: paymentCounter,
        date: paymentDate,
        amount: baseAmount + vatAmount,
        includesVat: isFirst && calc.vatAmount > 0,
        vatAmount,
        baseAmount,
        year: year + 1,
      });
    }
  }

  return { schedules: allPayments, yearlyRents };
}

export function formatAED(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
