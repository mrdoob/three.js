import TempNode from '../core/TempNode.js';
import { mix } from '../math/MathNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, tslFn, nodeObject, nodeProxy, vec4 } from '../shadernode/ShaderNode.js';

import { LinearSRGBColorSpace, SRGBColorSpace } from 'three';

const sRGBToLinearShader = tslFn( ( inputs ) => {

	const { value } = inputs;
	const { rgb } = value;

	const a = rgb.mul( 0.9478672986 ).add( 0.0521327014 ).pow( 2.4 );
	const b = rgb.mul( 0.0773993808 );
	const factor = rgb.lessThanEqual( 0.04045 );

	const rgbResult = mix( a, b, factor );

	return vec4( rgbResult, value.a );

} );

const LinearTosRGBShader = tslFn( ( inputs ) => {

	const { value } = inputs;
	const { rgb } = value;

	const a = rgb.pow( 0.41666 ).mul( 1.055 ).sub( 0.055 );
	const b = rgb.mul( 12.92 );
	const factor = rgb.lessThanEqual( 0.0031308 );

	const rgbResult = mix( a, b, factor );

	return vec4( rgbResult, value.a );

} );

const getColorSpaceMethod = ( colorSpace ) => {

	let method = null;

	if ( colorSpace === LinearSRGBColorSpace ) {

		method = 'Linear';

	} else if ( colorSpace === SRGBColorSpace ) {

		method = 'sRGB';

	}

	return method;

};

const getMethod = ( source, target ) => {

	return getColorSpaceMethod( source ) + 'To' + getColorSpaceMethod( target );

};

class ColorSpaceNode extends TempNode {

	constructor( method, node ) {

		super( 'vec4' );

		this.method = method;
		this.node = node;

	}

	construct() {

		const { method, node } = this;

		if ( method === ColorSpaceNode.LINEAR_TO_LINEAR )
			return node;

		return Methods[ method ]( { value: node } );

	}

}

ColorSpaceNode.LINEAR_TO_LINEAR = 'LinearToLinear';
ColorSpaceNode.LINEAR_TO_sRGB = 'LinearTosRGB';
ColorSpaceNode.sRGB_TO_LINEAR = 'sRGBToLinear';

const Methods = {
	[ ColorSpaceNode.LINEAR_TO_sRGB ]: LinearTosRGBShader,
	[ ColorSpaceNode.sRGB_TO_LINEAR ]: sRGBToLinearShader
};

export default ColorSpaceNode;

export const linearToColorSpace = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( getMethod( LinearSRGBColorSpace, colorSpace ), nodeObject( node ) ) );
export const colorSpaceToLinear = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( getMethod( colorSpace, LinearSRGBColorSpace ), nodeObject( node ) ) );

export const linearTosRGB = nodeProxy( ColorSpaceNode, ColorSpaceNode.LINEAR_TO_sRGB );
export const sRGBToLinear = nodeProxy( ColorSpaceNode, ColorSpaceNode.sRGB_TO_LINEAR );

addNodeElement( 'linearTosRGB', linearTosRGB );
addNodeElement( 'sRGBToLinear', sRGBToLinear );
addNodeElement( 'linearToColorSpace', linearToColorSpace );
addNodeElement( 'colorSpaceToLinear', colorSpaceToLinear );

addNodeClass( ColorSpaceNode );
