export class PropertyBinding {

	constructor( rootNode: any, path: string, parsedPath?: any );

	path: string;
	parsedPath: any;
	node: any;
	rootNode: any;

	getValue( targetArray: any, offset: number ): any;
	setValue( sourceArray: any, offset: number ): void;
	bind(): void;
	unbind(): void;

	BindingType: { [bindingType: string]: number };
	Versioning: { [versioning: string]: number };

	GetterByBindingType: Function[];
	SetterByBindingTypeAndVersioning: Array<Function[]>;

	static create(
		root: any,
		path: any,
		parsedPath?: any
	): PropertyBinding | PropertyBinding.Composite;
	static parseTrackName( trackName: string ): any;
	static findNode( root: any, nodeName: string ): any;

}

export namespace PropertyBinding {
	export class Composite {

  	constructor( targetGroup: any, path: any, parsedPath?: any );

  	getValue( array: any, offset: number ): any;
  	setValue( array: any, offset: number ): void;
  	bind(): void;
  	unbind(): void;

	}
}
