"use client";

import { toast } from "sonner";

type PortalErrorLike = {
  message?: string;
  name?: string;
  status?: number;
};

export function reportPortalActionError(
  error: unknown,
  fallbackMessage: string,
) {
  const safeError =
    error && typeof error === "object"
      ? (error as PortalErrorLike)
      : undefined;

  console.error(
    `[Portal] ${fallbackMessage}`,
    safeError
      ? {
          name: safeError.name ?? "Error",
          message: safeError.message ?? "Unknown error",
          status: safeError.status,
        }
      : { message: String(error ?? "Unknown error") },
  );

  toast.error(fallbackMessage);
}
