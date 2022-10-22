import TempNode from '../core/TempNode.js';
import { vec2, vec3, negate, normalize, cross, dot, mul, add, transformedNormalView, positionViewDirection } from '../shadernode/ShaderNodeBaseElements.js';

class MatcapUVNode extends TempNode {

	constructor() {

		super( 'vec2' );

	}

	construct() {

		const x = normalize( vec3( positionViewDirection.z, 0, negate( positionViewDirection.x ) ) );
		const y = cross( positionViewDirection, x );

		return add( mul( vec2( dot( x, transformedNormalView ), dot( y, transformedNormalView ) ), 0.495 ), 0.5 );

	}

}

export default MatcapUVNode;
