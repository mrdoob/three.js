/**
 * @author sunag / http://www.sunag.com.br/
 */

import { TempNode } from './TempNode.js';

export class InputNode extends TempNode {

	constructor( type, params ) {

		params = params || {};
		params.shared = params.shared !== undefined ? params.shared : false;

		super( type, params );

		this.constant = false;
		
	}

	setConst( value ) {

		this.constant = value;

		return this;

	}

	getConst() {

		return this.constant;

	}

	copy( source ) {

		super.copy( source );

		if ( source.constant !== undefined ) this.constant = source.constant;

		return this;

	}

	createJSONNode( meta ) {

		var data = super.createJSONNode( meta );

		if ( this.constant === true ) data.constant = this.constant;

		return data;

	}

	generate( builder, output, uuid, type, ns, needsUpdate ) {

		uuid = builder.getUuid( uuid || this.getUuid() );
		type = type || this.getType( builder );

		var data = builder.getNodeData( uuid ),
			constant = this.getConst( builder ) && this.generateConst !== undefined;

		if ( constant ) {

			return this.generateConst( builder, output, uuid, type, ns, needsUpdate );

		} else {

			if ( builder.isShader( 'vertex' ) ) {

				if ( ! data.vertex ) {

					data.vertex = builder.createVertexUniform( type, this, ns, needsUpdate, this.getLabel() );

				}

				return builder.format( data.vertex.name, type, output );

			} else {

				if ( ! data.fragment ) {

					data.fragment = builder.createFragmentUniform( type, this, ns, needsUpdate, this.getLabel() );

				}

				return builder.format( data.fragment.name, type, output );

			}

		}

	}

}
