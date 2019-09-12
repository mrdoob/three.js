/**
 * @author sunag / http://www.sunag.com.br/
 */

import {
	CubeRefractionMapping
} from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';
import { NodeLib } from '../core/NodeLib.js';
import { NodeContext } from '../core/NodeContext.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';

export class CubeTextureNode extends InputNode {

	constructor( value, uv, bias ) {

		super( 'v4' );

		this.value = value;
		this.uv = NodeLib.resolve( uv ) || new ReflectNode();
		this.bias = NodeLib.resolve( bias );

		this.shared = true;

		this.nodeType = "CubeTexture";

	}

	getTexture( builder, output ) {

		return super.generate( builder, output, this.value.uuid, 'tc' );

	}

	generate( builder, output ) {

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
		// caching => create temp variables nodeT0..9 to optimize the code

		var contextSpaceContext = new NodeContext()
			.setProperty( 'include', builder.isShader( 'vertex' ) )
			.setProperty( 'caching', false );

		var outputType = this.getType( builder );

		this.colorSpace = this.colorSpace || new ColorSpaceNode( ColorSpaceNode.LINEAR_TO_LINEAR, new ExpressionNode( '', outputType ) );
		this.colorSpace.fromDecoding( builder.getTextureEncodingFromMap( this.value ) );
		this.colorSpace.input.src = code;

		code = this.colorSpace.buildContext( contextSpaceContext, builder, outputType );

		return builder.format( code, outputType, output );

	}

	copy( source ) {

		super.copy( source );

		if ( source.value ) this.value = source.value;

		this.uv = source.uv;

		if ( source.bias ) this.bias = source.bias;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.uuid;
			data.uv = this.uv.toJSON( meta ).uuid;

			if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

		}

		return data;

	}

}

NodeLib.addResolver( ( value ) => { 

	if ( value.isCubeTexture ) {

		var uv;

		if ( value.mapping === CubeRefractionMapping ) {

			uv = new ReflectNode( ReflectNode.CUBE, 1 );

		}

		return new CubeTextureNode( value, uv );

	}

} );
