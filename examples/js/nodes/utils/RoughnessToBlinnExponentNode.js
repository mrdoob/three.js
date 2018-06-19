/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.RoughnessToBlinnExponentNode = function ( texture ) {

	THREE.TempNode.call( this, 'fv1' );

	this.texture = texture;

	this.maxMIPLevel = new THREE.MaxMIPLevelNode( texture );
	this.blinnShininessExponent = new THREE.BlinnShininessExponentNode();

};

THREE.RoughnessToBlinnExponentNode.getSpecularMIPLevel = new THREE.FunctionNode( [
	// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
	"float getSpecularMIPLevel( const in float blinnShininessExponent, const in float maxMIPLevelScalar ) {",

	//	float envMapWidth = pow( 2.0, maxMIPLevelScalar );
	//	float desiredMIPLevel = log2( envMapWidth * sqrt( 3.0 ) ) - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );

	"	float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );",

	// clamp to allowable LOD ranges.
	"	return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );",
	"}"
].join( "\n" ) );

THREE.RoughnessToBlinnExponentNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.RoughnessToBlinnExponentNode.prototype.constructor = THREE.RoughnessToBlinnExponentNode;
THREE.RoughnessToBlinnExponentNode.prototype.nodeType = "RoughnessToBlinnExponent";

THREE.RoughnessToBlinnExponentNode.prototype.generate = function ( builder, output ) {

	var material = builder.material;

	if ( builder.isShader( 'fragment' ) ) {

		builder.include( THREE.RoughnessToBlinnExponentNode.getSpecularMIPLevel );

		this.maxMIPLevel.texture = this.texture;
		
		return builder.format( 'getSpecularMIPLevel( ' + this.blinnShininessExponent.build( builder, 'fv1' ) + ', ' + this.maxMIPLevel.build( builder, 'fv1' ) + ' )', this.type, output );

	} else {

		console.warn( "THREE.RoughnessToBlinnExponentNode is not compatible with " + builder.shader + " shader." );

		return builder.format( '0.0', this.type, output );

	}

};

THREE.RoughnessToBlinnExponentNode.prototype.copy = function ( source ) {
			
	THREE.GLNode.prototype.copy.call( this, source );
	
	this.texture = source.texture;
	
};

THREE.RoughnessToBlinnExponentNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.texture = this.texture;

	}

	return data;

};

