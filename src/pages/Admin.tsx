import Header from "@/components/Header";
import AdminAuth from "@/components/AdminAuth";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboard from "@/components/AdminDashboard";
import AdminDashboardSkeleton from "@/components/AdminDashboardSkeleton";

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <AdminDashboardSkeleton />
      </div>
    );
  }

  if (!user) {
    return <AdminAuth />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Your account does not have admin privileges.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminDashboard />
    </div>
  );
}
