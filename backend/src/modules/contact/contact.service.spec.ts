import { ContactService } from './contact.service';

describe('ContactService', () => {
  const contactRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };
  const authorizationService = {
    assertContactAccess: jest.fn(),
  };
  const auditService = { log: jest.fn() };
  const configService = { get: jest.fn().mockReturnValue('PR_COMMITTEE') };
  const emailService = {
    send: jest.fn().mockResolvedValue({ delivered: true }),
  };

  const service = new ContactService(
    contactRepository as never,
    authorizationService as never,
    auditService as never,
    configService as never,
    emailService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a submission and logs audit metadata', async () => {
    contactRepository.create.mockResolvedValue({ id: 'contact-1' });

    const result = await service.submit(
      {
        name: 'Test User',
        email: 'user@test.com',
        subject: 'Need help',
        message: 'Please contact me about a meeting.',
      },
      '127.0.0.1',
      'corr-1',
    );

    expect(result.id).toBe('contact-1');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CONTACT_SUBMITTED',
        ipAddress: '127.0.0.1',
      }),
    );
  });
});
