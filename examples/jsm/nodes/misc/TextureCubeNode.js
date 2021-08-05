import { TempNode } from '../core/TempNode.js';
import { FloatNode } from '../inputs/FloatNode.js';
import { TextureCubeUVNode } from './TextureCubeUVNode.js';
import { ReflectNode } from '../accessors/ReflectNode.js';
import { NormalNode } from '../accessors/NormalNode.js';

class TextureCubeNode extends TempNode {

	constructor( value, uv, bias ) {

		super( 'v4' );

		this.value = value;

		this.radianceNode = new TextureCubeUVNode(
			this.value,
			uv || new ReflectNode( ReflectNode.VECTOR ),
			// bias should be replaced in builder.context in build process
			bias
		);

		this.irradianceNode = new TextureCubeUVNode(
			this.value,
			new NormalNode( NormalNode.WORLD ),
			new FloatNode( 1 ).setReadonly( true )
		);

	}

	generate( builder, output ) {

		if ( builder.isShader( 'fragment' ) ) {

			builder.require( 'irradiance' );

			if ( builder.context.bias ) {

				builder.context.bias.setTexture( this.value );

			}

			const scopeNode = builder.slot === 'irradiance' ? this.irradianceNode : this.radianceNode;

			return scopeNode.build( builder, output );

		} else {

			console.warn( 'THREE.TextureCubeNode is not compatible with ' + builder.shader + ' shader.' );

			return builder.format( 'vec4( 0.0 )', this.getType( builder ), output );

		}

	}

	copy( source ) {

		super.copy( source );

		this.value = source.value;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value.toJSON( meta ).uuid;

		}

		return data;

	}

}

TextureCubeNode.prototype.nodeType = 'TextureCube';

export { TextureCubeNode };
