import { ChatbotController } from './chatbot.controller';

describe('ChatbotController', () => {
  const chatbotService = {
    query: jest.fn().mockResolvedValue({
      locale: 'en',
      type: 'faq',
      intent: 'content_qna',
      confidence: 0.9,
      message: 'Answer',
    }),
  };

  const controller = new ChatbotController(chatbotService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates chatbot queries to the chatbot service', async () => {
    const payload = { message: 'What is NA?', locale: 'en' as const };

    await expect(
      controller.query(payload, { ip: '127.0.0.1', correlationId: 'corr-1' }),
    ).resolves.toMatchObject({
      type: 'faq',
      intent: 'content_qna',
    });
    expect(chatbotService.query).toHaveBeenCalledWith(
      payload,
      '127.0.0.1',
      'corr-1',
    );
  });
});
