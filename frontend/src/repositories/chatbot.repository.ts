import { env, hasApiBaseUrl } from "@/config/env";
import type { ChatbotRequestDto, ChatbotResponseDto } from "@/types/api";

export const chatbotRepository = {
  async send(payload: ChatbotRequestDto): Promise<ChatbotResponseDto> {
    if (!hasApiBaseUrl) {
      return {
        locale: payload.locale,
        type: "fallback",
        intent: "fallback",
        confidence: 0.2,
        message:
          payload.locale === "ar"
            ? "يمكنني مساعدتك في العثور على الاجتماعات أو توجيهك إلى صفحة التواصل."
            : "I can help you find meetings or guide you to the contact page.",
        followUpSuggestions:
          payload.locale === "ar"
            ? ["اعرض اجتماعات اليوم", "كيف أجد اجتماعاً مناسباً؟"]
            : ["Show today meetings", "How do I find a suitable meeting?"],
      };
    }

    const response = await fetch(`${env.apiBaseUrl}/api/v1/public/chatbot/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Unable to reach chatbot service.");
    }

    return (await response.json()) as ChatbotResponseDto;
  },
};
