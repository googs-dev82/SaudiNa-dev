import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { 
  GovernanceEmptyState, 
  GovernanceMetaGrid, 
  GovernanceMetricCard, 
  GovernanceMetricGrid, 
  GovernancePageHeader, 
  GovernanceSection
} from "@/features/portal/components/governance-ui";
import { 
  getPortalAssignment, 
  getPortalUser,
  getPortalRegion,
  getPortalArea,
  getPortalCommittee,
  PortalApiError,
  PortalAdminAssignment,
  PortalGovernanceUser,
  PortalRegion,
  PortalArea,
  PortalCommittee
} from "@/features/portal/lib/api";
import { formatDateLabel, formatRoleLabel, getAssignmentScopeLabel } from "@/features/portal/lib/governance";
import { canAccessPortalHref } from "@/features/portal/lib/navigation";
import { 
  activatePortalAssignmentAction, 
  deactivatePortalAssignmentAction, 
  deletePortalAssignmentAction 
} from "@/features/portal/lib/mutations";
import { requirePortalUser } from "@/features/portal/lib/session";
import { PortalConfirmAction } from "@/features/portal/components/portal-confirm-action";
import { User, Shield, Calendar, Activity, Link as LinkIcon } from "lucide-react";

export default async function PortalAdminAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const signedInUser = await requirePortalUser();
  const { assignmentId } = await params;

  if (!canAccessPortalHref(signedInUser, "/portal/admin/assignments")) {
    return (
      <GovernanceSection title="Access restricted">
        <GovernanceEmptyState
          title="You do not have permission"
          description="Only super administrators can manage governance assignments."
        />
      </GovernanceSection>
    );
  }

  let assignment: PortalAdminAssignment | null = null;
  let user: PortalGovernanceUser | null = null;
  let scopeLabel: string = "Unknown Scope";
  let errorMessage: string | null = null;

  try {
    assignment = await getPortalAssignment(assignmentId);
    
    // Fetch user
    user = await getPortalUser(assignment.userId);

    // Fetch regions, areas, committees to resolve scope label
    const [regions, areas, committees] = await Promise.all([
      getPortalRegions(),
      getPortalAreas(),
      getPortalCommittees()
    ]);

    scopeLabel = getAssignmentScopeLabel(assignment, "en", { regions, areas, committees });

  } catch (error) {
    if (error instanceof PortalApiError && error.status === 404) {
      notFound();
    }
    errorMessage = error instanceof Error ? error.message : "Failed to load assignment details.";
  }

  // Need to import these helper fetchers but let's just use the ones we have in api.ts
  // Wait, I didn't import all of them in the catch block above, but they are in the Promise.all
  // I need to make sure I have the functions imported or defined.
  
  if (errorMessage || !assignment) {
    return (
      <GovernanceSection title="Error loading assignment">
        <GovernanceEmptyState
          title="Assignment not found"
          description={errorMessage || "The assignment you are looking for does not exist or could not be loaded."}
        />
      </GovernanceSection>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <GovernancePageHeader
        eyebrow="Governance Assignment"
        title={`Assignment: ${user?.displayName || "User"}`}
        description={`Detailed view of the ${formatRoleLabel(assignment.roleCode)} role assigned to ${user?.displayName} for ${scopeLabel}.`}
        breadcrumb={["Admin", "Assignments", assignment.id.substring(0, 8)]}
        actions={
          <div className="flex gap-2">
            {assignment.active ? (
              <PortalConfirmAction
                action={deactivatePortalAssignmentAction}
                description="Deactivating this assignment will immediately revoke the user's permissions for this scope."
                fields={{ assignmentId: assignment.id }}
                title="Deactivate Assignment?"
                triggerLabel="Deactivate"
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            ) : (
              <PortalConfirmAction
                action={activatePortalAssignmentAction}
                description="Activating this assignment will restore the user's permissions for this scope."
                fields={{ assignmentId: assignment.id }}
                title="Activate Assignment?"
                triggerLabel="Activate"
                triggerVariant="outline"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              />
            )}
            <PortalConfirmAction
              action={deletePortalAssignmentAction}
              confirmVariant="destructive"
              description="Deleting an assignment is permanent and removes the historical record."
              fields={{ assignmentId: assignment.id }}
              title="Delete Assignment?"
              triggerLabel="Delete"
              triggerVariant="destructive"
            />
          </div>
        }
      />

      <GovernanceMetricGrid>
        <GovernanceMetricCard
          label="Status"
          value={assignment.active ? "Active" : "Inactive"}
          hint="Current validity status"
          icon={<Activity className="size-4" />}
        />
        <GovernanceMetricCard
          label="Role"
          value={formatRoleLabel(assignment.roleCode)}
          hint="Assigned responsibility"
          icon={<Shield className="size-4" />}
        />
        <GovernanceMetricCard
          label="Period"
          value={assignment.activeFrom ? formatDateLabel(assignment.activeFrom) : "Immediate"}
          hint={`Valid until ${assignment.activeUntil ? formatDateLabel(assignment.activeUntil) : "Indefinite"}`}
          icon={<Calendar className="size-4" />}
        />
        <GovernanceMetricCard
          label="Scope"
          value={assignment.scopeType}
          hint={scopeLabel}
          icon={<LinkIcon className="size-4" />}
        />
      </GovernanceMetricGrid>

      <div className="grid gap-8 lg:grid-cols-2">
        <GovernanceSection title="User details">
          <div className="flex items-center gap-4 mb-6">
             <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <User className="size-6 text-muted-foreground" />
             </div>
             <div>
                <h3 className="font-semibold text-lg">{user?.displayName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
             </div>
             <div className="ml-auto">
                <Button asChild variant="outline" size="sm">
                   <Link href={`/portal/admin/users/${assignment.userId}`}>View profile</Link>
                </Button>
             </div>
          </div>
          <GovernanceMetaGrid
            columns={2}
            items={[
              { label: "User ID", value: assignment.userId },
              {
                label: "Status",
                value: (
                  <Badge className={user?.status === "ACTIVE" ? "bg-emerald-100 text-emerald-900" : ""}>
                    {user?.status ?? "Unknown"}
                  </Badge>
                ),
              },
            ]}
          />
        </GovernanceSection>

        <GovernanceSection title="Scope details">
          <div className="mb-6">
             <h3 className="font-semibold text-lg">{scopeLabel}</h3>
             <p className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] mt-1">{assignment.scopeType} LEVEL</p>
          </div>
          <GovernanceMetaGrid
            columns={2}
            items={[
               { label: "Scope Type", value: assignment.scopeType },
               { label: "Scope ID/Code", value: assignment.scopeId || assignment.scopeCode || "N/A" },
               { label: "Actions", value: (
                  <Button asChild variant="link" className="p-0 h-auto text-primary">
                     <Link href={getScopeUrl(assignment)}>View scope record</Link>
                  </Button>
               )}
            ]}
          />
        </GovernanceSection>
      </div>
    </div>
  );
}

// Helpers for the page (since we can't export multiple things from a page easily)
import { getPortalRegions, getPortalAreas, getPortalCommittees } from "@/features/portal/lib/api";
import { Button } from "@/components/ui/button";

function getScopeUrl(assignment: PortalAdminAssignment) {
   switch (assignment.scopeType) {
      case "REGION":
         return `/portal/admin/locations/regions/${assignment.scopeId || assignment.scopeCode}`;
      case "AREA":
         return `/portal/admin/locations/areas/${assignment.scopeId || assignment.scopeCode}`;
      case "COMMITTEE":
         return `/portal/admin/committees/${assignment.scopeId || assignment.scopeCode}`;
      default:
         return "#";
   }
}
