import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CurrentUserContext } from '../../common/types/request-context.type.js';
import { AuditService } from '../audit/audit.service.js';
import { StorageService } from '../integrations/storage.service.js';
import { CreateResourceDto, InitResourceUploadDto } from './resources.dto.js';
import { ResourcesRepository } from './resources.repository.js';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly resourcesRepository: ResourcesRepository,
    private readonly auditService: AuditService,
    private readonly storageService: StorageService,
  ) {}

  async createResource(
    input: CreateResourceDto,
    userId: string,
    roles: string[],
  ) {
    const resource = await this.resourcesRepository.create(input);
    await this.auditService.log({
      action: 'CREATED',
      resourceType: 'Resource',
      resourceId: resource.id,
      userId,
      userRoleSnapshot: roles.join(','),
      afterState: resource as unknown as Record<string, unknown>,
    });
    return resource;
  }

  listPublicResources() {
    return this.resourcesRepository.listPublic();
  }

  async listAdminResources(user: CurrentUserContext) {
    void this.auditService.log({
      action: 'VIEWED',
      resourceType: 'ResourceList',
      userId: user.id,
      userRoleSnapshot: user.roles.join(','),
    });

    return this.resourcesRepository.listAdmin();
  }

  async initUpload(input: InitResourceUploadDto) {
    const path = `resources/${randomUUID()}-${input.fileName}`;
    return this.storageService.createSignedUpload(path, input.isPublic ?? true);
  }

  async getDownloadUrl(id: string) {
    const resource = await this.resourcesRepository.findById(id);

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    await this.resourcesRepository.incrementDownloadCount(id);
    await this.auditService.log({
      action: 'DOWNLOADED',
      resourceType: 'Resource',
      resourceId: id,
      metadata: {
        isPublic: resource.isPublic,
        filePath: resource.filePath,
      },
    });

    return {
      id: resource.id,
      url: await this.storageService.resolveDownloadUrl(
        resource.filePath,
        resource.isPublic,
      ),
    };
  }
}
