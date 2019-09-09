/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { NodeLib } from '../core/NodeLib.js';
import { NodeContext } from '../core/NodeContext.js';
import { UVNode } from '../accessors/UVNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';

export class TextureNode extends InputNode {

	constructor( value, uv, bias, project ) {

		super( 'v4' );

		this.value = value;
		this.uv = NodeLib.resolve( uv );
		this.bias = NodeLib.resolve( bias );
		this.project = project !== undefined ? project : false;

		this.shared = true;

		this.nodeType = "Texture";

	}

	getTexture( builder, output ) {

		return super.generate( builder, output, this.value.uuid, 't' );

	}

	getUVNode( builder ) {
		
		this.uv = this.uv || new UVNode();

		return builder.getContextProperty( 'uv' ) || this.uv;

	}

	getBiasNode( builder ) {
		
		// contextually bias is used normally in physically-based material
		var contextuallyBias = builder.getContextProperty( 'bias' );

		return contextuallyBias ? contextuallyBias.setTexture( this ) : this.bias;

	}

	generate( builder, output ) {

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

		var colorSpaceContext = new NodeContext()
			.setProperty( 'include', builder.isShader( 'vertex' ) )
			.setProperty( 'caching', false );

		var outputType = this.getType( builder );

		this.colorSpace = this.colorSpace || new ColorSpaceNode( new ExpressionNode( '', outputType ) );
		this.colorSpace.fromDecoding( builder.getTextureEncodingFromMap( this.value ) );
		this.colorSpace.input.parse( code );

		code = this.colorSpace.buildContext( colorSpaceContext, builder, outputType );

		return builder.format( code, outputType, output );

	}

	copy( source ) {

		super.copy( source );

		if ( source.value ) this.value = source.value;

		this.uv = source.uv;

		if ( source.bias ) this.bias = source.bias;
		if ( source.project !== undefined ) this.project = source.project;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			if ( this.value ) data.value = this.value.uuid;

			data.uv = this.uv.toJSON( meta ).uuid;
			data.project = this.project;

			if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

		}

		return data;

	}

}

NodeLib.addResolver( ( value ) => { 

	if ( value.isTexture && ! value.isCubeTexture ) {

		return new TextureNode( value );

	}

} );
