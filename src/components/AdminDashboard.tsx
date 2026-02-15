import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Users, Eye, Star, Wrench, TrendingUp, Calendar,
  AlertCircle, CheckCircle2, Clock, LogOut, Download, Trash2, FileText, Mail, Printer
} from "lucide-react";
import * as XLSX from "xlsx";
import { getTenantRecords, getMaintenanceRequests, getFeedback, getRentIncrease, setRentIncrease, updateMaintenanceStatus, deleteTenantRecord } from "@/utils/storage";
import { printTenantPdf } from "@/utils/tenantPrint";
import { printMaintenanceRequest } from "@/utils/maintenancePrint";
import { TenantRecord, MaintenanceRequest, TenantFeedback } from "@/types/rent";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import AdminTrendsChart from "@/components/AdminTrendsChart";
import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading: loadingRecords } = useQuery({
    queryKey: ["admin-records"],
    queryFn: getTenantRecords,
    staleTime: 60_000,
    retry: false,
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: getMaintenanceRequests,
    staleTime: 60_000,
    retry: false,
  });

  const { data: feedback = [], isLoading: loadingFeedback } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: getFeedback,
    staleTime: 60_000,
    retry: false,
  });

  const { data: rentIncreaseData } = useQuery({
    queryKey: ["admin-rent-increase"],
    queryFn: getRentIncrease,
    staleTime: 60_000,
    retry: false,
  });


  const rentIncreaseEnabled = rentIncreaseData?.enabled ?? false;

  const handleRentIncreaseToggle = async (enabled: boolean) => {
    await setRentIncrease(enabled);
    queryClient.invalidateQueries({ queryKey: ["admin-rent-increase"] });
    toast.success(enabled ? "5% rent increase activated" : "Rent increase deactivated");
  };

  const handleDeleteTenant = async (id: string) => {
    try {
      await deleteTenantRecord(id);
      queryClient.invalidateQueries({ queryKey: ["admin-records"] });
      toast.success("Tenant record deleted");
    } catch {
      toast.error("Failed to delete tenant record");
    }
  };

  const handleMaintenanceStatusChange = async (id: string, status: MaintenanceRequest["status"]) => {
    await updateMaintenanceStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    toast.success(`Request marked as ${status}`);
  };


  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const handleExportMaintenance = () => {
    if (requests.length === 0) {
      toast.error("No maintenance requests to export");
      return;
    }
    const wb = XLSX.utils.book_new();
    const rows = requests.map((r) => ({
      "Tenant Name": r.tenantName,
      "Company": r.companyName || "—",
      "Building": r.building,
      "Unit": r.unitNumber,
      "Description": r.description,
      "Priority": r.priority,
      "Status": r.status,
      "Submitted": format(new Date(r.submittedAt), "dd MMM yyyy, hh:mm a"),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Maintenance Requests");
    XLSX.writeFile(wb, `Maintenance_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Maintenance report downloaded");
  };

  const handleExportExcel = () => {
    if (records.length === 0 && requests.length === 0 && feedback.length === 0) {
      toast.error("No data to export");
      return;
    }
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tenant Calculations
    if (records.length > 0) {
      const tenantRows = records.map((r) => ({
        "Tenant Name": r.tenantName,
        "Company": r.companyName || "—",
        "Building": r.buildingName,
        "Unit": r.unitNumber,
        "Unit Type": r.unitType,
        "Annual Rent (AED)": r.annualRent,
        "Visits": r.visitCount,
        "Last Visit": format(new Date(r.lastVisit), "dd MMM yyyy, hh:mm a"),
        "First Calculated": format(new Date(r.calculatedAt), "dd MMM yyyy"),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tenantRows), "Tenant Calculations");
    }

    // Sheet 2: Maintenance Requests
    if (requests.length > 0) {
      const maintRows = requests.map((r) => ({
        "Tenant Name": r.tenantName,
        "Company": r.companyName || "—",
        "Building": r.building,
        "Unit": r.unitNumber,
        "Description": r.description,
        "Priority": r.priority,
        "Status": r.status,
        "Submitted": format(new Date(r.submittedAt), "dd MMM yyyy, hh:mm a"),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(maintRows), "Maintenance Requests");
    }

    // Sheet 3: Feedback
    if (feedback.length > 0) {
      const fbRows = feedback.map((f) => ({
        "Tenant Name": f.tenantName,
        "Company": f.companyName || "—",
        "Rating": f.rating,
        "Comment": f.comment || "—",
        "Submitted": format(new Date(f.submittedAt), "dd MMM yyyy, hh:mm a"),
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fbRows), "Feedback");
    }

    XLSX.writeFile(wb, `Dashboard_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Excel file downloaded with all sheets");
  };

  // No longer block rendering — dashboard shows immediately, sections load individually

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const totalVisits = records.reduce((sum, r) => sum + r.visitCount, 0);
  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "N/A";
  const pendingMaintenance = requests.filter((r) => r.status === "pending").length;

  // Monthly stats
  const monthlyVisitors = records.filter((r) => new Date(r.lastVisit) >= startOfMonth).length;
  const monthlyMaintenance = requests.filter((r) => new Date(r.submittedAt) >= startOfMonth).length;
  const monthlyFeedback = feedback.filter((f) => new Date(f.submittedAt) >= startOfMonth).length;
  const monthlyVisits = records
    .filter((r) => new Date(r.lastVisit) >= startOfMonth)
    .reduce((sum, r) => sum + r.visitCount, 0);

  // Yearly stats
  const yearlyVisitors = records.filter((r) => new Date(r.lastVisit) >= startOfYear).length;
  const yearlyMaintenance = requests.filter((r) => new Date(r.submittedAt) >= startOfYear).length;
  const yearlyFeedback = feedback.filter((f) => new Date(f.submittedAt) >= startOfYear).length;
  const yearlyVisits = records
    .filter((r) => new Date(r.lastVisit) >= startOfYear)
    .reduce((sum, r) => sum + r.visitCount, 0);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage tenants, maintenance requests, and settings.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:info@alyassiaproperties.ae">
                <Mail className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Email Us</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Tenants" value={records.length.toString()} />
        <StatCard icon={<Eye className="w-5 h-5" />} label="Total Visits" value={totalVisits.toString()} />
        <StatCard icon={<Star className="w-5 h-5" />} label="Avg. Rating" value={avgRating} />
        <StatCard icon={<Wrench className="w-5 h-5" />} label="Pending Maintenance" value={pendingMaintenance.toString()} highlight={pendingMaintenance > 0} />
      </div>

      {/* Monthly & Yearly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              This Month — {format(now, "MMMM yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Active Users" value={monthlyVisitors} />
              <MiniStat label="Total Visits" value={monthlyVisits} />
              <MiniStat label="Maintenance Req." value={monthlyMaintenance} />
              <MiniStat label="Feedback" value={monthlyFeedback} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              This Year — {now.getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <MiniStat label="Active Users" value={yearlyVisitors} />
              <MiniStat label="Total Visits" value={yearlyVisits} />
              <MiniStat label="Maintenance Req." value={yearlyMaintenance} />
              <MiniStat label="Feedback" value={yearlyFeedback} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <AdminTrendsChart records={records} requests={requests} feedback={feedback} />

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
            <Switch checked={rentIncreaseEnabled} onCheckedChange={handleRentIncreaseToggle} />
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
            <p className="text-center text-muted-foreground py-8">No tenant activity yet.</p>
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
                     <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {records.map((r) => (
                     <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/50">
                       <td className="py-2.5 px-3 font-medium">{r.tenantName}</td>
                       <td className="py-2.5 px-3 text-muted-foreground">{r.companyName || "—"}</td>
                       <td className="py-2.5 px-3">{r.buildingName} / {r.unitNumber}</td>
                       <td className="py-2.5 px-3 text-center"><Badge variant="secondary">{r.visitCount}</Badge></td>
                       <td className="py-2.5 px-3 text-muted-foreground">{format(new Date(r.lastVisit), "dd MMM yyyy, hh:mm a")}</td>
                       <td className="py-2.5 px-3 text-center">
                         <div className="flex items-center justify-center gap-1">
                           <Button size="sm" variant="ghost" onClick={() => printTenantPdf(r)} title="Download PDF">
                             <FileText className="w-4 h-4" />
                           </Button>
                           <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTenant(r.id)} title="Delete">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
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
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportMaintenance}>
                <Download className="w-3 h-3 mr-1" /> Export
              </Button>
              <Badge variant="secondary">{requests.length}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No maintenance requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="border rounded-lg p-4 space-y-2 hover:bg-secondary/30 transition-colors">
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
                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(req.submittedAt), "dd MMM yyyy, hh:mm a")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => printMaintenanceRequest(req)} title="Print Request">
                        <Printer className="w-3 h-3 mr-1" /> Print
                      </Button>
                      {req.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleMaintenanceStatusChange(req.id, "in-progress")}>
                            <Clock className="w-3 h-3 mr-1" /> In Progress
                          </Button>
                          <Button size="sm" onClick={() => handleMaintenanceStatusChange(req.id, "completed")}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                          </Button>
                        </>
                      )}
                      {req.status === "in-progress" && (
                        <Button size="sm" onClick={() => handleMaintenanceStatusChange(req.id, "completed")}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Complete
                        </Button>
                      )}
                    </div>
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
                        <Star key={s} className={`w-4 h-4 ${s <= f.rating ? "fill-accent text-accent" : "text-border"}`} />
                      ))}
                    </div>
                  </div>
                  {f.comment && <p className="text-sm text-muted-foreground">{f.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{format(new Date(f.submittedAt), "dd MMM yyyy")}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
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
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variants[priority] || ""}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    pending: "bg-accent/10 text-accent-foreground",
    "in-progress": "bg-info/10 text-info",
    completed: "bg-success/10 text-success",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variants[status] || ""}`}>{status}</span>;
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center p-3 rounded-lg bg-secondary/50">
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
    </div>
  );
}
