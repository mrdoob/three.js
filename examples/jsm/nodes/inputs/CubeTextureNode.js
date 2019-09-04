/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { NodeContext } from '../core/NodeContext.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';

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

	// contextually bias is used normally in physically-based material
	var contextuallyBias = builder.getContextProperty( 'bias' );

	var cubetex = this.getTexture( builder, output );
	var uv = this.uv.build( builder, 'v3' );
	var bias = this.bias ? this.bias.build( builder, 'f' ) : undefined;

	if ( bias === undefined && contextuallyBias !== undefined ) {

		bias = builder.getContextProperty( 'bias' ).setTexture( this ).build( builder, 'f' );

	}

	var code;

	if ( bias ) code = 'texCubeBias( ' + cubetex + ', ' + uv + ', ' + bias + ' )';
	else code = 'texCube( ' + cubetex + ', ' + uv + ' )';

	// add a custom context for fix incompatibility with the core
	// include ColorSpace function only for vertex shader (in fragment shader color space functions is added automatically by core)
	// this should be removed in the future
	// include => is used to include or not functions if used FunctionNode
	// ignoreCache => not create variables temp nodeT0..9 to optimize the code

	var contextSpaceContext = new NodeContext()
		.setProperty( 'include', builder.isShader( 'vertex' ) )
		.setProperty( 'caching', false );

	var outputType = this.getType( builder );

	this.colorSpace = this.colorSpace || new ColorSpaceNode( new ExpressionNode( '', outputType ) );
	this.colorSpace.fromDecoding( builder.getTextureEncodingFromMap( this.value ) );
	this.colorSpace.input.parse( code );

	code = this.colorSpace.buildContext( contextSpaceContext, builder, outputType );

	return builder.format( code, outputType, output );

};

CubeTextureNode.prototype.copy = function ( source ) {

	InputNode.prototype.copy.call( this, source );

	if ( source.value ) this.value = source.value;

	this.uv = source.uv;

	if ( source.bias ) this.bias = source.bias;

	return this;

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
