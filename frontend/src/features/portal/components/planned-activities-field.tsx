"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlannedActivity {
  activity: string;
}

interface PlannedActivitiesFieldProps {
  defaultValue?: Array<Record<string, unknown>>;
  name?: string;
}

function normalizeActivities(value: Array<Record<string, unknown>> | undefined) {
  if (!value || value.length === 0) {
    return [{ activity: "" }];
  }

  return value.map((entry) => ({
    activity: typeof entry.activity === "string" ? entry.activity : "",
  }));
}

export function PlannedActivitiesField({
  defaultValue,
  name = "plannedActivities",
}: PlannedActivitiesFieldProps) {
  const [activities, setActivities] = useState<PlannedActivity[]>(
    normalizeActivities(defaultValue),
  );

  const serializedActivities = JSON.stringify(
    activities
      .map((entry) => ({ activity: entry.activity.trim() }))
      .filter((entry) => entry.activity.length > 0),
  );

  return (
    <div className="space-y-4 xl:col-span-2">
      <input name={name} type="hidden" value={serializedActivities} />
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          Planned activities
        </h4>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Add one activity per row. The portal will format them for the backend automatically.
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={`activity-${index}`} className="flex gap-3">
            <Input
              value={activity.activity}
              onChange={(event) => {
                const nextActivities = [...activities];
                nextActivities[index] = { activity: event.target.value };
                setActivities(nextActivities);
              }}
              placeholder={`Activity ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (activities.length === 1) {
                  setActivities([{ activity: "" }]);
                  return;
                }

                setActivities(activities.filter((_, entryIndex) => entryIndex !== index));
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setActivities([...activities, { activity: "" }])}
      >
        Add activity
      </Button>
    </div>
  );
}
