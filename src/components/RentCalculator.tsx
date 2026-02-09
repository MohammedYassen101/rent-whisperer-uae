import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Printer, Building2, DollarSign, Calendar, FileText } from "lucide-react";
import { buildings, getUnitsByBuilding, isCommercialUnit, getBuildingById, getUnitById } from "@/data/buildings";
import { fees } from "@/data/fees";
import { calculateRent, generatePaymentSchedule, formatAED } from "@/utils/calculations";
import { saveTenantRecord } from "@/utils/storage";
import { printReceipt } from "@/utils/print";
import { RentCalculation, PaymentScheduleItem } from "@/types/rent";
import { addMonths, format } from "date-fns";
import PaymentSchedule from "./PaymentSchedule";
import UnitSearchSelect from "./UnitSearchSelect";
import { toast } from "sonner";
import { rentCalculatorSchema } from "@/utils/validation";

export default function RentCalculator() {
  const [tenantName, setTenantName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contractType, setContractType] = useState<string>("");
  const [leaseType, setLeaseType] = useState<string>("");
  const [buildingId, setBuildingId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [annualRent, setAnnualRent] = useState<number>(0);
  const [numPayments, setNumPayments] = useState<string>("4");
  const [leaseStartDate, setLeaseStartDate] = useState("");
  const [results, setResults] = useState<{
    calculation: RentCalculation;
    schedule: PaymentScheduleItem[];
  } | null>(null);

  const isCommercial = contractType === "commercial";

  const availableUnits = useMemo(
    () => (buildingId ? getUnitsByBuilding(buildingId) : []),
    [buildingId]
  );

  const selectedUnit = useMemo(() => (unitId ? getUnitById(unitId) : undefined), [unitId]);
  const selectedBuilding = useMemo(() => (buildingId ? getBuildingById(buildingId) : undefined), [buildingId]);

  useEffect(() => {
    if (selectedUnit) {
      // Always apply mandatory 5% increase on the unit's base rent
      setAnnualRent(Math.round(selectedUnit.annualRent * 1.05 * 100) / 100);
    }
  }, [selectedUnit]);

  useEffect(() => {
    setUnitId("");
    setAnnualRent(0);
    setResults(null);
  }, [buildingId]);

  const handleCalculate = () => {
    const result = rentCalculatorSchema.safeParse({
      tenantName,
      companyName,
      contractType,
      buildingId,
      unitId,
      leaseStartDate,
      annualRent,
    });

    if (!result.success) {
      toast.error(result.error.errors[0]?.message || "Please fix the form errors");
      return;
    }

    const calculation = calculateRent(result.data.annualRent, parseInt(numPayments), isCommercial);
    const schedule = generatePaymentSchedule(new Date(leaseStartDate), parseInt(numPayments), calculation);

    setResults({ calculation, schedule });

    // Save for admin tracking (fire and forget)
    saveTenantRecord({
      tenantName: tenantName.trim(),
      companyName: companyName.trim(),
      buildingName: selectedBuilding?.name || "",
      unitNumber: selectedUnit?.unitNumber || "",
      unitType: selectedUnit?.type || "",
      annualRent,
      calculatedAt: new Date().toISOString(),
    }).catch(() => {});

    toast.success("Rent calculated successfully!");
  };

  const handlePrint = () => {
    if (!results || !selectedBuilding || !selectedUnit) return;

    const leaseStart = new Date(leaseStartDate);
    const leaseEnd = addMonths(leaseStart, 12);

    printReceipt({
      tenantName,
      companyName,
      buildingName: selectedBuilding.name,
      unitNumber: selectedUnit.unitNumber,
      unitType: selectedUnit.type,
      area: selectedUnit.area,
      annualRent: results.calculation.annualRent,
      monthlyRent: results.calculation.monthlyRent,
      vatAmount: results.calculation.vatAmount,
      numPayments: results.calculation.numPayments,
      schedule: results.schedule,
      fees,
      leaseStartDate: format(leaseStart, "dd MMM yyyy"),
      leaseEndDate: format(leaseEnd, "dd MMM yyyy"),
      leaseType: leaseType === "new" ? "New Lease" : "Renewal",
      isCommercial,
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Rent Calculator
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Calculate your commercial or residential rent, view payment schedules, and download a detailed statement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <Card className="lg:col-span-2 shadow-card animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-primary" />
              Tenant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">Tenant Name *</Label>
              <Input
                id="tenantName"
                placeholder="Enter full name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contract Type *</Label>
                <Select value={contractType} onValueChange={(val) => {
                  setContractType(val);
                  if (val !== "commercial") setCompanyName("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Lease Type *</Label>
                <Select value={leaseType} onValueChange={setLeaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lease" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Lease</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isCommercial && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label>Building *</Label>
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} — {b.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unit Number *</Label>
              <UnitSearchSelect
                units={availableUnits}
                value={unitId}
                onSelect={setUnitId}
                disabled={!buildingId}
              />
            </div>

            {selectedUnit && (
              <div className="flex gap-2">
                <Badge variant={isCommercial ? "default" : "secondary"}>
                  {selectedUnit.type}
                </Badge>
                {isCommercial && (
                  <Badge className="bg-accent text-accent-foreground">
                    +5% VAT
                  </Badge>
                )}
              </div>
            )}

            <Separator />

            <div>
              <div className="space-y-2">
                <Label htmlFor="annualRent">Annual Rent (AED) *</Label>
                <Input
                  id="annualRent"
                  type="number"
                  min={0}
                  value={annualRent || ""}
                  onChange={(e) => setAnnualRent(parseFloat(e.target.value) || 0)}
                />
                {selectedUnit && selectedUnit.annualRent > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Base rent: {selectedUnit.annualRent.toLocaleString()} AED → with 5% increase: {annualRent.toLocaleString()} AED
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Number of Payments</Label>
              <Select value={numPayments} onValueChange={setNumPayments}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Payment (Annual)</SelectItem>
                  <SelectItem value="2">2 Payments (Semi-Annual)</SelectItem>
                  <SelectItem value="3">3 Payments</SelectItem>
                  <SelectItem value="4">4 Payments (Quarterly)</SelectItem>
                  <SelectItem value="6">6 Payments (Bi-Monthly)</SelectItem>
                  <SelectItem value="12">12 Payments (Monthly)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Lease Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={leaseStartDate}
                onChange={(e) => setLeaseStartDate(e.target.value)}
              />
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4" size="lg">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Rent
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {results ? (
            <div className="animate-fade-in space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                  label="Annual Rent"
                  value={formatAED(results.calculation.annualRent)}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <SummaryCard
                  label="Monthly Rent"
                  value={formatAED(results.calculation.monthlyRent)}
                  icon={<Calendar className="w-4 h-4" />}
                />
                {results.calculation.isCommercial && (
                  <SummaryCard
                    label="VAT (5%)"
                    value={formatAED(results.calculation.vatAmount)}
                    icon={<DollarSign className="w-4 h-4" />}
                    highlight
                  />
                )}
              </div>

              {/* First Payment Highlight */}
              {results.calculation.isCommercial && (
                <Card className="border-gold bg-gold-subtle shadow-card">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        First Payment (includes 5% VAT)
                      </p>
                      <p className="text-2xl font-display font-bold text-foreground">
                        AED {formatAED(results.calculation.firstPayment)}
                      </p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground text-sm px-3 py-1">
                      VAT Included
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Payment Schedule */}
              <PaymentSchedule schedule={results.schedule} />

              {/* Fee Schedule */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Additional Fees Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Fee</th>
                          <th className="text-right py-2 px-3 font-semibold text-muted-foreground">Amount (AED)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((fee) => (
                          <tr key={fee.id} className="border-b border-border/50 last:border-0">
                            <td className="py-2.5 px-3">
                              <div className="font-medium">{fee.name}</div>
                              <div className="text-xs text-muted-foreground">{fee.description}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold tabular-nums">
                              {formatAED(isCommercial ? fee.amountCommercial : fee.amountResidential)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Print Button */}
              <Button onClick={handlePrint} size="lg" variant="outline" className="w-full">
                <Printer className="w-4 h-4 mr-2" />
                Print / Save as PDF
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Ready to Calculate
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Fill in the tenant details on the left and click "Calculate Rent" to see the full breakdown and payment schedule.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={`shadow-card ${highlight ? "border-gold bg-gold-subtle" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-lg font-display font-bold text-foreground">AED {value}</p>
      </CardContent>
    </Card>
  );
}
