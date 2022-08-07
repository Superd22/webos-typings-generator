export interface Service {
  uri: string;
  title: string;
  /** group of services (lg/ose/...) */
  group?: 'lg' | 'ose';
  endpoints: Endpoint[];
}

export interface Endpoint {
  name: string;
  docs?: string[];
  parameters: Type;
  callReturn?: LiteralType;
  subscriptionReturn?: LiteralType;
  errors?: EndpointError[];
}

export interface Property {
  name: string;
  type: Type;
  docs?: string[];
  array?: boolean;
  required?: boolean;
}

export interface EndpointError {
  code: string;
  message: string;
}

export type ScalarType = 'boolean' | 'string' | 'number' | 'never' | 'parent' | 'any';

export interface LiteralType {
  name: string;
  properties: Property[];
  docs?: string[];
}

export type Type = ScalarType | LiteralType;
