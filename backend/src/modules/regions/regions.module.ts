import { Module } from '@nestjs/common';
import { RegionsController } from './regions.controller.js';
import { RegionsRepository } from './regions.repository.js';
import { RegionsService } from './regions.service.js';

@Module({
  controllers: [RegionsController],
  providers: [RegionsRepository, RegionsService],
  exports: [RegionsService, RegionsRepository],
})
export class RegionsModule {}
