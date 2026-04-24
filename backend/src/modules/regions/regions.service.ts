import { Injectable } from '@nestjs/common';
import { RegionsRepository } from './regions.repository.js';
import { CreateRegionDto, UpdateRegionDto } from './regions.dto.js';

@Injectable()
export class RegionsService {
  constructor(private readonly regionsRepository: RegionsRepository) {}

  createRegion(input: CreateRegionDto) {
    return this.regionsRepository.create(input);
  }

  listPublicRegions() {
    return this.regionsRepository.findPublic();
  }

  listRegions() {
    return this.regionsRepository.listAll();
  }

  updateRegion(id: string, input: UpdateRegionDto) {
    return this.regionsRepository.update(id, input);
  }

  getRegion(id: string) {
    return this.regionsRepository.findById(id);
  }

  deleteRegion(id: string) {
    return this.regionsRepository.delete(id);
  }
}
