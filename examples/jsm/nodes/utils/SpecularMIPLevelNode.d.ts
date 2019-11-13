import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';
import { MaxMIPLevelNode } from '../utils/MaxMIPLevelNode';
import { FunctionNode } from '../core/FunctionNode';

export class SpecularMIPLevelNode extends TempNode {

	constructor( texture: Node );

	texture: Node;
	maxMIPLevel: MaxMIPLevelNode;
	nodeType: string;

	generate( builder: NodeBuilder, output: string ): string;
	copy( source: SpecularMIPLevelNode ): this;

	static Nodes: {
		getSpecularMIPLevel: FunctionNode;
	};

}
