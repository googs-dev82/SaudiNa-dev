"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactService } from "@/services/contact.service";
import type { Locale } from "@/types/api";

export function ContactForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "pending">("idle");

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setStatus("pending");

        try {
          await contactService.submit({
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            phone: String(formData.get("phone") ?? ""),
            subject: String(formData.get("subject") ?? ""),
            message: String(formData.get("message") ?? ""),
          });
          setStatus("success");
          form.reset();
        } catch {
          setStatus("error");
        }
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="name" placeholder={locale === "ar" ? "الاسم" : "Name"} required />
        <Input name="email" placeholder={locale === "ar" ? "البريد الإلكتروني" : "Email"} type="email" required />
      </div>
      <Input name="phone" placeholder={locale === "ar" ? "رقم الهاتف" : "Phone number"} />
      <Input name="subject" placeholder={locale === "ar" ? "الموضوع" : "Subject"} required />
      <Textarea name="message" placeholder={locale === "ar" ? "اكتب رسالتك هنا" : "Write your message here"} required />
      <Button className="hero-gradient px-8 text-primary-foreground" type="submit">
        {status === "pending" ? (locale === "ar" ? "جاري الإرسال..." : "Sending...") : locale === "ar" ? "إرسال" : "Send"}
      </Button>
      {status === "success" ? <p className="text-sm text-secondary">{locale === "ar" ? "تم إرسال رسالتك بنجاح." : "Your message was sent successfully."}</p> : null}
      {status === "error" ? <p className="text-sm text-destructive">{locale === "ar" ? "تعذر إرسال الرسالة حالياً." : "Unable to send the message right now."}</p> : null}
    </form>
  );
}
