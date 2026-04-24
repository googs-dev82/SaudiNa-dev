import { Injectable, NotFoundException } from '@nestjs/common';
import { CommitteesRepository } from './committees.repository.js';
import { CreateCommitteeDto, UpdateCommitteeDto } from './committees.dto.js';

@Injectable()
export class CommitteesService {
  constructor(private readonly committeesRepository: CommitteesRepository) {}

  createCommittee(input: CreateCommitteeDto) {
    return this.committeesRepository.create(input);
  }

  listCommittees() {
    return this.committeesRepository.listAll();
  }

  async getCommittee(id: string) {
    const committee = await this.committeesRepository.findById(id);

    if (!committee) {
      throw new NotFoundException('Committee not found.');
    }

    return committee;
  }

  updateCommittee(id: string, input: UpdateCommitteeDto) {
    return this.committeesRepository.update(id, input);
  }

  deleteCommittee(id: string) {
    return this.committeesRepository.delete(id);
  }
}
