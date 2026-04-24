import 'reflect-metadata';
import {
  IS_PUBLIC_KEY,
  RATE_LIMIT_KEY,
} from '../../common/constants/metadata.constants.js';
import { PublicMeetingsController } from './meetings.public.controller';

describe('PublicMeetingsController', () => {
  const meetingsService = {
    searchPublicMeetings: jest.fn(),
    searchMapMeetings: jest.fn(),
    searchNearbyMeetings: jest.fn(),
  };

  const controller = new PublicMeetingsController(meetingsService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks the controller as public', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, PublicMeetingsController)).toBe(
      true,
    );
  });

  it('declares a rate limit on the public search action', () => {
    expect(
      Reflect.getMetadata(
        RATE_LIMIT_KEY,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        PublicMeetingsController.prototype.search,
      ),
    ).toMatchObject({
      limit: 60,
      windowMs: 60000,
      key: 'ip',
    });
  });

  it('delegates map searches to the meetings service', async () => {
    meetingsService.searchMapMeetings.mockResolvedValue([{ id: 'm1' }]);

    await expect(controller.map({ city: 'Riyadh' } as never)).resolves.toEqual([
      { id: 'm1' },
    ]);
    expect(meetingsService.searchMapMeetings).toHaveBeenCalledWith({
      city: 'Riyadh',
    });
  });

  it('delegates nearby searches to the meetings service', async () => {
    meetingsService.searchNearbyMeetings.mockResolvedValue([{ id: 'm2' }]);

    await expect(
      controller.nearby({
        latitude: 24.7,
        longitude: 46.6,
        radiusKm: 10,
      } as never),
    ).resolves.toEqual([{ id: 'm2' }]);
    expect(meetingsService.searchNearbyMeetings).toHaveBeenCalledWith({
      latitude: 24.7,
      longitude: 46.6,
      radiusKm: 10,
    });
  });
});
