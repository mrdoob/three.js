import { NodeBuilder } from '../../core/NodeBuilder';
import { Node } from '../../core/Node';
import { ColorNode } from '../../inputs/ColorNode';
import { FloatNode } from '../../inputs/FloatNode';

export class StandardNode extends Node {

	constructor();

	color: ColorNode;
	roughness: FloatNode;
	metalness: FloatNode;
	nodeType: string;

	build( builder: NodeBuilder ): string;
	copy( source: StandardNode ): this;

}
