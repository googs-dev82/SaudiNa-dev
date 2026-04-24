import { ResourcesService } from './resources.service';

describe('ResourcesService', () => {
  const resourcesRepository = {
    create: jest.fn(),
    listPublic: jest.fn(),
    listAdmin: jest.fn(),
    incrementDownloadCount: jest.fn(),
    findById: jest.fn(),
  };
  const auditService = { log: jest.fn() };
  const storageService = {
    createSignedUpload: jest.fn().mockResolvedValue({
      bucket: 'public-assets',
      path: 'resources/x-file.pdf',
    }),
    resolveDownloadUrl: jest
      .fn()
      .mockResolvedValue('https://storage.local/download'),
  };

  const service = new ResourcesService(
    resourcesRepository as never,
    auditService as never,
    storageService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes upload path through storage adapter', async () => {
    const result = await service.initUpload({
      fileName: 'guide.pdf',
      isPublic: true,
    });
    expect(result.bucket).toBe('public-assets');
    expect(storageService.createSignedUpload).toHaveBeenCalled();
  });

  it('returns resource download URL and increments count', async () => {
    resourcesRepository.findById.mockResolvedValue({
      id: 'r1',
      filePath: 'resources/file.pdf',
      isPublic: true,
    });

    const result = await service.getDownloadUrl('r1');
    expect(result.url).toBe('https://storage.local/download');
    expect(resourcesRepository.incrementDownloadCount).toHaveBeenCalledWith(
      'r1',
    );
  });
});
