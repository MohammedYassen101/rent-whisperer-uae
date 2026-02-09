import Header from "@/components/Header";
import ContactInfo from "@/components/ContactInfo";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <ContactInfo />
      </main>
    </div>
  );
}
