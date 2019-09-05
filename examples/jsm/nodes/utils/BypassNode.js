/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Node } from '../core/Node.js';

export class BypassNode extends Node {

	constructor( code, value ) {

		super();

		this.code = code;
		this.value = value;

		this.nodeType = "Bypass";

	}

	getType( builder ) {

		if ( this.value ) {

			return this.value.getType( builder );

		} else if ( builder.isShader( 'fragment' ) ) {

			return 'f';

		}

		return 'void';

	};

	generate( builder, output ) {

		var code = this.code.build( builder, output ) + ';';

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

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.code = this.code.toJSON( meta ).uuid;

			if ( this.value ) data.value = this.value.toJSON( meta ).uuid;

		}

		return data;

	}

}
