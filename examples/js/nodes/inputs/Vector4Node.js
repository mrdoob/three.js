/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Vector4Node = function ( x, y, z, w ) {

	THREE.InputNode.call( this, 'v4' );

	this.value = new THREE.Vector4( x, y, z, w );

};

THREE.Vector4Node.prototype = Object.create( THREE.InputNode.prototype );
THREE.Vector4Node.prototype.constructor = THREE.Vector4Node;
THREE.Vector4Node.prototype.nodeType = "Vector4";

THREE.NodeMaterial.addShortcuts( THREE.Vector4Node.prototype, 'value', [ 'x', 'y', 'z', 'w' ] );

THREE.Vector4Node.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( "vec4( " + this.x + ", " + this.y + ", " + this.z + ", " + this.w + " )", type, output );

};

THREE.Vector4Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.x = this.x;
		data.y = this.y;
		data.z = this.z;
		data.w = this.w;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
