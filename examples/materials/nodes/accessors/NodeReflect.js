/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeReflect = function() {
	
	THREE.NodeTemp.call( this, 'v3', {unique:true} );
	
	this.worldPosition = new THREE.NodePosition( THREE.NodePosition.WORLD );
	
};

THREE.NodeReflect.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeReflect.prototype.constructor = THREE.NodeReflect;

THREE.NodeReflect.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	
	if (builder.isShader('fragment')) {
		
		material.addFragmentNode( [
			'vec3 cameraToVertex = normalize( ' + this.worldPosition.build( builder, 'v3' )  + ' - cameraPosition );',
			'vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );',
			'vec3 vReflect = reflect( cameraToVertex, worldNormal );'
		].join( "\n" ) );
		
		return builder.format( 'vReflect', this.type, output );
		
	}
	else {
		
		console.warn("THREE.NodeReflect is not compatible with " + builder.shader + " shader");
		
		return builder.format( 'vec3( 0.0 )', this.type, output );
	
	}

};