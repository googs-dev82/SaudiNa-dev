import { Injectable } from '@nestjs/common';
import { AreasRepository } from './areas.repository.js';
import { CreateAreaDto, UpdateAreaDto } from './areas.dto.js';

@Injectable()
export class AreasService {
  constructor(private readonly areasRepository: AreasRepository) {}

  createArea(input: CreateAreaDto) {
    return this.areasRepository.create(input);
  }

  listPublicAreas(regionId?: string) {
    return this.areasRepository.findPublic(regionId);
  }

  listAreas() {
    return this.areasRepository.listAll();
  }

  updateArea(id: string, input: UpdateAreaDto) {
    return this.areasRepository.update(id, input);
  }

  getArea(id: string) {
    return this.areasRepository.findById(id);
  }

  deleteArea(id: string) {
    return this.areasRepository.delete(id);
  }
}
