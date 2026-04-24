import { Suspense } from "react";
import { ProviderCallback } from "@/features/portal/components/provider-callback";

export default function GooglePortalCallbackPage() {
  return (
    <Suspense fallback={null}>
      <ProviderCallback provider="GOOGLE" />
    </Suspense>
  );
}
