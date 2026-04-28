import { UnauthorizedException } from '@nestjs/common';
import { IdentityProviderService } from './identity-provider.service';

describe('IdentityProviderService', () => {
  const configService = {
    get: jest.fn(),
  };
  const fetchMock = jest.fn();
  let service: IdentityProviderService;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as never;
    service = new IdentityProviderService(configService as never);
  });

  it('verifies google access tokens against configured app userinfo endpoint', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'app.googleUserinfoUrl') return 'https://google.test/userinfo';
      return undefined;
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        email: 'member@example.com',
        name: 'Member User',
        sub: 'google-subject',
      }),
    });

    await expect(
      service.verifyIdentity({
        provider: 'GOOGLE',
        accessToken: 'provider-access-token',
      }),
    ).resolves.toEqual({
      provider: 'GOOGLE',
      email: 'member@example.com',
      displayName: 'Member User',
      externalSubject: 'google-subject',
    });

    expect(fetchMock).toHaveBeenCalledWith('https://google.test/userinfo', {
      headers: { Authorization: 'Bearer provider-access-token' },
    });
  });

  it('rejects provider callbacks without token or trusted dev claims', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'AUTH_TRUST_CLAIMS_IN_DEV') return 'false';
      if (key === 'app.nodeEnv') return 'development';
      return undefined;
    });

    await expect(
      service.verifyIdentity({
        provider: 'ZOHO',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
