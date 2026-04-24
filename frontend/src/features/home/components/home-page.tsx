import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Play, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewsletterForm } from "@/features/shared/components/newsletter-form";
import type { Locale } from "@/config/site";
import type { CmsArticleCard } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";
import { urlForImage } from "@/sanity/lib/image";

export function HomePage({ locale, articles }: { locale: Locale; articles: CmsArticleCard[] }) {
  const content = locale === "ar"
    ? {
        badge: "مجتمع يدعم تعافيك في المملكة",
        heroTitle: "مساحة هادئة\nللبداية من جديد",
        heroText: "نحن مجتمع من المتعافين الذين يساندون بعضهم البعض. رحلة التعافي تبدأ بخطوة واحدة، ونحن هنا لنخطوها معك في بيئة من السرية والقبول.",
        primaryCta: "ابحث عن اجتماع",
        secondaryCta: "من نحن؟",
        firstTitle: "خطواتك الأولى نحو السلام",
        firstDescription: "لا توجد صناديق أو قوالب محددة للتعافي، بل مسارات مفتوحة تناسب رحلتك الشخصية.",
        paths: [
          {
            icon: "mind",
            title: "هل أنا مدمن؟",
            description: "الإجابة تكمن بداخلك. إذا كانت المواد تؤثر على حياتك وعلاقاتك، فقد تكون هذه هي البداية لاكتشاف الحقيقة.",
            link: "ابدأ التقييم الذاتي",
          },
          {
            icon: "group",
            title: "ماذا تتوقع في الاجتماع؟",
            description: "الاجتماعات هي جوهر زمالتنا. ستجد أشخاصاً يشاركونك قصصهم وتجاربهم في جو من الاحترام المتبادل.",
            link: "دليل الاجتماع الأول",
          },
        ],
        storiesLabel: "صدى التجربة",
        storiesTitle: "قصص تتنفس الأمل",
        quote: "لم تكن الرحلة سهلة، ولكنها كانت تستحق كل ثانية. اليوم، أستيقظ بقلب ممتن وعقل صافٍ.",
        meditationLabel: "فقط لليوم",
        meditationTitle: "تأمل السكينة",
        meditationQuote: "نحن لا نحتفظ بما لدينا إلا بتقديمه للآخرين",
        meditationText: "الاستيقاظ الروحي هو الثمرة التي نجنيها من العمل بالخطوات. عندما نشارك تجربتنا وقوتنا وأملنا مع الآخرين، فإننا نعمق جذور تعافينا الخاص.",
        communityLabel: "مجتمعنا",
        communityTitle: "آخر الأخبار والفعاليات",
        subscribeTitle: "ابقَ على اتصال بنور الأمل",
        subscribeText: "انضم لقائمتنا البريدية لتصلك التأملات اليومية وتحديثات الزمالة مباشرة في بريدك.",
      }
    : {
        badge: "A recovery community across the Kingdom",
        heroTitle: "A calm space\nfor starting again",
        heroText: "We are a community of recovering people who support one another. Recovery begins with a single step, and we are here to walk it with you in a culture of confidentiality and acceptance.",
        primaryCta: "Find a meeting",
        secondaryCta: "Who we are",
        firstTitle: "Your first steps toward calm",
        firstDescription: "There are no rigid boxes for recovery, only open pathways that can fit your personal journey.",
        paths: [
          {
            icon: "mind",
            title: "Am I an addict?",
            description: "The answer begins within. If substances are affecting your life and relationships, this may be the start of a deeper truth.",
            link: "Start self-assessment",
          },
          {
            icon: "group",
            title: "What happens in a meeting?",
            description: "Meetings are the heart of the fellowship. You will hear honest experience in an atmosphere of mutual respect.",
            link: "First meeting guide",
          },
        ],
        storiesLabel: "Shared experience",
        storiesTitle: "Stories that breathe hope",
        quote: "The journey was not easy, but it was worth every moment. Today, I wake up with a grateful heart and a clear mind.",
        meditationLabel: "Just for today",
        meditationTitle: "Meditation on serenity",
        meditationQuote: "We only keep what we have by giving it away.",
        meditationText: "A spiritual awakening grows through practicing the steps. When we share our experience, strength, and hope, we deepen our own recovery roots.",
        communityLabel: "Our community",
        communityTitle: "Latest news and gatherings",
        subscribeTitle: "Stay connected to the light of hope",
        subscribeText: "Join our email list to receive daily reflections and fellowship updates directly in your inbox.",
      };

  return (
    <main>
      <section className="relative min-h-[550px] overflow-hidden bg-background">
        <div className="absolute inset-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/45 to-transparent" />
          <Image
            alt="Serene Nature"
            className="h-full w-full object-cover opacity-30 grayscale-[20%]"
            src="https://lh3.googleusercontent.com/aida/ADBb0ujp6O500zrcIC3BecKEugAKqU2PTMDOkpgZYXrb9Sbp6tMy3cQEFG5aZZEw1jzcZhtHtf-HzQXTgonZEeW-t3aMEt8WYlbNMlaOboArsEhWIPZXHUmPU9xabWjyPGewzTAz6yK3FesalajlsbMX0WOyRlsPhk7DaQjxrWbC8c5mf-yigg_YzzU37PrfnnY11vYeubaMro8bxi_OA6luJljXT8fRrE4tExk4cJdsE3W6Fh8NUg_rUOj_8aiS9sjS2im9vpznRrog"
            fill
            sizes="100vw"
          />
        </div>

        <div className="relative z-20 mx-auto flex min-h-[550px] w-full max-w-7xl items-center px-4 py-20 md:px-8">
          <div className="max-w-2xl space-y-8">
            <Badge className="bg-accent/70 text-accent-foreground">{content.badge}</Badge>
            <h1 className="whitespace-pre-line text-5xl font-bold leading-tight text-primary md:text-6xl">{content.heroTitle}</h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">{content.heroText}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button className="hero-gradient h-14 rounded-xl px-8 text-base text-primary-foreground md:px-10" asChild>
                <Link href={`/${locale}/meetings`}>{content.primaryCta}</Link>
              </Button>
              <Button className="h-14 rounded-xl border border-border/40 bg-white px-8 text-base text-primary hover:bg-muted md:px-10" variant="outline" asChild>
                <Link href={`/${locale}/about`}>{content.secondaryCta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-primary">{content.firstTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{content.firstDescription}</p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-20">
          {content.paths.map((item) => (
            <div key={item.title} className="space-y-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.icon === "mind" ? "soft-gradient-blue text-primary" : "soft-gradient-green text-secondary"}`}>
                {item.icon === "mind" ? <Sparkles className="h-8 w-8" /> : <Heart className="h-8 w-8" />}
              </div>
              <h3 className="text-3xl font-bold text-primary">{item.title}</h3>
              <p className="text-lg leading-8 text-muted-foreground">{item.description}</p>
              <Link href={`/${locale}/about`} className="inline-flex items-center gap-2 pt-2 font-bold text-primary">
                {item.link}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="section-divider pt-8" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/20 py-24">
        <div className="mx-auto grid max-w-7xl gap-20 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">{content.storiesLabel}</p>
              <h2 className="text-4xl font-bold text-primary">{content.storiesTitle}</h2>
            </div>

            <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl editorial-shadow">
              <Image
                alt="Nature Texture"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaDaZ8yXIYIATul2AVdqSLk5HCxASM8an_U4l4usH_paGrhu0NXyPpF0voSRZAU0Svz0SsmsqwjszuxKNWMhD4Qwqo_06ruFaCINpoYUrfh9SVh72tvEnlqcTNBybPcQQF2K2AaXvBSmHSfprdSSz0AwUQ8JzUEggWfDFdok29pQuoY-gyhnNYjuACcXnqZQiEP7QIQDC8lMQ9232xQ5DreJtXvyTQBGY-_1l_AxZqVrIGNLu4JD4op_U4VLqQ4Xyy5C2-pDTG0Lg"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[2px]">
                <button className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-primary shadow-2xl transition-transform hover:scale-110" type="button">
                  <Play className="h-8 w-8 fill-current" />
                </button>
              </div>
            </div>

            <blockquote className="text-2xl font-light italic leading-relaxed text-primary/80">{content.quote}</blockquote>
          </div>

          <Card className="relative overflow-hidden border-white/50 bg-white p-2">
            <CardContent className="relative p-10 md:p-12">
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent/40 blur-3xl" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">{content.meditationLabel}</p>
                  <h2 className="mt-2 text-3xl font-bold text-primary">{content.meditationTitle}</h2>
                </div>
                <span className="text-sm text-muted-foreground/70">{locale === "ar" ? "٢٤ مايو ٢٠٢٤" : "24 May 2024"}</span>
              </div>

              <div className="relative z-10 mt-10 space-y-8">
                <p className="border-s-4 border-secondary/30 ps-6 text-2xl font-medium italic text-primary">{content.meditationQuote}</p>
                <p className="text-lg leading-8 text-muted-foreground">{content.meditationText}</p>
                <div className="border-t border-border/40 pt-8 text-sm text-muted-foreground">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Just for today</p>
                  <p className="text-xl font-bold italic text-primary">“We only keep what we have by giving it away.”</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 md:px-8">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">{content.communityLabel}</p>
            <h2 className="mt-2 text-4xl font-bold text-primary">{content.communityTitle}</h2>
          </div>
          <Link href={`/${locale}/literature`} className="text-sm font-bold text-primary">
            {locale === "ar" ? "عرض الكل" : "View all"}
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {articles.map((article) => (
            <article key={article.id} className="group">
              <div className="mb-5 h-72 overflow-hidden rounded-2xl editorial-shadow">
                <div className="relative h-full w-full">
                  <Image
                    alt={getLocalizedValue(article.title, locale) ?? "Article image"}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    src={article.image?.asset?._ref?.startsWith("http") ? article.image.asset._ref : urlForImage(article.image).url()}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </div>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{article.type}</span>
                <span className="text-xs text-muted-foreground">{getLocalizedValue(article.dateLabel, locale)}</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-primary group-hover:text-secondary">{getLocalizedValue(article.title, locale)}</h3>
              <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">{getLocalizedValue(article.description, locale)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-7xl px-4 md:px-8">
        <div className="soft-gradient-blue rounded-3xl border border-white/50 p-10 text-center editorial-shadow md:p-16">
          <h2 className="text-4xl font-bold text-primary">{content.subscribeTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-muted-foreground">{content.subscribeText}</p>
          <div className="relative mt-10">
            <NewsletterForm locale={locale} />
          </div>
        </div>
      </section>
    </main>
  );
}
