"use client";

import { ErrorState } from "@/components/states/error-state";

export default function LocaleError() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <ErrorState title="Unable to load page" description="Please refresh the page or try again shortly." />
    </section>
  );
}
