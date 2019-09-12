/**
 * @author sunag / http://www.sunag.com.br/
 */

import {
	GammaEncoding,
	LinearEncoding,
	RGBEEncoding,
	RGBM7Encoding,
	RGBM16Encoding,
	RGBDEncoding,
	sRGBEncoding,
	ShaderChunk,
} from '../../../../build/three.module.js';

import { TempNode } from '../core/TempNode.js';
import { ConstNode } from '../core/ConstNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';
import { GLSLParser } from '../core/GLSLParser.js';

var encodings_pars_fragment;

export class ColorSpaceNode extends TempNode {

	constructor( method, input ) {

		super( 'v4' );

		this.method = method || ColorSpaceNode.LINEAR_TO_LINEAR;
		this.input = input;

		this.nodeType = "ColorSpace";

	}

	generate( builder, output ) {

		var input = this.input.build( builder, 'v4' );
		var outputType = this.getType( builder );

		if ( this.method === ColorSpaceNode.LINEAR_TO_LINEAR ) {

			return builder.format( input, outputType, output );

		} else {

			encodings_pars_fragment = encodings_pars_fragment || new GLSLParser( ShaderChunk['encodings_pars_fragment'] );

			var methodNode = encodings_pars_fragment.getNodeByName( this.method );
			var method = builder.include( methodNode );

			if ( methodNode.inputs.length === 2 ) {

				var factor = this.factor.build( builder, 'f' );

				return builder.format( method + '( ' + input + ', ' + factor + ' )', outputType, output );

			} else {

				return builder.format( method + '( ' + input + ' )', outputType, output );

			}

		}

	}

	fromEncoding( encoding ) {

		var components = ColorSpaceNode.getEncodingComponents( encoding );

		this.method = 'LinearTo' + components[ 0 ];
		this.factor = components[ 1 ];

	}

	fromDecoding( encoding ) {

		var components = ColorSpaceNode.getEncodingComponents( encoding );

		this.method = components[ 0 ] + 'ToLinear';
		this.factor = components[ 1 ];

	}

	copy( source ) {

		super.copy( source );

		this.method = source.method;
		this.input = source.input;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.method = this.method;
			data.input = this.input.toJSON( meta ).uuid;

		}

		return data;

	}

}

ColorSpaceNode.getEncodingComponents = function ( encoding ) {

	switch ( encoding ) {

		case LinearEncoding:
			return [ 'Linear' ];
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
			return [ 'Gamma', new ExpressionNode( 'float( GAMMA_FACTOR )', 'f' ) ];

	}

}

ColorSpaceNode.LINEAR_TO_LINEAR = 'LinearToLinear';

ColorSpaceNode.GAMMA_TO_LINEAR = 'GammaToLinear';
ColorSpaceNode.LINEAR_TO_GAMMA = 'LinearToGamma';

ColorSpaceNode.SRGB_TO_LINEAR = 'sRGBToLinear';
ColorSpaceNode.LINEAR_TO_SRGB = 'LinearTosRGB';

ColorSpaceNode.RGBE_TO_LINEAR = 'RGBEToLinear';
ColorSpaceNode.LINEAR_TO_RGBE = 'LinearToRGBE';

ColorSpaceNode.RGBM_TO_LINEAR = 'RGBMToLinear';
ColorSpaceNode.LINEAR_TO_RGBM = 'LinearToRGBM';

ColorSpaceNode.RGBD_TO_LINEAR = 'RGBDToLinear';
ColorSpaceNode.LINEAR_TO_RGBD = 'LinearToRGBD';

ColorSpaceNode.LINEAR_TO_LOG_LUV = 'LinearToLogLuv';
ColorSpaceNode.LOG_LUV_TO_LINEAR = 'LogLuvToLinear';
