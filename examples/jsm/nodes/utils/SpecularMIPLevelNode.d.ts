import { TempNode } from '../core/TempNode';
import { MaxMIPLevelNode } from '../utils/MaxMIPLevelNode';
import { FunctionNode } from '../core/FunctionNode';

export class SpecularMIPLevelNode extends TempNode {

	constructor( texture: Node );

	texture: Node;
	maxMIPLevel: MaxMIPLevelNode;
	nodeType: string;

	copy( source: SpecularMIPLevelNode ): this;

	static Nodes: {
		getSpecularMIPLevel: FunctionNode;
	};

}
