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

THREE.Matrix3Node.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( "mat3( " + this.value.elements.join( ", " ) + " )", type, output );

};

THREE.Matrix3Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.elements = this.value.elements.concat();

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
