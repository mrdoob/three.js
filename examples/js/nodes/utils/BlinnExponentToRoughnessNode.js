/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.BlinnExponentToRoughnessNode = function ( blinnExponent ) {

	THREE.TempNode.call( this, 'fv1' );

	this.blinnExponent = blinnExponent || new THREE.BlinnShininessExponentNode();

};

THREE.BlinnExponentToRoughnessNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.BlinnExponentToRoughnessNode.prototype.constructor = THREE.BlinnExponentToRoughnessNode;
THREE.BlinnExponentToRoughnessNode.prototype.nodeType = "BlinnExponentToRoughness";

THREE.BlinnExponentToRoughnessNode.prototype.generate = function ( builder, output ) {

	return builder.format( 'BlinnExponentToGGXRoughness( ' + this.blinnExponent.build( builder, 'fv1' ) + ' )', this.type, output );

};

THREE.BlinnExponentToRoughnessNode.prototype.copy = function ( source ) {
			
	THREE.GLNode.prototype.copy.call( this, source );
	
	this.blinnExponent = source.blinnExponent;
	
};

THREE.BlinnExponentToRoughnessNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.blinnExponent = this.blinnExponent;

	}

	return data;

};
