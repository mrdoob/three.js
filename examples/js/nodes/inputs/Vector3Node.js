/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Vector3Node = function ( x, y, z ) {

	THREE.InputNode.call( this, 'v3' );

	this.type = 'v3';
	this.value = new THREE.Vector3( x, y, z );

};

THREE.Vector3Node.prototype = Object.create( THREE.InputNode.prototype );
THREE.Vector3Node.prototype.constructor = THREE.Vector3Node;
THREE.Vector3Node.prototype.nodeType = "Vector3";

THREE.NodeMaterial.addShortcuts( THREE.Vector3Node.prototype, 'value', [ 'x', 'y', 'z' ] );

THREE.Vector3Node.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( "vec3( " + this.x + ", " + this.y + ", " + this.z + " )", type, output );

};

THREE.Vector3Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.x = this.x;
		data.y = this.y;
		data.z = this.z;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
