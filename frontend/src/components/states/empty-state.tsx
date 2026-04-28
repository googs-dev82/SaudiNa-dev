import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, actionLabel, actionHref }: { title: string; description: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-secondary/30 bg-card p-10 text-center editorial-shadow">
      <h3 className="text-2xl font-bold text-primary">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionHref ? (
        <Button className="mt-6" asChild>
          <a href={actionHref}>{actionLabel}</a>
        </Button>
      ) : null}
    </div>
  );
}
