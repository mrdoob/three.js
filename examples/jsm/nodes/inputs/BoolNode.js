/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';

export class BoolNode extends InputNode {

	constructor( value ) {

		super( 'b' );

		this.value = Boolean( value );

		this.nodeType = "Bool";

	}

	generateReadonly( builder, output, uuid, type ) {

		return builder.format( this.value, type, output );

	}

	copy( source ) {

		super.copy( source );

		this.value = source.value;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.value = this.value;

			if ( this.constant === true ) data.constant = true;

		}

		return data;

	}

}
