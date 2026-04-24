"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPortalUserAction } from "@/features/portal/lib/mutations";
import type { PortalArea, PortalCommittee, PortalRegion } from "@/features/portal/lib/api";
import { reportPortalActionError } from "@/features/portal/lib/error";
import { roleDefinitions } from "@/features/portal/lib/governance";

interface CreateUserDialogProps {
  regions: PortalRegion[];
  areas: PortalArea[];
  committees: PortalCommittee[];
}

export function CreateUserDialog({ regions, areas, committees }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [scopeType, setScopeType] = useState<string>("GLOBAL");

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      await createPortalUserAction(formData);
      setOpen(false);
    } catch (e) {
      reportPortalActionError(e, "Unable to register the identity.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-9 shadow-sm" />}>
        <UserPlus className="mr-2 size-4" />
        Register User
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Register new internal identity</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="displayName">
                  Full Name
                </label>
                <Input disabled={isPending} id="displayName" name="displayName" placeholder="Ahmad Al-Subaie" required />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="provider">
                  Identity Provider
                </label>
                <select
                  name="provider"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  defaultValue="INTERNAL"
                  disabled={isPending}
                >
                  <option value="INTERNAL">Internal Record</option>
                  <option value="GOOGLE">Google Workspace</option>
                  <option value="ZOHO">Zoho Mail</option>
                </select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                Identity Email
              </label>
              <Input disabled={isPending} id="email" name="email" type="email" placeholder="ahmad@saudina.org" required />
            </div>

            <div className="mt-2 border-t border-border/40 pt-4">
              <h4 className="text-sm font-semibold text-primary">Initial Access (Optional)</h4>
              <p className="text-xs text-muted-foreground mb-4">
                You can assign the first governed role right now or do it later from the details page.
              </p>
              
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="roleCode">Role</label>
                    <select
                      name="roleCode"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      disabled={isPending}
                    >
                      <option value="">No initial role</option>
                      {roleDefinitions.map((r) => (
                        <option key={r.code} value={r.code}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="scopeType">Scope</label>
                    <select
                      name="scopeType"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      disabled={isPending}
                      value={scopeType}
                      onChange={(e) => setScopeType(e.target.value)}
                    >
                      <option value="GLOBAL">Global</option>
                      <option value="REGION">Regional</option>
                      <option value="AREA">Area-specific</option>
                      <option value="COMMITTEE">Committee-specific</option>
                    </select>
                  </div>
                </div>

                {scopeType === "REGION" && (
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="scopeId">Target Region</label>
                    <select
                      name="scopeId"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}

                {scopeType === "AREA" && (
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="scopeId">Target Area</label>
                    <select
                      name="scopeId"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      {areas.map((a) => (
                        <option key={a.id} value={a.id}>{a.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}

                {scopeType === "COMMITTEE" && (
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="scopeId">Target Committee</label>
                    <select
                      name="scopeId"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      required
                    >
                      {committees.map((c) => (
                        <option key={c.id} value={c.id}>{c.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button disabled={isPending} type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Registering..." : "Register identity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
