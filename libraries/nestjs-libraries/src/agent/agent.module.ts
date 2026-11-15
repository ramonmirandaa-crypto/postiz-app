import { Global, Module } from '@nestjs/common';
import { AgentGraphService } from '@gitroom/nestjs-libraries/agent/agent.graph.service';
import { AgentGraphInsertService } from '@gitroom/nestjs-libraries/agent/agent.graph.insert.service';
import { DeepResearchService } from '@gitroom/nestjs-libraries/agent/deep-research.service';
import { ImageGenerationService } from '@gitroom/nestjs-libraries/agent/image-generation.service';
import { TrendingService } from '@gitroom/nestjs-libraries/agent/trending.service';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';

@Global()
@Module({
  providers: [
    AgentGraphService,
    AgentGraphInsertService,
    DeepResearchService,
    ImageGenerationService,
    TrendingService,
    MediaService,
  ],
  get exports() {
    return this.providers;
  },
})
export class AgentModule {}
