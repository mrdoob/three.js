import TempNode from '../core/Node.js';
import { ShaderNode, vec3, pow, mul, sub, mix, vec4, lessThanEqual } from '../shadernode/ShaderNodeBaseElements.js';

import { LinearEncoding, sRGBEncoding } from 'three';

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

	return vec4( rgbResult, value.a );

} );

const EncodingLib = {
	LinearToLinear,
	LinearTosRGB
};

class ColorSpaceNode extends TempNode {

	static LINEAR_TO_LINEAR = 'LinearToLinear';
	static LINEAR_TO_SRGB = 'LinearTosRGB';

	constructor( method, node ) {

		super( 'vec4' );

		this.method = method;

		this.node = node;

	}

	fromEncoding( encoding ) {

		let method = null;

		if ( encoding === LinearEncoding ) {

			method = 'Linear';

		} else if ( encoding === sRGBEncoding ) {

			method = 'sRGB';

		}

		this.method = 'LinearTo' + method;

		return this;

	}

	construct() {

		const method = this.method;
		const node = this.node;

		let outputNode = null;

		if ( method !== ColorSpaceNode.LINEAR_TO_LINEAR ) {

			const encodingFunctionNode = EncodingLib[ method ];

			outputNode = encodingFunctionNode.call( {
				value: node
			} );

		} else {

			outputNode = node;

		}

		return outputNode;

	}

}

export default ColorSpaceNode;
