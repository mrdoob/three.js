import { TempNode } from '../core/TempNode';
import { FunctionNode } from '../core/FunctionNode';
import { ConstNode } from '../core/ConstNode';
import { Node } from '../core/Node';

export class LuminanceNode extends TempNode {

	constructor( rgb: Node );

	rgb: Node;
	nodeType: string;

	copy( source: LuminanceNode ): this;

	static Nodes: {
		LUMA: ConstNode;
		luminance: FunctionNode;
	}

}
