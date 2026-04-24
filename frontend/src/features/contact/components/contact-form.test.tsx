import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/contact.service", () => ({
  contactService: {
    submit: vi.fn().mockResolvedValue({ success: true }),
  },
}));

import { ContactForm } from "./contact-form";

describe("ContactForm", () => {
  it("submits and shows success state", async () => {
    render(<ContactForm locale="en" />);

    fireEvent.change(screen.getByPlaceholderText("Name"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Subject"), { target: { value: "Help" } });
    fireEvent.change(screen.getByPlaceholderText("Write your message here"), { target: { value: "I need help finding a meeting." } });
    fireEvent.submit(screen.getByRole("button", { name: "Send" }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Your message was sent successfully.")).toBeInTheDocument();
    });
  });
});
