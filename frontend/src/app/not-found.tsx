import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 text-center md:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary">404</p>
      <h1 className="mt-4 text-4xl font-bold text-primary">Page not found</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">The page you requested could not be found. Return to the homepage to continue browsing SaudiNA.</p>
      <Link href="/ar" className="mt-8 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground">
        Go home
      </Link>
    </section>
  );
}
