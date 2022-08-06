import { Strings } from '../utils/string.utils';
import { InterfaceDeclaration, Project, SourceFile } from 'ts-morph';
import { Endpoint, LiteralType, Service, Type } from './_.outputer';
import * as rimraf from 'rimraf';
/**
 * Takes services data and outputs it as Typescript definitions
 */
export class TsMorphOutputer {
  protected readonly project = new Project({
    compilerOptions: {
      baseUrl: 'out',
    },
  });

  protected indexes: {
    main: SourceFile;
    lg: SourceFile;
    ose: SourceFile;
  };

  constructor(protected readonly services: Service[]) { }

  public async output() {
    await new Promise<void>((resolve, reject) =>
      rimraf('out-ts', (err) => {
        if (err) reject(err);
        else resolve();
      }),
    );

    this.indexes = {
      main: this.project.createSourceFile('out-ts/index.d.ts'),
      lg: this.project.createSourceFile('out-ts/lg/index.d.ts'),
      ose: this.project.createSourceFile('out-ts/ose/index.d.ts'),
    };

    for (const s of this.services) {
      this.transformService(s);
    }

    this.indexes['main'].addExportDeclarations(
      (['lg', 'ose'] as const).map((group) => ({
        moduleSpecifier: this.indexes[
          'main'
        ].getRelativePathAsModuleSpecifierTo(this.indexes[group]),
      })),
    );

    console.log('Done generating ts-morph, saving.');
    await this.project.save();

    console.log('Done saving typescript files');
  }

  protected transformService(service: Service): void {
    const serviceFile = this.project.createSourceFile(
      `out-ts/${service.group || 'lg'}/${Strings.snakeCase(
        service.title,
      ).toLowerCase()}.d.ts`,
    );

    const indexFile = this.indexes[service.group!];
    serviceFile.addInterface({
      name: Strings.pascalCase(service.title),
      docs: [service.uri],
    });

    // This is a big service, we better split it if we can
    if (service.endpoints.length > 20 && this.serviceCanBeSplit(service)) {
      const splittedEndpoints = service.endpoints.reduce((acc, endpoint) => {
        const group = endpoint.name.split('/')[0];

        acc[group] = acc[group] ? [...acc[group], endpoint] : [endpoint];
        return acc;
      }, {} as Record<string, Endpoint[]>);

      for (const [group, endpoints] of Object.entries(splittedEndpoints)) {
        const subServiceFile = this.project.createSourceFile(
          `out-ts/${service.group || 'lg'}/${Strings.snakeCase(
            service.title,
          )}/${Strings.snakeCase(
            service.title + ' ' + group,
          ).toLowerCase()}.d.ts`,
        );

        this.writeSourceFile(service, endpoints, subServiceFile, serviceFile);
      }

      indexFile.addExportDeclaration({
        moduleSpecifier:
          indexFile.getRelativePathAsModuleSpecifierTo(serviceFile),
      });
    } else if (service.endpoints.length > 20) {
      console.warn(
        `Service ${service.title} is a big service that we couldn't split, might fail.`,
      );
      this.writeSourceFile(service, service.endpoints, serviceFile, indexFile);
    } else {
      this.writeSourceFile(service, service.endpoints, serviceFile, indexFile);
    }
  }

  protected writeSourceFile(
    service: Service,
    endpoints: Service['endpoints'],
    sourceFile: SourceFile,
    reExportIn: SourceFile,
  ) {
    endpoints.forEach((e) => {
      this.transformEndpoint(sourceFile, service, e);
    });
    reExportIn.addExportDeclaration({
      moduleSpecifier:
        reExportIn.getRelativePathAsModuleSpecifierTo(sourceFile),
    });
  }

  protected transformEndpoint(
    serviceFile: SourceFile,
    service: Service,
    endpoint: Endpoint,
  ) {
    if (typeof endpoint.parameters !== 'string') {
      this.interfaceFromType(serviceFile, service, endpoint.parameters);
    }

    console.debug('Done generating ts for endpoint', endpoint.name);
    if (endpoint.errors?.length) {
      serviceFile.addEnum({
        name:
          Strings.pascalCase(service.title) +
          Strings.pascalCase(endpoint.name) +
          'Error',
        isExported: true,
        members: endpoint.errors.map((e) => ({
          name: Strings.snakeCase(e.message).toUpperCase(),
          value: e.code,
        })),
      });
    }

    if (endpoint.callReturn) {
      this.interfaceFromType(serviceFile, service, endpoint.callReturn);
    }

    if (endpoint.subscriptionReturn) {
      this.interfaceFromType(serviceFile, service, endpoint.subscriptionReturn);
    }
  }

  protected serviceCanBeSplit(service: Service) {
    return service.endpoints.some((e) => e.name.includes('/'));
  }

  protected tsTypeFromScrapeType(
    sourceFile: SourceFile,
    service: Service,
    parentName: string,
    type: Type,
  ): string {
    if (typeof type === 'string') {
      if (type === 'parent') return parentName;
      return type;
    } else return this.interfaceFromType(sourceFile, service, type).getName();
  }

  protected interfaceFromType(
    sourceFile: SourceFile,
    service: Service,
    type: LiteralType,
  ): InterfaceDeclaration {
    const interfaceName =
      Strings.pascalCase(service.title) + Strings.pascalCase(type.name);
    const existing = sourceFile.getInterface(interfaceName);
    if (existing) return existing;
    // if (interfaceName.includes('Bluetooth2Mesh')) {
    //   debugger;
    //   return sourceFile.getInterfaces()[0];
    // }
    return sourceFile.addInterface({
      name: interfaceName,
      isExported: true,
      properties: type.properties.map((p) => {
        return {
          name: p.name,
          type: `${this.tsTypeFromScrapeType(
            sourceFile,
            service,
            interfaceName,
            p.type,
          )}${p.array ? '[]' : ''}`,
          hasQuestionToken: !p.required,
        };
      }),
    });
  }
}
