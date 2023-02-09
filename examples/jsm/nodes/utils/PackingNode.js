import TempNode from '../core/TempNode.js';
import { normalize } from '../shadernode/ShaderNodeBaseElements.js';

class PackingNode extends TempNode {

	constructor( scope, node ) {

		super( 'vec3' );

		this.scope = scope;
		this.node = node;

	}

	construct() {

		const { scope, node } = this;

		let result = null;

		if ( scope === PackingNode.NORMAL_TO_RGB ) {

			result = normalize( node ).mul( 0.5 ).add( 0.5 );

		} else if ( scope === PackingNode.RGB_TO_NORMAL ) {

			result = node.mul( 2.0 ).sub( 1 );

		}

		return result;

	}

}

PackingNode.NORMAL_TO_RGB = 'normalToRGB';
PackingNode.RGB_TO_NORMAL = 'rgbToNormal';

export default PackingNode;
