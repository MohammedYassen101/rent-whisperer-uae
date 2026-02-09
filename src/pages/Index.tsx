import Header from "@/components/Header";
import RentCalculator from "@/components/RentCalculator";
import FeedbackForm from "@/components/FeedbackForm";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <RentCalculator />

        {/* Feedback Section */}
        <div className="mt-16 max-w-lg mx-auto">
          <FeedbackForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dark mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-surface-dark-foreground/60">
            © {new Date().getFullYear()} Alyassia Properties L.L.C. O.P.C. — All rights reserved.
          </p>
          <p className="text-xs text-surface-dark-foreground/40 mt-1">
            شركة الياسية للعقارات ش.ش ذ.م.م
          </p>
        </div>
      </footer>
    </div>
  );
}
