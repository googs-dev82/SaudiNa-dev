import { env, hasApiBaseUrl } from "@/config/env";
import { fetchJson } from "@/lib/fetch-json";
import type { EventMode, PublicEventDto } from "@/types/api";

const toQuery = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
};

export const eventsRepository = {
  async list(
    params: {
      query?: string;
      regionId?: string;
      areaId?: string;
      mode?: EventMode;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<PublicEventDto[]> {
    if (!hasApiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load events.");
    }

    const query = toQuery(params);
    return fetchJson<PublicEventDto[]>(
      `${env.apiBaseUrl}/api/v1/public/events${query ? `?${query}` : ""}`,
    );
  },

  async findById(id: string): Promise<PublicEventDto | null> {
    if (!hasApiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load events.");
    }

    try {
      return await fetchJson<PublicEventDto>(`${env.apiBaseUrl}/api/v1/public/events/${id}`);
    } catch {
      return null;
    }
  },
};
