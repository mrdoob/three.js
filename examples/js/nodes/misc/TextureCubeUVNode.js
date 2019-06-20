/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { ConstNode } from '../core/ConstNode.js';
import { StructNode } from '../core/StructNode.js';
import { FunctionNode } from '../core/FunctionNode.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { FloatNode } from '../inputs/FloatNode.js';

function TextureCubeUVNode( uv, textureSize, blinnExponentToRoughness ) {

	TempNode.call( this, 'TextureCubeUVData' ); // TextureCubeUVData is type as StructNode

	this.uv = uv;
	this.textureSize = textureSize;
	this.blinnExponentToRoughness = blinnExponentToRoughness;

}

TextureCubeUVNode.Nodes = ( function () {

	var TextureCubeUVData = new StructNode( [
		"struct TextureCubeUVData {",
		"	vec2 uv_10;",
		"	vec2 uv_20;",
		"	float t;",
		"}"
	].join( "\n" ) );

	var getFaceFromDirection = new FunctionNode( [
		"int getFaceFromDirection(vec3 direction) {",
		"	vec3 absDirection = abs(direction);",
		"	int face = -1;",
		"	if( absDirection.x > absDirection.z ) {",
		"		if(absDirection.x > absDirection.y )",
		"			face = direction.x > 0.0 ? 0 : 3;",
		"		else",
		"			face = direction.y > 0.0 ? 1 : 4;",
		"	}",
		"	else {",
		"		if(absDirection.z > absDirection.y )",
		"			face = direction.z > 0.0 ? 2 : 5;",
		"		else",
		"			face = direction.y > 0.0 ? 1 : 4;",
		"	}",
		"	return face;",
		"}"
	].join( "\n" ) );

	var cubeUV_maxLods1 = new ConstNode( "#define cubeUV_maxLods1 ( log2( cubeUV_textureSize * 0.25 ) - 1.0 )" );
	var cubeUV_rangeClamp = new ConstNode( "#define cubeUV_rangeClamp ( exp2( ( 6.0 - 1.0 ) * 2.0 ) )" );

	var MipLevelInfo = new FunctionNode( [
		"vec2 MipLevelInfo( vec3 vec, float roughnessLevel, float roughness, in float cubeUV_textureSize ) {",
		"	float scale = exp2(cubeUV_maxLods1 - roughnessLevel);",
		"	float dxRoughness = dFdx(roughness);",
		"	float dyRoughness = dFdy(roughness);",
		"	vec3 dx = dFdx( vec * scale * dxRoughness );",
		"	vec3 dy = dFdy( vec * scale * dyRoughness );",
		"	float d = max( dot( dx, dx ), dot( dy, dy ) );",
		// Clamp the value to the max mip level counts. hard coded to 6 mips"
		"	d = clamp(d, 1.0, cubeUV_rangeClamp);",
		"	float mipLevel = 0.5 * log2(d);",
		"	return vec2(floor(mipLevel), fract(mipLevel));",
		"}"
	].join( "\n" ), [ cubeUV_maxLods1, cubeUV_rangeClamp ], { derivatives: true } );

	var cubeUV_maxLods2 = new ConstNode( "#define cubeUV_maxLods2 ( log2( cubeUV_textureSize * 0.25 ) - 2.0 )" );
	var cubeUV_rcpTextureSize = new ConstNode( "#define cubeUV_rcpTextureSize ( 1.0 / cubeUV_textureSize )" );

	var getCubeUV = new FunctionNode( [
		"vec2 getCubeUV( vec3 direction, float roughnessLevel, float mipLevel, in float cubeUV_textureSize ) {",
		"	mipLevel = roughnessLevel > cubeUV_maxLods2 - 3.0 ? 0.0 : mipLevel;",
		"	float a = 16.0 * cubeUV_rcpTextureSize;",
		"",
		"	vec2 exp2_packed = exp2( vec2( roughnessLevel, mipLevel ) );",
		"	vec2 rcp_exp2_packed = vec2( 1.0 ) / exp2_packed;",
		// float powScale = exp2(roughnessLevel + mipLevel);"
		"	float powScale = exp2_packed.x * exp2_packed.y;",
		// float scale =  1.0 / exp2(roughnessLevel + 2.0 + mipLevel);"
		"	float scale = rcp_exp2_packed.x * rcp_exp2_packed.y * 0.25;",
		// float mipOffset = 0.75*(1.0 - 1.0/exp2(mipLevel))/exp2(roughnessLevel);"
		"	float mipOffset = 0.75*(1.0 - rcp_exp2_packed.y) * rcp_exp2_packed.x;",
		"",
		"	bool bRes = mipLevel == 0.0;",
		"	scale =  bRes && (scale < a) ? a : scale;",
		"",
		"	vec3 r;",
		"	vec2 offset;",
		"	int face = getFaceFromDirection(direction);",
		"",
		"	float rcpPowScale = 1.0 / powScale;",
		"",
		"	if( face == 0) {",
		"		r = vec3(direction.x, -direction.z, direction.y);",
		"		offset = vec2(0.0+mipOffset,0.75 * rcpPowScale);",
		"		offset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;",
		"	}",
		"	else if( face == 1) {",
		"		r = vec3(direction.y, direction.x, direction.z);",
		"		offset = vec2(scale+mipOffset, 0.75 * rcpPowScale);",
		"		offset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;",
		"	}",
		"	else if( face == 2) {",
		"		r = vec3(direction.z, direction.x, direction.y);",
		"		offset = vec2(2.0*scale+mipOffset, 0.75 * rcpPowScale);",
		"		offset.y = bRes && (offset.y < 2.0*a) ? a : offset.y;",
		"	}",
		"	else if( face == 3) {",
		"		r = vec3(direction.x, direction.z, direction.y);",
		"		offset = vec2(0.0+mipOffset,0.5 * rcpPowScale);",
		"		offset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;",
		"	}",
		"	else if( face == 4) {",
		"		r = vec3(direction.y, direction.x, -direction.z);",
		"		offset = vec2(scale+mipOffset, 0.5 * rcpPowScale);",
		"		offset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;",
		"	}",
		"	else {",
		"		r = vec3(direction.z, -direction.x, direction.y);",
		"		offset = vec2(2.0*scale+mipOffset, 0.5 * rcpPowScale);",
		"		offset.y = bRes && (offset.y < 2.0*a) ? 0.0 : offset.y;",
		"	}",
		"	r = normalize(r);",
		"	float texelOffset = 0.5 * cubeUV_rcpTextureSize;",
		"	vec2 s = ( r.yz / abs( r.x ) + vec2( 1.0 ) ) * 0.5;",
		"	vec2 base = offset + vec2( texelOffset );",
		"	return base + s * ( scale - 2.0 * texelOffset );",
		"}"
	].join( "\n" ), [ cubeUV_maxLods2, cubeUV_rcpTextureSize, getFaceFromDirection ] );

	var cubeUV_maxLods3 = new ConstNode( "#define cubeUV_maxLods3 ( log2( cubeUV_textureSize * 0.25 ) - 3.0 )" );

	var textureCubeUV = new FunctionNode( [
		"TextureCubeUVData textureCubeUV( vec3 reflectedDirection, float roughness, in float cubeUV_textureSize ) {",
		"	float roughnessVal = roughness * cubeUV_maxLods3;",
		"	float r1 = floor(roughnessVal);",
		"	float r2 = r1 + 1.0;",
		"	float t = fract(roughnessVal);",
		"	vec2 mipInfo = MipLevelInfo(reflectedDirection, r1, roughness, cubeUV_textureSize);",
		"	float s = mipInfo.y;",
		"	float level0 = mipInfo.x;",
		"	float level1 = level0 + 1.0;",
		"	level1 = level1 > 5.0 ? 5.0 : level1;",
		"",
		// round to nearest mipmap if we are not interpolating."
		"	level0 += min( floor( s + 0.5 ), 5.0 );",
		"",
		// Tri linear interpolation."
		"	vec2 uv_10 = getCubeUV(reflectedDirection, r1, level0, cubeUV_textureSize);",
		"	vec2 uv_20 = getCubeUV(reflectedDirection, r2, level0, cubeUV_textureSize);",
		"",
		"	return TextureCubeUVData(uv_10, uv_20, t);",
		"}"
	].join( "\n" ), [ TextureCubeUVData, cubeUV_maxLods3, MipLevelInfo, getCubeUV ] );

	return {
		TextureCubeUVData: TextureCubeUVData,
		textureCubeUV: textureCubeUV
	};

} )();

TextureCubeUVNode.prototype = Object.create( TempNode.prototype );
TextureCubeUVNode.prototype.constructor = TextureCubeUVNode;
TextureCubeUVNode.prototype.nodeType = "TextureCubeUV";

TextureCubeUVNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		var textureCubeUV = builder.include( TextureCubeUVNode.Nodes.textureCubeUV );

		return builder.format( textureCubeUV + '( ' + this.uv.build( builder, 'v3' ) + ', ' +
			this.blinnExponentToRoughness.build( builder, 'f' ) + ', ' +
			this.textureSize.build( builder, 'f' ) + ' )', this.getType( builder ), output );

	} else {

		console.warn( "THREE.TextureCubeUVNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec4( 0.0 )', this.getType( builder ), output );

	}

};

TextureCubeUVNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.uv = this.uv.toJSON( meta ).uuid;
		data.textureSize = this.textureSize.toJSON( meta ).uuid;
		data.blinnExponentToRoughness = this.blinnExponentToRoughness.toJSON( meta ).uuid;

	}

	return data;

};

export { TextureCubeUVNode };
