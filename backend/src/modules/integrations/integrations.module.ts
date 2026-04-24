import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { CmsFaqService } from './cms-faq.service.js';
import { IdentityProviderService } from './identity-provider.service.js';
import { StorageService } from './storage.service.js';
import { ZoomService } from './zoom.service.js';

@Module({
  providers: [
    EmailService,
    CmsFaqService,
    IdentityProviderService,
    StorageService,
    ZoomService,
  ],
  exports: [
    EmailService,
    CmsFaqService,
    IdentityProviderService,
    StorageService,
    ZoomService,
  ],
})
export class IntegrationsModule {}
