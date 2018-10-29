/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';

function FloatNode( value ) {

	InputNode.call( this, 'f' );

	this.value = value || 0;

}

FloatNode.prototype = Object.create( InputNode.prototype );
FloatNode.prototype.constructor = FloatNode;
FloatNode.prototype.nodeType = "Float";

FloatNode.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( this.value + ( this.value % 1 ? '' : '.0' ), type, output );

};

FloatNode.prototype.copy = function ( source ) {

	InputNode.prototype.copy.call( this, source );

	this.value = source.value;

};

FloatNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};

export { FloatNode };
