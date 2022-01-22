import { LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { MathNode, Vector3Node } from '../../renderers/nodes/Nodes.js';

const DEFAULT_VALUE = new Vector3Node();

export class NormalizeEditor extends BaseNode {

	constructor() {

		const node = new MathNode( MathNode.NORMALIZE, DEFAULT_VALUE );

		super( 'Normalize', 3, node, 175 );

		const input = new LabelElement( 'A' ).setInput( 3 );

		input.onConnect( () => {

			node.aNode = input.getLinkedObject() || DEFAULT_VALUE;

		} );

		this.add( input );

	}

}
