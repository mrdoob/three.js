/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.Vector2Node = function ( x, y ) {

	THREE.InputNode.call( this, 'v2' );

	this.value = new THREE.Vector2( x, y );

};

THREE.Vector2Node.prototype = Object.create( THREE.InputNode.prototype );
THREE.Vector2Node.prototype.constructor = THREE.Vector2Node;
THREE.Vector2Node.prototype.nodeType = "Vector2";

THREE.NodeMaterial.addShortcuts( THREE.Vector2Node.prototype, 'value', [ 'x', 'y' ] );

THREE.Vector2Node.prototype.generateReadonly = function ( builder, output, uuid, type, ns, needsUpdate ) {

	return builder.format( "vec2( " + this.x + ", " + this.y + " )", type, output );

};

THREE.Vector2Node.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.x = this.x;
		data.y = this.y;

		if ( this.readonly === true ) data.readonly = true;

	}

	return data;

};
