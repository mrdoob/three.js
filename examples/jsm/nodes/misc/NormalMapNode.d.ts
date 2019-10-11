import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { FunctionNode } from '../core/FunctionNode';
import { TextureNode } from '../inputs/TextureNode';
import { Vector2Node } from '../inputs/Vector2Node';

export class NormalMapNode extends TempNode {

	constructor( value: TextureNode, scale?: Vector2Node );

	value: TextureNode;
	scale: Vector2Node;
	toNormalMap: boolean;
	nodeType: string;

	generate( builder: NodeBuilder, output: string ): string;
	copy( source: NormalMapNode ): this;

	static Nodes: {
		perturbNormal2Arb: FunctionNode;
	}

}
