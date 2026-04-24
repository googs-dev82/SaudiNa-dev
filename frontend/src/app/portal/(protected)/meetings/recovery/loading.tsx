import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecoveryMeetingsLoading() {
  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardContent className="space-y-4 p-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-full max-w-3xl" />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <Card className="bg-white">
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
