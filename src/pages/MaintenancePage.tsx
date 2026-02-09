import Header from "@/components/Header";
import MaintenanceForm from "@/components/MaintenanceForm";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <MaintenanceForm />
      </main>
    </div>
  );
}
