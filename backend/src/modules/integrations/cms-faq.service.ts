import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CmsFaqResult {
  id?: string;
  questionAr?: string;
  questionEn?: string;
  answerAr?: string;
  answerEn?: string;
  keywords?: string[];
  score?: number;
}

interface PortableTextSpan {
  _type?: string;
  text?: string;
}

interface PortableTextBlock {
  _type?: string;
  children?: PortableTextSpan[];
}

interface SanityFaqPayload {
  _id?: string;
  question?: {
    ar?: string;
    en?: string;
  };
  answer?: {
    ar?: PortableTextBlock[];
    en?: PortableTextBlock[];
  };
  keywords?: string[];
}

@Injectable()
export class CmsFaqService {
  constructor(private readonly configService: ConfigService) {}

  private portableTextToPlainText(blocks: PortableTextBlock[] | undefined) {
    if (!Array.isArray(blocks)) {
      return '';
    }

    return blocks
      .flatMap((block) => block.children ?? [])
      .map((child) => child.text ?? '')
      .join(' ')
      .trim();
  }

  async searchFaqs(
    message: string,
    locale: 'ar' | 'en',
  ): Promise<CmsFaqResult[]> {
    const projectId = this.configService.get<string>('SANITY_PROJECT_ID');
    const dataset =
      this.configService.get<string>('SANITY_DATASET') ?? 'production';
    const apiVersion =
      this.configService.get<string>('SANITY_API_VERSION') ?? '2025-04-05';
    const token = this.configService.get<string>('SANITY_READ_TOKEN');

    if (!projectId) {
      return [];
    }

    const host = token
      ? `${projectId}.api.sanity.io`
      : `${projectId}.apicdn.sanity.io`;

    const endpoint = new URL(
      `https://${host}/v${apiVersion}/data/query/${dataset}`,
    );
    endpoint.searchParams.set(
      'query',
      '*[_type == "faq"]{_id, question, answer, keywords}[0...50]',
    );

    let response: Response;

    try {
      response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch {
      return [];
    }

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { result?: SanityFaqPayload[] };
    const normalizedMessage = message.toLowerCase();

    return (payload.result ?? [])
      .map((faq) => {
        const normalizedFaq: CmsFaqResult = {
          id: faq._id,
          questionAr: faq.question?.ar,
          questionEn: faq.question?.en,
          answerAr: this.portableTextToPlainText(faq.answer?.ar),
          answerEn: this.portableTextToPlainText(faq.answer?.en),
          keywords: faq.keywords ?? [],
        };

        const haystack =
          locale === 'ar'
            ? `${normalizedFaq.questionAr ?? ''} ${normalizedFaq.answerAr ?? ''} ${(normalizedFaq.keywords ?? []).join(' ')}`.toLowerCase()
            : `${normalizedFaq.questionEn ?? ''} ${normalizedFaq.answerEn ?? ''} ${(normalizedFaq.keywords ?? []).join(' ')}`.toLowerCase();

        const terms = normalizedMessage.split(/\s+/).filter(Boolean);
        const score = terms.reduce((acc, term) => {
          if (!haystack.includes(term)) {
            return acc;
          }

          return acc + 1;
        }, 0);

        return {
          ...normalizedFaq,
          score,
        };
      })
      .filter((faq) => (faq.score ?? 0) > 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }
}
