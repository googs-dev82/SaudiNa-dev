"use client";

import { Button } from "@/components/ui/button";

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-destructive/15 bg-card p-10 text-center editorial-shadow">
      <h3 className="text-2xl font-bold text-primary">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <Button className="mt-6" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </div>
  );
}
