/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.CubeTextureNode = function ( value, coord, bias ) {

	THREE.InputNode.call( this, 'v4', { shared: true } );

	this.value = value;
	this.coord = coord || new THREE.ReflectNode();
	this.bias = bias;

};

THREE.CubeTextureNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.CubeTextureNode.prototype.constructor = THREE.CubeTextureNode;
THREE.CubeTextureNode.prototype.nodeType = "CubeTexture";

THREE.CubeTextureNode.prototype.getTexture = function ( builder, output ) {

	return THREE.InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 't' );

};

THREE.CubeTextureNode.prototype.generate = function ( builder, output ) {

	if ( output === 'samplerCube' ) {

		return this.getTexture( builder, output );

	}

	var cubetex = this.getTexture( builder, output );
	var coord = this.coord.build( builder, 'v3' );
	var bias = this.bias ? this.bias.build( builder, 'fv1' ) : undefined;

	if ( bias == undefined && builder.requires.bias ) {

		bias = builder.requires.bias.build( builder, 'fv1' );

	}

	var code;

	if ( bias ) code = 'texCubeBias(' + cubetex + ',' + coord + ',' + bias + ')';
	else code = 'texCube(' + cubetex + ',' + coord + ')';

	if ( builder.isSlot( 'color' ) ) {

		code = 'mapTexelToLinear(' + code + ')';

	} else if ( builder.isSlot( 'emissive' ) ) {

		code = 'emissiveMapTexelToLinear(' + code + ')';

	} else if ( builder.isSlot( 'environment' ) ) {

		code = 'envMapTexelToLinear(' + code + ')';

	}

	return builder.format( code, this.type, output );

};

THREE.CubeTextureNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		data.value = this.value.uuid;
		data.coord = this.coord.toJSON( meta ).uuid;

		if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

	}

	return data;

};
