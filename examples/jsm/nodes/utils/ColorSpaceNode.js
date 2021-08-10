import {
	GammaEncoding,
	LinearEncoding,
	RGBEEncoding,
	RGBM7Encoding,
	RGBM16Encoding,
	RGBDEncoding,
	sRGBEncoding
} from '../../../../build/three.module.js';

import { TempNode } from '../core/TempNode.js';
import { ConstNode } from '../core/ConstNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';

class ColorSpaceNode extends TempNode {

	constructor( input, method ) {

		super( 'v4' );

		this.input = input;

		this.method = method || ColorSpaceNode.LINEAR_TO_LINEAR;

	}

	generate( builder, output ) {

		const input = this.input.build( builder, 'v4' );
		const outputType = this.getType( builder );

		const methodNode = ColorSpaceNode.Nodes[ this.method ];
		const method = builder.include( methodNode );

		if ( method === ColorSpaceNode.LINEAR_TO_LINEAR ) {

			return builder.format( input, outputType, output );

		} else {

			if ( methodNode.inputs.length === 2 ) {

				const factor = this.factor.build( builder, 'f' );

				return builder.format( method + '( ' + input + ', ' + factor + ' )', outputType, output );

			} else {

				return builder.format( method + '( ' + input + ' )', outputType, output );

			}

		}

	}

	fromEncoding( encoding ) {

		const components = ColorSpaceNode.getEncodingComponents( encoding );

		this.method = 'LinearTo' + components[ 0 ];
		this.factor = components[ 1 ];

	}

	fromDecoding( encoding ) {

		const components = ColorSpaceNode.getEncodingComponents( encoding );

		this.method = components[ 0 ] + 'ToLinear';
		this.factor = components[ 1 ];

	}

	copy( source ) {

		super.copy( source );

		this.input = source.input;
		this.method = source.method;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.input = this.input.toJSON( meta ).uuid;
			data.method = this.method;

		}

		return data;

	}

}

