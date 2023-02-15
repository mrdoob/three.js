import TempNode from '../core/TempNode.js';
import { mix } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, ShaderNode, nodeObject, vec4 } from '../shadernode/ShaderNode.js';

import { LinearEncoding, sRGBEncoding } from 'three';

export const LinearToLinear = new ShaderNode( ( inputs ) => {

	return inputs.value;

} );

export const LinearTosRGB = new ShaderNode( ( inputs ) => {

	const { value } = inputs;
	const { rgb } = value;

	const a = rgb.pow( 0.41666 ).mul( 1.055 ).sub( 0.055 );
	const b = rgb.mul( 12.92 );
	const factor = rgb.lessThanEqual( 0.0031308 );

	const rgbResult = mix( a, b, factor );

	return vec4( rgbResult, value.a );

} );

const EncodingLib = {
	LinearToLinear,
	LinearTosRGB
};

class ColorSpaceNode extends TempNode {

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

		const { method, node } = this;

		return EncodingLib[ method ].call( { value: node } );

	}

}

ColorSpaceNode.LINEAR_TO_LINEAR = 'LinearToLinear';
ColorSpaceNode.LINEAR_TO_SRGB = 'LinearTosRGB';

export default ColorSpaceNode;

export const colorSpace = ( node, encoding ) => nodeObject( new ColorSpaceNode( null, nodeObject( node ) ).fromEncoding( encoding ) );

addNodeElement( 'colorSpace', colorSpace );

addNodeClass( ColorSpaceNode );
