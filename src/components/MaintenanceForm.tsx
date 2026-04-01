import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Send, CheckCircle2 } from "lucide-react";
import { buildings } from "@/data/buildings";
import { saveMaintenanceRequest } from "@/utils/storage";
import { toast } from "sonner";
import { maintenanceRequestSchema } from "@/utils/validation";
import { useLanguage } from "@/hooks/useLanguage";

export default function MaintenanceForm() {
  const { t } = useLanguage();
  const [tenantName, setTenantName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [building, setBuilding] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = maintenanceRequestSchema.safeParse({
      tenantName,
      companyName,
      unitNumber,
      building,
      description,
      priority,
    });

    if (!result.success) {
      toast.error(result.error.errors[0]?.message || "Please fix the form errors");
      return;
    }

    try {
      await saveMaintenanceRequest(result.data as Required<typeof result.data>);
      toast.success(t("maint.success"));
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit request. Please try again.");
    }
  };

  const handleReset = () => {
    setTenantName("");
    setCompanyName("");
    setBuilding("");
    setUnitNumber("");
    setDescription("");
    setPriority("medium");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto animate-scale-in">
        <Card className="shadow-card text-center">
          <CardContent className="py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">
              {t("maint.submitted")}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {t("maint.submittedDesc")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("maint.urgentContact")}{" "}
              <a href="mailto:info@alyassiaproperties.ae" className="text-primary font-medium hover:underline">
                info@alyassiaproperties.ae
              </a>
            </p>
            <Button onClick={handleReset} variant="outline" className="mt-4">
              {t("maint.another")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          {t("maint.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("maint.subtitle")}
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="w-5 h-5 text-primary" />
            {t("maint.submitTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maint-name">{t("maint.name")} *</Label>
                <Input
                  id="maint-name"
                  placeholder={t("maint.yourName")}
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maint-company">{t("maint.company")}</Label>
                <Input
                  id="maint-company"
                  placeholder={t("maint.companyName")}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("maint.building")} *</Label>
                <Select value={building} onValueChange={setBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("maint.selectBuilding")} />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maint-unit">{t("maint.unit")} *</Label>
                <Input
                  id="maint-unit"
                  placeholder={t("maint.unitPlaceholder")}
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("maint.priority")}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("maint.low")}</SelectItem>
                  <SelectItem value="medium">{t("maint.medium")}</SelectItem>
                  <SelectItem value="high">{t("maint.high")}</SelectItem>
                  <SelectItem value="urgent">{t("maint.urgent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maint-desc">{t("maint.description")} *</Label>
              <Textarea
                id="maint-desc"
                placeholder={t("maint.descPlaceholder")}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Send className="w-4 h-4 me-2" />
              {t("maint.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
