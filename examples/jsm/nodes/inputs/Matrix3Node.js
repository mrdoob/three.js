/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Matrix3 } from '../../../../build/three.module.js';

import { InputNode } from '../core/InputNode.js';

function Matrix3Node( matrix ) {

	InputNode.call( this, 'm3' );

	this.value = matrix || new Matrix3();

}

Matrix3Node.prototype = Object.create( InputNode.prototype );
Matrix3Node.prototype.constructor = Matrix3Node;
Matrix3Node.prototype.nodeType = "Matrix3";

Object.defineProperties( Matrix3Node.prototype, {

	elements: {

		set: function ( val ) {

			this.value.elements = val;

		},

		get: function () {

			return this.value.elements;

		}

	}

} );

Matrix3Node.prototype.generateReadonly = function ( builder, output, uuid, type/*, ns, needsUpdate */ ) {

	return builder.format( "mat3( " + this.value.elements.join( ", " ) + " )", type, output );

};


Matrix3Node.prototype.copy = function ( source ) {

	InputNode.prototype.copy.call( this, source );

	this.value.fromArray( source.elements );

	return this;

};

Matrix3Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.elements = this.value.elements.concat();

	}

	return data;

};

export { Matrix3Node };
