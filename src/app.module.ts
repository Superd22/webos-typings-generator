import { Module } from '@nestjs/common';
import { ScrapeCommand } from './commands/scrape.command';
import { Config } from './config';

const commands = [ScrapeCommand];

const providers = [Config];

@Module({
  imports: [],
  controllers: [],
  providers: [...providers, ...commands],
})
export class AppModule { }
