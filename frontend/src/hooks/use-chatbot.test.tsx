import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("@/services/chatbot.service", () => ({
  chatbotService: {
    send: (...args: unknown[]) => sendMock(...args),
  },
}));

describe("useChatbot", () => {
  afterEach(() => {
    sendMock.mockReset();
  });

  it("ignores blank messages", async () => {
    const { useChatbot } = await import("./use-chatbot");
    const { result } = renderHook(() => useChatbot("en"));

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(result.current.messages).toHaveLength(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("appends user and assistant messages on success", async () => {
    sendMock.mockResolvedValue({
      locale: "en",
      type: "faq",
      intent: "content_qna",
      confidence: 0.9,
      message: "Answer",
    });

    const { useChatbot } = await import("./use-chatbot");
    const { result } = renderHook(() => useChatbot("en"));

    await act(async () => {
      await result.current.sendMessage("Question");
    });

    expect(result.current.pending).toBe(false);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]?.content).toBe("Question");
    expect(result.current.messages[1]?.content).toBe("Answer");
  });

  it("adds a friendly fallback assistant message on failure", async () => {
    sendMock.mockRejectedValue(new Error("down"));

    const { useChatbot } = await import("./use-chatbot");
    const { result } = renderHook(() => useChatbot("en"));

    await act(async () => {
      await result.current.sendMessage("Question");
    });

    expect(result.current.pending).toBe(false);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[1]?.content).toContain("assistant is unavailable");
  });
});
