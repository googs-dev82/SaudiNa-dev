import { chatbotRepository } from "@/repositories/chatbot.repository";
import type { ChatbotRequestDto } from "@/types/api";

export const chatbotService = {
  send(payload: ChatbotRequestDto) {
    return chatbotRepository.send(payload);
  },
};
