import type {
  AreaDto,
  MeetingDto,
  RegionDto,
  ResourceDto,
} from "@/types/api";
import type { CmsArticleCard, CmsFaqItem, CmsPage, CmsSiteSettings } from "@/types/cms";

export const fallbackRegions: RegionDto[] = [
  { id: "riyadh", code: "riyadh", nameAr: "الرياض", nameEn: "Riyadh" },
  { id: "jeddah", code: "jeddah", nameAr: "جدة", nameEn: "Jeddah" },
  { id: "eastern", code: "eastern", nameAr: "المنطقة الشرقية", nameEn: "Eastern Region" },
];

export const fallbackAreas: AreaDto[] = [
  { id: "north-riyadh", regionId: "riyadh", code: "north-riyadh", nameAr: "شمال الرياض", nameEn: "North Riyadh" },
  { id: "central-jeddah", regionId: "jeddah", code: "central-jeddah", nameAr: "وسط جدة", nameEn: "Central Jeddah" },
  { id: "khobar", regionId: "eastern", code: "khobar", nameAr: "الخبر", nameEn: "Khobar" },
];

export const fallbackMeetings: MeetingDto[] = [
  {
    id: "meeting-hope-riyadh",
    nameAr: "اجتماع نور الأمل",
    nameEn: "Hope Light Meeting",
    descriptionAr: "اجتماع تعافي مفتوح للرجال والنساء في بيئة داعمة وسرية.",
    descriptionEn: "Open recovery meeting for men and women in a supportive, confidential space.",
    city: "Riyadh",
    district: "Al Olaya",
    dayOfWeek: "Sunday",
    startTime: "19:00",
    endTime: "20:30",
    gender: "MIXED",
    language: "BILINGUAL",
    isOnline: false,
    latitude: 24.7136,
    longitude: 46.6753,
    addressAr: "حي العليا، الرياض",
    addressEn: "Al Olaya, Riyadh",
  },
  {
    id: "meeting-serenity-jeddah",
    nameAr: "لقاء السكينة",
    nameEn: "Serenity Circle",
    descriptionAr: "لقاء مسائي يركز على الخطوات الأولى والمشاركة الهادئة.",
    descriptionEn: "Evening gathering focused on first steps and calm sharing.",
    city: "Jeddah",
    district: "Al Rawdah",
    dayOfWeek: "Tuesday",
    startTime: "20:00",
    endTime: "21:00",
    gender: "MIXED",
    language: "ARABIC",
    isOnline: true,
    meetingLink: "https://example.com/recovery/serenity-circle",
  },
  {
    id: "meeting-renewal-khobar",
    nameAr: "بداية جديدة",
    nameEn: "New Beginning",
    descriptionAr: "مجموعة أسبوعية للدعم المنتظم وتبادل الخبرات العملية.",
    descriptionEn: "Weekly group for steady support and practical shared experience.",
    city: "Khobar",
    district: "Al Aqrabiyah",
    dayOfWeek: "Thursday",
    startTime: "18:30",
    endTime: "20:00",
    gender: "MIXED",
    language: "ENGLISH",
    isOnline: false,
    latitude: 26.2794,
    longitude: 50.2083,
    addressAr: "العقربية، الخبر",
    addressEn: "Al Aqrabiyah, Khobar",
  },
];

export const fallbackResources: ResourceDto[] = [
  {
    id: "resource-first-steps",
    titleAr: "دليل الخطوات الأولى",
    titleEn: "First Steps Guide",
    descriptionAr: "مادة تعريفية موجزة لمن يبدأ رحلته مع التعافي والاجتماعات.",
    descriptionEn: "A concise introductory guide for people beginning their recovery and meeting journey.",
    fileName: "first-steps-guide.pdf",
    filePath: "resources/first-steps-guide.pdf",
    mimeType: "application/pdf",
    fileSize: 1640000,
    isPublic: true,
    downloadCount: 214,
    category: { id: "guidelines", code: "guidelines", nameAr: "الإرشادات", nameEn: "Guidelines" },
  },
  {
    id: "resource-family-support",
    titleAr: "إرشاد للأهل والأصدقاء",
    titleEn: "Guide for Family and Friends",
    descriptionAr: "محتوى يساعد الداعمين على فهم المرض وطريقة المساندة الصحية.",
    descriptionEn: "Content that helps supporters understand addiction and provide healthier support.",
    fileName: "family-and-friends.pdf",
    filePath: "resources/family-and-friends.pdf",
    mimeType: "application/pdf",
    fileSize: 980000,
    isPublic: true,
    downloadCount: 132,
    category: { id: "guidelines", code: "guidelines", nameAr: "الإرشادات", nameEn: "Guidelines" },
  },
];

