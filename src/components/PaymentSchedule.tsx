import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { PaymentScheduleItem } from "@/types/rent";
import { formatAED } from "@/utils/calculations";
import { format } from "date-fns";
import { numberToWordsEn, numberToWordsAr } from "@/utils/numberToWords";
import { useLanguage } from "@/hooks/useLanguage";

interface PaymentScheduleProps {
  schedule: PaymentScheduleItem[];
  yearlyRents?: number[];
}

export default function PaymentSchedule({ schedule, yearlyRents }: PaymentScheduleProps) {
  const { t } = useLanguage();
  const totalAmount = schedule.reduce((sum, item) => sum + item.amount, 0);
  const hasMultipleYears = yearlyRents && yearlyRents.length > 1;

  // Group payments by year
  const years = hasMultipleYears
    ? [...new Set(schedule.map((s) => s.year || 1))]
    : [1];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="w-5 h-5 text-primary" />
          {t("result.schedule")}
          <Badge variant="secondary" className="ms-auto">
            {schedule.length} {t("result.paymentNo")}{schedule.length > 1 ? "" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Yearly rent breakdown for multi-year */}
        {hasMultipleYears && (
          <div className="mb-4 space-y-2">
            {yearlyRents.map((rent, idx) => (
              <div key={idx} className="flex items-center justify-between bg-secondary/50 rounded-md px-3 py-2 text-sm">
                <span className="font-medium">
                  {t("result.yearRent")} {idx + 1}
                  {idx > 0 && <span className="text-muted-foreground ms-1 text-xs">{t("result.increase5")}</span>}
                </span>
                <span className="font-bold tabular-nums">AED {formatAED(rent)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-start py-2 px-3 font-semibold text-muted-foreground">#</th>
                {hasMultipleYears && (
                  <th className="text-start py-2 px-3 font-semibold text-muted-foreground">{t("result.year")}</th>
                )}
                <th className="text-start py-2 px-3 font-semibold text-muted-foreground">{t("result.dueDate")}</th>
                <th className="text-end py-2 px-3 font-semibold text-muted-foreground">{t("result.baseAmount")}</th>
                <th className="text-end py-2 px-3 font-semibold text-muted-foreground">{t("result.vat")}</th>
                <th className="text-end py-2 px-3 font-semibold text-muted-foreground">{t("result.total")}</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, idx) => {
                const prevYear = idx > 0 ? schedule[idx - 1].year : undefined;
                const showYearDivider = hasMultipleYears && item.year !== prevYear && idx > 0;

                return (
                  <>
                    {showYearDivider && (
                      <tr key={`divider-${item.year}`} className="border-t-2 border-primary/30">
                        <td colSpan={hasMultipleYears ? 6 : 5} className="py-1" />
                      </tr>
                    )}
                    <tr
                      key={item.paymentNumber}
                      className={`border-b border-border/50 transition-colors ${
                        item.includesVat
                          ? "bg-gold-subtle font-semibold"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {item.paymentNumber}
                        </span>
                      </td>
                      {hasMultipleYears && (
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-xs">
                            {t("result.year")} {item.year}
                          </Badge>
                        </td>
                      )}
                      <td className="py-3 px-3">
                        {format(item.date, "dd MMM yyyy")}
                      </td>
                      <td className="py-3 px-3 text-end tabular-nums">
                        AED {formatAED(item.baseAmount)}
                      </td>
                      <td className="py-3 px-3 text-end tabular-nums">
                        {item.includesVat ? (
                          <span className="text-accent-foreground">
                            AED {formatAED(item.vatAmount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end">
                        <div className="tabular-nums font-bold">
                          AED {formatAED(item.amount)}
                          {item.includesVat && (
                            <Badge className="ms-2 bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
                              VAT
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-normal mt-1 leading-tight">
                          {numberToWordsEn(item.amount)}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-normal leading-tight" dir="rtl">
                          {numberToWordsAr(item.amount)}
                        </div>
                      </td>
                    </tr>
                  </>
                );
              })}
              {/* Total row */}
              <tr className="bg-secondary font-bold border-t-2 border-border">
                <td colSpan={hasMultipleYears ? 5 : 4} className="py-3 px-3">
                  {t("result.total")}
                </td>
                <td className="py-3 px-3 text-end tabular-nums text-primary">
                  AED {formatAED(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
