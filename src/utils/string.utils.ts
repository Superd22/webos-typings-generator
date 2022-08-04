import { snakeCase, camelCase } from 'lodash'

export class Strings {
  /**
   * Trim all whitespaces from a string
   * @param str string
   * @param preserveSpaces when true line return won't be removed
   */
  public static trim(str: string, preserveNewLines = false): string {
    const firstPass = str.replace(/[\r\t\f\v]/g, '');

    if (preserveNewLines) return firstPass;
    else return firstPass.replace(/[\n]/g, '');
  }

  public static pascalCase(p: string): string {
    return `${p}`
      .replace(new RegExp(/[/]+/, 'g'), ' ')
      .replace(new RegExp(/[-_]+/, 'g'), ' ')
      .replace(new RegExp(/[^\w\s]/, 'g'), '')
      .replace(
        new RegExp(/\s+(.)(\w*)/, 'g'),
        ($1, $2, $3) => `${$2.toUpperCase() + $3}`,
      )
      .replace(new RegExp(/\w/), (s) => s.toUpperCase());
  }

  public static camelCase(p: string): string {
    return camelCase(p);
  }

  public static snakeCase(str: string): string {
    return snakeCase(str)
  }
}
