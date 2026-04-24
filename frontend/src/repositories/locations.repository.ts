import { env, hasApiBaseUrl } from "@/config/env";
import { fetchJson } from "@/lib/fetch-json";
import type { AreaDto, RegionDto } from "@/types/api";

export const locationsRepository = {
  async listRegions(): Promise<RegionDto[]> {
    if (!hasApiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load regions.");
    }
    return fetchJson<RegionDto[]>(`${env.apiBaseUrl}/api/v1/public/regions`);
  },

  async listAreas(regionId?: string): Promise<AreaDto[]> {
    if (!hasApiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load areas.");
    }
    const query = regionId ? `?regionId=${regionId}` : "";
    return fetchJson<AreaDto[]>(`${env.apiBaseUrl}/api/v1/public/areas${query}`);
  },
};
