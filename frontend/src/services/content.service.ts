import { contentRepository } from "@/repositories/content.repository";

export const contentService = {
  getSiteSettings() {
    return contentRepository.getSiteSettings();
  },
  getPage(slug: string) {
    return contentRepository.getPage(slug);
  },
  listArticles() {
    return contentRepository.listArticles();
  },
  listFaqs() {
    return contentRepository.listFaqs();
  },
};
