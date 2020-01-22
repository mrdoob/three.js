import { InputNode } from '../core/InputNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class IntNode extends InputNode {

	constructor( value?: number );

	value: number;
	nodeType: string;

	generateReadonly( builder: NodeBuilder, output: string, uuid?: string, type?: string, ns?: string, needsUpdate?: boolean ): string;
	copy( source: IntNode ): this;

}
