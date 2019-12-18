import { Node } from '../core/Node';
import { NodeBuilder } from '../core/NodeBuilder';

export class BypassNode extends Node {

	constructor( code: Node, value?: Node );

	code: Node;
	value: Node | undefined;
	nodeType: string;

	copy( source: BypassNode ): this;

}
