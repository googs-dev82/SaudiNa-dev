import { ChatbotService } from './chatbot.service';

describe('ChatbotService', () => {
  const meetingsService = {
    searchPublicMeetings: jest.fn(),
    searchNearbyMeetings: jest.fn(),
  };
  const cmsFaqService = {
    searchFaqs: jest.fn(),
  };
  const auditService = {
    log: jest.fn(),
  };
  const configService = {
    get: jest.fn().mockReturnValue('Asia/Riyadh'),
  };

  const service = new ChatbotService(
    meetingsService as never,
    cmsFaqService as never,
    auditService as never,
    configService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns FAQ answers with source metadata for content questions', async () => {
    cmsFaqService.searchFaqs.mockResolvedValue([
      {
        id: 'faq-1',
        questionEn: 'How do I find a suitable meeting?',
        answerEn: 'Try a few meetings and choose the one that feels right.',
        score: 3,
      },
    ]);

    const result = await service.query({
      message: 'How do I find a suitable meeting?',
      locale: 'en',
    });

    expect(result.type).toBe('faq');
    expect(result.intent).toBe('content_qna');
    expect(result.sources?.[0]).toEqual({
      type: 'faq',
      id: 'faq-1',
      title: 'How do I find a suitable meeting?',
    });
  });

  it('returns clarification for near-me requests without coordinates', async () => {
    const result = await service.query({
      message: 'Meetings near me',
      locale: 'en',
    });

    expect(result.type).toBe('clarification');
    expect(result.intent).toBe('clarification_needed');
    expect(result.clarificationNeeded).toBe(true);
    expect(meetingsService.searchNearbyMeetings).not.toHaveBeenCalled();
  });

  it('returns structured meeting results for discovery queries', async () => {
    meetingsService.searchPublicMeetings.mockResolvedValue({
      items: [
        {
          id: 'm1',
          nameEn: 'Hope Meeting',
          nameAr: 'اجتماع الأمل',
          city: 'Riyadh',
          district: 'Olaya',
          dayOfWeek: 'wednesday',
          startTime: '19:00',
          endTime: '20:00',
          isOnline: false,
          language: 'EN',
          gender: 'MIXED',
          meetingLink: null,
          addressEn: 'Olaya Street',
          addressAr: 'شارع العليا',
          latitude: 24.7,
          longitude: 46.6,
        },
      ],
    });

    const result = await service.query({
      message: 'Meetings in Riyadh today',
      locale: 'en',
    });

    expect(result.type).toBe('meeting-results');
    expect(result.intent).toBe('meeting_search');
    expect(result.filtersApplied).toMatchObject({
      city: 'Riyadh',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      dayOfWeek: expect.any(String),
    });
    expect(result.meetings).toHaveLength(1);
    expect(result.meetings?.[0]?.googleMapsLink).toContain('google.com/maps');
  });

  it('writes audit metadata for public chatbot queries', async () => {
    cmsFaqService.searchFaqs.mockResolvedValue([
      {
        id: 'faq-1',
        questionEn: 'What is NA?',
        answerEn: 'A recovery fellowship.',
        score: 2,
      },
    ]);

    await service.query(
      {
        message: 'What is NA?',
        locale: 'en',
      },
      '127.0.0.1',
      'corr-1',
    );

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CHATBOT_QUERY',
        resourceType: 'Chatbot',
        ipAddress: '127.0.0.1',
        correlationId: 'corr-1',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        metadata: expect.objectContaining({
          locale: 'en',
          messageLength: 11,
        }),
      }),
    );
  });
});
