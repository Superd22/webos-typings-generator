import { Injectable } from '@nestjs/common';
import {
  Endpoint,
  EndpointError,
  LiteralType,
  ScalarType,
  Service,
  Type,
} from '../outputer/_.outputer';
import { Scrapper } from './_.scrapper';
import fetch from 'node-fetch';
import { Cheerio, CheerioAPI, load, Element } from 'cheerio';
import { Strings } from '../utils/string.utils';

export class LGScrapper implements Scrapper {
  protected readonly $!: CheerioAPI;

  protected serviceTitle: string;

  protected objectLiterals: LiteralType[] = [];

  constructor(protected readonly url: string) { }

  public async scrape(): Promise<Service> {
    console.log(`Scrapping ${this.url}`);
    const response = await fetch(this.url);
    const html = await response.text();
    (this as any).$ = load(html);

    this.serviceTitle = this.$('.page-title').text();
    const uri = this.$('.TED_H2')
      .text()
      .match(/.*(luna:.*)/)![1];
    const version = '1.0.0';
    const description = this.$('.DIV_contentarea > p').text();

    const endpoints: ScrappedEndpoint[] = this.$(
      '.DIV_contentarea > table.tbListCol tr:nth-child(2) > td:first-of-type',
    )
      .toArray()
      .map((e) => {
        // (= content of the cell),
        const name = this.$(e).text().replace(/\s/g, '');
        // URL (= anchor of the a href.)
        let url = this.$('a', e).attr('href')?.match(/#(.*)/)![1] || name;

        if (!this.$(`#${url}`).length) {
          console.warn(
            `URL of ${this.serviceTitle} endpoint ${name} is wrong...`,
          );

          if (this.$(`#${url?.toLowerCase()}`).length) {
            console.debug(
              `Found URL of ${this.serviceTitle} endpoint ${name} by lowercasing`,
            );
            url = url.toLowerCase();
          } else {
            throw new Error(
              `Could not resolve URL of ${this.serviceTitle} endpoint ${name}...`,
            );
          }
        }

        return [name, url];
      });

    return {
      title: this.serviceTitle,
      uri,
      group: 'lg',
      endpoints: endpoints.map((e) => this.scrapeEndpoint(e)),
    };
  }

  protected scrapeEndpoint(endpoint: ScrappedEndpoint): Endpoint {
    const more = this.$(`#${endpoint[1] || endpoint[0]}`);
    const table = this.$('table', more)[0];

    if (!table) {
      throw new Error('Cannot find table of endpoint');
    }

    const parameters = this.extractParams(endpoint);
    const errors = this.extractErrors(endpoint);
    const callReturn = this.extractReturn(endpoint);
    const subscriptionReturn = this.extractSubscription(endpoint);

    return {
      name: endpoint[0],
      callReturn,
      subscriptionReturn,
      parameters,
      errors,
    };
  }

  protected extractParams(endpoint: ScrappedEndpoint): LiteralType {
    const params = this.findTitle(endpoint, 'Parameters');
    if (!params)
      throw new Error(
        `Could not find params for ${this.serviceTitle} ${endpoint[0]}`,
      );
    const table = this.$(params).nextAll('table')[0];
    return this.extractObjectLiteralFromTable(
      Strings.pascalCase(endpoint[0]) + Strings.pascalCase('Parameters'),
      table,
    );
  }

  protected extractSubscription(
    endpoint: ScrappedEndpoint,
  ): LiteralType | undefined {
    const subTitle = this.findTitle(endpoint, 'Subscription Returns');
    if (!subTitle) return undefined;
    const table = this.$(subTitle).nextAll('table')[0];

    return this.extractObjectLiteralFromTable(
      Strings.pascalCase(endpoint[0]) + Strings.pascalCase('Subscription'),
      table,
    );
  }

  protected extractReturn(endpoint: ScrappedEndpoint): LiteralType | undefined {
    const returnTitle = this.findTitle(endpoint, 'Call Returns');
    if (!returnTitle) return undefined;
    const table = this.$(returnTitle).nextAll('table')[0];

    return this.extractObjectLiteralFromTable(
      Strings.pascalCase(endpoint[0]) + Strings.pascalCase('CallReturn'),
      table,
    );
  }

  protected extractErrors(
    endpoint: ScrappedEndpoint,
  ): EndpointError[] | undefined {
    const errorsTitle = this.findTitle(endpoint, 'error reference');
    if (!errorsTitle) return undefined;
    if (errorsTitle) {
      const table = this.$(errorsTitle).nextAll('table')[0];
      return this.$('tr', table)
        .splice(1)
        .map((tr) => ({
          message: this.$('td:nth-child(2)', tr).text().trim(),
          code: this.$('td:nth-child(1)', tr).text().replace(/\s/g, ''),
        }));
    }
  }

  /**
   * Find an H4 section (error ref/return/subscribe...) for a
   * given endpoint
   */
  protected findTitle([name, url]: ScrappedEndpoint, section: string) {
    const more = this.$(`#${url || name}`);
    const sections = this.$('h4.TED_H4', more).toArray();
    return sections.find(
      (h4) => this.$(h4).text().toLowerCase() === section.toLowerCase(),
    );
  }

  protected extractObjectLiteralFromTable(
    nameOfObject: string,
    table: Element,
  ): LiteralType {
    const existing = this.objectLiterals.find((o) => o.name === nameOfObject);
    if (existing) return existing;

    const propertiesElements = this.$('tr', table).splice(1);

    const literalType: LiteralType = {
      name: nameOfObject,
      properties: propertiesElements.map((p) => {
        const rawTypeOfProperty = this.$('td:nth-child(3)', p)
          .text()
          .replace(/\s/g, '')
          .toLowerCase();

        let type: Type;
        if (rawTypeOfProperty === 'object') {
          const link = this.$('td:nth-child(1) a', p)
            .text()
            .replace('$', '')
            .replace(/\s/g, '');
          const tableOfObject = this.$(`[name=${link}]`)
            .parent()
            .nextAll('table')[0];

          if (link && tableOfObject) {
            const objectName = Strings.pascalCase(
              this.$('td:nth-child(1)', p).text().replace(/\s/g, ''),
            );
            type = this.extractObjectLiteralFromTable(
              objectName,
              tableOfObject,
            );
          } else {
            type = 'any';
          }
        } else {
          type = rawTypeOfProperty as ScalarType;
        }

        return {
          name: this.$('td:nth-child(1)', p).text().replace(/\s/g, ''),
          docs: this.$('td:nth-child(4)', p)
            .text()
            .replace(/[\r\t\f\v]/g, '')
            .trim()
            .split(/\n/)
            .map((l) => l.trim())
            .filter((l) => !!l),
          type,
          required:
            this.$('td:nth-child(2)', p).text().replace(/\s/g, '') ===
            'Required',
        };
      }),
    };

    this.objectLiterals.push(literalType);
    return literalType;
  }
}

type ScrappedEndpoint = [name: string, url: string];
