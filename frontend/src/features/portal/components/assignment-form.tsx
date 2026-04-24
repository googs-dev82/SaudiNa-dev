"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  PortalAdminAssignment,
  PortalAdminUser,
  PortalArea,
  PortalCommittee,
  PortalRegion,
} from "@/features/portal/lib/api";
import { reportPortalActionError } from "@/features/portal/lib/error";
import {
  createPortalAssignmentAction,
  updatePortalAssignmentAction,
} from "@/features/portal/lib/mutations";

const roleCodes = [
  "SUPER_ADMIN",
  "REGIONAL_MANAGER",
  "AREA_MANAGER",
  "COMMITTEE_MANAGER",
  "COMMITTEE_SECRETARY",
  "MEETING_EDITOR",
  "CONTENT_EDITOR",
] as const;

const scopeTypes = ["GLOBAL", "REGION", "AREA", "COMMITTEE"] as const;

type ScopeType = (typeof scopeTypes)[number];

interface AssignmentFormProps {
  mode: "create" | "update";
  assignment?: PortalAdminAssignment;
  userId?: string;
  users?: PortalAdminUser[];
  regions: PortalRegion[];
  areas: PortalArea[];
  committees: PortalCommittee[];
  onSuccess?: () => void;
  onCancel?: () => void;
  lockedScopeType?: ScopeType;
  lockedScopeId?: string;
  lockedScopeCode?: string;
}

export function AssignmentForm({
  mode,
  assignment,
  userId,
  users = [],
  regions,
  areas,
  committees,
  onSuccess,
  onCancel,
  lockedScopeType,
  lockedScopeId,
  lockedScopeCode,
}: AssignmentFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [scopeType, setScopeType] = useState<ScopeType>(
    lockedScopeType ?? (assignment?.scopeType as ScopeType | undefined) ?? "GLOBAL",
  );

  const [selectedScopeId, setSelectedScopeId] = useState(
    lockedScopeId ?? assignment?.scopeId ?? "",
  );

  const scopeOptions = useMemo(() => {
    switch (scopeType) {
      case "REGION":
        return regions.map((region) => ({
          id: region.id,
          code: region.code,
          label: `${region.nameEn} (${region.code})`,
        }));
      case "AREA":
        return areas.map((area) => {
          const region = regions.find((entry) => entry.id === area.regionId);
          return {
            id: area.id,
            code: area.code,
            label: `${area.nameEn} (${region?.nameEn ?? "Unknown region"})`,
          };
        });
      case "COMMITTEE":
        return committees.map((committee) => ({
          id: committee.id,
          code: committee.code,
          label: `${committee.nameEn} (${committee.code})`,
        }));
      default:
        return [];
    }
  }, [areas, committees, regions, scopeType]);

  const selectedScope = scopeOptions.find((option) => option.id === selectedScopeId);
  const effectiveScopeCode =
    scopeType === "GLOBAL" ? "" : lockedScopeCode ?? selectedScope?.code ?? assignment?.scopeCode ?? "";
  const action = mode === "create" ? createPortalAssignmentAction : updatePortalAssignmentAction;

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await action(formData);
      onSuccess?.();
    } catch (e) {
      reportPortalActionError(
        e,
        mode === "create"
          ? "Unable to create the assignment."
          : "Unable to update the assignment.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form action={handleSubmit} className="grid gap-4 md:grid-cols-2">
      {mode === "update" ? (
        <input name="assignmentId" type="hidden" value={assignment?.id ?? ""} />
      ) : null}

      <input name="scopeId" type="hidden" value={scopeType === "GLOBAL" ? "" : selectedScopeId} />
      <input name="scopeCode" type="hidden" value={effectiveScopeCode} />

      {mode === "create" ? (
        <select
          name="userId"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          defaultValue={userId ?? ""}
          disabled={isPending}
          required
        >
          <option disabled value="">
            Select user
          </option>
          {users.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.displayName} - {entry.email}
            </option>
          ))}
        </select>
      ) : (
        <input name="userId" type="hidden" value={userId ?? ""} />
      )}

      <select
        name="roleCode"
        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        defaultValue={assignment?.roleCode ?? "CONTENT_EDITOR"}
        disabled={isPending}
      >
        {roleCodes.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      {lockedScopeType ? (
        <>
          <input name="scopeType" type="hidden" value={scopeType} />
          <div className="h-10 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
            {scopeType}
          </div>
        </>
      ) : (
        <select
          name="scopeType"
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          value={scopeType}
          disabled={isPending}
          onChange={(event) => {
            const nextScopeType = event.target.value as ScopeType;
            setScopeType(nextScopeType);
            setSelectedScopeId("");
          }}
        >
          {scopeTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      )}

      {scopeType === "GLOBAL" ? (
        <div className="rounded-md border border-dashed border-border/50 px-3 py-2 text-sm text-muted-foreground md:col-span-2">
          Global assignments do not require a scope target.
        </div>
      ) : lockedScopeType && lockedScopeId ? (
        <div className="rounded-md border border-dashed border-border/50 px-3 py-2 text-sm text-muted-foreground md:col-span-2">
          Scope is locked to this {scopeType.toLowerCase()} record.
        </div>
      ) : (
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2"
          value={selectedScopeId}
          disabled={isPending}
          onChange={(event) => setSelectedScopeId(event.target.value)}
          required
        >
          <option disabled value="">
            {scopeType === "REGION"
              ? "Select region"
              : scopeType === "AREA"
                ? "Select area"
                : "Select committee"}
          </option>
          {scopeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      <Input
        defaultValue={assignment?.activeFrom?.slice(0, 10) ?? ""}
        disabled={isPending}
        name="activeFrom"
        type="date"
      />
      <Input
        defaultValue={assignment?.activeUntil?.slice(0, 10) ?? ""}
        disabled={isPending}
        name="activeUntil"
        type="date"
      />
      <label className="flex items-center gap-3 text-sm text-muted-foreground md:col-span-2">
        <input
          defaultChecked={assignment?.active ?? true}
          disabled={isPending}
          name="active"
          type="checkbox"
          className="accent-primary"
        />
        Assignment is active
      </label>
      <div className="flex flex-col-reverse gap-3 md:col-span-2 md:flex-row md:justify-end">
        {onCancel ? (
          <Button disabled={isPending} type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          disabled={isPending}
          type="submit"
          variant={mode === "create" ? "default" : "outline"}
          className="w-full md:w-auto"
        >
          {isPending ? "Processing..." : mode === "create" ? "Create assignment" : "Save assignment"}
        </Button>
      </div>
    </form>
  );
}
