/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { NodeContext } from '../core/NodeContext.js';
import { UVNode } from '../accessors/UVNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';

function TextureNode( value, uv, bias, project ) {

	InputNode.call( this, 'v4', { shared: true } );

	this.value = value;
	this.uv = uv;
	this.bias = bias;
	this.project = project !== undefined ? project : false;

}

TextureNode.prototype = Object.create( InputNode.prototype );
TextureNode.prototype.constructor = TextureNode;
TextureNode.prototype.nodeType = "Texture";

TextureNode.prototype.getTexture = function ( builder, output ) {

	return InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 't' );

};

TextureNode.prototype.getUVNode = function ( builder ) {
	
	this.uv = this.uv || new UVNode();

	return builder.getContextProperty( 'uv' ) || this.uv;

};

TextureNode.prototype.getBiasNode = function ( builder ) {
	
	// contextually bias is used normally in physically-based material
  var contextuallyBias = builder.getContextProperty( 'bias' );

	return contextuallyBias ? contextuallyBias.setTexture( this ) : this.bias;

};

TextureNode.prototype.generate = function ( builder, output ) {

	if ( output === 'sampler2D' ) {

		return this.getTexture( builder, output );

	}

	var uvNode = this.getUVNode( builder );
	var biasNode = this.getBiasNode( builder );

	if ( uvNode.isFunctionNode ) {

		uvNode.keywords['texture.uv'] = this.uv;

	}

	var tex = this.getTexture( builder, output );
	var uv = uvNode.build( builder, this.project ? 'v4' : 'v2' );
	var bias = biasNode ? biasNode.build( builder, 'f' ) : undefined;

	var method, code;

	if ( this.project ) method = 'texture2DProj';
	else method = bias ? 'tex2DBias' : 'tex2D';

	if ( bias ) code = method + '( ' + tex + ', ' + uv + ', ' + bias + ' )';
	else code = method + '( ' + tex + ', ' + uv + ' )';

	// add a custom context for fix incompatibility with the core
	// include ColorSpace function only for vertex shader (in fragment shader color space functions is added automatically by core)
	// this should be removed in the future
	// include => is used to include or not functions if used FunctionNode
	// ignoreCache => not create temp variables nodeT0..9 to optimize the code

	var colorSpaceContext = new NodeContext().setInclude( builder.isShader( 'vertex' ) ).setCaching( false );
	var outputType = this.getType( builder );

	this.colorSpace = this.colorSpace || new ColorSpaceNode( new ExpressionNode( '', outputType ) );
	this.colorSpace.fromDecoding( builder.getTextureEncodingFromMap( this.value ) );
	this.colorSpace.input.parse( code );

	code = this.colorSpace.buildContext( colorSpaceContext, builder, outputType );

	return builder.format( code, outputType, output );

};

TextureNode.prototype.copy = function ( source ) {

	InputNode.prototype.copy.call( this, source );

	if ( source.value ) this.value = source.value;

	this.uv = source.uv;

	if ( source.bias ) this.bias = source.bias;
	if ( source.project !== undefined ) this.project = source.project;

	return this;

};

TextureNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		if ( this.value ) data.value = this.value.uuid;

		data.uv = this.uv.toJSON( meta ).uuid;
		data.project = this.project;

		if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

	}

	return data;

};

export { TextureNode };
