"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export function ProviderCallback({ provider }: { provider: "GOOGLE" | "ZOHO" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    const fragment = typeof window !== "undefined" ? new URLSearchParams(window.location.hash.replace(/^#/, "")) : new URLSearchParams();
    const query = new URLSearchParams(searchParams.toString());
    const accessToken = fragment.get("access_token") ?? query.get("access_token");
    const email = fragment.get("email") ?? query.get("email");
    const displayName = fragment.get("displayName") ?? query.get("displayName");

    if (typeof window !== "undefined") {
      if (query.has("access_token") || query.has("email") || query.has("displayName")) {
        query.delete("access_token");
        query.delete("email");
        query.delete("displayName");
        const nextQuery = query.toString();
        window.history.replaceState(
          {},
          document.title,
          `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`,
        );
      } else {
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
      }
    }

    void (async () => {
      const response = await fetch("/api/portal/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          accessToken: accessToken ?? undefined,
          email: email ?? undefined,
          displayName: displayName ?? undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setMessage(payload?.message ?? "We could not complete sign-in. Confirm the provider callback is passing a usable token or trusted claims.");
        return;
      }

      router.replace("/portal");
      router.refresh();
    })();
  }, [provider, router, searchParams]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-16 md:px-8">
      <Card className="w-full bg-white">
        <CardContent className="p-8 text-center">
          <h1 className="text-3xl font-bold text-primary">{provider === "GOOGLE" ? "Google sign-in" : "Zoho sign-in"}</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
