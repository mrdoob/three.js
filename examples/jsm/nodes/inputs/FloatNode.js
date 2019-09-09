/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { NodeLib } from '../core/NodeLib.js';

export class FloatNode extends InputNode {

	constructor( value ) {

		super( 'f' );

		this.value = value || 0;

		this.nodeType = "Float";

	}

	generateConst( builder, output, uuid, type ) {

		return builder.format( this.value + ( this.value % 1 ? '' : '.0' ), type, output );

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

NodeLib.addResolver( ( value ) => {

	if ( typeof value === 'number' ) {

		return new FloatNode( value ).setConst( true ); 

	}

} );
