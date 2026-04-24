"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  return (
    <Button
      size={compact ? "icon-sm" : "default"}
      variant="outline"
      onClick={async () => {
        await fetch("/api/portal/logout", { method: "POST" });
        router.replace("/portal/login");
        router.refresh();
      }}
    >
      {compact ? (
        <>
          <LogOut />
          <span className="sr-only">Sign out</span>
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  );
}
