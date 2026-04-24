import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicEventDto } from "@/types/api";
import { EventDirectory } from "./event-directory";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/en/events",
  useSearchParams: () => new URLSearchParams(""),
}));

const events: PublicEventDto[] = [
  {
    id: "evt-1",
    title: "Public Hope Forum",
    description: "Open event",
    visibility: "PUBLIC",
    mode: "ONLINE",
    status: "PUBLISHED",
    date: "2026-04-12T00:00:00.000Z",
    startTime: "18:00",
    endTime: "19:00",
    timezone: "Asia/Riyadh",
    zoomEnabled: true,
    regionId: "region-1",
    areaId: "area-1",
    publicationStatus: "PUBLISHED",
  },
  {
    id: "evt-2",
    title: "Private Working Session",
    description: "Internal only",
    visibility: "PRIVATE",
    mode: "PHYSICAL",
    status: "DRAFT",
    date: "2026-04-13T00:00:00.000Z",
    startTime: "20:00",
    endTime: "21:00",
    timezone: "Asia/Riyadh",
    zoomEnabled: false,
    regionId: "region-1",
    areaId: "area-1",
    publicationStatus: "NOT_ELIGIBLE",
  },
];

describe("EventDirectory", () => {
  it("renders events and filters by title", () => {
    render(
      <EventDirectory
        locale="en"
        events={events}
        title="Events"
        description="Browse public events"
      />,
    );

    expect(screen.getByText("Public Hope Forum")).toBeInTheDocument();
    expect(screen.getByText("Private Working Session")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search by title"), {
      target: { value: "Hope" },
    });

    expect(screen.getByText("Public Hope Forum")).toBeInTheDocument();
    expect(screen.queryByText("Private Working Session")).not.toBeInTheDocument();
  });

  it("updates the router when filters are applied", () => {
    render(
      <EventDirectory
        locale="en"
        events={events}
        title="Events"
        description="Browse public events"
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search by title"), {
      target: { value: "Hope" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(replace).toHaveBeenCalledWith("/en/events?query=Hope", {
      scroll: false,
    });
  });
});
