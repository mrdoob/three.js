/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.RoughnessToBlinnExponentNode = function() {

	THREE.TempNode.call( this, 'fv1' );

};

THREE.RoughnessToBlinnExponentNode.getSpecularMIPLevel = new THREE.FunctionNode( [
// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
"float getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {",

	//float envMapWidth = pow( 2.0, maxMIPLevelScalar );
	//float desiredMIPLevel = log2( envMapWidth * sqrt( 3.0 ) ) - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );
	"float maxMIPLevelScalar = float( maxMIPLevel );",
	"float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );",

	// clamp to allowable LOD ranges.
	"return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );",
"}"
].join( "\n" ) );

THREE.RoughnessToBlinnExponentNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.RoughnessToBlinnExponentNode.prototype.constructor = THREE.RoughnessToBlinnExponentNode;

THREE.RoughnessToBlinnExponentNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	if ( builder.isShader( 'fragment' ) ) {

		if ( material.isDefined( 'PHYSICAL' ) ) {

			builder.include( THREE.RoughnessToBlinnExponentNode.getSpecularMIPLevel );

			return builder.format( 'getSpecularMIPLevel( Material_BlinnShininessExponent( material ), 8 )', this.type, output );

		} else {

			console.warn( "THREE.RoughnessToBlinnExponentNode is only compatible with PhysicalMaterial." );

			return builder.format( '0.0', this.type, output );

		}

	} else {

		console.warn( "THREE.RoughnessToBlinnExponentNode is not compatible with " + builder.shader + " shader." );

		return builder.format( '0.0', this.type, output );

	}

};
