export namespace CodeSerializer {
  export function serializeObject(fullName: string, object: object): string;
  export function serializeClass(fullName: string, object: object, constructorName?: string, basePrototypeName?: string, ignoreFunctions?: string[], includeFunctions?: string[], overrideFunctions?: string[]): string;
}
