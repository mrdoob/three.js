/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NormalMapNode = function( value, uv, scale, normal, position ) {

	THREE.TempNode.call( this, 'v3' );

	this.value = value;
	this.scale = scale || new THREE.FloatNode( 1 );

	this.normal = normal || new THREE.NormalNode( THREE.NormalNode.LOCAL );
	this.position = position || new THREE.PositionNode( THREE.NormalNode.VIEW );

};

THREE.NormalMapNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.NormalMapNode.prototype.constructor = THREE.NormalMapNode;

THREE.NormalMapNode.prototype.generate = function( builder, output ) {

	var material = builder.material;

	builder.include( 'perturbNormal2Arb' );

	if ( builder.isShader( 'fragment' ) ) {

		return builder.format( 'perturbNormal2Arb(-' + this.position.build( builder, 'v3' ) + ',' +
			this.normal.build( builder, 'v3' ) + ',' +
			this.value.build( builder, 'v3' ) + ',' +
			this.value.coord.build( builder, 'v2' ) + ',' +
			this.scale.build( builder, 'v2' ) + ')', this.getType( builder ), output );

	}
	else {

		console.warn( "THREE.NormalMapNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};
