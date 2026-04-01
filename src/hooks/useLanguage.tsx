import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<string, Record<Language, string>> = {
  // Nav
  "nav.calculator": { en: "Calculator", ar: "حاسبة الإيجار" },
  "nav.maintenance": { en: "Maintenance", ar: "طلب صيانة" },
  "nav.contact": { en: "Contact", ar: "تواصل معنا" },
  "nav.admin": { en: "Admin", ar: "لوحة التحكم" },

  // Calculator page
  "calc.title": { en: "Rent Calculator", ar: "حاسبة الإيجار" },
  "calc.subtitle": { en: "Calculate your commercial or residential rent, view payment schedules, and download a detailed statement.", ar: "احسب إيجارك التجاري أو السكني، واطلع على جدول الدفعات، وحمّل كشف حساب مفصّل." },
  "calc.tenantName": { en: "Tenant Name", ar: "اسم المستأجر" },
  "calc.enterName": { en: "Enter full name", ar: "أدخل الاسم الكامل" },
  "calc.companyName": { en: "Company Name", ar: "اسم الشركة" },
  "calc.enterCompany": { en: "Enter company name", ar: "أدخل اسم الشركة" },
  "calc.building": { en: "Building", ar: "المبنى" },
  "calc.unit": { en: "Unit", ar: "الوحدة" },
  "calc.unitNumber": { en: "Unit Number", ar: "رقم الوحدة" },
  "calc.annualRent": { en: "Annual Rent (AED)", ar: "الإيجار السنوي (درهم)" },
  "calc.oldAnnualRent": { en: "Old Annual Rent (AED)", ar: "الإيجار السنوي القديم (درهم)" },
  "calc.rentHint": { en: "Enter the current rent — a 5% increase will be applied automatically.", ar: "أدخل الإيجار الحالي — سيتم تطبيق زيادة 5% تلقائياً." },
  "calc.leaseStart": { en: "Lease Start Date", ar: "تاريخ بدء العقد" },
  "calc.contractType": { en: "Contract Type", ar: "نوع العقد" },
  "calc.leaseType": { en: "Lease Type", ar: "نوع الإيجار" },
  "calc.selectType": { en: "Select type", ar: "اختر النوع" },
  "calc.selectLease": { en: "Select lease", ar: "اختر نوع الإيجار" },
  "calc.newLease": { en: "New Lease", ar: "عقد جديد" },
  "calc.renewal": { en: "Renewal", ar: "تجديد" },
  "calc.payments": { en: "Number of Payments", ar: "عدد الدفعات" },
  "calc.calculate": { en: "Calculate Rent", ar: "احسب الإيجار" },
  "calc.print": { en: "Print / PDF", ar: "طباعة / PDF" },
  "calc.downloadWord": { en: "Download Word", ar: "تحميل Word" },
  "calc.residential": { en: "Residential", ar: "سكني" },
  "calc.commercial": { en: "Commercial", ar: "تجاري" },
  "calc.selectBuilding": { en: "Select building", ar: "اختر المبنى" },
  "calc.selectUnit": { en: "Select unit", ar: "اختر الوحدة" },
  "calc.searchUnit": { en: "Search units...", ar: "ابحث عن وحدة..." },
  "calc.noUnits": { en: "No units found", ar: "لا توجد وحدات" },
  "calc.tenantDetails": { en: "Tenant Details", ar: "بيانات المستأجر" },
  "calc.readyTitle": { en: "Ready to Calculate", ar: "جاهز للحساب" },
  "calc.readyDesc": { en: "Fill in the tenant details on the left and click \"Calculate Rent\" to see the full breakdown and payment schedule.", ar: "املأ بيانات المستأجر وانقر \"احسب الإيجار\" لعرض التفاصيل وجدول الدفعات." },
  "calc.success": { en: "Rent calculated successfully!", ar: "تم حساب الإيجار بنجاح!" },
  "calc.1payment": { en: "1 Payment (Annual)", ar: "دفعة واحدة (سنوي)" },
  "calc.2payments": { en: "2 Payments (Semi-Annual)", ar: "دفعتان (نصف سنوي)" },
  "calc.3payments": { en: "3 Payments", ar: "3 دفعات" },
  "calc.4payments": { en: "4 Payments (Quarterly)", ar: "4 دفعات (ربع سنوي)" },
  "calc.6payments": { en: "6 Payments (Bi-Monthly)", ar: "6 دفعات (كل شهرين)" },
  "calc.12payments": { en: "12 Payments (Monthly)", ar: "12 دفعة (شهري)" },

  // Results
  "result.summary": { en: "Rent Summary", ar: "ملخص الإيجار" },
  "result.annualRent": { en: "Annual Rent", ar: "الإيجار السنوي" },
  "result.monthlyRent": { en: "Monthly Rent", ar: "الإيجار الشهري" },
  "result.perPayment": { en: "Per Payment", ar: "لكل دفعة" },
  "result.vat": { en: "VAT (5%)", ar: "ضريبة القيمة المضافة (5%)" },
  "result.securityDeposit": { en: "Security Deposit (5%)", ar: "تأمين (5%)" },
  "result.brokerFee": { en: "Broker Fee (5%)", ar: "عمولة الوسيط (5%)" },
  "result.adminFeeNew": { en: "Admin Fee (New)", ar: "رسوم إدارية (جديد)" },
  "result.adminFeeRenewal": { en: "Admin Fee (Renewal)", ar: "رسوم إدارية (تجديد)" },
  "result.firstPayment": { en: "First Payment (includes 5% VAT)", ar: "الدفعة الأولى (شامل 5% ضريبة)" },
  "result.vatIncluded": { en: "VAT Included", ar: "شامل الضريبة" },
  "result.additionalFees": { en: "Additional Fees Schedule", ar: "جدول الرسوم الإضافية" },
  "result.fee": { en: "Fee", ar: "الرسم" },
  "result.amountAED": { en: "Amount (AED)", ar: "المبلغ (درهم)" },
  "result.schedule": { en: "Payment Schedule", ar: "جدول الدفعات" },
  "result.paymentNo": { en: "Payment", ar: "الدفعة" },
  "result.dueDate": { en: "Due Date", ar: "تاريخ الاستحقاق" },
  "result.baseAmount": { en: "Base Amount", ar: "المبلغ الأساسي" },
  "result.total": { en: "Total", ar: "الإجمالي" },
  "result.date": { en: "Date", ar: "التاريخ" },
  "result.amount": { en: "Amount", ar: "المبلغ" },
  "result.notes": { en: "Notes", ar: "ملاحظات" },
  "result.includesVat": { en: "Includes VAT", ar: "شامل الضريبة" },

  // Maintenance
  "maint.title": { en: "Maintenance Request", ar: "طلب صيانة" },
  "maint.subtitle": { en: "Submit a maintenance complaint and our team will address it promptly.", ar: "قدّم شكوى صيانة وسيتعامل فريقنا معها على الفور." },
  "maint.submitTitle": { en: "Submit a Request", ar: "تقديم طلب" },
  "maint.name": { en: "Tenant Name", ar: "اسم المستأجر" },
  "maint.yourName": { en: "Your name", ar: "اسمك" },
  "maint.company": { en: "Company", ar: "الشركة" },
  "maint.companyName": { en: "Company name", ar: "اسم الشركة" },
  "maint.unit": { en: "Unit Number", ar: "رقم الوحدة" },
  "maint.unitPlaceholder": { en: "e.g. M101", ar: "مثال: M101" },
  "maint.building": { en: "Building", ar: "المبنى" },
  "maint.selectBuilding": { en: "Select building", ar: "اختر المبنى" },
  "maint.description": { en: "Description", ar: "وصف المشكلة" },
  "maint.descPlaceholder": { en: "Describe the issue in detail...", ar: "صف المشكلة بالتفصيل..." },
  "maint.priority": { en: "Priority", ar: "الأولوية" },
  "maint.submit": { en: "Submit Request", ar: "إرسال الطلب" },
  "maint.low": { en: "Low — General maintenance", ar: "منخفضة — صيانة عامة" },
  "maint.medium": { en: "Medium — Needs attention soon", ar: "متوسطة — تحتاج اهتمام قريب" },
  "maint.high": { en: "High — Affects daily operations", ar: "عالية — تؤثر على العمليات اليومية" },
  "maint.urgent": { en: "Urgent — Emergency / Safety issue", ar: "عاجلة — طوارئ / مسألة سلامة" },
  "maint.success": { en: "Maintenance request submitted successfully!", ar: "تم إرسال طلب الصيانة بنجاح!" },
  "maint.submitted": { en: "Request Submitted!", ar: "تم إرسال الطلب!" },
  "maint.submittedDesc": { en: "Your maintenance request has been submitted. Our team will review it and get back to you shortly.", ar: "تم تقديم طلب الصيانة. سيقوم فريقنا بمراجعته والرد عليك قريباً." },
  "maint.urgentContact": { en: "For urgent issues, please contact:", ar: "للمشاكل العاجلة، يرجى التواصل:" },
  "maint.another": { en: "Submit Another Request", ar: "تقديم طلب آخر" },

  // Feedback
  "feedback.title": { en: "Rate Your Experience", ar: "قيّم تجربتك" },
  "feedback.name": { en: "Your Name", ar: "اسمك" },
  "feedback.namePlaceholder": { en: "Tenant name", ar: "اسم المستأجر" },
  "feedback.company": { en: "Company", ar: "الشركة" },
  "feedback.companyPlaceholder": { en: "Company name", ar: "اسم الشركة" },
  "feedback.rating": { en: "Rating", ar: "التقييم" },
  "feedback.comment": { en: "Comments", ar: "تعليقات" },
  "feedback.submit": { en: "Submit Feedback", ar: "إرسال التقييم" },
  "feedback.placeholder": { en: "Share your experience...", ar: "شاركنا تجربتك..." },
  "feedback.success": { en: "Thank you for your feedback!", ar: "شكراً لملاحظاتك!" },

  // Contact
  "contact.title": { en: "Contact Us", ar: "تواصل معنا" },
  "contact.subtitle": { en: "Get in touch with our leasing team for any inquiries.", ar: "تواصل مع فريق التأجير لأي استفسارات." },
  "contact.leasingExec": { en: "Leasing Executive", ar: "المسؤول التنفيذي للتأجير" },
  "contact.leasingExecRole": { en: "Leasing Executive — Alyassia Properties L.L.C.", ar: "المسؤول التنفيذي للتأجير — شركة الياسية للعقارات" },
  "contact.email": { en: "Email", ar: "البريد الإلكتروني" },
  "contact.customerService": { en: "Customer Service", ar: "خدمة العملاء" },
  "contact.mobile": { en: "Mobile", ar: "الجوال" },
  "contact.maintEmail": { en: "Maintenance Email", ar: "بريد الصيانة" },
  "contact.office": { en: "Office Address", ar: "عنوان المكتب" },
  "contact.callUs": { en: "Call Us", ar: "اتصل بنا" },
  "contact.emailUs": { en: "Email Us", ar: "راسلنا" },
  "contact.location": { en: "Location", ar: "الموقع" },
  "contact.phone": { en: "Phone", ar: "الهاتف" },

  // Admin
  "admin.login": { en: "Admin Login", ar: "تسجيل دخول المسؤول" },
  "admin.email": { en: "Email", ar: "البريد الإلكتروني" },
  "admin.password": { en: "Password", ar: "كلمة المرور" },
  "admin.signIn": { en: "Sign In", ar: "تسجيل الدخول" },
  "admin.signUp": { en: "Sign Up", ar: "إنشاء حساب" },
  "admin.accessDenied": { en: "Access Denied", ar: "الوصول مرفوض" },
  "admin.noPrivileges": { en: "Your account does not have admin privileges.", ar: "حسابك لا يملك صلاحيات المسؤول." },

  // Common
  "common.required": { en: "Required", ar: "مطلوب" },
  "common.optional": { en: "Optional", ar: "اختياري" },
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.allRights": { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    return (saved === "ar" ? "ar" : "en") as Language;
  });

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "en" ? "ar" : "en";
      localStorage.setItem("app_language", next);
      document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string) => translations[key]?.[language] ?? key,
    [language]
  );

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
