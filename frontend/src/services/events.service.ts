import { eventsRepository } from "@/repositories/events.repository";
import type { EventMode } from "@/types/api";

export const eventsService = {
  list(params?: {
    query?: string;
    regionId?: string;
    areaId?: string;
    mode?: EventMode;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    return eventsRepository.list(params);
  },
  getById(id: string) {
    return eventsRepository.findById(id);
  },
};
