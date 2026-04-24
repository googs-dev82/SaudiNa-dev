"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PortalConfirmActionProps {
  title: string;
  description: string;
  triggerLabel: string;
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  confirmVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  children?: React.ReactNode;
  className?: string;
}

export function PortalConfirmAction({
  title,
  description,
  triggerLabel,
  action,
  fields,
  triggerVariant = "outline",
  confirmVariant = "default",
  children,
  className,
}: PortalConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    try {
      await action(formData);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button className={className} onClick={() => { setOpen(true); setError(null); }} type="button" variant={triggerVariant}>
        {triggerLabel}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-4 backdrop-blur-sm">
          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className="w-full max-w-lg rounded-[1.75rem] bg-background p-6 shadow-[0_30px_80px_rgba(20,38,53,0.28)]"
            role="dialog"
          >
            <div className="space-y-2">
              <h2 id={titleId} className="text-xl font-semibold tracking-tight text-primary">
                {title}
              </h2>
              <p id={descriptionId} className="text-sm leading-7 text-muted-foreground">
                {description}
              </p>
            </div>

            <form action={handleSubmit} className="mt-5 space-y-4">
              {Object.entries(fields).map(([name, value]) => (
                <input key={name} name={name} type="hidden" value={value} />
              ))}

              {children}

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end")}>
                <Button onClick={() => setOpen(false)} type="button" variant="ghost" disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" variant={confirmVariant} disabled={isPending}>
                  {isPending ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
