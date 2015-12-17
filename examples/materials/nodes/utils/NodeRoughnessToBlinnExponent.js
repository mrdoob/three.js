/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NodeRoughnessToBlinnExponent = function() {
	
	THREE.NodeTemp.call( this, 'fv1', {unique:true} );
	
};

THREE.NodeRoughnessToBlinnExponent.prototype = Object.create( THREE.NodeTemp.prototype );
THREE.NodeRoughnessToBlinnExponent.prototype.constructor = THREE.NodeRoughnessToBlinnExponent;

THREE.NodeRoughnessToBlinnExponent.prototype.generate = function( builder, output ) {
	
	var material = builder.material;
	
	if (builder.isShader('fragment')) {
		
		if (material.isDefined('STANDARD')) {
		
			material.addFragmentNode('float specularMIPLevel = GGXRoughnessToBlinnExponent( 1.0 - material.specularRoughness );');
			
		}
		else {
			
			console.warn("THREE.NodeRoughnessToBlinnExponent is compatible with StandardMaterial only");
			
			material.addFragmentNode('float specularMIPLevel = 0.0;');
		
		}
		
		return builder.format( 'specularMIPLevel', this.type, output );
		
	}
	else {
		
		console.warn("THREE.NodeRoughnessToBlinnExponent is not compatible with " + builder.shader + " shader");
		
		return builder.format( '0.0', this.type, output );
	
	}

};