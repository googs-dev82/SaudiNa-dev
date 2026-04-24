import { CmsFaqService } from './cms-faq.service';

describe('CmsFaqService', () => {
  const get = jest.fn();
  const service = new CmsFaqService({ get } as never);

  beforeEach(() => {
    jest.clearAllMocks();
    get.mockImplementation((key: string) => {
      switch (key) {
        case 'SANITY_PROJECT_ID':
          return 'proj123';
        case 'SANITY_DATASET':
          return 'production';
        case 'SANITY_API_VERSION':
          return '2026-04-07';
        case 'SANITY_READ_TOKEN':
          return '';
        default:
          return undefined;
      }
    });
  });

  it('returns empty results when Sanity project is not configured', async () => {
    get.mockImplementation((key: string) =>
      key === 'SANITY_PROJECT_ID' ? '' : undefined,
    );

    await expect(service.searchFaqs('meeting', 'en')).resolves.toEqual([]);
  });

  it('returns ranked FAQ results from Sanity payloads', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          result: [
            {
              _id: 'faq-1',
              question: {
                en: 'How do I find a meeting?',
                ar: 'كيف أجد اجتماعاً؟',
              },
              answer: {
                en: [
                  {
                    children: [{ text: 'Find a meeting in Riyadh or online.' }],
                  },
                ],
                ar: [
                  {
                    children: [
                      { text: 'ابحث عن اجتماع في الرياض أو أونلاين.' },
                    ],
                  },
                ],
              },
              keywords: ['meeting', 'riyadh'],
            },
          ],
        }),
    } as Response);

    const result = await service.searchFaqs('meeting riyadh', 'en');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'faq-1',
      questionEn: 'How do I find a meeting?',
    });
    expect((result[0]?.score ?? 0) > 0).toBe(true);
  });

  it('returns empty results when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network')) as never;

    await expect(service.searchFaqs('meeting', 'en')).resolves.toEqual([]);
  });
});
