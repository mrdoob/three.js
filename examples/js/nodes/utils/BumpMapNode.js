/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.BumpMapNode = function ( value, scale ) {

	THREE.TempNode.call( this, 'v3' );

	this.value = value;
	this.scale = scale || new THREE.FloatNode( 1 );

	this.toNormalMap = false;
	
};

THREE.BumpMapNode.fBumpToNormal = new THREE.FunctionNode( [
	"vec3 bumpToNormal( sampler2D bumpMap, vec2 uv, float scale ) {",
	"	vec2 dSTdx = dFdx( uv );",
	"	vec2 dSTdy = dFdy( uv );",
	"	float Hll = texture2D( bumpMap, uv ).x;",
	"	float dBx = texture2D( bumpMap, uv + dSTdx ).x - Hll;",
	"	float dBy = texture2D( bumpMap, uv + dSTdy ).x - Hll;",
	"	return vec3( .5 - ( dBx * scale ), .5 - ( dBy * scale ), 1.0 );",
	"}"
].join( "\n" ), null, { derivatives: true } );

THREE.BumpMapNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.BumpMapNode.prototype.constructor = THREE.BumpMapNode;
THREE.BumpMapNode.prototype.nodeType = "BumpMap";

THREE.BumpMapNode.prototype.generate = function ( builder, output ) {

	if ( builder.isShader( 'fragment' ) ) {

		if ( this.toNormalMap ) {
	
			builder.include( THREE.BumpMapNode.fBumpToNormal );
		
			return builder.format( THREE.BumpMapNode.fBumpToNormal.name + '( ' + this.value.build( builder, 'sampler2D' ) + ', ' +
				this.value.coord.build( builder, 'v2' ) + ', ' +
				this.scale.build( builder, 'fv1' ) + ' )', this.getType( builder ), output );
				
		} else {
			
			builder.include( 'dHdxy_fwd' );
			builder.include( 'perturbNormalArb' );
		
			this.normal = this.normal || new THREE.NormalNode( THREE.NormalNode.VIEW );
			this.position = this.position || new THREE.PositionNode( THREE.NormalNode.VIEW );
		
			var derivativeOfHeightCode = 'dHdxy_fwd( ' + this.value.build( builder, 'sampler2D' ) + ', ' +
				this.value.coord.build( builder, 'v2' ) + ', ' +
				this.scale.build( builder, 'fv1' ) + ' )';

			return builder.format( 'perturbNormalArb( -' + this.position.build( builder, 'v3' ) + ', ' +
				this.normal.build( builder, 'v3' ) + ', ' +
				derivativeOfHeightCode + ' )', this.getType( builder ), output );
			
		}

	} else {

		console.warn( "THREE.BumpMapNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};

THREE.BumpMapNode.prototype.copy = function ( source ) {
			
	THREE.GLNode.prototype.copy.call( this, source );
	
	this.value = source.value;
	this.scale = source.scale;
					
};

THREE.BumpMapNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;
		data.scale = this.scale.toJSON( meta ).uuid;

	}

	return data;

};
