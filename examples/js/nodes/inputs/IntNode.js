/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.IntNode = function ( value ) {

	THREE.InputNode.call( this, 'iv1' );

	this.value = [ Math.floor( value || 0 ) ];

};

THREE.IntNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.IntNode.prototype.constructor = THREE.IntNode;
THREE.IntNode.prototype.nodeType = "Int";

Object.defineProperties( THREE.IntNode.prototype, {
	number: {
		get: function () {

			return this.value[ 0 ];

		},
		set: function ( val ) {

			this.value[ 0 ] = Math.floor( val );

		}
	}
} );

THREE.IntNode.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( this.number, type, output );

};

THREE.IntNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.number = this.number;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
