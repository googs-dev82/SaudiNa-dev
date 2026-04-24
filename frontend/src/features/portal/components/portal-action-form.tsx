"use client";

import { useActionState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import {
  initialPortalActionState,
  type PortalActionState,
} from "@/features/portal/lib/action-state";

interface PortalActionFormProps extends PropsWithChildren {
  action: (
    previousState: PortalActionState,
    formData: FormData,
  ) => Promise<PortalActionState>;
  className?: string;
  fieldsetClassName?: string;
  successMessage?: string;
  onSuccess?: () => void;
}

export function PortalActionForm({
  action,
  className,
  fieldsetClassName,
  successMessage,
  onSuccess,
  children,
}: PortalActionFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialPortalActionState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [onSuccess, state.success]);

  return (
    <form action={formAction} className={className}>
      <fieldset
        disabled={pending}
        className={fieldsetClassName ?? "grid gap-4"}
      >
        {state.error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}
        {state.success && successMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        {children}
      </fieldset>
    </form>
  );
}
