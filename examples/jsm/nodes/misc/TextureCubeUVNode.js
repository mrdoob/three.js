/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { ConstNode } from '../core/ConstNode.js';
import { StructNode } from '../core/StructNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { FunctionCallNode } from '../core/FunctionCallNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { OperatorNode } from '../math/OperatorNode.js';
import { MathNode } from '../math/MathNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';

function TextureCubeUVNode( value, uv, bias ) {

	TempNode.call( this, 'v4' );

	this.value = value,
	this.uv = uv;
	this.bias = bias;

}

TextureCubeUVNode.Nodes = ( function () {

	var TextureCubeUVData = new StructNode(
		`struct TextureCubeUVData {
			vec4 tl;
			vec4 tr;
			vec4 br;
			vec4 bl;
			vec2 f;
		}` );

	var cubeUV_maxMipLevel = new ConstNode( `float cubeUV_maxMipLevel 8.0`, true );
	var cubeUV_minMipLevel = new ConstNode( `float cubeUV_minMipLevel 4.0`, true );
	var cubeUV_maxTileSize = new ConstNode( `float cubeUV_maxTileSize 256.0`, true );
	var cubeUV_minTileSize = new ConstNode( `float cubeUV_minTileSize 16.0`, true );

	// These shader functions convert between the UV coordinates of a single face of
	// a cubemap, the 0-5 integer index of a cube face, and the direction vector for
	// sampling a textureCube (not generally normalized).

	var getFace = new FunctionNode(
		`float getFace(vec3 direction) {
				vec3 absDirection = abs(direction);
				float face = -1.0;
				if (absDirection.x > absDirection.z) {
					if (absDirection.x > absDirection.y)
						face = direction.x > 0.0 ? 0.0 : 3.0;
					else
						face = direction.y > 0.0 ? 1.0 : 4.0;
				} else {
					if (absDirection.z > absDirection.y)
						face = direction.z > 0.0 ? 2.0 : 5.0;
					else
						face = direction.y > 0.0 ? 1.0 : 4.0;
				}
				return face;
		}` );
	getFace.useKeywords = false;

	var getUV = new FunctionNode(
		`vec2 getUV(vec3 direction, float face) {
				vec2 uv;
				if (face == 0.0) {
					uv = vec2(-direction.z, direction.y) / abs(direction.x);
				} else if (face == 1.0) {
					uv = vec2(direction.x, -direction.z) / abs(direction.y);
				} else if (face == 2.0) {
					uv = direction.xy / abs(direction.z);
				} else if (face == 3.0) {
					uv = vec2(direction.z, direction.y) / abs(direction.x);
				} else if (face == 4.0) {
					uv = direction.xz / abs(direction.y);
				} else {
					uv = vec2(-direction.x, direction.y) / abs(direction.z);
				}
				return 0.5 * (uv + 1.0);
		}` );
	getUV.useKeywords = false;

	var bilinearCubeUV = new FunctionNode(
		`TextureCubeUVData bilinearCubeUV(sampler2D envMap, vec3 direction, float mipInt) {
			float face = getFace(direction);
			float filterInt = max(cubeUV_minMipLevel - mipInt, 0.0);
			mipInt = max(mipInt, cubeUV_minMipLevel);
			float faceSize = exp2(mipInt);
			float texelSize = 1.0 / (3.0 * cubeUV_maxTileSize);
			vec2 uv = getUV(direction, face) * (faceSize - 1.0);
			vec2 f = fract(uv);
			uv += 0.5 - f;
			if (face > 2.0) {
				uv.y += faceSize;
				face -= 3.0;
			}
			uv.x += face * faceSize;
			if(mipInt < cubeUV_maxMipLevel){
				uv.y += 2.0 * cubeUV_maxTileSize;
			}
			uv.y += filterInt * 2.0 * cubeUV_minTileSize;
			uv.x += 3.0 * max(0.0, cubeUV_maxTileSize - 2.0 * faceSize);
			uv *= texelSize;
			vec4 tl = texture2D(envMap, uv);
			uv.x += texelSize;
			vec4 tr = texture2D(envMap, uv);
			uv.y += texelSize;
			vec4 br = texture2D(envMap, uv);
			uv.x -= texelSize;
			vec4 bl = texture2D(envMap, uv);

			return TextureCubeUVData( tl, tr, br, bl, f );
		}`, [ TextureCubeUVData, getFace, getUV, cubeUV_maxMipLevel, cubeUV_minMipLevel, cubeUV_maxTileSize, cubeUV_minTileSize ] );
	bilinearCubeUV.useKeywords = false;

	// These defines must match with PMREMGenerator

	var r0 = new ConstNode( `float r0 1.0`, true );
	var v0 = new ConstNode( `float v0 0.339`, true );
	var m0 = new ConstNode( `float m0 -2.0`, true );
	var r1 = new ConstNode( `float r1 0.8`, true );
	var v1 = new ConstNode( `float v1 0.276`, true );
	var m1 = new ConstNode( `float m1 -1.0`, true );
	var r4 = new ConstNode( `float r4 0.4`, true );
	var v4 = new ConstNode( `float v4 0.046`, true );
	var m4 = new ConstNode( `float m4 2.0`, true );
	var r5 = new ConstNode( `float r5 0.305`, true );
	var v5 = new ConstNode( `float v5 0.016`, true );
	var m5 = new ConstNode( `float m5 3.0`, true );
	var r6 = new ConstNode( `float r6 0.21`, true );
	var v6 = new ConstNode( `float v6 0.0038`, true );
	var m6 = new ConstNode( `float m6 4.0`, true );

	var defines = [ r0, v0, m0, r1, v1, m1, r4, v4, m4, r5, v5, m5, r6, v6, m6 ];

	var roughnessToMip = new FunctionNode(
		`float roughnessToMip(float roughness) {
			float mip = 0.0;
			if (roughness >= r1) {
				mip = (r0 - roughness) * (m1 - m0) / (r0 - r1) + m0;
			} else if (roughness >= r4) {
				mip = (r1 - roughness) * (m4 - m1) / (r1 - r4) + m1;
			} else if (roughness >= r5) {
				mip = (r4 - roughness) * (m5 - m4) / (r4 - r5) + m4;
			} else if (roughness >= r6) {
				mip = (r5 - roughness) * (m6 - m5) / (r5 - r6) + m5;
			} else {
				mip = -2.0 * log2(1.16 * roughness);// 1.16 = 1.79^0.25
			}
			return mip;
		}`, defines );

	return {
		bilinearCubeUV: bilinearCubeUV,
		roughnessToMip: roughnessToMip,
		m0: m0,
		cubeUV_maxMipLevel: cubeUV_maxMipLevel
	};

} )();

