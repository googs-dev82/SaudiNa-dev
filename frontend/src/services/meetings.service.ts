import { meetingsRepository } from "@/repositories/meetings.repository";

export const meetingsService = {
  list(params?: Record<string, string | number | undefined>) {
    return meetingsRepository.list(params);
  },
  getById(id: string) {
    return meetingsRepository.findById(id);
  },
};
