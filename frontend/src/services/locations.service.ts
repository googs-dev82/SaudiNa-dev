import { locationsRepository } from "@/repositories/locations.repository";

export const locationsService = {
  listRegions() {
    return locationsRepository.listRegions();
  },
  listAreas(regionId?: string) {
    return locationsRepository.listAreas(regionId);
  },
};
