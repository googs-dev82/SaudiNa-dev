import { Suspense } from "react";
import { ProviderCallback } from "@/features/portal/components/provider-callback";

export default function ZohoPortalCallbackPage() {
  return (
    <Suspense fallback={null}>
      <ProviderCallback provider="ZOHO" />
    </Suspense>
  );
}
