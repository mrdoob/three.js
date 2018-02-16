/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.FloatNode = function ( value ) {

	THREE.InputNode.call( this, 'fv1' );

	this.value = [ value || 0 ];

};

THREE.FloatNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.FloatNode.prototype.constructor = THREE.FloatNode;
THREE.FloatNode.prototype.nodeType = "Float";

Object.defineProperties( THREE.FloatNode.prototype, {
	number: {
		get: function () {

			return this.value[ 0 ];

		},
		set: function ( val ) {

			this.value[ 0 ] = val;

		}
	}
} );

THREE.FloatNode.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	var value = this.number;

	return builder.format( Math.floor( value ) !== value ? value : value + ".0", type, output );

};

THREE.FloatNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.number = this.number;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
