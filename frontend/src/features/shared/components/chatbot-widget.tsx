"use client";

import { ExternalLink, MapPin, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatbot } from "@/hooks/use-chatbot";
import type { ChatbotMeetingDto, ChatbotResponseDto, Locale } from "@/types/api";

function MeetingCard({ locale, meeting }: { locale: Locale; meeting: ChatbotMeetingDto }) {
  const title = locale === "ar" ? meeting.nameAr : meeting.nameEn;
  const address = locale === "ar" ? meeting.addressAr : meeting.addressEn;

  return (
    <div className="mt-3 rounded-lg border border-secondary/15 bg-background/90 p-3 text-foreground">
      <div className="text-sm font-semibold text-primary">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {[meeting.city, meeting.district, meeting.dayOfWeek, meeting.startTime].filter(Boolean).join(" • ")}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
        {meeting.language ? <span className="rounded-full bg-muted px-2 py-1">{meeting.language}</span> : null}
        {meeting.gender ? <span className="rounded-full bg-muted px-2 py-1">{meeting.gender}</span> : null}
        <span className="rounded-full bg-muted px-2 py-1">
          {meeting.isOnline ? (locale === "ar" ? "اونلاين" : "Online") : locale === "ar" ? "حضوري" : "In person"}
        </span>
      </div>
      {address ? <div className="mt-2 text-xs leading-5 text-muted-foreground">{address}</div> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {meeting.googleMapsLink ? (
          <a className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted" href={meeting.googleMapsLink} rel="noreferrer" target="_blank">
            <MapPin className="h-3.5 w-3.5" />
            {locale === "ar" ? "الخريطة" : "Map"}
          </a>
        ) : null}
        {meeting.meetingLink ? (
          <a className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-foreground transition-colors hover:bg-muted" href={meeting.meetingLink} rel="noreferrer" target="_blank">
            <ExternalLink className="h-3.5 w-3.5" />
            {locale === "ar" ? "رابط الاجتماع" : "Join link"}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function AssistantPayload({
  locale,
  response,
  onSuggestionClick,
}: {
  locale: Locale;
  response?: ChatbotResponseDto;
  onSuggestionClick: (value: string) => Promise<void>;
}) {
  if (!response) return null;

  return (
    <div className="mt-3 space-y-3">
      {response.sources?.length ? (
        <div className="flex flex-wrap gap-2">
          {response.sources.map((source) => (
            <span key={`${source.type}-${source.id ?? source.title ?? "source"}`} className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-medium text-accent-foreground">
              {source.title ?? (locale === "ar" ? "مصدر المحتوى" : "Content source")}
            </span>
          ))}
        </div>
      ) : null}

      {response.meetings?.length ? (
        <div className="space-y-2">
          {response.meetings.map((meeting) => (
            <MeetingCard key={meeting.id} locale={locale} meeting={meeting} />
          ))}
        </div>
      ) : null}

      {response.followUpSuggestions?.length ? (
        <div className="flex flex-wrap gap-2">
          {response.followUpSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="rounded-full border border-secondary/20 px-3 py-1 text-xs text-foreground transition-colors hover:bg-secondary/5"
              onClick={() => void onSuggestionClick(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ChatbotWidget({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, pending, sendMessage } = useChatbot(locale);

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-3">
      {open ? (
        <div className="w-[min(92vw,24rem)] rounded-lg border border-secondary/15 bg-card p-4 editorial-shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary">{locale === "ar" ? "مساعد الرسالة" : "Message Assistant"}</h3>
            <button className="rounded-full p-2 hover:bg-muted" onClick={() => setOpen(false)} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-muted/35 p-3">
            {messages.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {locale === "ar" ? "كيف أستطيع مساعدتك اليوم؟" : "How can I help you today?"}
              </p>
            ) : null}

            {messages.map((message) => (
              <div
                key={message.id}
                className={message.sender === "user" ? "ms-auto max-w-[88%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground" : "max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm text-foreground shadow-sm"}
              >
                <div>{message.content}</div>
                {message.sender === "assistant" ? <AssistantPayload locale={locale} response={message.response} onSuggestionClick={sendMessage} /> : null}
              </div>
            ))}

            {pending ? <div className="max-w-[88%] rounded-2xl bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">...</div> : null}
          </div>

          <form
            className="flex items-center gap-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const value = draft;
              setDraft("");
              await sendMessage(value);
            }}
          >
            <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={locale === "ar" ? "اكتب سؤالك هنا..." : "Type your question here..."} />
            <Button aria-label={locale === "ar" ? "إرسال رسالة" : "Send message"} className="hero-gradient h-12 w-12 rounded-xl p-0" type="submit">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}

      <button aria-label={locale === "ar" ? "افتح مساعد الرسالة" : "Open message assistant"} className="hero-gradient flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-105" onClick={() => setOpen((value) => !value)} type="button">
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
