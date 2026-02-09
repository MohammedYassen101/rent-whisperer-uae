import { Fee } from "@/types/rent";

export const fees: Fee[] = [
  {
    id: "lease-renewal",
    name: "Lease Renewal Administration Fee",
    nameAr: "رسوم إدارة تجديد العقد",
    amount: 500,
    description: "Fee charged for processing lease renewal paperwork",
  },
  {
    id: "new-lease",
    name: "New Lease Administration Fee",
    nameAr: "رسوم إدارة عقد جديد",
    amount: 1000,
    description: "Fee charged for processing a new lease agreement",
  },
  {
    id: "dishonored-cheque",
    name: "Dishonored Cheque Fee + Legal Expenses",
    nameAr: "رسوم شيك مرتجع + مصاريف قانونية",
    amount: 1000,
    description: "Fee charged for bounced cheques including legal costs",
  },
  {
    id: "cheque-deferral",
    name: "Cheque Deferral (up to 30 days)",
    nameAr: "تأجيل شيك (حتى 30 يوم)",
    amount: 500,
    description: "Fee for deferring a cheque payment up to 30 days",
  },
  {
    id: "cheque-replacement",
    name: "Cheque Replacement",
    nameAr: "استبدال شيك",
    amount: 250,
    description: "Fee for issuing a replacement cheque",
  },
  {
    id: "parking-card",
    name: "Parking Access Card Fee",
    nameAr: "رسوم بطاقة دخول المواقف",
    amount: 300,
    description: "Fee for parking access card issuance",
  },
];
