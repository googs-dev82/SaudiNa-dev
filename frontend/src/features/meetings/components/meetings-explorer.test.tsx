import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/en/meetings",
  useSearchParams: () => new URLSearchParams("view=list"),
}));

vi.mock("@/features/meetings/components/meetings-map", () => ({
  MeetingsMap: () => <div>Map Mock</div>,
}));

import { MeetingsExplorer } from "./meetings-explorer";

describe("MeetingsExplorer", () => {
  it("switches to map view", () => {
    render(
      <MeetingsExplorer
        locale="en"
        areas={[{ id: "a1", regionId: "r1", code: "north", nameAr: "شمال", nameEn: "North" }]}
        meetings={[
          {
            id: "m1",
            nameAr: "اجتماع",
            nameEn: "Meeting",
            city: "Riyadh",
            dayOfWeek: "Sunday",
            startTime: "19:00",
            latitude: 24.7,
            longitude: 46.6,
          },
        ]}
        initialFilters={{ view: "list" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Map" }));
    expect(replace).toHaveBeenCalled();
  });

  it("shows clear filters badge state", () => {
    render(
      <MeetingsExplorer
        locale="en"
        areas={[]}
        meetings={[
          {
            id: "m1",
            nameAr: "اجتماع",
            nameEn: "Meeting",
            city: "Riyadh",
            dayOfWeek: "Sunday",
            startTime: "19:00",
          },
        ]}
        initialFilters={{ city: "Riyadh", view: "list" }}
      />,
    );

    expect(screen.getByDisplayValue("Riyadh")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });
});
