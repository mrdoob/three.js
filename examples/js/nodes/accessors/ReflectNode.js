/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ReflectNode = function() {

	THREE.TempNode.call( this, 'v3', { unique: true } );

	this.worldPosition = new THREE.PositionNode( THREE.PositionNode.WORLD );

};

THREE.ReflectNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.ReflectNode.prototype.constructor = THREE.ReflectNode;

THREE.ReflectNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	if ( builder.isShader( 'fragment' ) ) {

		material.addFragmentNode( [
			'vec3 cameraToVertex = normalize( ' + this.worldPosition.build( builder, 'v3' ) + ' - cameraPosition );',
			'vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );',
			'vec3 vReflect = reflect( cameraToVertex, worldNormal );'
		].join( "\n" ) );

		return builder.format( 'vReflect', this.type, output );

	}
	else {

		console.warn( "THREE.ReflectNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.type, output );

	}

};
