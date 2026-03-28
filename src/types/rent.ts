export interface Building {
  id: string;
  name: string;
  location: string;
}

export type UnitType = 'Office' | 'Showroom' | 'Shop' | '1 BR' | '2 BR' | '3 BR' | 'Villa' | 'Studio';

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  type: UnitType;
  area?: number;
  annualRent: number;
}

export interface Fee {
  id: string;
  name: string;
  nameAr: string;
  amountCommercial: number;
  amountResidential: number;
  description: string;
}

export interface RentCalculation {
  annualRent: number;
  monthlyRent: number;
  paymentAmount: number;
  vatRate: number;
  vatAmount: number;
  firstPayment: number;
  subsequentPayments: number;
  numPayments: number;
  isCommercial: boolean;
  brokerFee: number;
  securityDeposit: number;
}

export interface PaymentScheduleItem {
  paymentNumber: number;
  date: Date;
  amount: number;
  includesVat: boolean;
  vatAmount: number;
  baseAmount: number;
}

export interface TenantRecord {
  id: string;
  tenantName: string;
  companyName: string;
  buildingName: string;
  unitNumber: string;
  unitType: string;
  annualRent: number;
  calculatedAt: string;
  visitCount: number;
  lastVisit: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantName: string;
  companyName: string;
  unitNumber: string;
  building: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface TenantFeedback {
  id: string;
  tenantName: string;
  companyName: string;
  rating: number;
  comment: string;
  submittedAt: string;
}
