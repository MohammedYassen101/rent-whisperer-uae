import { supabase } from "@/integrations/supabase/client";

// Maintenance Requests
export async function saveMaintenanceRequest(request: {
  tenantName: string;
  companyName: string;
  unitNumber: string;
  building: string;
  description: string;
  priority: string;
}): Promise<void> {
  const { error } = await supabase.from("maintenance_requests").insert({
    tenant_name: request.tenantName,
    company_name: request.companyName,
    unit_number: request.unitNumber,
    building: request.building,
    description: request.description,
    priority: request.priority,
  });
  if (error) throw error;
}

export async function getMaintenanceRequests() {
  const { data, error } = await supabase
    .from("maintenance_requests")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) {
    console.error("getMaintenanceRequests error:", error);
    throw error;
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    tenantName: r.tenant_name,
    companyName: r.company_name ?? "",
    unitNumber: r.unit_number,
    building: r.building,
    description: r.description,
    priority: r.priority as "low" | "medium" | "high" | "urgent",
    submittedAt: r.submitted_at,
    status: r.status as "pending" | "in-progress" | "completed",
  }));
}

export async function updateMaintenanceStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("maintenance_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// Feedback
export async function saveFeedback(feedback: {
  tenantName: string;
  companyName: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const { error } = await supabase.from("feedback").insert({
    tenant_name: feedback.tenantName,
    company_name: feedback.companyName,
    rating: feedback.rating,
    comment: feedback.comment,
  });
  if (error) throw error;
}

export async function getFeedback() {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("submitted_at", { ascending: false });
  if (error) {
    console.error("getFeedback error:", error);
    throw error;
  }
  return (data ?? []).map((f) => ({
    id: f.id,
    tenantName: f.tenant_name,
    companyName: f.company_name ?? "",
    rating: f.rating,
    comment: f.comment ?? "",
    submittedAt: f.submitted_at,
  }));
}

// Tenant Records
export async function saveTenantRecord(record: {
  tenantName: string;
  companyName: string;
  buildingName: string;
  unitNumber: string;
  unitType: string;
  annualRent: number;
  calculatedAt: string;
}): Promise<void> {
  // Upsert: find existing record, update visit count
  const { data: existing } = await supabase
    .from("tenant_records")
    .select("id, visit_count")
    .eq("tenant_name", record.tenantName)
    .eq("unit_number", record.unitNumber)
    .eq("building_name", record.buildingName)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("tenant_records")
      .update({
        visit_count: existing.visit_count + 1,
        last_visit: new Date().toISOString(),
        annual_rent: record.annualRent,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("tenant_records").insert({
      tenant_name: record.tenantName,
      company_name: record.companyName,
      building_name: record.buildingName,
      unit_number: record.unitNumber,
      unit_type: record.unitType,
      annual_rent: record.annualRent,
      calculated_at: record.calculatedAt,
    });
  }
}

export async function deleteTenantRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from("tenant_records")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function getTenantRecords() {
  const { data, error } = await supabase
    .from("tenant_records")
    .select("*")
    .order("last_visit", { ascending: false });
  if (error) {
    console.error("getTenantRecords error:", error);
    throw error;
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    tenantName: r.tenant_name,
    companyName: r.company_name ?? "",
    buildingName: r.building_name,
    unitNumber: r.unit_number,
    unitType: r.unit_type,
    annualRent: Number(r.annual_rent),
    calculatedAt: r.calculated_at,
    visitCount: r.visit_count,
    lastVisit: r.last_visit,
  }));
}

// App Settings (rent increase)
export async function getRentIncrease(): Promise<{ enabled: boolean; percentage: number }> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "rent_increase")
    .maybeSingle();
  if (data?.value) {
    const val = data.value as { enabled: boolean; percentage: number };
    return { enabled: val.enabled ?? false, percentage: val.percentage ?? 5 };
  }
  return { enabled: false, percentage: 5 };
}

export async function setRentIncrease(enabled: boolean, percentage: number = 5): Promise<void> {
  const { error } = await supabase
    .from("app_settings")
    .update({ value: { enabled, percentage }, updated_at: new Date().toISOString() })
    .eq("key", "rent_increase");
  if (error) throw error;
}

// Apply rent increase to a base amount (needs async now)
export async function applyRentIncrease(baseRent: number): Promise<number> {
  const setting = await getRentIncrease();
  if (setting.enabled) {
    return baseRent * (1 + setting.percentage / 100);
  }
  return baseRent;
}

// App Settings (broker fee)
export async function getBrokerFee(): Promise<{ enabled: boolean; percentage: number }> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "broker_fee")
    .maybeSingle();
  if (data?.value) {
    const val = data.value as { enabled: boolean; percentage: number };
    return { enabled: val.enabled ?? false, percentage: val.percentage ?? 5 };
  }
  return { enabled: false, percentage: 5 };
}

export async function setBrokerFee(enabled: boolean, percentage: number = 5): Promise<void> {
  const { data: existing } = await supabase
    .from("app_settings")
    .select("id")
    .eq("key", "broker_fee")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("app_settings")
      .update({ value: { enabled, percentage }, updated_at: new Date().toISOString() })
      .eq("key", "broker_fee");
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("app_settings")
      .insert({ key: "broker_fee", value: { enabled, percentage } });
    if (error) throw error;
  }
}
