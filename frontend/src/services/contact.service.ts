import { contactRepository } from "@/repositories/contact.repository";
import type { ContactSubmissionDto } from "@/types/api";

export const contactService = {
  submit(payload: ContactSubmissionDto) {
    return contactRepository.submit(payload);
  },
};
