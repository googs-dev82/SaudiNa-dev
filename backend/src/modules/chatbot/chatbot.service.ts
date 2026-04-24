import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service.js';
import { MeetingsService } from '../meetings/meetings.service.js';
import { CmsFaqService } from '../integrations/cms-faq.service.js';
import {
  ChatbotFiltersDto,
  ChatbotQueryDto,
  ChatbotResponseDto,
  SanitizedChatbotMeetingDto,
} from './chatbot.dto.js';

const ENGLISH_MEETING_TERMS = [
  'meeting',
  'meetings',
  'near me',
  'nearest',
  'online',
  'riyadh',
  'jeddah',
  'dammam',
  'khobar',
  'today',
  'tomorrow',
];
const GENERIC_MEETING_TERMS = ['meeting', 'meetings', 'اجتماع', 'اجتماعات'];
const QUESTION_INTRO_TERMS = [
  'how',
  'what',
  'why',
  'can i',
  'should i',
  'كيف',
  'ما',
  'ماذا',
  'هل',
];
const ARABIC_MEETING_TERMS = [
  'اجتماع',
  'اجتماعات',
  'قريب',
  'الأقرب',
  'اونلاين',
  'عن بعد',
  'اليوم',
  'غدا',
  'الرياض',
  'جدة',
  'الدمام',
  'الخبر',
];
const CITY_ALIASES: Array<{ value: string; aliases: string[] }> = [
  { value: 'Riyadh', aliases: ['riyadh', 'الرياض'] },
  { value: 'Jeddah', aliases: ['jeddah', 'جدة'] },
  { value: 'Dammam', aliases: ['dammam', 'الدمام'] },
  { value: 'Khobar', aliases: ['khobar', 'الخبر'] },
  { value: 'Mecca', aliases: ['mecca', 'makkah', 'مكة'] },
  { value: 'Medina', aliases: ['medina', 'madinah', 'المدينة'] },
];
const DAY_ALIASES: Record<string, string[]> = {
  sunday: ['sunday', 'الأحد'],
  monday: ['monday', 'الاثنين', 'الإثنين'],
  tuesday: ['tuesday', 'الثلاثاء'],
  wednesday: ['wednesday', 'الأربعاء'],
  thursday: ['thursday', 'الخميس'],
  friday: ['friday', 'الجمعة'],
  saturday: ['saturday', 'السبت'],
};
const LANGUAGE_ALIASES: Record<string, string[]> = {
  AR: ['arabic', 'عربي', 'العربية'],
  EN: ['english', 'انجليزي', 'english-speaking'],
  BILINGUAL: ['bilingual', 'ثنائي', 'لغتين'],
};
const GENDER_ALIASES: Record<string, string[]> = {
  MIXED: ['mixed', 'anyone', 'للجميع', 'مختلط'],
  MEN: ['men', 'male', 'رجال', 'للرجال'],
  WOMEN: ['women', 'female', 'نساء', 'للسيدات', 'للمرأة'],
};

interface RoutedIntent {
  intent: 'content_qna' | 'meeting_search';
  confidence: number;
  filters: ChatbotFiltersDto;
}

@Injectable()
export class ChatbotService {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly cmsFaqService: CmsFaqService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async query(
    input: ChatbotQueryDto,
    ipAddress?: string,
    correlationId?: string,
  ): Promise<ChatbotResponseDto> {
    const routed = this.routeIntent(input);
    const response =
      routed.intent === 'meeting_search'
        ? await this.handleMeetingSearch(input, routed)
        : await this.handleContentAnswer(input, routed.confidence);

    await this.auditService.log({
      action: 'CHATBOT_QUERY',
      resourceType: 'Chatbot',
      ipAddress,
      correlationId,
      metadata: {
        locale: input.locale,
        intent: response.intent,
        responseType: response.type,
        confidence: response.confidence,
        messageLength: input.message.length,
        filtersApplied: response.filtersApplied ?? null,
        resultCount: response.meetings?.length ?? 0,
      },
    });

    return response;
  }

  private routeIntent(input: ChatbotQueryDto): RoutedIntent {
    const normalizedMessage = input.message.toLowerCase();
    const terms = [...ENGLISH_MEETING_TERMS, ...ARABIC_MEETING_TERMS];
    const matchedTerms = terms.filter((term) =>
      normalizedMessage.includes(term),
    );
    const nonGenericMeetingTerms = matchedTerms.filter(
      (term) => !GENERIC_MEETING_TERMS.includes(term),
    );
    const looksLikeQuestion = QUESTION_INTRO_TERMS.some((term) =>
      normalizedMessage.includes(term),
    );
    const filters = this.extractMeetingFilters(input);
    const hasStructuredFilters =
      Boolean(filters.city) ||
      Boolean(filters.dayOfWeek) ||
      Boolean(filters.language) ||
      Boolean(filters.gender) ||
      filters.isOnline !== undefined ||
      filters.nearMe === true;

    if (
      looksLikeQuestion &&
      !hasStructuredFilters &&
      nonGenericMeetingTerms.length === 0
    ) {
      return {
        intent: 'content_qna',
        confidence: 0.78,
        filters,
      };
    }

    if (matchedTerms.length > 0 || hasStructuredFilters) {
      const confidence = Math.min(
        0.55 +
          nonGenericMeetingTerms.length * 0.1 +
          (hasStructuredFilters ? 0.15 : 0) +
          (matchedTerms.length > 0 ? 0.05 : 0),
        0.98,
      );

      return {
        intent: 'meeting_search',
        confidence,
        filters,
      };
    }

    return {
      intent: 'content_qna',
      confidence: 0.72,
      filters,
    };
  }

