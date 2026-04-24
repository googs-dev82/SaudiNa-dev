import { ContactForm } from "@/features/contact/components/contact-form";
import type { Locale } from "@/config/site";

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-8">
      <div>
        <h1 className="text-4xl font-bold text-primary">{locale === "ar" ? "تواصل معنا" : "Contact us"}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{locale === "ar" ? "إذا كنت بحاجة إلى توجيه إضافي أو كنت تبحث عن اجتماع مناسب، أرسل لنا رسالتك وسنرد عليك بأسرع وقت ممكن." : "If you need more direction or are looking for the right meeting, send us a message and we will respond as quickly as possible."}</p>
        <div className="mt-8 rounded-3xl bg-muted/40 p-6 text-sm leading-7 text-muted-foreground">
          <p>{locale === "ar" ? "البريد العام: support@example.com" : "General email: support@example.com"}</p>
          <p>{locale === "ar" ? "المملكة العربية السعودية" : "Kingdom of Saudi Arabia"}</p>
        </div>
      </div>
      <div className="rounded-3xl border border-border/30 bg-white p-8 editorial-shadow">
        <ContactForm locale={locale} />
      </div>
    </section>
  );
}
