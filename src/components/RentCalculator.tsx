import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Printer, Building2, DollarSign, Calendar, FileText, FileDown } from "lucide-react";
import { buildings, getUnitsByBuilding, isCommercialUnit, getBuildingById, getUnitById, units } from "@/data/buildings";
import { fees } from "@/data/fees";
import { calculateRent, generatePaymentSchedule, generateMultiYearSchedule, formatAED } from "@/utils/calculations";
import { saveTenantRecord, getRentIncrease } from "@/utils/storage";
import { printReceipt } from "@/utils/print";
import { exportDocx } from "@/utils/docxExport";
import { RentCalculation, PaymentScheduleItem } from "@/types/rent";
import { addMonths, format } from "date-fns";
import PaymentSchedule from "./PaymentSchedule";
import UnitSearchSelect from "./UnitSearchSelect";
import { toast } from "sonner";
import { rentCalculatorSchema } from "@/utils/validation";
import { useLanguage } from "@/hooks/useLanguage";

export default function RentCalculator() {
  const { t, language } = useLanguage();
  const [tenantName, setTenantName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contractType, setContractType] = useState<string>("");
  const [leaseType, setLeaseType] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [buildingId, setBuildingId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [annualRent, setAnnualRent] = useState<number>(0);
  const [numPayments, setNumPayments] = useState<string>("4");
  const [leaseYears, setLeaseYears] = useState<string>("1");
  const [leaseStartDate, setLeaseStartDate] = useState("");
  const [results, setResults] = useState<{
    calculation: RentCalculation;
    schedule: PaymentScheduleItem[];
    yearlyRents?: number[];
  } | null>(null);

  const isCommercial = contractType === "commercial";

  const locations = useMemo(() => {
    const locs = [...new Set(buildings.map((b) => b.location))];
    return locs.sort();
  }, []);

  const filteredBuildings = useMemo(
    () => {
      const filtered = locationFilter === "all" ? buildings : buildings.filter((b) => b.location === locationFilter);
      return filtered.map((b) => ({
        ...b,
        unitCount: units.filter((u) => u.buildingId === b.id).length,
      }));
    },
    [locationFilter]
  );

  const availableUnits = useMemo(
    () => (buildingId ? getUnitsByBuilding(buildingId) : []),
    [buildingId]
  );

  const selectedUnit = useMemo(() => (unitId ? getUnitById(unitId) : undefined), [unitId]);
  const selectedBuilding = useMemo(() => (buildingId ? getBuildingById(buildingId) : undefined), [buildingId]);

  useEffect(() => {
    if (selectedUnit) {
      setAnnualRent(selectedUnit.annualRent);
    }
  }, [selectedUnit]);

  useEffect(() => {
    setUnitId("");
    setAnnualRent(0);
    setResults(null);
  }, [buildingId]);

  const handleCalculate = async () => {
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
    // Apply 5% increase only on renewals when admin toggle is enabled
    let newRent = result.data.annualRent;
    if (leaseType === "renewal") {
      const rentIncreaseSetting = await getRentIncrease();
      if (rentIncreaseSetting.enabled) {
        newRent = Math.round(result.data.annualRent * (1 + rentIncreaseSetting.percentage / 100) * 100) / 100;
      }
    }

    // Apply broker fee to all new leases
    const hasBrokerFee = leaseType === "new";
    const years = isCommercial ? parseInt(leaseYears) : 1;

    if (years > 1) {
      // Multi-year commercial lease
      const { schedules, yearlyRents } = generateMultiYearSchedule(
        new Date(leaseStartDate), parseInt(numPayments), newRent, years, isCommercial, hasBrokerFee
      );
      const calculation = calculateRent(newRent, parseInt(numPayments), isCommercial, hasBrokerFee);
      setResults({ calculation, schedule: schedules, yearlyRents });
    } else {
      const calculation = calculateRent(newRent, parseInt(numPayments), isCommercial, hasBrokerFee);
      const schedule = generatePaymentSchedule(new Date(leaseStartDate), parseInt(numPayments), calculation);
      setResults({ calculation, schedule });
    }

    // Save for admin tracking (fire and forget)
    saveTenantRecord({
      tenantName: tenantName.trim(),
      companyName: companyName.trim(),
      buildingName: selectedBuilding?.name || "",
      unitNumber: selectedUnit?.unitNumber || "",
      unitType: selectedUnit?.type || "",
      annualRent: newRent,
      calculatedAt: new Date().toISOString(),
    }).catch(() => {});

    toast.success(t("calc.success"));
  };

  const handlePrint = () => {
    if (!results || !selectedBuilding || !selectedUnit) return;

    const leaseStart = new Date(leaseStartDate);
    const years = isCommercial ? parseInt(leaseYears) : 1;
    const leaseEnd = addMonths(leaseStart, 12 * years);

    const adminFeeItem = leaseType === "new"
      ? fees.find(f => f.id === "new-lease")
      : fees.find(f => f.id === "lease-renewal");
    const adminFee = adminFeeItem
      ? (isCommercial ? adminFeeItem.amountCommercial : adminFeeItem.amountResidential)
      : 0;
    const adminFeeLabel = leaseType === "new"
      ? "New Lease Administration Fee"
      : "Renewal Administration Fee";

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
      brokerFee: results.calculation.brokerFee,
      securityDeposit: results.calculation.securityDeposit,
      adminFee,
      adminFeeLabel,
      numPayments: results.calculation.numPayments,
      schedule: results.schedule,
      fees,
      leaseStartDate: format(leaseStart, "dd MMM yyyy"),
      leaseEndDate: format(leaseEnd, "dd MMM yyyy"),
      leaseType: leaseType === "new" ? "New Lease" : "Renewal",
      isCommercial,
      language,
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          {t("calc.title")}
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t("calc.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <Card className="lg:col-span-2 shadow-card animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-primary" />
              {t("calc.tenantDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenantName">{t("calc.tenantName")} *</Label>
              <Input
                id="tenantName"
                placeholder={t("calc.enterName")}
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("calc.contractType")} *</Label>
                <Select value={contractType} onValueChange={(val) => {
                  setContractType(val);
                  if (val !== "commercial") setCompanyName("");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("calc.selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">{t("calc.commercial")}</SelectItem>
                    <SelectItem value="residential">{t("calc.residential")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("calc.leaseType")} *</Label>
                <Select value={leaseType} onValueChange={setLeaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("calc.selectLease")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("calc.newLease")}</SelectItem>
                    <SelectItem value="renewal">{t("calc.renewal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isCommercial && (
              <div className="space-y-2">
                <Label htmlFor="companyName">{t("calc.companyName")}</Label>
                <Input
                  id="companyName"
                  placeholder={t("calc.enterCompany")}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("calc.location")}</Label>
                <Select value={locationFilter} onValueChange={(val) => {
                  setLocationFilter(val);
                  setBuildingId("");
                  setUnitId("");
                  setAnnualRent(0);
                  setResults(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("calc.allLocations")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("calc.allLocations")}</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("calc.building")} *</Label>
                <Select value={buildingId} onValueChange={setBuildingId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("calc.selectBuilding")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBuildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} ({b.unitCount})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("calc.unitNumber")} *</Label>
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
                <Label htmlFor="annualRent">{t("calc.oldAnnualRent")} *</Label>
                <Input
                  id="annualRent"
                  type="number"
                  min={0}
                  value={annualRent || ""}
                  onChange={(e) => setAnnualRent(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("calc.rentHint")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("calc.payments")}</Label>
              <Select value={numPayments} onValueChange={setNumPayments}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("calc.1payment")}</SelectItem>
                  <SelectItem value="2">{t("calc.2payments")}</SelectItem>
                  <SelectItem value="3">{t("calc.3payments")}</SelectItem>
                  <SelectItem value="4">{t("calc.4payments")}</SelectItem>
                  <SelectItem value="6">{t("calc.6payments")}</SelectItem>
                  <SelectItem value="12">{t("calc.12payments")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCommercial && (
              <div className="space-y-2">
                <Label>{t("calc.leaseYears")}</Label>
                <Select value={leaseYears} onValueChange={setLeaseYears}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{t("calc.1year")}</SelectItem>
                    <SelectItem value="2">{t("calc.2years")}</SelectItem>
                    <SelectItem value="3">{t("calc.3years")}</SelectItem>
                    <SelectItem value="4">{t("calc.4years")}</SelectItem>
                    <SelectItem value="5">{t("calc.5years")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">{t("calc.leaseStart")} *</Label>
              <Input
                id="startDate"
                type="date"
                value={leaseStartDate}
                onChange={(e) => setLeaseStartDate(e.target.value)}
              />
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4" size="lg">
              <Calculator className="w-4 h-4 me-2" />
              {t("calc.calculate")}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-6">
          {results ? (
            <div className="animate-fade-in space-y-6">
              {/* Summary Cards */}
              {/* Rent Summary */}
              <div className="grid grid-cols-2 gap-4">
                <SummaryCard
                  label={t("result.annualRent")}
                  value={formatAED(results.calculation.annualRent)}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <SummaryCard
                  label={t("result.monthlyRent")}
                  value={formatAED(results.calculation.monthlyRent)}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Fees (separate from rent) */}
              {(results.calculation.isCommercial || results.calculation.brokerFee > 0 || true) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {results.calculation.isCommercial && (
                    <SummaryCard
                      label={t("result.vat")}
                      value={formatAED(results.calculation.vatAmount)}
                      icon={<DollarSign className="w-4 h-4" />}
                      highlight
                    />
                  )}
                  {results.calculation.brokerFee > 0 && (
                    <SummaryCard
                      label={t("result.brokerFee")}
                      value={formatAED(results.calculation.brokerFee)}
                      icon={<DollarSign className="w-4 h-4" />}
                      highlight
                    />
                  )}
                  {!(isCommercial && leaseType === "renewal") && (
                    <SummaryCard
                      label={t("result.securityDeposit")}
                      value={formatAED(results.calculation.securityDeposit)}
                      icon={<DollarSign className="w-4 h-4" />}
                      highlight
                    />
                  )}
                  <SummaryCard
                    label={leaseType === "new" ? t("result.adminFeeNew") : t("result.adminFeeRenewal")}
                    value={formatAED(
                      isCommercial
                        ? (leaseType === "new" ? fees.find(f => f.id === "new-lease")?.amountCommercial ?? 0 : fees.find(f => f.id === "lease-renewal")?.amountCommercial ?? 0)
                        : (leaseType === "new" ? fees.find(f => f.id === "new-lease")?.amountResidential ?? 0 : fees.find(f => f.id === "lease-renewal")?.amountResidential ?? 0)
                    )}
                    icon={<FileText className="w-4 h-4" />}
                    highlight
                  />
                </div>
              )}

              {/* First Payment Highlight */}
              {results.calculation.isCommercial && (
                <Card className="border-gold bg-gold-subtle shadow-card">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("result.firstPayment")}
                      </p>
                      <p className="text-2xl font-display font-bold text-foreground">
                        AED {formatAED(results.calculation.firstPayment)}
                      </p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground text-sm px-3 py-1">
                      {t("result.vatIncluded")}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Payment Schedule */}
              <PaymentSchedule schedule={results.schedule} yearlyRents={results.yearlyRents} />

              {/* Fee Schedule */}
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("result.additionalFees")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-start py-2 px-3 font-semibold text-muted-foreground">{t("result.fee")}</th>
                          <th className="text-end py-2 px-3 font-semibold text-muted-foreground">{t("result.amountAED")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((fee) => (
                          <tr key={fee.id} className="border-b border-border/50 last:border-0">
                            <td className="py-2.5 px-3">
                              <div className="font-medium">{fee.name}</div>
                              <div className="text-xs text-muted-foreground">{fee.description}</div>
                            </td>
                            <td className="py-2.5 px-3 text-end font-semibold tabular-nums">
                              {formatAED(isCommercial ? fee.amountCommercial : fee.amountResidential)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handlePrint} size="lg" variant="outline" className="flex-1">
                  <Printer className="w-4 h-4 me-2" />
                  {t("calc.print")}
                </Button>
                <Button onClick={() => {
                  if (!results || !selectedBuilding || !selectedUnit) return;
                  const leaseStart = new Date(leaseStartDate);
                  const yrs = isCommercial ? parseInt(leaseYears) : 1;
                  const leaseEnd = addMonths(leaseStart, 12 * yrs);
                  const adminFeeItem = leaseType === "new" ? fees.find(f => f.id === "new-lease") : fees.find(f => f.id === "lease-renewal");
                  const adminFee = adminFeeItem ? (isCommercial ? adminFeeItem.amountCommercial : adminFeeItem.amountResidential) : 0;
                  const adminFeeLabel = leaseType === "new" ? "New Lease Administration Fee" : "Renewal Administration Fee";
                  exportDocx({
                    tenantName, companyName, buildingName: selectedBuilding.name, unitNumber: selectedUnit.unitNumber,
                    unitType: selectedUnit.type, area: selectedUnit.area, annualRent: results.calculation.annualRent,
                    monthlyRent: results.calculation.monthlyRent, vatAmount: results.calculation.vatAmount,
                    brokerFee: results.calculation.brokerFee, securityDeposit: results.calculation.securityDeposit,
                    adminFee, adminFeeLabel, numPayments: results.calculation.numPayments,
                    schedule: results.schedule, fees, leaseStartDate: format(leaseStart, "dd MMM yyyy"),
                    leaseEndDate: format(leaseEnd, "dd MMM yyyy"), leaseType: leaseType === "new" ? "New Lease" : "Renewal", isCommercial,
                    language,
                  });
                }} size="lg" variant="outline" className="flex-1">
                  <FileDown className="w-4 h-4 me-2" />
                  {t("calc.downloadWord")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                {t("calc.readyTitle")}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {t("calc.readyDesc")}
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
