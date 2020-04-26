import { Node } from '../../core/Node';

export class RawNode extends Node {

	constructor( value: Node );

	value: Node;
	nodeType: string;

	copy( source: RawNode ): this;

}
