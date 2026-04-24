"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { LatLngLiteral } from "leaflet";
import { Button } from "@/components/ui/button";

const RecoveryLocationPickerMap = dynamic(
  () =>
    import("./recovery-location-picker-map").then(
      (module) => module.RecoveryLocationPickerMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-border/40 bg-muted/10 text-sm text-muted-foreground">
        Loading map picker...
      </div>
    ),
  },
);

export function RecoveryLocationPicker({
  latitude,
  longitude,
}: {
  latitude?: number | null;
  longitude?: number | null;
}) {
  const initialValue = useMemo<LatLngLiteral | null>(() => {
    if (typeof latitude === "number" && typeof longitude === "number") {
      return { lat: latitude, lng: longitude };
    }

    return null;
  }, [latitude, longitude]);

  const [value, setValue] = useState<LatLngLiteral | null>(initialValue);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/30 bg-muted/10 p-4 text-sm text-muted-foreground">
        Click on the map to drop a pin. Coordinates are optional, but using the
        picker improves meeting discovery and map accuracy.
      </div>

      <RecoveryLocationPickerMap value={value} onChange={setValue} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background/80 px-4 py-3 text-sm">
        <div className="text-muted-foreground">
          {value ? (
            <span>
              Selected location:{" "}
              <span className="font-medium text-foreground">
                {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
              </span>
            </span>
          ) : (
            <span>No pin selected yet.</span>
          )}
        </div>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => setValue(null)}>
            Clear pin
          </Button>
        ) : null}
      </div>

      <input name="latitude" type="hidden" value={value?.lat ?? ""} />
      <input name="longitude" type="hidden" value={value?.lng ?? ""} />
    </div>
  );
}
