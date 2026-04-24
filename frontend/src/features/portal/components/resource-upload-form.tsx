"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PortalResourceCategory } from "@/features/portal/lib/api";

interface UploadInitResult {
  bucket: string;
  path: string;
  uploadUrl?: string;
  token?: string;
}

interface ResourceUploadFormProps {
  categories: PortalResourceCategory[];
  onCancel?: () => void;
}

export function ResourceUploadForm({ categories, onCancel }: ResourceUploadFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("Choose a file to upload first.");
      return;
    }

    setStatus("Preparing upload...");

    try {
      const initResponse = await fetch("/api/portal/resources/upload-init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          isPublic: formData.get("isPublic") === "on",
        }),
      });

      const initPayload = (await initResponse.json().catch(() => null)) as
        | (UploadInitResult & { message?: string })
        | null;

      if (!initResponse.ok || !initPayload) {
        throw new Error(initPayload?.message ?? "Could not initialize the upload.");
      }

      if (initPayload.uploadUrl && initPayload.token) {
        setStatus("Uploading file...");

        const uploadUrl = initPayload.uploadUrl;

        if (!uploadUrl) {
          throw new Error("Missing upload URL from the server.");
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          const uploadMessage = await uploadResponse.text().catch(() => "");
          throw new Error(uploadMessage || "The file upload failed.");
        }
      }

      setStatus("Creating resource record...");

      startTransition(async () => {
        try {
          const createResponse = await fetch("/api/portal/resources", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              categoryId: formData.get("categoryId")?.toString(),
              titleEn: formData.get("titleEn")?.toString(),
              titleAr: formData.get("titleAr")?.toString(),
              descriptionEn: formData.get("descriptionEn")?.toString() || undefined,
              descriptionAr: formData.get("descriptionAr")?.toString() || undefined,
              filePath: initPayload.path,
              fileName: file.name,
              mimeType: file.type || "application/octet-stream",
              fileSize: file.size,
              isPublic: formData.get("isPublic") === "on",
            }),
          });

          if (!createResponse.ok) {
            const createPayload = (await createResponse.json().catch(() => null)) as
              | { message?: string }
              | null;
            throw new Error(createPayload?.message ?? "The resource record could not be created.");
          }

          form.reset();
          setStatus("Resource uploaded and saved.");
          window.location.reload();
        } catch (submitError) {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "The resource record could not be created.",
          );
          setStatus(null);
        }
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "The upload could not be completed.",
      );
      setStatus(null);
    }
  }

  return (
    <div>
      <div>
        <h3 className="text-2xl font-bold text-primary">Create resource</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Upload the file first, then the portal will create the backend resource record with
          the returned path and file metadata.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 xl:grid-cols-2">
        <select
          name="categoryId"
          className="h-12 rounded-xl border border-border/50 bg-white px-4 text-sm text-foreground shadow-sm xl:col-span-2"
          defaultValue=""
          required
        >
          <option disabled value="">
            Select category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn}
            </option>
          ))}
        </select>
        <Input name="titleEn" placeholder="Title (English)" required />
        <Input name="titleAr" placeholder="Title (Arabic)" required />
        <Textarea
          name="descriptionEn"
          placeholder="Description (English)"
          className="xl:col-span-2"
        />
        <Textarea
          name="descriptionAr"
          placeholder="Description (Arabic)"
          className="xl:col-span-2"
        />
        <Input name="file" type="file" className="xl:col-span-2" required />
        <label className="flex items-center gap-3 text-sm text-muted-foreground xl:col-span-2">
          <input defaultChecked name="isPublic" type="checkbox" />
          Resource is public
        </label>

        {status ? (
          <p className="text-sm text-muted-foreground xl:col-span-2">{status}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive xl:col-span-2">{error}</p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 xl:col-span-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button disabled={isPending} type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Upload and create resource"}
          </Button>
        </div>
      </form>
    </div>
  );
}
