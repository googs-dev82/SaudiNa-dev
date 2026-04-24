import { env, hasApiBaseUrl } from "@/config/env";
import { fetchJson } from "@/lib/fetch-json";
import type { ResourceDto } from "@/types/api";

export const resourcesRepository = {
  async list(): Promise<ResourceDto[]> {
    if (!hasApiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load resources.");
    }

    return fetchJson<ResourceDto[]>(`${env.apiBaseUrl}/api/v1/public/resources`);
  },

  async getDownloadUrl(id: string): Promise<{ id: string; url: string }> {
    if (!hasApiBaseUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is required to download resources.",
      );
    }

    return fetchJson<{ id: string; url: string }>(`${env.apiBaseUrl}/api/v1/public/resources/${id}/download`);
  },
};