  private extractMeetingFilters(input: ChatbotQueryDto): ChatbotFiltersDto {
    const normalizedMessage = input.message.toLowerCase();
    const filters: ChatbotFiltersDto = {};

    if (input.city?.trim()) {
      filters.city = input.city.trim();
    } else {
      const matchedCity = CITY_ALIASES.find(({ aliases }) =>
        aliases.some((alias) => normalizedMessage.includes(alias)),
      );
      if (matchedCity) {
        filters.city = matchedCity.value;
      }
    }

    if (
      normalizedMessage.includes('near me') ||
      normalizedMessage.includes('nearest') ||
      normalizedMessage.includes('قريب') ||
      normalizedMessage.includes('الأقرب')
    ) {
      filters.nearMe = true;
    }

    if (
      normalizedMessage.includes('online') ||
      normalizedMessage.includes('virtual') ||
      normalizedMessage.includes('zoom') ||
      normalizedMessage.includes('اونلاين') ||
      normalizedMessage.includes('عن بعد')
    ) {
      filters.isOnline = true;
    }

    if (
      normalizedMessage.includes('in person') ||
      normalizedMessage.includes('face to face') ||
      normalizedMessage.includes('حضوري')
    ) {
      filters.isOnline = false;
    }

    const matchedDay = Object.entries(DAY_ALIASES).find(([, aliases]) =>
      aliases.some((alias) => normalizedMessage.includes(alias)),
    );
    if (matchedDay) {
      filters.dayOfWeek = matchedDay[0];
    } else if (
      normalizedMessage.includes('today') ||
      normalizedMessage.includes('اليوم')
    ) {
      filters.dayOfWeek = this.resolveRelativeDay(0);
    } else if (
      normalizedMessage.includes('tomorrow') ||
      normalizedMessage.includes('غدا')
    ) {
      filters.dayOfWeek = this.resolveRelativeDay(1);
    }

    const matchedLanguage = Object.entries(LANGUAGE_ALIASES).find(
      ([, aliases]) =>
        aliases.some((alias) => normalizedMessage.includes(alias)),
    );
    if (matchedLanguage) {
      filters.language = matchedLanguage[0];
    }

    const matchedGender = Object.entries(GENDER_ALIASES).find(([, aliases]) =>
      aliases.some((alias) => normalizedMessage.includes(alias)),
    );
    if (matchedGender) {
      filters.gender = matchedGender[0];
    }

    return filters;
  }

