import { NodeBuilder } from '../core/NodeBuilder';
import { TempNode } from '../core/TempNode';

export class NormalNode extends TempNode {

	constructor( scope?: string );

	scope: string;
	nodeType: string;

	generate( builder: NodeBuilder, output: string ): string;
	copy( source: NormalNode ): this;

	static LOCAL: string;
	static WORLD: string;

}
