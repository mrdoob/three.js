/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.BumpMapNode = function( value, uv, scale ) {

	THREE.TempNode.call( this, 'v3' );

	this.value = value;
	this.uv = uv || new THREE.UVNode();
	this.scale = scale || new THREE.Vector2Node( 1, 1 );

};

THREE.BumpMapNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.BumpMapNode.prototype.constructor = THREE.BumpMapNode;

THREE.BumpMapNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	builder.include( 'bumpToNormal' );

	if ( builder.isShader( 'fragment' ) ) {

		return builder.format( 'bumpToNormal(' + this.value.build( builder, 'sampler2D' ) + ',' +
			this.uv.build( builder, 'v2' ) + ',' +
			this.scale.build( builder, 'v2' ) + ')', this.getType( builder ), output );

	} else {

		console.warn( "THREE.BumpMapNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};
