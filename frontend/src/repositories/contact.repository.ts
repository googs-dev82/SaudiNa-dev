import { env, hasApiBaseUrl } from "@/config/env";
import type { ContactSubmissionDto } from "@/types/api";

export const contactRepository = {
  async submit(payload: ContactSubmissionDto): Promise<{ success: true }> {
    if (!hasApiBaseUrl) {
      return { success: true };
    }

    const response = await fetch(`${env.apiBaseUrl}/api/v1/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Unable to submit contact form.");
    }

    return { success: true };
  },
};
