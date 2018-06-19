/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Matrix3Node = function ( matrix ) {

	THREE.InputNode.call( this, 'm3' );

	this.value = matrix || new THREE.Matrix3();

};

THREE.Matrix3Node.prototype = Object.create( THREE.InputNode.prototype );
THREE.Matrix3Node.prototype.constructor = THREE.Matrix3Node;
THREE.Matrix3Node.prototype.nodeType = "Matrix3";

Object.defineProperties( THREE.Matrix3Node.prototype, {

	elements: {
		
		set: function (val) {

			this.value.elements = val;

		},
		
		get: function () {

			return this.value.elements;

		}
		
	}

} );

THREE.Matrix3Node.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( "mat3( " + this.value.elements.join( ", " ) + " )", type, output );

};


THREE.Matrix3Node.prototype.copy = function ( source ) {
			
	THREE.InputNode.prototype.copy.call( this, source );
	
	this.value.fromArray( source.elements );
	
};

THREE.Matrix3Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.elements = this.value.elements.concat();

	}

	return data;

};
