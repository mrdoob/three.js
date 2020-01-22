import { NodeBuilder } from './NodeBuilder';

export class Node {

	constructor( type?: string );

	uuid: string;
	name: string;
	type: string | undefined;
	userData: object;
	readonly isNode: true;
	frameId: number | undefined;

	analyze( builder: NodeBuilder, settings?: object ): void;
	analyzeAndFlow( builder: NodeBuilder, output: string, settings?: object ): object;
	flow( builder: NodeBuilder, output: string, settings?: object ): object;
	build( builder: NodeBuilder, output: string, uuid?: string ): string;
	generate( builder: NodeBuilder, output: string, uuid?: string, type?: string, ns?: string ): string;
	appendDepsNode( builder: NodeBuilder, data: object, output: string ): void;
	setName( name: string ): this;
	getName( builder: NodeBuilder ): string;
	getType( builder: NodeBuilder, output?: string ): string;
	getJSONNode( meta?: object | string ): object | undefined;
	copy( source: Node ): this;
	createJSONNode( meta?: object | string ): object;
	toJSON( meta?: object | string ): object;

}
