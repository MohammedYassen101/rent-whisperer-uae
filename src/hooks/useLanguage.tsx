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
  "calc.tenantName": { en: "Tenant Name", ar: "اسم المستأجر" },
  "calc.companyName": { en: "Company Name", ar: "اسم الشركة" },
  "calc.building": { en: "Building", ar: "المبنى" },
  "calc.unit": { en: "Unit", ar: "الوحدة" },
  "calc.annualRent": { en: "Annual Rent (AED)", ar: "الإيجار السنوي (درهم)" },
  "calc.leaseStart": { en: "Lease Start Date", ar: "تاريخ بدء العقد" },
  "calc.contractType": { en: "Contract Type", ar: "نوع العقد" },
  "calc.payments": { en: "Number of Payments", ar: "عدد الدفعات" },
  "calc.calculate": { en: "Calculate", ar: "احسب" },
  "calc.print": { en: "Print", ar: "طباعة" },
  "calc.downloadWord": { en: "Download Word", ar: "تحميل Word" },
  "calc.residential": { en: "Residential", ar: "سكني" },
  "calc.commercial": { en: "Commercial", ar: "تجاري" },
  "calc.selectBuilding": { en: "Select building", ar: "اختر المبنى" },
  "calc.selectUnit": { en: "Select unit", ar: "اختر الوحدة" },
  "calc.searchUnit": { en: "Search units...", ar: "ابحث عن وحدة..." },
  "calc.noUnits": { en: "No units found", ar: "لا توجد وحدات" },

  // Results
  "result.summary": { en: "Rent Summary", ar: "ملخص الإيجار" },
  "result.annualRent": { en: "Annual Rent", ar: "الإيجار السنوي" },
  "result.monthlyRent": { en: "Monthly Rent", ar: "الإيجار الشهري" },
  "result.perPayment": { en: "Per Payment", ar: "لكل دفعة" },
  "result.vat": { en: "VAT (5%)", ar: "ضريبة القيمة المضافة (5%)" },
  "result.securityDeposit": { en: "Security Deposit (5%)", ar: "تأمين (5%)" },
  "result.brokerFee": { en: "Broker Fee (5%)", ar: "عمولة الوسيط (5%)" },
  "result.adminFee": { en: "Admin Fee", ar: "رسوم إدارية" },
  "result.firstPayment": { en: "First Payment Total", ar: "إجمالي الدفعة الأولى" },
  "result.schedule": { en: "Payment Schedule", ar: "جدول الدفعات" },
  "result.paymentNo": { en: "Payment #", ar: "الدفعة #" },
  "result.date": { en: "Date", ar: "التاريخ" },
  "result.amount": { en: "Amount", ar: "المبلغ" },
  "result.notes": { en: "Notes", ar: "ملاحظات" },
  "result.includesVat": { en: "Includes VAT", ar: "شامل الضريبة" },

  // Maintenance
  "maint.title": { en: "Maintenance Request", ar: "طلب صيانة" },
  "maint.name": { en: "Your Name", ar: "اسمك" },
  "maint.company": { en: "Company", ar: "الشركة" },
  "maint.unit": { en: "Unit Number", ar: "رقم الوحدة" },
  "maint.building": { en: "Building", ar: "المبنى" },
  "maint.description": { en: "Description", ar: "وصف المشكلة" },
  "maint.priority": { en: "Priority", ar: "الأولوية" },
  "maint.submit": { en: "Submit Request", ar: "إرسال الطلب" },
  "maint.low": { en: "Low", ar: "منخفضة" },
  "maint.medium": { en: "Medium", ar: "متوسطة" },
  "maint.high": { en: "High", ar: "عالية" },
  "maint.urgent": { en: "Urgent", ar: "عاجلة" },

  // Feedback
  "feedback.title": { en: "Rate Your Experience", ar: "قيّم تجربتك" },
  "feedback.name": { en: "Your Name", ar: "اسمك" },
  "feedback.company": { en: "Company", ar: "الشركة" },
  "feedback.rating": { en: "Rating", ar: "التقييم" },
  "feedback.comment": { en: "Comments", ar: "تعليقات" },
  "feedback.submit": { en: "Submit Feedback", ar: "إرسال التقييم" },
  "feedback.placeholder": { en: "Share your experience...", ar: "شاركنا تجربتك..." },
  "feedback.success": { en: "Thank you for your feedback!", ar: "شكراً لملاحظاتك!" },

  // Contact
  "contact.title": { en: "Contact Us", ar: "تواصل معنا" },
  "contact.location": { en: "Location", ar: "الموقع" },
  "contact.phone": { en: "Phone", ar: "الهاتف" },
  "contact.email": { en: "Email", ar: "البريد الإلكتروني" },

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
