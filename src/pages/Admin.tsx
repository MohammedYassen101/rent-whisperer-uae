import { useState, useEffect } from "react";
import Header from "@/components/Header";
import AdminAuth, { isAdminAuthenticated, clearAdminSession } from "@/components/AdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Users, Eye, Star, Wrench, TrendingUp, Calendar,
  AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import { getTenantRecords, getMaintenanceRequests, getFeedback, getRentIncrease, setRentIncrease, updateMaintenanceStatus } from "@/utils/storage";
import { TenantRecord, MaintenanceRequest, TenantFeedback } from "@/types/rent";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const [records, setRecords] = useState<TenantRecord[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [feedback, setFeedback] = useState<TenantFeedback[]>([]);
  const [rentIncreaseEnabled, setRentIncreaseEnabled] = useState(false);

  useEffect(() => {
    if (!authenticated) return;
    setRecords(getTenantRecords());
    setRequests(getMaintenanceRequests());
    setFeedback(getFeedback());
    setRentIncreaseEnabled(getRentIncrease().enabled);
  }, [authenticated]);

  if (!authenticated) {
    return <AdminAuth onAuthenticated={() => setAuthenticated(true)} />;
  }

  const handleRentIncreaseToggle = (enabled: boolean) => {
    setRentIncreaseEnabled(enabled);
    setRentIncrease(enabled);
    toast.success(enabled ? "5% rent increase activated" : "Rent increase deactivated");
  };

  const handleMaintenanceStatusChange = (id: string, status: MaintenanceRequest["status"]) => {
    updateMaintenanceStatus(id, status);
    setRequests(getMaintenanceRequests());
    toast.success(`Request marked as ${status}`);
  };

  const totalVisits = records.reduce((sum, r) => sum + r.visitCount, 0);
  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "N/A";
  const pendingMaintenance = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Title */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage tenants, maintenance requests, and settings.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Tenants" value={records.length.toString()} />
          <StatCard icon={<Eye className="w-5 h-5" />} label="Total Visits" value={totalVisits.toString()} />
          <StatCard icon={<Star className="w-5 h-5" />} label="Avg. Rating" value={avgRating} />
          <StatCard icon={<Wrench className="w-5 h-5" />} label="Pending Maintenance" value={pendingMaintenance.toString()} highlight={pendingMaintenance > 0} />
        </div>

        {/* Rent Increase Toggle */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Rent Increase Setting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Apply 5% Rent Increase</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  When enabled, all rents displayed in the calculator will include a 5% increase.
                </p>
              </div>
              <Switch
                checked={rentIncreaseEnabled}
                onCheckedChange={handleRentIncreaseToggle}
              />
            </div>
            {rentIncreaseEnabled && (
              <div className="mt-4 p-3 rounded-md bg-gold-subtle border border-gold/30">
                <p className="text-sm font-medium text-accent-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  5% rent increase is currently active for all tenants.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Records */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Tenant Activity
              <Badge variant="secondary" className="ml-auto">{records.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tenant activity yet. Records will appear when tenants use the calculator.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Tenant</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Company</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Building / Unit</th>
                      <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Visits</th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/50">
                        <td className="py-2.5 px-3 font-medium">{r.tenantName}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.companyName || "—"}</td>
                        <td className="py-2.5 px-3">{r.buildingName} / {r.unitNumber}</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant="secondary">{r.visitCount}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {format(new Date(r.lastVisit), "dd MMM yyyy, hh:mm a")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Maintenance Requests
              <Badge variant="secondary" className="ml-auto">{requests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No maintenance requests yet.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="border rounded-lg p-4 space-y-2 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{req.tenantName}</p>
                        <p className="text-sm text-muted-foreground">{req.building} — {req.unitNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={req.priority} />
                        <StatusBadge status={req.status} />
                      </div>
                    </div>
                    <p className="text-sm">{req.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(req.submittedAt), "dd MMM yyyy, hh:mm a")}
                      </p>
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMaintenanceStatusChange(req.id, "in-progress")}
                          >
                            <Clock className="w-3 h-3 mr-1" /> In Progress
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleMaintenanceStatusChange(req.id, "completed")}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                          </Button>
                        </div>
                      )}
                      {req.status === "in-progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleMaintenanceStatusChange(req.id, "completed")}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Tenant Feedback
              <Badge variant="secondary" className="ml-auto">{feedback.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No feedback yet.</p>
            ) : (
              <div className="space-y-3">
                {feedback.map((f) => (
                  <div key={f.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{f.tenantName}</p>
                        {f.companyName && <p className="text-xs text-muted-foreground">{f.companyName}</p>}
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= f.rating ? "fill-accent text-accent" : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {f.comment && <p className="text-sm text-muted-foreground">{f.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(f.submittedAt), "dd MMM yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`shadow-card ${highlight ? "border-destructive/40" : ""}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${highlight ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-xl font-display font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    low: "bg-info/10 text-info",
    medium: "bg-accent/10 text-accent-foreground",
    high: "bg-destructive/10 text-destructive",
    urgent: "bg-destructive text-destructive-foreground",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variants[priority] || ""}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-accent/10 text-accent-foreground",
    "in-progress": "bg-info/10 text-info",
    completed: "bg-success/10 text-success",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variants[status] || ""}`}>
      {status}
    </span>
  );
}
