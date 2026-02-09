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

export default function MaintenanceForm() {
  const [tenantName, setTenantName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [building, setBuilding] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("medium");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    saveMaintenanceRequest(result.data as Required<typeof result.data>);

    toast.success("Maintenance request submitted successfully!");
    setSubmitted(true);
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
              Request Submitted!
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your maintenance request has been submitted. Our team will review it and get back to you shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              For urgent issues, please contact:{" "}
              <a href="mailto:info@alyassiaproperties.ae" className="text-primary font-medium hover:underline">
                info@alyassiaproperties.ae
              </a>
            </p>
            <Button onClick={handleReset} variant="outline" className="mt-4">
              Submit Another Request
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
          Maintenance Request
        </h2>
        <p className="text-muted-foreground">
          Submit a maintenance complaint and our team will address it promptly.
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="w-5 h-5 text-primary" />
            Submit a Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maint-name">Tenant Name *</Label>
                <Input
                  id="maint-name"
                  placeholder="Your name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maint-company">Company</Label>
                <Input
                  id="maint-company"
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Building *</Label>
                <Select value={building} onValueChange={setBuilding}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
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
                <Label htmlFor="maint-unit">Unit Number *</Label>
                <Input
                  id="maint-unit"
                  placeholder="e.g. M101"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  maxLength={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — General maintenance</SelectItem>
                  <SelectItem value="medium">Medium — Needs attention soon</SelectItem>
                  <SelectItem value="high">High — Affects daily operations</SelectItem>
                  <SelectItem value="urgent">Urgent — Emergency / Safety issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maint-desc">Description *</Label>
              <Textarea
                id="maint-desc"
                placeholder="Describe the issue in detail..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
