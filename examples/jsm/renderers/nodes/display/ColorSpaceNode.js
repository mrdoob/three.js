import TempNode from '../core/Node.js';
import { ShaderNode } from '../ShaderNode.js';

import { LinearEncoding/*,
	sRGBEncoding, RGBEEncoding, RGBM7Encoding, RGBM16Encoding,
	RGBDEncoding, GammaEncoding, LogLuvEncoding*/ } from 'three';

export const LinearToLinear = new ShaderNode( ( inputs ) => {

	return inputs.value;

} );

function getEncodingComponents ( encoding ) {

	switch ( encoding ) {

		case LinearEncoding:
			return [ 'Linear' ];
/*
		case sRGBEncoding:
			return [ 'sRGB' ];
		case RGBEEncoding:
			return [ 'RGBE' ];
		case RGBM7Encoding:
			return [ 'RGBM', new FloatNode( 7.0 ).setConst( true ) ];
		case RGBM16Encoding:
			return [ 'RGBM', new FloatNode( 16.0 ).setConst( true ) ];
		case RGBDEncoding:
			return [ 'RGBD', new FloatNode( 256.0 ).setConst( true ) ];
		case GammaEncoding:
			return [ 'Gamma', new CodeNode( 'float( GAMMA_FACTOR )' ) ];
		case LogLuvEncoding:
			return [ 'LogLuv' ];
*/
	}

}

class ColorSpaceNode extends TempNode {

	static LINEAR_TO_LINEAR = 'LinearToLinear';
/*
	static GAMMA_TO_LINEAR = 'GammaToLinear';
	static LINEAR_TO_GAMMA = 'LinearToGamma';

	static SRGB_TO_LINEAR = 'sRGBToLinear';
	static LINEAR_TO_SRGB = 'LinearTosRGB';

	static RGBE_TO_LINEAR = 'RGBEToLinear';
	static LINEAR_TO_RGBE = 'LinearToRGBE';

	static RGBM_TO_LINEAR = 'RGBMToLinear';
	static LINEAR_TO_RGBM = 'LinearToRGBM';

	static RGBD_TO_LINEAR = 'RGBDToLinear';
	static LINEAR_TO_RGBD = 'LinearToRGBD';

	static LINEAR_TO_LOG_LUV = 'LinearToLogLuv';
	static LOG_LUV_TO_LINEAR = 'LogLuvToLinear';
*/
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

	fromDecoding( encoding ) {

		const components = getEncodingComponents( encoding );

		this.method = components[ 0 ] + 'ToLinear';
		this.factor = components[ 1 ];

		return this;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );

		const method = this.method;
		const node = this.node;

		if ( method !== ColorSpaceNode.LINEAR_TO_LINEAR ) {

			// disable for now color space
			const encodingFunctionNode = LinearToLinear;
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
