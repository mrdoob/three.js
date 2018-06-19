/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.NormalMapNode = function ( value, scale ) {

	THREE.TempNode.call( this, 'v3' );

	this.value = value;
	this.scale = scale || new THREE.Vector2Node( 1, 1 );

};

THREE.NormalMapNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.NormalMapNode.prototype.constructor = THREE.NormalMapNode;
THREE.NormalMapNode.prototype.nodeType = "NormalMap";

THREE.NormalMapNode.prototype.generate = function ( builder, output ) {

	var material = builder.material;

	if ( builder.isShader( 'fragment' ) ) {

		builder.include( 'perturbNormal2Arb' );

		this.normal = this.normal || new THREE.NormalNode( THREE.NormalNode.VIEW );
		this.position = this.position || new THREE.PositionNode( THREE.NormalNode.VIEW );
		this.uv = this.uv || new THREE.UVNode();

		return builder.format( 'perturbNormal2Arb( -' + this.position.build( builder, 'v3' ) + ', ' +
			this.normal.build( builder, 'v3' ) + ', ' +
			this.value.build( builder, 'v3' ) + ', ' +
			this.uv.build( builder, 'v2' ) + ', ' +
			this.scale.build( builder, 'v2' ) + ' )', this.getType( builder ), output );

	} else {

		console.warn( "THREE.NormalMapNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec3( 0.0 )', this.getType( builder ), output );

	}

};

THREE.NormalMapNode.prototype.copy = function ( source ) {
			
	THREE.GLNode.prototype.copy.call( this, source );
	
	this.value = source.value;
	this.scale = source.scale;
	
};

THREE.NormalMapNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.toJSON( meta ).uuid;
		data.scale = this.scale.toJSON( meta ).uuid;

	}

	return data;

};
