import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const sendMessage = vi.fn().mockResolvedValue(undefined);

vi.mock("@/hooks/use-chatbot", () => ({
  useChatbot: () => ({
    pending: false,
    sendMessage,
    messages: [
      {
        id: "assistant-1",
        sender: "assistant",
        content: "I found 1 meeting that may help.",
        response: {
          locale: "en",
          type: "meeting-results",
          intent: "meeting_search",
          confidence: 0.91,
          message: "I found 1 meeting that may help.",
          meetings: [
            {
              id: "m1",
              nameAr: "اجتماع الأمل",
              nameEn: "Hope Meeting",
              city: "Riyadh",
              district: "Olaya",
              dayOfWeek: "Wednesday",
              startTime: "19:00",
              endTime: "20:00",
              isOnline: false,
              language: "EN",
              gender: "MIXED",
              addressEn: "Olaya Street",
              addressAr: "شارع العليا",
              googleMapsLink: "https://www.google.com/maps?q=24.7,46.6",
            },
          ],
          followUpSuggestions: ["Show online meetings"],
        },
      },
    ],
  }),
}));

import { ChatbotWidget } from "./chatbot-widget";

describe("ChatbotWidget", () => {
  it("renders structured meeting results and suggestion chips", () => {
    render(<ChatbotWidget locale="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Open message assistant" }));

    expect(screen.getByText("Message Assistant")).toBeInTheDocument();
    expect(screen.getByText("Hope Meeting")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show online meetings" })).toBeInTheDocument();
  });

  it("sends a suggestion chip back through the chatbot hook", () => {
    render(<ChatbotWidget locale="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Open message assistant" }));
    fireEvent.click(screen.getByRole("button", { name: "Show online meetings" }));

    expect(sendMessage).toHaveBeenCalledWith("Show online meetings");
  });
});
