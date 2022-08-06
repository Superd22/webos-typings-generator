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
import { NodeHtmlMarkdown } from 'node-html-markdown';
import Parallel from 'paralleljs';

export class OSEScrapper implements Scrapper {
  protected static nhm = new NodeHtmlMarkdown({});

  protected readonly $!: CheerioAPI;

  protected serviceTitle: string;

  protected objectLiterals: LiteralType[] = [];

  constructor(protected readonly url: string) { }

  public async scrape(): Promise<Service> {
    console.log(`Scrapping ${this.url}`);
    const response = await fetch(this.url);
    const html = await response.text();
    (this as any).$ = load(html);

    // com.service.whatever.(foo) <= we want this last part
    this.serviceTitle = this.$('h1.title').text().split('.').pop()!;
    const uri = 'luna://' + this.$('h1.title').text();
    const version = '1.0.0';
    const description = this.$('h1.title~*').nextUntil('h2#methods').html();

    const endpoints: ScrappedEndpoint[] = this.$('h2#methods')
      .nextUntil('h2', 'h3')
      .toArray()
      .map((e) => {
        // (= content of the cell),
        const name = this.$(e).text().replace(/\s/g, '');
        // URL (= anchor of the a href.)
        let url = this.$(e).attr('id') || name;

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

    const scrapped = [];
    for (const endpoint of endpoints) {
      scrapped.push(await this.scrapeEndpoint(endpoint));
    }
    return {
      title: this.serviceTitle,
      uri,
      group: 'ose',
      endpoints: scrapped,
    };
  }

  protected async scrapeEndpoint(
    endpoint: ScrappedEndpoint,
  ): Promise<Endpoint> {
    console.debug('Scraping endpoint', endpoint[0]);
    const parameters = this.extractParams(endpoint);
    console.debug('Done scraping params of endpoing', endpoint[0]);
    const errors = this.extractErrors(endpoint);
    console.debug('Done scraping errors of endpoing', endpoint[0]);
    const callReturn = this.extractReturn(endpoint);
    console.debug('Done scraping return of endpoing', endpoint[0]);
    const subscriptionReturn = this.extractSubscription(endpoint);
    console.debug('Done scraping subscription of endpoing', endpoint[0]);

    console.debug('Done scraping endpoint', endpoint[0]);
    return {
      name: endpoint[0],
      callReturn,
      subscriptionReturn,
      parameters,
      errors,
    };
  }

  protected extractParams(endpoint: ScrappedEndpoint): Type {
    const table = this.findTable(endpoint, 'Parameters');

    if (!table) {
      return 'never';
    }

    return this.extractObjectLiteralFromTable(
      Strings.pascalCase(endpoint[0]) + Strings.pascalCase('Parameters'),
      table,
    );
  }

  protected extractSubscription(
    endpoint: ScrappedEndpoint,
  ): LiteralType | undefined {
    const table = this.findTable(endpoint, 'Subscription Returns');
    if (!table) return undefined;

    return this.extractObjectLiteralFromTable(
      Strings.pascalCase(endpoint[0]) + Strings.pascalCase('Subscription'),
      table,
    );
  }

  protected extractReturn(endpoint: ScrappedEndpoint): LiteralType | undefined {
    const table = this.findTable(endpoint, 'Call Returns');
    if (!table) return undefined;

    return this.extractObjectLiteralFromTable(
      Strings.pascalCase(endpoint[0]) + Strings.pascalCase('CallReturn'),
      table,
    );
  }

  protected extractErrors(
    endpoint: ScrappedEndpoint,
  ): EndpointError[] | undefined {
    const table = this.findTable(endpoint, 'error reference');
    if (!table) return undefined;
    return this.$('tr', table)
      .splice(1)
      .map((tr) => ({
        message: this.$('td:nth-child(2)', tr).text().trim(),
        code: this.$('td:nth-child(1)', tr).text().replace(/\s/g, ''),
      }));
  }

  /**
   * Find the table in a given H4 section (error ref/return/subscribe...) for a
   * given endpoint
   */
  protected findTable([name, url]: ScrappedEndpoint, section: string) {
    const sections = this.$(`#${url}`).next('div').children('h4').toArray();
    const params = sections.find(
      (h4) => this.$(h4).text().toLowerCase() === section.toLowerCase(),
    );

    return this.$(params).next('.table-container').children('table')[0];
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
        if (rawTypeOfProperty.toLowerCase().startsWith('object')) {
          let hasLink = this.$('td:nth-child(3) a', p)!.attr('href');
          if (hasLink) {
            if (nameOfObject === 'AudioList' && hasLink === '#audiolist') {
              hasLink = '#audiolist-1';
            }

            const link = hasLink.replace('$', '').replace(/\s/g, '');

            const tableOfObject = this.$(link)
              .nextUntil('h3', '.table-container')
              .children('table')[0];

            if (link && tableOfObject) {
              const objectName = Strings.pascalCase(
                this.$(link).text().replace(/\s/g, ''),
              );

              // We're referencing ourselves
              if (objectName === nameOfObject) {
                type = 'parent';
              } else {
                type = this.extractObjectLiteralFromTable(
                  objectName,
                  tableOfObject,
                );
              }
            } else {
              type = 'any';
            }
          } else {
            type = 'any';
          }
        } else {
          type = rawTypeOfProperty.replace('array', '') as ScalarType;
          const hasSubType = type.match(/(\((.*)\))/);
          if (hasSubType?.length && hasSubType[2]) {
            // @todo add it to docs or something
            type = type.replace(hasSubType[1], '') as ScalarType;
          }
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
          array: rawTypeOfProperty.includes('array'),
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
