import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { PaymentScheduleItem } from "@/types/rent";
import { formatAED } from "@/utils/calculations";
import { format } from "date-fns";

interface PaymentScheduleProps {
  schedule: PaymentScheduleItem[];
}

export default function PaymentSchedule({ schedule }: PaymentScheduleProps) {
  const totalAmount = schedule.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="w-5 h-5 text-primary" />
          Payment Schedule
          <Badge variant="secondary" className="ml-auto">
            {schedule.length} Payment{schedule.length > 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">#</th>
                <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Due Date</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Base Amount</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">VAT (5%)</th>
                <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
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
                  <td className="py-3 px-3">
                    {format(item.date, "dd MMM yyyy")}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    AED {formatAED(item.baseAmount)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {item.includesVat ? (
                      <span className="text-accent-foreground">
                        AED {formatAED(item.vatAmount)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold">
                    AED {formatAED(item.amount)}
                    {item.includesVat && (
                      <Badge className="ml-2 bg-accent text-accent-foreground text-[10px] px-1.5 py-0">
                        VAT
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-secondary font-bold border-t-2 border-border">
                <td colSpan={4} className="py-3 px-3">
                  Total
                </td>
                <td className="py-3 px-3 text-right tabular-nums text-primary">
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