TextureCubeUVNode.prototype = Object.create( TempNode.prototype );
TextureCubeUVNode.prototype.constructor = TextureCubeUVNode;
TextureCubeUVNode.prototype.nodeType = "TextureCubeUV";

TextureCubeUVNode.prototype.bilinearCubeUV = function ( builder, texture, uv, mipInt ) {

	var bilinearCubeUV = new FunctionCallNode( TextureCubeUVNode.Nodes.bilinearCubeUV, [ texture, uv, mipInt ] );

	this.colorSpaceTL = this.colorSpaceTL || new ColorSpaceNode( new ExpressionNode( '', 'v4' ) );
	this.colorSpaceTL.fromDecoding( builder.getTextureEncodingFromMap( this.value.value ) );
	this.colorSpaceTL.input.parse( bilinearCubeUV.build( builder ) + '.tl' );

	this.colorSpaceTR = this.colorSpaceTR || new ColorSpaceNode( new ExpressionNode( '', 'v4' ) );
	this.colorSpaceTR.fromDecoding( builder.getTextureEncodingFromMap( this.value.value ) );
	this.colorSpaceTR.input.parse( bilinearCubeUV.build( builder ) + '.tr' );

	this.colorSpaceBL = this.colorSpaceBL || new ColorSpaceNode( new ExpressionNode( '', 'v4' ) );
	this.colorSpaceBL.fromDecoding( builder.getTextureEncodingFromMap( this.value.value ) );
	this.colorSpaceBL.input.parse( bilinearCubeUV.build( builder ) + '.bl' );

	this.colorSpaceBR = this.colorSpaceBR || new ColorSpaceNode( new ExpressionNode( '', 'v4' ) );
	this.colorSpaceBR.fromDecoding( builder.getTextureEncodingFromMap( this.value.value ) );
	this.colorSpaceBR.input.parse( bilinearCubeUV.build( builder ) + '.br' );

	// add a custom context for fix incompatibility with the core
	// include ColorSpace function only for vertex shader (in fragment shader color space functions is added automatically by core)
	// this should be removed in the future
	// context.include =: is used to include or not functions if used FunctionNode
	// context.ignoreCache =: not create temp variables nodeT0..9 to optimize the code
	var context = { include: builder.isShader( 'vertex' ), ignoreCache: true };

	builder.addContext( context );

	this.colorSpaceTLExp = new ExpressionNode( this.colorSpaceTL.build( builder, 'v4' ), 'v4' );
	this.colorSpaceTRExp = new ExpressionNode( this.colorSpaceTR.build( builder, 'v4' ), 'v4' );
	this.colorSpaceBLExp = new ExpressionNode( this.colorSpaceBL.build( builder, 'v4' ), 'v4' );
	this.colorSpaceBRExp = new ExpressionNode( this.colorSpaceBR.build( builder, 'v4' ), 'v4' );

	// end custom context

	builder.removeContext();

	// --

	var output = new ExpressionNode( `mix( mix( cubeUV_TL, cubeUV_TR, cubeUV.f.x ), mix( cubeUV_BL, cubeUV_BR, cubeUV.f.x ), cubeUV.f.y )`, 'v4' );
	output.keywords[ 'cubeUV_TL' ] = this.colorSpaceTLExp;
	output.keywords[ 'cubeUV_TR' ] = this.colorSpaceTRExp;
	output.keywords[ 'cubeUV_BL' ] = this.colorSpaceBLExp;
	output.keywords[ 'cubeUV_BR' ] = this.colorSpaceBRExp;
	output.keywords[ 'cubeUV' ] = bilinearCubeUV;

	return output;

};

TextureCubeUVNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		var uv = this.uv;
		var bias = this.bias || builder.context.roughness;

		var mipV = new FunctionCallNode( TextureCubeUVNode.Nodes.roughnessToMip, [ bias ] );
		var mip = new MathNode( mipV, TextureCubeUVNode.Nodes.m0, TextureCubeUVNode.Nodes.cubeUV_maxMipLevel, MathNode.CLAMP );
		var mipInt	= new MathNode( mip, MathNode.FLOOR );
		var mipF	= new MathNode( mip, MathNode.FRACT );

		var color0 = this.bilinearCubeUV( builder, this.value, uv, mipInt );
		var color1 = this.bilinearCubeUV( builder, this.value, uv, new OperatorNode(
			mipInt,
			new FloatNode( 1 ).setReadonly( true ),
			OperatorNode.ADD
		) );

		var color1Mix = new MathNode( color0, color1, mipF, MathNode.MIX );

		/*
		// TODO: Optimize this in the future
		var cond = new CondNode(
			mipF,
			new FloatNode( 0 ).setReadonly( true ),
			CondNode.EQUAL,
			color0, // if
			color1Mix	// else
		);
		*/

		return builder.format( color1Mix.build( builder ), 'v4', output );

	} else {

		console.warn( "THREE.TextureCubeUVNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec4( 0.0 )', this.getType( builder ), output );

	}

};

TextureCubeUVNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;
		data.uv = this.uv.toJSON( meta ).uuid;
		data.bias = this.bias.toJSON( meta ).uuid;

	}

	return data;

};

export { TextureCubeUVNode };
