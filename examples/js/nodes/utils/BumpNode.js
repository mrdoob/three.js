/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.BumpNode = function ( value, coord, scale ) {

	THREE.TempNode.call( this, 'v3' );

	this.value = value;
	this.coord = coord || new THREE.UVNode();
	this.scale = scale || new THREE.Vector2Node( 1, 1 );

};

THREE.BumpNode.fBumpToNormal = new THREE.FunctionNode( [
	"vec3 bumpToNormal( sampler2D bumpMap, vec2 uv, vec2 scale ) {",
	"	vec2 dSTdx = dFdx( uv );",
	"	vec2 dSTdy = dFdy( uv );",
	"	float Hll = texture2D( bumpMap, uv ).x;",
	"	float dBx = texture2D( bumpMap, uv + dSTdx ).x - Hll;",
	"	float dBy = texture2D( bumpMap, uv + dSTdy ).x - Hll;",
	"	return vec3( .5 + ( dBx * scale.x ), .5 + ( dBy * scale.y ), 1.0 );",
	"}"
].join( "\n" ), null, { derivatives: true } );

THREE.BumpNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.BumpNode.prototype.constructor = THREE.BumpNode;
THREE.BumpNode.prototype.nodeType = "Bump";

THREE.BumpNode.prototype.generate = function ( builder, output ) {

	var material = builder.material, func = THREE.BumpNode.fBumpToNormal;

	builder.include( func );

	if ( builder.isShader( 'fragment' ) ) {

		return builder.format( func.name + '(' + this.value.build( builder, 'sampler2D' ) + ',' +
			this.coord.build( builder, 'v2' ) + ',' +
			this.scale.build( builder, 'v2' ) + ')', this.getType( builder ), output );

	} else {

		console.warn( "THREE.BumpNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};

THREE.BumpNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;
		data.coord = this.coord.toJSON( meta ).uuid;
		data.scale = this.scale.toJSON( meta ).uuid;

	}

	return data;

};
