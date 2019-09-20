import { Vector2 } from '../../../../src/Three';

import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { NodeFrame } from '../core/NodeFrame';
import { UVNode } from '../accessors/UVNode';
import { Vector2Node } from '../inputs/Vector2Node';
import { FloatNode } from '../inputs/FloatNode';
import { FunctionNode } from '../core/FunctionNode';
import { TextureNode } from '../inputs/TextureNode';

export class BlurNode extends TempNode {

	constructor( value: TextureNode, uv?: UVNode, radius?: number, size?: Vector2 );

	value: TextureNode;
	uv: UVNode;
	radius: Vector2Node;
	size: Vector2;
	blurX: boolean;
	blurY: boolean;
	horizontal: FloatNode;
	vertical: FloatNode;
	nodeType: string;

	updateFrame( frame: NodeFrame ): void;
	generate( builder: NodeBuilder, output: string ): string;
	copy( source: BlurNode ): this;

	static Nodes: {
		blurX: FunctionNode;
		blurY: FunctionNode;
	}

}