  private resolveRelativeDay(offsetDays: number) {
    const dayName = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone:
        this.configService.get<string>('app.appTimeZone') ?? 'Asia/Riyadh',
    })
      .format(new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000))
      .toLowerCase();

    return dayName;
  }

  private async handleContentAnswer(
    input: ChatbotQueryDto,
    confidence: number,
  ): Promise<ChatbotResponseDto> {
    const faqMatches = await this.cmsFaqService.searchFaqs(
      input.message,
      input.locale,
    );

    if (faqMatches.length > 0) {
      const topFaq = faqMatches[0];
      return {
        locale: input.locale,
        type: 'faq',
        intent: 'content_qna',
        confidence: Math.min(0.75 + (topFaq?.score ?? 1) * 0.05, 0.96),
        message:
          input.locale === 'ar'
            ? (topFaq?.answerAr ?? 'يرجى مراجعة صفحة الأسئلة الشائعة.')
            : (topFaq?.answerEn ?? 'Please review the FAQ content.'),
        sources: [
          {
            type: 'faq',
            id: topFaq?.id,
            title:
              input.locale === 'ar' ? topFaq?.questionAr : topFaq?.questionEn,
          },
        ],
        followUpSuggestions:
          input.locale === 'ar'
            ? ['اعثر على اجتماع في الرياض', 'اعرض الاجتماعات القريبة']
            : ['Find a meeting in Riyadh', 'Show nearby meetings'],
      };
    }

    return {
      locale: input.locale,
      type: 'fallback',
      intent: 'fallback',
      confidence: confidence * 0.5,
      message:
        input.locale === 'ar'
          ? 'لم أتمكن من تأكيد الإجابة من المحتوى الحالي. يمكنني مساعدتك في العثور على الاجتماعات أو توجيهك إلى صفحة التواصل.'
          : 'I could not confirm that from the current content. I can still help you find meetings or guide you to the contact page.',
      followUpSuggestions:
        input.locale === 'ar'
          ? ['اعرض اجتماعات اليوم', 'كيف أجد اجتماعاً مناسباً؟']
          : ['Show today meetings', 'How do I find a suitable meeting?'],
    };
  }

  private async handleMeetingSearch(
    input: ChatbotQueryDto,
    routed: RoutedIntent,
  ): Promise<ChatbotResponseDto> {
    const filters = routed.filters;

    if (filters.nearMe && (!input.latitude || !input.longitude)) {
      return {
        locale: input.locale,
        type: 'clarification',
        intent: 'clarification_needed',
        confidence: 0.93,
        message:
          input.locale === 'ar'
            ? 'يمكنني البحث عن الاجتماعات القريبة، لكنني أحتاج إلى موقعك الحالي أو اسم المدينة أولاً.'
            : 'I can look for nearby meetings, but I need your current location or a city first.',
        clarificationNeeded: true,
        filtersApplied: filters,
        followUpSuggestions:
          input.locale === 'ar'
            ? ['اجتماعات في الرياض اليوم', 'اجتماعات اونلاين']
            : ['Meetings in Riyadh today', 'Online meetings'],
      };
    }

    const results =
      filters.nearMe &&
      input.latitude !== undefined &&
      input.longitude !== undefined
        ? await this.meetingsService.searchNearbyMeetings({
            latitude: input.latitude,
            longitude: input.longitude,
            radiusKm: input.radiusKm ?? 10,
            areaId: input.areaId,
            city: filters.city,
            dayOfWeek: filters.dayOfWeek,
            gender: filters.gender as 'MALE' | 'FEMALE' | 'MIXED' | undefined,
            language: filters.language as
              | 'ARABIC'
              | 'ENGLISH'
              | 'BILINGUAL'
              | undefined,
            isOnline: filters.isOnline,
            query: input.message,
          })
        : await this.meetingsService.searchPublicMeetings({
            areaId: input.areaId,
            city: filters.city,
            dayOfWeek: filters.dayOfWeek,
            gender: filters.gender as 'MALE' | 'FEMALE' | 'MIXED' | undefined,
            language: filters.language as
              | 'ARABIC'
              | 'ENGLISH'
              | 'BILINGUAL'
              | undefined,
            isOnline: filters.isOnline,
            query: input.message,
            limit: 3,
          });

    const items = (Array.isArray(results) ? results : results.items) as Record<
      string,
      unknown
    >[];
    const meetings = items
      .slice(0, 3)
      .map((meeting) => this.toSanitizedMeeting(meeting));

    if (meetings.length === 0) {
      return {
        locale: input.locale,
        type: 'fallback',
        intent: 'meeting_search',
        confidence: routed.confidence * 0.85,
        message:
          input.locale === 'ar'
            ? 'لم أجد اجتماعاً مطابقاً لهذه المعايير. جرّب مدينة أخرى أو ابحث عن الاجتماعات الأونلاين.'
            : 'I could not find meetings that match those filters. Try another city or search for online meetings.',
        filtersApplied: filters,
        followUpSuggestions:
          input.locale === 'ar'
            ? ['اجتماعات اونلاين', 'اجتماعات في جدة']
            : ['Online meetings', 'Meetings in Jeddah'],
      };
    }

    return {
      locale: input.locale,
      type: 'meeting-results',
      intent: 'meeting_search',
      confidence: routed.confidence,
      message:
        input.locale === 'ar'
          ? `وجدت ${meetings.length} اجتماع${meetings.length > 1 ? 'ات' : ''} مناسب${meetings.length > 1 ? 'ة' : ''} لك.`
          : `I found ${meetings.length} meeting${meetings.length > 1 ? 's' : ''} that may help.`,
      filtersApplied: filters,
      meetings,
      followUpSuggestions:
        input.locale === 'ar'
          ? ['اعرض اجتماعات اليوم', 'اجتماعات اونلاين']
          : ['Show today meetings', 'Show online meetings'],
    };
  }

  private toSanitizedMeeting(
    meeting: Record<string, unknown>,
  ): SanitizedChatbotMeetingDto {
    return {
      id: meeting.id as string,
      nameEn: meeting.nameEn as string,
      nameAr: meeting.nameAr as string,
      city: meeting.city as string,
      district: meeting.district as string,
      dayOfWeek: meeting.dayOfWeek as string,
      startTime: meeting.startTime as string,
      endTime: meeting.endTime as string,
      isOnline: meeting.isOnline as boolean,
      language: meeting.language as string,
      gender: meeting.gender as string,
      meetingLink: (meeting.meetingLink as string | null) ?? null,
      addressEn: (meeting.addressEn as string | null) ?? null,
      addressAr: (meeting.addressAr as string | null) ?? null,
      googleMapsLink:
        (meeting.googleMapsLink as string | null) ??
        (meeting.latitude != null && meeting.longitude != null
          ? `https://www.google.com/maps?q=${meeting.latitude as number},${meeting.longitude as number}`
          : null),
    };
  }
}
