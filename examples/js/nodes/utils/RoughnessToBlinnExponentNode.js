/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.RoughnessToBlinnExponentNode = function() {

	THREE.TempNode.call( this, 'fv1', { unique: true } );

};

THREE.RoughnessToBlinnExponentNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.RoughnessToBlinnExponentNode.prototype.constructor = THREE.RoughnessToBlinnExponentNode;

THREE.RoughnessToBlinnExponentNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	if ( builder.isShader( 'fragment' ) ) {

		if ( material.isDefined( 'STANDARD' ) ) {

			material.addFragmentNode( 'float specularMIPLevel = GGXRoughnessToBlinnExponent( 1.0 - material.specularRoughness );' );

		}
		else {

			console.warn( "THREE.RoughnessToBlinnExponentNode is compatible with StandardMaterial only." );

			material.addFragmentNode( 'float specularMIPLevel = 0.0;' );

		}

		return builder.format( 'specularMIPLevel', this.type, output );

	}
	else {

		console.warn( "THREE.RoughnessToBlinnExponentNode is not compatible with " + builder.shader + " shader." );

		return builder.format( '0.0', this.type, output );

	}

};
