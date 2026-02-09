import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly & Yearly Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="shadow-card">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="text-center p-3 rounded-lg bg-secondary/50 space-y-2">
                    <Skeleton className="h-7 w-10 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart placeholder */}
      <Card className="shadow-card">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Settings card */}
      <Card className="shadow-card">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Table placeholder */}
      <Card className="shadow-card">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
