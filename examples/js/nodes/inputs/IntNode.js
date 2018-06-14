/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.IntNode = function ( value ) {

	THREE.InputNode.call( this, 'iv1' );

	this.value = Math.floor( value || 0 );

};

THREE.IntNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.IntNode.prototype.constructor = THREE.IntNode;
THREE.IntNode.prototype.nodeType = "Int";

THREE.IntNode.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( this.value, type, output );

};

THREE.IntNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
