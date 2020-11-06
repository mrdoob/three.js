import { NodeBuilder } from '../../core/NodeBuilder';
import { Node } from '../../core/Node';

export class SpriteNode extends Node {

	constructor();

	color: Node;
	spherical: true;
	nodeType: string;

	build( builder: NodeBuilder ): string;
	copy( source: SpriteNode ): this;

}
