import { env, hasApiBaseUrl } from "@/config/env";
import { fetchJson } from "@/lib/fetch-json";
import type { MeetingDto, MeetingsResponseDto } from "@/types/api";

const toQuery = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
};

export const meetingsRepository = {
  async list(params: Record<string, string | number | undefined> = {}): Promise<MeetingsResponseDto> {
    if (!hasApiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load meetings.");
    }

    const query = toQuery(params);
    return fetchJson<MeetingsResponseDto>(`${env.apiBaseUrl}/api/v1/public/meetings${query ? `?${query}` : ""}`);
  },

  async findById(id: string): Promise<MeetingDto | null> {
    if (!hasApiBaseUrl) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load meetings.");
    }

    const response = await this.list({ limit: 100 });
    return response.items.find((meeting) => meeting.id === id) ?? null;
  },
};
