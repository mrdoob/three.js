export namespace CodeSerializer {

	export function serializeClass( targetPrototype: object, targetPrototypeInstance: object, basePrototypeName?: string, overrideFunctions?: CodeSerializationInstruction[] ): string;

}

export class CodeSerializationInstruction {

	constructor( name: string, fullName: string );
	name: string;
	fullName: string;
	code: string;
	removeCode: boolean;

	getName(): string;
	getFullName(): string;
	setCode( code: string ): this;
	getCode(): string;
	setRemoveCode( removeCode: boolean ): this;
	isRemoveCode(): boolean;

}
