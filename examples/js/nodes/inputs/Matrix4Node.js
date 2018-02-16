/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Matrix4Node = function ( matrix ) {

	THREE.InputNode.call( this, 'm4' );

	this.value = matrix || new THREE.Matrix4();

};

THREE.Matrix4Node.prototype = Object.create( THREE.InputNode.prototype );
THREE.Matrix4Node.prototype.constructor = THREE.Matrix4Node;
THREE.Matrix4Node.prototype.nodeType = "Matrix4";

THREE.Matrix4Node.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( "mat4( " + this.value.elements.join( ", " ) + " )", type, output );

};

THREE.Matrix4Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.elements = this.value.elements.concat();

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
