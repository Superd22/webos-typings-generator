import { Command, CommandRunner } from 'nest-commander';
import { LGScrapper } from '../scrappers/lg.scrapper';
import { Config } from '../config';
import { Service } from '../outputer/_.outputer';
import { TsMorphOutputer } from '../outputer/ts-morph.outputer';
import { OSEScrapper } from '../scrappers/ose.scrapper';

@Command({ name: 'scrape', description: 'Launch scrape' })
export class ScrapeCommand extends CommandRunner {
  constructor(protected readonly config: Config) {
    super();
  }

  public async run(
    passedParams: string[],
    options?: Record<string, any> | undefined,
  ): Promise<void> {
    const services: Service[] = [];

    console.log('Starting scrape');


    for (const urls of this.chunkArray(this.config.ose.endpoints, 10)) {
      await Promise.all(
        urls.map(async (url) =>
          services.push(await new OSEScrapper(url).scrape()),
        ),
      );
    }

    // for (const urls of this.chunkArray(this.config.lg.endpoints, 10)) {
    //   await Promise.all(
    //     urls.map(async (url) =>
    //       services.push(await new LGScrapper(url).scrape()),
    //     ),
    //   );
    // }

    console.log(
      'Done scrapping, generating',
    );

    await new TsMorphOutputer(services).output();

    console.log('Done!');
  }

  protected chunkArray<A>(array: A[], chunkSize: number): A[][] {
    const results = [];
    while (array.length) {
      results.push(array.splice(0, chunkSize));
    }
    return results;
  }
}