export const fallbackArticles: CmsArticleCard[] = [
  {
    id: "event-2024",
    slug: "saudi-regional-convention-2024",
    type: "event",
    title: {
      ar: "المؤتمر الإقليمي السعودي ٢٠٢٤",
      en: "Saudi Regional Convention 2024",
    },
    description: {
      ar: "لحظات من التواصل والتعلم والنمو المشترك في الرياض. كن جزءاً من هذا التجمع الروحي.",
      en: "Moments of connection, learning, and shared growth in Riyadh. Be part of this spiritual gathering.",
    },
    dateLabel: {
      ar: "١٢ أكتوبر ٢٠٢٤",
      en: "12 October 2024",
    },
    image: {
      asset: {
        _ref: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9YI4PzumyTxHtplS0bdU560BbHhCUIRBugprSQsy9b-FrdQRcxvH07Tqzwm8mh9EB_22BNkalubQZkZgF-jnoWM3MTz8rM4_Yb-1h45UMgHtN1xHU0Ok2ZP3aMHzPnFFs_HbXMI1UEX_3CWbNW6hSxjHF-I99n5GA6zepJOZG-XCo1TvYtjx-1gcxYTPCiKDeIj5JH-VA3XO1gZOlV9HvWr6ktQW2cK5ZxUmyCgVvWEOC6ibQw2YBCaiPXyaJn7uhPnxBj1E5ed0",
      },
    },
  },
  {
    id: "arabic-literature",
    slug: "new-arabic-literature-releases",
    type: "literature",
    title: {
      ar: "إصدارات جديدة باللغة العربية",
      en: "New Arabic Literature Releases",
    },
    description: {
      ar: "تحديثات هامة على ترجمة النصوص الأساسية لتكون أقرب لروح الرسالة باللغة العربية.",
      en: "Important updates to core text translations for a more natural Arabic reading of the message.",
    },
    dateLabel: {
      ar: "٠٥ سبتمبر ٢٠٢٤",
      en: "05 September 2024",
    },
    image: {
      asset: {
        _ref: "https://lh3.googleusercontent.com/aida-public/AB6AXuC83sBV6QDjJfXczFxMNYmmx1tMDI9NhEuYVzPeMpdrdYDlBYeReUseWKNznsDqTN65vVEjWzA1jFu14mZ7bjqHsNd7J7bUtfx8IlTZlA12blX2h8MHoc6MekZPpqSqk1URoaA3YIBkSavNEmPpG2J0V1i5HDdiY6AvOTcf0aiVwtbnUB5JwEDBf8UCpm-xIe5Ya1eBUu0se5sKb60nRhq9w3l7XWGeQzV5zOG09Hwg4zJ45Z3RVdGpT_MzPKBOzihPvg2M-9NxnUg",
      },
    },
  },
  {
    id: "virtual-meetings",
    slug: "expanded-virtual-meetings-schedule",
    type: "meeting",
    title: {
      ar: "توسعة نطاق الاجتماعات الافتراضية",
      en: "Expanded Virtual Meetings Schedule",
    },
    description: {
      ar: "جداول جديدة مرنة تتيح لك الحضور من أي مكان وفي أي وقت يناسب جدولك اليومي.",
      en: "Flexible new schedules that let you attend from anywhere at a time that fits your day.",
    },
    dateLabel: {
      ar: "٢٨ أغسطس ٢٠٢٤",
      en: "28 August 2024",
    },
    image: {
      asset: {
        _ref: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfWsr3ZhWhXnxVGxe5ILTXB5oofNvN55nM957MjugBzhtzx0qIDpH-k3Qwt_E3IsF9Wb8NhLh4crYlXhWB1Rntv1H8olhSc_zMB6SSS8qK7cTOOoDnyIpNyPQSfc4MI7N5neGguXdg6eh4bDY1P_-LO53zygr4vmKKBgWStczLocQtcmHYSIqIuj3lbTEPQkMFE4CnBMi8F_97rRPKsDmVlYB2b_CQNzd7nbUwFQ9GnQzTzxOYE3D4oY0U_qfU6Ah3CtPKdfQIo34",
      },
    },
  },
];

