import { TempNode } from '../core/TempNode';
import { NodeBuilder } from '../core/NodeBuilder';

export class SubSlots extends TempNode {

	constructor( slots?: object );

	slots: Node[];

	copy( source: SubSlots ): this;

}
