/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ColorNode = function ( color, g, b ) {

	THREE.InputNode.call( this, 'c' );

	this.value = color instanceof THREE.Color ? color : new THREE.Color( color || 0, g, b );

};

THREE.ColorNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.ColorNode.prototype.constructor = THREE.ColorNode;
THREE.ColorNode.prototype.nodeType = "Color";

THREE.NodeMaterial.addShortcuts( THREE.ColorNode.prototype, 'value', [ 'r', 'g', 'b' ] );

THREE.ColorNode.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( "vec3( " + this.r + ", " + this.g + ", " + this.b + " )", type, output );

};

THREE.ColorNode.prototype.copy = function ( source ) {
			
	THREE.InputNode.prototype.copy.call( this, source );
	
	this.value.copy( source );
	
};

THREE.ColorNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.r = this.r;
		data.g = this.g;
		data.b = this.b;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