export const fallbackSiteSettings: CmsSiteSettings = {
  siteTitle: {
    ar: "رسالة سعودينا",
    en: "SaudiNA Message",
  },
  siteDescription: {
    ar: "منصة سعودينا للرسائل التعريفية والاجتماعات والموارد الداعمة للتعافي.",
    en: "SaudiNA public platform for recovery meetings, resources, and guided support.",
  },
  navigation: [
    { href: "/", label: { ar: "الرئيسية", en: "Home" } },
    { href: "/meetings", label: { ar: "الاجتماعات", en: "Meetings" } },
    { href: "/literature", label: { ar: "الأدبيات", en: "Literature" } },
    { href: "/resources", label: { ar: "الموارد", en: "Resources" } },
    { href: "/about", label: { ar: "عن الزمالة", en: "About" } },
  ],
  footerBlurb: {
    ar: "نحن مجتمع عالمي لخدمة المتعافين، نؤمن بأن كل مدمن يمكنه التوقف عن التعاطي وفقدان الرغبة فيه وإيجاد طريق جديد للحياة.",
    en: "We are a global fellowship serving people in recovery, grounded in the belief that every addict can stop using, lose the desire, and find a new way to live.",
  },
  footerColumns: [
    {
      title: { ar: "الوصول السريع", en: "Quick access" },
      links: [
        { href: "/meetings", label: { ar: "ابحث عن اجتماع", en: "Find a meeting" } },
        { href: "/resources", label: { ar: "قائمة الأدبيات", en: "Resource library" } },
        { href: "/contact", label: { ar: "تواصل معنا", en: "Contact us" } },
      ],
    },
    {
      title: { ar: "عن المنصة", en: "About the platform" },
      links: [
        { href: "/about", label: { ar: "من نحن؟", en: "About us" } },
        { href: "/regions", label: { ar: "المناطق", en: "Regions" } },
        { href: "/literature", label: { ar: "الأدبيات", en: "Literature" } },
      ],
    },
    {
      title: { ar: "قانوني", en: "Legal" },
      links: [
        { href: "/about", label: { ar: "الخصوصية والسرية", en: "Privacy and confidentiality" } },
        { href: "/about", label: { ar: "شروط الاستخدام", en: "Terms of use" } },
      ],
    },
  ],
  footerCopyright: {
    ar: "© ٢٠٢٤ زمالة سعودينا. جميع الحقوق محفوظة",
    en: "© 2024 SaudiNA Fellowship. All rights reserved.",
  },
  socialLinks: [
    { platform: "Facebook", href: "https://facebook.com" },
    { platform: "Instagram", href: "https://instagram.com" },
    { platform: "X / Twitter", href: "https://x.com" },
  ],
};

