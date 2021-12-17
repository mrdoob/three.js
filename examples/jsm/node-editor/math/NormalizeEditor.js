import { ObjectNode, LabelElement } from '../../libs/flow.module.js';
import { MathNode, Vector3Node } from '../../renderers/nodes/Nodes.js';

const DEFAULT_VALUE = new Vector3Node();

export class NormalizeEditor extends ObjectNode {

	constructor() {

		const node = new MathNode( MathNode.NORMALIZE, DEFAULT_VALUE );

		super( 'Normalize', 3, node, 200 );

		const input = new LabelElement( 'Source' ).setInput( 3 );

		input.onConnect( () => {

			node.aNode = input.linkedExtra || DEFAULT_VALUE;

		} );

		this.add( input );

	}

}
