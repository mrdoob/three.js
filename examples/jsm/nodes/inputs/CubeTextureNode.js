/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';

function CubeTextureNode( value, uv, bias ) {

	InputNode.call( this, 'v4', { shared: true } );

	this.value = value;
	this.uv = uv || new ReflectNode();
	this.bias = bias;

}

CubeTextureNode.prototype = Object.create( InputNode.prototype );
CubeTextureNode.prototype.constructor = CubeTextureNode;
CubeTextureNode.prototype.nodeType = "CubeTexture";

CubeTextureNode.prototype.getTexture = function ( builder, output ) {

	return InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 'tc' );

};

CubeTextureNode.prototype.generate = function ( builder, output ) {

	if ( output === 'samplerCube' ) {

		return this.getTexture( builder, output );

	}

	var cubetex = this.getTexture( builder, output );
	var uv = this.uv.build( builder, 'v3' );
	var bias = this.bias ? this.bias.build( builder, 'f' ) : undefined;

	if ( bias === undefined && builder.context.bias ) {

		bias = new builder.context.bias( this ).build( builder, 'f' );

	}

	var code;

	if ( bias ) code = 'texCubeBias( ' + cubetex + ', ' + uv + ', ' + bias + ' )';
	else code = 'texCube( ' + cubetex + ', ' + uv + ' )';

	// add this context to replace ColorSpaceNode.input to code

	builder.addContext( { input: code, encoding: builder.getTextureEncodingFromMap( this.value ), include: builder.isShader( 'vertex' ) } );

	this.colorSpace = this.colorSpace || new ColorSpaceNode( this );
	code = this.colorSpace.build( builder, this.type );

	builder.removeContext();

	return builder.format( code, this.type, output );

};

CubeTextureNode.prototype.copy = function ( source ) {

	InputNode.prototype.copy.call( this, source );

	if ( source.value ) this.value = source.value;

	this.uv = source.uv;

	if ( source.bias ) this.bias = source.bias;

};

CubeTextureNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.uuid;
		data.uv = this.uv.toJSON( meta ).uuid;

		if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

	}

	return data;

};

export { CubeTextureNode };
