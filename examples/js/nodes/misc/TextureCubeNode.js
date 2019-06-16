/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from '../core/TempNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';
import { TextureCubeUVNode } from './TextureCubeUVNode.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';

function TextureCubeNode( value ) {

	TempNode.call( this, 'v4' );

	this.value = value;

	this.radianceCache = { uv: new TextureCubeUVNode() };
	this.irradianceCache = { uv: new TextureCubeUVNode( new ReflectNode( ReflectNode.VECTOR2 ), undefined, new FloatNode( 1 ).setReadonly( true ) ) };

}

TextureCubeNode.prototype = Object.create( TempNode.prototype );
TextureCubeNode.prototype.constructor = TextureCubeNode;
TextureCubeNode.prototype.nodeType = "TextureCube";

TextureCubeNode.prototype.generateTextureCubeUV = function ( builder, cache, t ) {

	var uv_10 = cache.uv.build( builder ) + '.uv_10',
		uv_20 = cache.uv.build( builder ) + '.uv_20',
		t = cache.uv.build( builder ) + '.t';

	var color10 = 'texture2D( ' + this.value.build( builder, 'sampler2D' ) + ', ' + uv_10 + ' )',
		color20 = 'texture2D( ' + this.value.build( builder, 'sampler2D' ) + ', ' + uv_20 + ' )';

	// add a custom context for fix incompatibility with the core
	// include ColorSpace function only if is a vertex shader
	// for optimization this should be removed in the future
	var context = { include: builder.isShader( 'vertex' ) };

	builder.addContext( context );

	cache.colorSpace10 = cache.colorSpace10 || new ColorSpaceNode( new ExpressionNode('', this.type ) );
	cache.colorSpace10.input.eval( color10 );
	cache.colorSpace10.fromDecoding( builder.getTextureEncodingFromMap( this.value.value ) );
	color10 = cache.colorSpace10.build( builder, this.type );

	cache.colorSpace20 = cache.colorSpace20 || new ColorSpaceNode( new ExpressionNode('', this.type ) );
	cache.colorSpace20.input.eval( color20 );
	cache.colorSpace20.fromDecoding( builder.getTextureEncodingFromMap( this.value.value ) );
	color20 = cache.colorSpace20.build( builder, this.type );

	builder.removeContext();

	// end custom context

	return 'mix( ' + color10 + ', ' + color20 + ', ' + t + ' ).rgb';

};

TextureCubeNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		var radiance = this.generateTextureCubeUV( builder, this.radianceCache );
		var irradiance = this.generateTextureCubeUV( builder, this.irradianceCache );

		builder.context.extra.irradiance = '( PI * ' + irradiance + ' )';

		return builder.format( 'vec4( ' + radiance + ', 1.0 )', this.getType( builder ), output );

	} else {

		console.warn( "THREE.TextureCubeNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec4( 0.0 )', this.getType( builder ), output );

	}

};

TextureCubeNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;

	}

	return data;

};

export { TextureCubeNode };
