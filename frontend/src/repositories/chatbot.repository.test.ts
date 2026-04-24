import { afterEach, describe, expect, it, vi } from "vitest";

describe("chatbotRepository", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("returns deterministic fallback when API base URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    const { chatbotRepository } = await import("./chatbot.repository");

    await expect(chatbotRepository.send({ message: "hello", locale: "en" })).resolves.toMatchObject({
      type: "fallback",
      intent: "fallback",
    });
  });

  it("posts to the backend chatbot endpoint when configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          locale: "en",
          type: "faq",
          intent: "content_qna",
          confidence: 0.9,
          message: "Answer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { chatbotRepository } = await import("./chatbot.repository");

    const result = await chatbotRepository.send({ message: "question", locale: "en" });

    expect(result.message).toBe("Answer");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/public/chatbot/query",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("throws when the chatbot endpoint returns a non-ok response", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:3001");
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("boom", { status: 500 }));

    const { chatbotRepository } = await import("./chatbot.repository");

    await expect(chatbotRepository.send({ message: "question", locale: "en" })).rejects.toThrow(
      "Unable to reach chatbot service.",
    );
  });
});
