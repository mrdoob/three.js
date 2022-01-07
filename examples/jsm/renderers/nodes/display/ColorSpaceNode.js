import TempNode from '../core/Node.js';
import { ShaderNode,
	vec3,
	pow, mul, sub, mix, join,
	lessThanEqual } from '../ShaderNode.js';

import { LinearEncoding, sRGBEncoding } from '../../../../../build/three.module.js';

export const LinearToLinear = new ShaderNode( ( inputs ) => {

	return inputs.value;

} );

export const LinearTosRGB = new ShaderNode( ( inputs ) => {

	const { value } = inputs;

	const rgb = value.rgb;

	const a = sub( mul( pow( value.rgb, vec3( 0.41666 ) ), 1.055 ), vec3( 0.055 ) );
	const b = mul( rgb, 12.92 );
	const factor = vec3( lessThanEqual( rgb, vec3( 0.0031308 ) ) );

	const rgbResult = mix( a, b, factor );

	return join( rgbResult.r, rgbResult.g, rgbResult.b, value.a );

} );

const EncodingLib = {
	LinearToLinear,
	LinearTosRGB
};

function getEncodingComponents( encoding ) {

	switch ( encoding ) {

		case LinearEncoding:
			return [ 'Linear' ];
		case sRGBEncoding:
			return [ 'sRGB' ];

	}

}

class ColorSpaceNode extends TempNode {

	static LINEAR_TO_LINEAR = 'LinearToLinear';
	static LINEAR_TO_SRGB = 'LinearTosRGB';

	constructor( method, node ) {

		super( 'vec4' );

		this.method = method;

		this.node = node;
		this.factor = null;

	}

	fromEncoding( encoding ) {

		const components = getEncodingComponents( encoding );

		this.method = 'LinearTo' + components[ 0 ];
		this.factor = components[ 1 ];

		return this;

	}

	fromDecoding() {

		// TODO: Remove fromDecoding()

		const components = getEncodingComponents( LinearEncoding );

		this.method = components[ 0 ] + 'ToLinear';
		this.factor = components[ 1 ];

		return this;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );

		const method = this.method;
		const node = this.node;

		if ( method !== ColorSpaceNode.LINEAR_TO_LINEAR ) {

			const encodingFunctionNode = EncodingLib[ method ];
			const factor = this.factor;

			return encodingFunctionNode( {
				value: node,
				factor
			} ).build( builder, type );

		} else {

			return node.build( builder, type );

		}

	}

}

export default ColorSpaceNode;
