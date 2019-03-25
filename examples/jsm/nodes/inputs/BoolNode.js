/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';

function BoolNode( value ) {

	InputNode.call( this, 'b' );

	this.value = Boolean( value );

}

BoolNode.prototype = Object.create( InputNode.prototype );
BoolNode.prototype.constructor = BoolNode;
BoolNode.prototype.nodeType = "Bool";

BoolNode.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( this.value, type, output );

};

BoolNode.prototype.copy = function ( source ) {

	InputNode.prototype.copy.call( this, source );

	this.value = source.value;

};

BoolNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};

export { BoolNode };
