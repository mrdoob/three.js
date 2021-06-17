import { Node } from '../core/Node.js';

class BypassNode extends Node {

	constructor( code, value ) {

		super();

		this.code = code;
		this.value = value;

	}

	getType( builder ) {

		if ( this.value ) {

			return this.value.getType( builder );

		} else if ( builder.isShader( 'fragment' ) ) {

			return 'f';

		}

		return 'void';

	}

	generate( builder, output ) {

		const code = this.code.build( builder, output ) + ';';

		builder.addNodeCode( code );

		if ( builder.isShader( 'vertex' ) ) {

			if ( this.value ) {

				return this.value.build( builder, output );

			}

		} else {

			return this.value ? this.value.build( builder, output ) : builder.format( '0.0', 'f', output );

		}

	}

	copy( source ) {

		super.copy( source );

		this.code = source.code;
		this.value = source.value;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.code = this.code.toJSON( meta ).uuid;

			if ( this.value ) data.value = this.value.toJSON( meta ).uuid;

		}

		return data;

	}

}

BypassNode.prototype.nodeType = 'Bypass';

export { BypassNode };
