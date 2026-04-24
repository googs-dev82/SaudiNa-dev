import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/content.service", () => ({
  contentService: {
    getPage: vi.fn().mockResolvedValue({
      id: "home",
      slug: "home",
      title: { ar: "الرئيسية", en: "Home" },
      sections: [
        {
          _key: "hero",
          _type: "heroBlock",
          title: { ar: "مساحة هادئة", en: "A calm space" },
          body: { ar: "نص تجريبي", en: "Sample text" },
        },
      ],
    }),
    listArticles: vi.fn().mockResolvedValue([]),
  },
}));

import LocaleHomePage from "./page";

describe("LocaleHomePage", () => {
  it("renders the Arabic homepage hero", async () => {
    const page = await LocaleHomePage({ params: Promise.resolve({ locale: "ar" }) });
    render(page);
    expect(screen.getByText(/مساحة هادئة/i)).toBeInTheDocument();
  });
});
