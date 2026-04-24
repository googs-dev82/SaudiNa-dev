import { resourcesRepository } from "@/repositories/resources.repository";

export const resourcesService = {
  list() {
    return resourcesRepository.list();
  },
  getDownloadUrl(id: string) {
    return resourcesRepository.getDownloadUrl(id);
  },
};
