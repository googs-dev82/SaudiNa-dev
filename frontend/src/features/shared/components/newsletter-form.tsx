"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contactService } from "@/services/contact.service";
import type { Locale } from "@/types/api";

export function NewsletterForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <form
      className="mx-auto flex max-w-lg flex-col gap-4 md:flex-row"
      onSubmit={async (event) => {
        event.preventDefault();
        await contactService.submit({
          name: locale === "ar" ? "اشتراك النشرة البريدية" : "Newsletter signup",
          email,
          subject: locale === "ar" ? "اشتراك بالبريد" : "Newsletter subscription",
          message: locale === "ar" ? "أرغب في استلام المستجدات عبر البريد الإلكتروني." : "I would like to receive updates by email.",
        });
        setSuccess(true);
        setEmail("");
      }}
    >
      <Input placeholder={locale === "ar" ? "بريدك الإلكتروني" : "Your email address"} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Button className="hero-gradient h-12 rounded-xl px-8 text-primary-foreground">{locale === "ar" ? "اشترك الآن" : "Subscribe now"}</Button>
      {success ? <p className="text-xs text-secondary md:absolute">{locale === "ar" ? "تم استلام طلب الاشتراك." : "Subscription request received."}</p> : null}
    </form>
  );
}
