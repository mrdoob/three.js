import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { FunctionNode } from '../core/FunctionNode';
import { UVNode } from '../accessors/UVNode';
import { UVTransformNode } from '../utils/UVTransformNode';

export class NoiseNode extends TempNode {

	constructor( uv?: UVNode | UVTransformNode );

	uv: UVNode | UVTransformNode;
	nodeType: string;

	generate( builder: NodeBuilder, output: string ): string;
	copy( source: NoiseNode ): this;

	static Nodes: {
		snoise: FunctionNode;
	};

}
