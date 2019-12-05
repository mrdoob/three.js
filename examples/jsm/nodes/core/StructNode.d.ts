import { TempNode } from './TempNode';
import { NodeBuilder } from './NodeBuilder';

export interface StructNodeInput {
	type: string;
	name: string;
}

export class StructNode extends TempNode {

	constructor( src?: string );

	inputs: StructNodeInput[];
	src: string;
	nodeType: string;

	getType( builder: NodeBuilder ): string;
	getInputByName( name: string ): StructNodeInput;
	generate( builder: NodeBuilder, output: string ): string;
	parse( src: string ): void;

}