ColorSpaceNode.Nodes = ( function () {

	// For a discussion of what this is, please read this: http://lousodrome.net/blog/light/2013/05/26/gamma-correct-and-hdr-rendering-in-a-32-bits-buffer/

	const LinearToLinear = new FunctionNode( /* glsl */`
		vec4 LinearToLinear( in vec4 value ) {

			return value;

		}`
	);

	const GammaToLinear = new FunctionNode( /* glsl */`
		vec4 GammaToLinear( in vec4 value, in float gammaFactor ) {

			return vec4( pow( value.xyz, vec3( gammaFactor ) ), value.w );

		}`
	);

	const LinearToGamma = new FunctionNode( /* glsl */`
		vec4 LinearToGamma( in vec4 value, in float gammaFactor ) {

			return vec4( pow( value.xyz, vec3( 1.0 / gammaFactor ) ), value.w );

		}`
	);

	const sRGBToLinear = new FunctionNode( /* glsl */`
		vec4 sRGBToLinear( in vec4 value ) {

			return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );

		}`
	);

	const LinearTosRGB = new FunctionNode( /* glsl */`
		vec4 LinearTosRGB( in vec4 value ) {

			return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );

		}`
	);

	const RGBEToLinear = new FunctionNode( /* glsl */`
		vec4 RGBEToLinear( in vec4 value ) {

			return vec4( value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );

		}`
	);

	const LinearToRGBE = new FunctionNode( /* glsl */`
		vec4 LinearToRGBE( in vec4 value ) {

			float maxComponent = max( max( value.r, value.g ), value.b );
			float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );
			return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );

		}`
	);

	// reference: http://iwasbeingirony.blogspot.ca/2010/06/difference-between-rgbm-and-rgbd.html

	const RGBMToLinear = new FunctionNode( /* glsl */`
		vec3 RGBMToLinear( in vec4 value, in float maxRange ) {

			return vec4( value.xyz * value.w * maxRange, 1.0 );

		}`
	);

	const LinearToRGBM = new FunctionNode( /* glsl */`
		vec3 LinearToRGBM( in vec4 value, in float maxRange ) {

			float maxRGB = max( value.x, max( value.g, value.b ) );
			float M      = clamp( maxRGB / maxRange, 0.0, 1.0 );
			M            = ceil( M * 255.0 ) / 255.0;
			return vec4( value.rgb / ( M * maxRange ), M );

		}`
	);

	// reference: http://iwasbeingirony.blogspot.ca/2010/06/difference-between-rgbm-and-rgbd.html

	const RGBDToLinear = new FunctionNode( /* glsl */`
		vec3 RGBDToLinear( in vec4 value, in float maxRange ) {

			return vec4( value.rgb * ( ( maxRange / 255.0 ) / value.a ), 1.0 );

		}`
	);


	const LinearToRGBD = new FunctionNode( /* glsl */`
		vec3 LinearToRGBD( in vec4 value, in float maxRange ) {

			float maxRGB = max( value.x, max( value.g, value.b ) );
			float D      = max( maxRange / maxRGB, 1.0 );
			D            = clamp( floor( D ) / 255.0, 0.0, 1.0 );
			return vec4( value.rgb * ( D * ( 255.0 / maxRange ) ), D );

		}`
	);

	// LogLuv reference: http://graphicrants.blogspot.ca/2009/04/rgbm-color-encoding.html

	// M matrix, for encoding

	const cLogLuvM = new ConstNode( 'const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );' );

	const LinearToLogLuv = new FunctionNode( /* glsl */`
		vec4 LinearToLogLuv( in vec4 value ) {

			vec3 Xp_Y_XYZp = cLogLuvM * value.rgb;
			Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));
			vec4 vResult;
			vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;
			float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;
			vResult.w = fract(Le);
			vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;
			return vResult;

		}`
	, [ cLogLuvM ] );

	// Inverse M matrix, for decoding

	const cLogLuvInverseM = new ConstNode( 'const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );' );

	const LogLuvToLinear = new FunctionNode( /* glsl */`
		vec4 LogLuvToLinear( in vec4 value ) {

			float Le = value.z * 255.0 + value.w;
			vec3 Xp_Y_XYZp;
			Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);
			Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;
			Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;
			vec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;
			return vec4( max(vRGB, 0.0), 1.0 );

		}`
	, [ cLogLuvInverseM ] );

	return {
		LinearToLinear: LinearToLinear,
		GammaToLinear: GammaToLinear,
		LinearToGamma: LinearToGamma,
		sRGBToLinear: sRGBToLinear,
		LinearTosRGB: LinearTosRGB,
		RGBEToLinear: RGBEToLinear,
		LinearToRGBE: LinearToRGBE,
		RGBMToLinear: RGBMToLinear,
		LinearToRGBM: LinearToRGBM,
		RGBDToLinear: RGBDToLinear,
		LinearToRGBD: LinearToRGBD,
		cLogLuvM: cLogLuvM,
		LinearToLogLuv: LinearToLogLuv,
		cLogLuvInverseM: cLogLuvInverseM,
		LogLuvToLinear: LogLuvToLinear
	};

} )();

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

ColorSpaceNode.getEncodingComponents = function ( encoding ) {

	switch ( encoding ) {

		case LinearEncoding:
			return [ 'Linear' ];
		case sRGBEncoding:
			return [ 'sRGB' ];
		case RGBEEncoding:
			return [ 'RGBE' ];
		case RGBM7Encoding:
			return [ 'RGBM', new FloatNode( 7.0 ).setReadonly( true ) ];
		case RGBM16Encoding:
			return [ 'RGBM', new FloatNode( 16.0 ).setReadonly( true ) ];
		case RGBDEncoding:
			return [ 'RGBD', new FloatNode( 256.0 ).setReadonly( true ) ];
		case GammaEncoding:
			return [ 'Gamma', new ExpressionNode( 'float( GAMMA_FACTOR )', 'f' ) ];

	}

};

ColorSpaceNode.prototype.nodeType = 'ColorSpace';
ColorSpaceNode.prototype.hashProperties = [ 'method' ];

export { ColorSpaceNode };
