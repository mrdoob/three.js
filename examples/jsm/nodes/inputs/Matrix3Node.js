/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Matrix3 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';

export class Matrix3Node extends InputNode {

	constructor( matrix ) {

		super( 'm3' );

		this.value = matrix || new Matrix3();

		this.nodeType = "Matrix3";

	}

	set elements( val ) {
		
		this.value.elements = val;
		
	}
	
	get elements() {
		
		return this.value.elements;
		
	}

	generateReadonly( builder, output, uuid, type/*, ns, needsUpdate */ ) {

		return builder.format( "mat3( " + this.value.elements.join( ", " ) + " )", type, output );

	}

	copy( source ) {

		super.copy( source );

		this.value.fromArray( source.elements );

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.elements = this.value.elements.concat();

		}

		return data;

	}

}
