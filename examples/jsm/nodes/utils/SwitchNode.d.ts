import { Node } from '../core/Node';
import { NodeBuilder } from '../core/NodeBuilder';

export class SwitchNode extends Node {

	constructor( node: Node, components?: string );

	node: Node;
	components: string;
	nodeType: string;

	generate( builder: NodeBuilder, output: string ): string;
	copy( source: SwitchNode ): this;

}
