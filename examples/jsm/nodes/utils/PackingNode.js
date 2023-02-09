import TempNode from '../core/TempNode.js';
import { mul } from '../shadernode/ShaderNodeBaseElements.js';

class PackingNode extends TempNode {

	constructor( scope, node ) {

		super();

		this.scope = scope;
		this.node = node;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	construct() {

		const { scope, node } = this;

		let result = null;

		if ( scope === PackingNode.DIRECTION_TO_COLOR ) {

			result = mul( node, 0.5 ).add( 0.5 );

		} else if ( scope === PackingNode.COLOR_TO_DIRECTION ) {

			result = mul( node, 2.0 ).sub( 1 );

		}

		return result;

	}

}

PackingNode.DIRECTION_TO_COLOR = 'directionToColor';
PackingNode.COLOR_TO_DIRECTION = 'colorToDirection';

export default PackingNode;
