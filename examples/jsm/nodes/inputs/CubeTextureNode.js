import { InputNode } from '../core/InputNode.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { ColorSpaceNode } from '../utils/ColorSpaceNode.js';
import { ExpressionNode } from '../core/ExpressionNode.js';

class CubeTextureNode extends InputNode {

	constructor( value, uv, bias ) {

		super( 'v4', { shared: true } );

		this.value = value;
		this.uv = uv || new ReflectNode();
		this.bias = bias;

	}

	getTexture( builder, output ) {

		return super.generate( builder, output, this.value.uuid, 'tc' );

	}

	generate( builder, output ) {

		if ( output === 'samplerCube' ) {

			return this.getTexture( builder, output );

		}

		const cubetex = this.getTexture( builder, output );
		const uv = this.uv.build( builder, 'v3' );
		let bias = this.bias ? this.bias.build( builder, 'f' ) : undefined;

		if ( bias === undefined && builder.context.bias ) {

			bias = builder.context.bias.setTexture( this ).build( builder, 'f' );

		}

		let code;

		if ( bias ) code = 'texCubeBias( ' + cubetex + ', ' + uv + ', ' + bias + ' )';
		else code = 'texCube( ' + cubetex + ', ' + uv + ' )';

		// add a custom context for fix incompatibility with the core
		// include ColorSpace function only for vertex shader (in fragment shader color space functions is added automatically by core)
		// this should be removed in the future
		// context.include =: is used to include or not functions if used FunctionNode
		// context.ignoreCache =: not create variables temp nodeT0..9 to optimize the code
		const context = { include: builder.isShader( 'vertex' ), ignoreCache: true };
		const outputType = this.getType( builder );

		builder.addContext( context );

		this.colorSpace = this.colorSpace || new ColorSpaceNode( new ExpressionNode( '', outputType ) );
		this.colorSpace.fromDecoding( builder.getTextureEncodingFromMap( this.value ) );
		this.colorSpace.input.parse( code );

		code = this.colorSpace.build( builder, outputType );

		// end custom context

		builder.removeContext();

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

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.uuid;
			data.uv = this.uv.toJSON( meta ).uuid;

			if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

		}

		return data;

	}

}

CubeTextureNode.prototype.nodeType = 'CubeTexture';

export { CubeTextureNode };
