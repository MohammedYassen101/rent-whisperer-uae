import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TenantRecord, MaintenanceRequest, TenantFeedback } from "@/types/rent";

interface Props {
  records: TenantRecord[];
  requests: MaintenanceRequest[];
  feedback: TenantFeedback[];
}

export default function AdminTrendsChart({ records, requests, feedback }: Props) {
  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const interval = { start, end };

      months.push({
        month: format(monthDate, "MMM yy"),
        Users: records.filter((r) =>
          isWithinInterval(new Date(r.lastVisit), interval)
        ).length,
        Maintenance: requests.filter((r) =>
          isWithinInterval(new Date(r.submittedAt), interval)
        ).length,
        Feedback: feedback.filter((f) =>
          isWithinInterval(new Date(f.submittedAt), interval)
        ).length,
      });
    }

    return months;
  }, [records, requests, feedback]);

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Monthly Activity Trends (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend />
              <Bar dataKey="Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Maintenance" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Feedback" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
