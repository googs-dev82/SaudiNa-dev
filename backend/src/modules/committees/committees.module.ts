import { Module } from '@nestjs/common';
import { CommitteesController } from './committees.controller.js';
import { CommitteesRepository } from './committees.repository.js';
import { CommitteesService } from './committees.service.js';

@Module({
  controllers: [CommitteesController],
  providers: [CommitteesRepository, CommitteesService],
  exports: [CommitteesService, CommitteesRepository],
})
export class CommitteesModule {}
