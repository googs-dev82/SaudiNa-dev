import { Card, CardContent } from "@/components/ui/card";
import {
  hasCmsStudioAccess,
  requirePortalUser,
} from "@/features/portal/lib/session";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePortalUser();

  if (!hasCmsStudioAccess(user)) {
    return (
      <div className="min-h-screen bg-muted/20 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="bg-white">
            <CardContent className="p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">
                CMS Access
              </p>
              <h1 className="mt-3 text-3xl font-bold text-primary">
                Access restricted
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Sanity content management is available only to users with
                <span className="font-semibold text-primary"> CONTENT_EDITOR </span>
                or
                <span className="font-semibold text-primary"> SUPER_ADMIN </span>
                access.
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                This workspace is reserved for editorial content changes and is
                not available to other operational roles.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <div style={{ margin: 0, padding: 0 }}>{children}</div>;
}
