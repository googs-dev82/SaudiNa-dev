import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    exchangeToken: jest.fn(),
    getProviderStartUrl: jest.fn().mockReturnValue('https://example.com/start'),
    exchangeProviderCode: jest.fn().mockResolvedValue('provider-token'),
    exchangeGoogleToken: jest
      .fn()
      .mockResolvedValue({ accessToken: 'google-jwt' }),
    exchangeZohoToken: jest.fn().mockResolvedValue({ accessToken: 'zoho-jwt' }),
  };

  const controller = new AuthController(
    authService as never,
    { get: jest.fn().mockReturnValue('http://localhost:3000') } as never,
  );

  it('routes google callback into provider-specific exchange', async () => {
    const result = await controller.googleCallback(
      undefined as never,
      undefined as never,
      undefined as never,
      'token-1',
      undefined as never,
      undefined as never,
    );
    expect(result).toEqual({ accessToken: 'google-jwt' });
    expect(authService.exchangeGoogleToken).toHaveBeenCalledWith({
      accessToken: 'token-1',
      email: undefined,
      displayName: undefined,
    });
  });

  it('builds google start redirect url', () => {
    expect(controller.googleStart('/portal')).toEqual({
      url: 'https://example.com/start',
    });
    expect(authService.getProviderStartUrl).toHaveBeenCalledWith(
      'GOOGLE',
      '/portal',
    );
  });

  it('builds zoho start redirect url', () => {
    expect(controller.zohoStart('/portal')).toEqual({
      url: 'https://example.com/start',
    });
    expect(authService.getProviderStartUrl).toHaveBeenCalledWith(
      'ZOHO',
      '/portal',
    );
  });

  it('redirects google code callbacks to the frontend callback path', async () => {
    const redirect = jest.fn();

    await expect(
      controller.googleCallback(
        { redirect } as never,
        'provider-code',
        Buffer.from(JSON.stringify({ returnTo: '/portal' })).toString(
          'base64url',
        ),
      ),
    ).resolves.toBeUndefined();

    expect(authService.exchangeProviderCode).toHaveBeenCalledWith(
      'GOOGLE',
      'provider-code',
    );
    expect(redirect).toHaveBeenCalledWith(
      'http://localhost:3000/portal/auth/callback/google#access_token=provider-token',
    );
  });

  it('returns the current user snapshot from me()', () => {
    expect(
      controller.me({
        id: 'u1',
        email: 'user@test.com',
        displayName: 'User',
        roles: ['SUPER_ADMIN'],
        assignments: [],
      }),
    ).toMatchObject({
      id: 'u1',
      roles: ['SUPER_ADMIN'],
    });
  });
});
