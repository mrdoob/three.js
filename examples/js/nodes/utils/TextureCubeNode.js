/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TextureCubeNode = function ( value, coord ) {

	THREE.TempNode.call( this, 'v4' );

	this.value = value;
	this.coord = coord || new THREE.TextureCubeUVNode();

};

THREE.TextureCubeNode.prototype = Object.create( THREE.TempNode.prototype );
THREE.TextureCubeNode.prototype.constructor = THREE.TextureCubeNode;
THREE.TextureCubeNode.prototype.nodeType = "TextureCube";

THREE.TextureCubeNode.prototype.generate = function ( builder, output ) {

	var material = builder.material;

	if ( builder.isShader( 'fragment' ) ) {

		var uv_10 = this.coord.build( builder ) + '.uv_10';
		var uv_20 = this.coord.build( builder ) + '.uv_20';
		var t = this.coord.build( builder ) + '.t';
		
		var color10 = builder.getTexelDecodingFunctionFromTexture( 'texture2D( ' + this.value.build( builder, 'sampler2D' ) + ', ' + uv_10 + ' )', this.value.value );
		var color20 = builder.getTexelDecodingFunctionFromTexture( 'texture2D( ' + this.value.build( builder, 'sampler2D' ) + ', ' + uv_20 + ' )', this.value.value );

		return builder.format( 'vec4( mix( ' + color10 + ', ' + color20 + ', ' + t + ' ).rgb, 1.0 )', this.getType( builder ), output );
			
	} else {

		console.warn( "THREE.TextureCubeNode is not compatible with " + builder.shader + " shader." );

		return builder.format( 'vec4( 0.0 )', this.getType( builder ), output );

	}

};

THREE.TextureCubeNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.coord = this.coord.toJSON( meta ).uuid;
		data.textureSize = this.textureSize.toJSON( meta ).uuid;
		data.blinnExponentToRoughness = this.blinnExponentToRoughness.toJSON( meta ).uuid;

		if ( this.roughness ) data.roughness = this.roughness.toJSON( meta ).uuid;

	}

	return data;

};
