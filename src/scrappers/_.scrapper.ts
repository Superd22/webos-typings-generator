import { Service } from 'src/outputer/_.outputer';

export interface Scrapper {
  scrape(url: string): Promise<Service>;
}
