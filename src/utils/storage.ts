import { TenantRecord, MaintenanceRequest, TenantFeedback } from "@/types/rent";

const STORAGE_KEYS = {
  TENANT_RECORDS: "alyassia_tenant_records",
  MAINTENANCE_REQUESTS: "alyassia_maintenance_requests",
  RENT_INCREASE: "alyassia_rent_increase",
  FEEDBACK: "alyassia_feedback",
};

// Tenant Records
export function saveTenantRecord(record: Omit<TenantRecord, "id" | "visitCount" | "lastVisit">): void {
  const records = getTenantRecords();
  const existing = records.find(
    (r) => r.tenantName === record.tenantName && r.unitNumber === record.unitNumber && r.buildingName === record.buildingName
  );

  if (existing) {
    existing.visitCount += 1;
    existing.lastVisit = new Date().toISOString();
    existing.annualRent = record.annualRent;
  } else {
    records.push({
      ...record,
      id: crypto.randomUUID(),
      visitCount: 1,
      lastVisit: new Date().toISOString(),
    });
  }

  localStorage.setItem(STORAGE_KEYS.TENANT_RECORDS, JSON.stringify(records));
}

export function getTenantRecords(): TenantRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANT_RECORDS) || "[]");
  } catch {
    return [];
  }
}

// Maintenance Requests
export function saveMaintenanceRequest(request: Omit<MaintenanceRequest, "id" | "submittedAt" | "status">): void {
  const requests = getMaintenanceRequests();
  requests.push({
    ...request,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
    status: "pending",
  });
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE_REQUESTS, JSON.stringify(requests));
}

export function getMaintenanceRequests(): MaintenanceRequest[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE_REQUESTS) || "[]");
  } catch {
    return [];
  }
}

export function updateMaintenanceStatus(id: string, status: MaintenanceRequest["status"]): void {
  const requests = getMaintenanceRequests();
  const request = requests.find((r) => r.id === id);
  if (request) {
    request.status = status;
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_REQUESTS, JSON.stringify(requests));
  }
}

// Rent Increase
export function getRentIncrease(): { enabled: boolean; percentage: number } {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RENT_INCREASE) || '{"enabled":false,"percentage":5}');
  } catch {
    return { enabled: false, percentage: 5 };
  }
}

export function setRentIncrease(enabled: boolean, percentage: number = 5): void {
  localStorage.setItem(STORAGE_KEYS.RENT_INCREASE, JSON.stringify({ enabled, percentage }));
}

// Feedback
export function saveFeedback(feedback: Omit<TenantFeedback, "id" | "submittedAt">): void {
  const allFeedback = getFeedback();
  allFeedback.push({
    ...feedback,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(allFeedback));
}

export function getFeedback(): TenantFeedback[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACK) || "[]");
  } catch {
    return [];
  }
}

// Apply rent increase to a base amount
export function applyRentIncrease(baseRent: number): number {
  const setting = getRentIncrease();
  if (setting.enabled) {
    return baseRent * (1 + setting.percentage / 100);
  }
  return baseRent;
}
