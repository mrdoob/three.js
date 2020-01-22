import { TempNode } from '../core/TempNode';
import { FunctionNode } from '../core/FunctionNode';
import { UVNode } from '../accessors/UVNode';
import { UVTransformNode } from '../utils/UVTransformNode';

export class CheckerNode extends TempNode {

	constructor( uv?: UVNode | UVTransformNode );

	uv: UVNode | UVTransformNode;
	nodeType: string;

	copy( source: CheckerNode ): this;

	static Nodes: {
		checker: FunctionNode;
	};

}
