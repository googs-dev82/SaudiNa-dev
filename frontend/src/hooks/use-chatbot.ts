"use client";

import { useState } from "react";

import { chatbotService } from "@/services/chatbot.service";
import type { ChatbotResponseDto, Locale } from "@/types/api";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  response?: ChatbotResponseDto;
}

export function useChatbot(locale: Locale) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setPending(true);

    try {
      const response: ChatbotResponseDto = await chatbotService.send({ message: trimmed, locale });
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          sender: "assistant",
          content: response.message,
          response,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          sender: "assistant",
          content:
            locale === "ar"
              ? "تعذر الوصول إلى المساعد الآن. يمكنك استخدام صفحة التواصل للحصول على المساندة."
              : "The assistant is unavailable right now. Please use the contact page for support.",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return { messages, pending, sendMessage };
}
