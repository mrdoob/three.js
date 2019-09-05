/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Matrix4 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';

export class Matrix4Node extends InputNode {

	constructor( matrix ) {

		super( 'm4' );

		this.value = matrix || new Matrix4();

		this.nodeType = "Matrix4";

	}

	set elements( val ) {
		
		this.value.elements = val;
		
	}
	
	get elements() {
		
		return this.value.elements;
		
	}


	generateReadonly( builder, output, uuid, type ) {

		return builder.format( "mat4( " + this.value.elements.join( ", " ) + " )", type, output );

	}

	copy( source ) {

		super.copy( source );

		this.scope.value.fromArray( source.elements );

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