export const fallbackPages: Record<string, CmsPage> = {
  home: {
    id: "home",
    slug: "home",
    title: { ar: "الرئيسية", en: "Home" },
    summary: {
      ar: "صفحة افتتاحية عامة للتعافي والمجتمع والدعم.",
      en: "A public landing page for recovery, community, and support.",
    },
    sections: [
      {
        _key: "hero-home",
        _type: "heroBlock",
        eyebrow: { ar: "مجتمع يدعم تعافيك في المملكة", en: "A recovery community across the Kingdom" },
        title: { ar: "مساحة هادئة للبداية من جديد", en: "A calm space for starting again" },
        body: {
          ar: "نحن مجتمع من المتعافين الذين يساندون بعضهم البعض. رحلة التعافي تبدأ بخطوة واحدة، ونحن هنا لنخطوها معك في بيئة من السرية والقبول.",
          en: "We are a community of recovering people who support one another. Recovery begins with a single step, and we are here to walk it with you in a culture of confidentiality and acceptance.",
        },
        primaryCta: { kind: "internal", href: "/meetings", label: { ar: "ابحث عن اجتماع", en: "Find a meeting" } },
        secondaryCta: { kind: "internal", href: "/about", label: { ar: "من نحن؟", en: "Who we are" } },
        theme: "ocean",
      },
      {
        _key: "rich-home",
        _type: "richTextBlock",
        title: { ar: "خطواتك الأولى نحو السلام", en: "Your first steps toward calm" },
        body: {
          ar: [
            {
              _type: "block",
              children: [{ _type: "span", text: "لا توجد صناديق أو قوالب محددة للتعافي، بل مسارات مفتوحة تناسب رحلتك الشخصية." }],
              markDefs: [],
              style: "normal",
            },
          ],
          en: [
            {
              _type: "block",
              children: [{ _type: "span", text: "There are no rigid boxes for recovery, only open pathways that can fit your personal journey." }],
              markDefs: [],
              style: "normal",
            },
          ],
        },
        tone: "default",
      },
      {
        _key: "cta-home",
        _type: "ctaBlock",
        eyebrow: { ar: "فقط لليوم", en: "Just for today" },
        title: { ar: "ابقَ على اتصال بنور الأمل", en: "Stay connected to the light of hope" },
        body: {
          ar: "انضم لقائمتنا البريدية لتصلك التأملات اليومية وتحديثات الزمالة مباشرة في بريدك.",
          en: "Join our email list to receive daily reflections and fellowship updates directly in your inbox.",
        },
        actions: [
          { kind: "internal", href: "/contact", label: { ar: "تواصل معنا", en: "Contact us" } },
        ],
      },
    ],
  },
  about: {
    id: "about",
    slug: "about",
    title: { ar: "عن زمالة سعودينا", en: "About SaudiNA" },
    summary: {
      ar: "رسالة الأمل والتعافي والدعم المتبادل في بيئة من السرية والقبول.",
      en: "A message of hope, recovery, and mutual support in an atmosphere of confidentiality and acceptance.",
    },
    sections: [
      {
        _key: "hero-about",
        _type: "heroBlock",
        title: { ar: "عن زمالة سعودينا", en: "About SaudiNA" },
        body: {
          ar: "تجمعنا رسالة الأمل والتعافي والدعم المتبادل في بيئة من السرية والقبول. المنصة العامة تتيح الوصول إلى الاجتماعات والمحتوى والموارد بصورة واضحة ومحترمة.",
          en: "We are united by a message of hope, recovery, and mutual support in an atmosphere of confidentiality and acceptance. The public platform makes meetings, content, and resources accessible in a clear and respectful way.",
        },
        theme: "sage",
      },
      {
        _key: "values-about",
        _type: "richTextBlock",
        title: { ar: "قيمنا", en: "Our values" },
        body: {
          ar: [
            { _type: "block", children: [{ _type: "span", text: "القبول: كل بداية تستحق مساحة آمنة ومحترمة." }], markDefs: [], style: "h3" },
            { _type: "block", children: [{ _type: "span", text: "السرية: نحمي الخصوصية لأنها أساس الثقة في مسار التعافي." }], markDefs: [], style: "normal" },
            { _type: "block", children: [{ _type: "span", text: "الاستمرارية: نقدم أبواباً متعددة للوصول إلى الدعم واللقاء والمعرفة." }], markDefs: [], style: "normal" },
          ],
          en: [
            { _type: "block", children: [{ _type: "span", text: "Acceptance: Every beginning deserves a safe and respectful space." }], markDefs: [], style: "h3" },
            { _type: "block", children: [{ _type: "span", text: "Confidentiality: We protect privacy because trust is central to recovery." }], markDefs: [], style: "normal" },
            { _type: "block", children: [{ _type: "span", text: "Continuity: We provide multiple ways to access support, meetings, and knowledge." }], markDefs: [], style: "normal" },
          ],
        },
      },
    ],
  },
};

export const fallbackFaqs: CmsFaqItem[] = [
  {
    id: "faq-1",
    category: "meetings",
    question: {
      ar: "كيف أجد اجتماعاً مناسباً؟",
      en: "How do I find a suitable meeting?",
    },
    answer: {
      ar: [
        {
          _type: "block",
          children: [{ _type: "span", text: "استخدم صفحة الاجتماعات لتصفية النتائج حسب المنطقة أو اليوم أو اللغة أو نوع الحضور." }],
          markDefs: [],
          style: "normal",
        },
      ],
      en: [
        {
          _type: "block",
          children: [{ _type: "span", text: "Use the meetings page to filter by area, day, language, or attendance type." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
  },
];
