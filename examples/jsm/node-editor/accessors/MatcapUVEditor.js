import { BaseNode } from '../core/BaseNode.js';
import { MatcapUVNode } from 'three-nodes/Nodes.js';

export class MatcapUVEditor extends BaseNode {

	constructor() {

		const node = new MatcapUVNode();

		super( 'Matcap UV', 2, node, 200 );

	}

}
