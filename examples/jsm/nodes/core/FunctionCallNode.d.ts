import { Node } from './Node';
import { FunctionNode } from './FunctionNode';
import { TempNode } from './TempNode';
import { NodeBuilder } from './NodeBuilder';

export class FunctionCallNode extends TempNode {

	constructor( func: FunctionNode, inputs?: Node[] );

	nodeType: string;

	value: FunctionNode;
	inputs: Node[];

	setFunction( func: FunctionNode, inputs?: Node[] ): void;
	getFunction(): FunctionNode;
	getType(): string;
	generate( builder: NodeBuilder, output: string ): string;
	copy( source: FunctionCallNode ): this;

}
