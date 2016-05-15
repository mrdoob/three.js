THREE.MirrorNode = function( renderer, camera, options ) {

	THREE.TempNode.call( this, 'v4' );

	this.mirror = renderer instanceof THREE.Mirror ? renderer : new THREE.Mirror( renderer, camera, options );

	this.textureMatrix = new THREE.Matrix4Node( this.mirror.textureMatrix );

	this.worldPosition = new THREE.PositionNode( THREE.PositionNode.WORLD );

	this.coord = new THREE.OperatorNode( this.textureMatrix, this.worldPosition, THREE.OperatorNode.MUL );
	this.coordResult = new THREE.OperatorNode( null, this.coord, THREE.OperatorNode.ADD );

	this.texture = new THREE.TextureNode( this.mirror.renderTarget.texture, this.coord, null, true );

};

THREE.MirrorNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.MirrorNode.prototype.constructor = THREE.MirrorNode;

THREE.MirrorNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	if ( builder.isShader( 'fragment' ) ) {

		this.coordResult.a = this.offset;
		this.texture.coord = this.offset ? this.coordResult : this.coord;

		var coord = this.texture.build( builder, this.type );

		return builder.format( coord, this.type, output );

	}
	else {

		console.warn( "THREE.MirrorNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec4(0.0)', this.type, output );

	}

};
