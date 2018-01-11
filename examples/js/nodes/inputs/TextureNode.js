/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TextureNode = function ( value, coord, bias, project ) {

	THREE.InputNode.call( this, 'v4', { shared: true } );

	this.value = value;
	this.coord = coord || new THREE.UVNode();
	this.bias = bias;
	this.project = project !== undefined ? project : false;

};

THREE.TextureNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.TextureNode.prototype.constructor = THREE.TextureNode;
THREE.TextureNode.prototype.nodeType = "Texture";

THREE.TextureNode.prototype.getTexture = function ( builder, output ) {

	return THREE.InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 't' );

};

THREE.TextureNode.prototype.generate = function ( builder, output ) {

	if ( output === 'sampler2D' ) {

		return this.getTexture( builder, output );

	}

	var tex = this.getTexture( builder, output );
	var coord = this.coord.build( builder, this.project ? 'v4' : 'v2' );
	var bias = this.bias ? this.bias.build( builder, 'fv1' ) : undefined;

	if ( bias == undefined && builder.requires.bias ) {

		bias = builder.requires.bias.build( builder, 'fv1' );

	}

	var method, code;

	if ( this.project ) method = 'texture2DProj';
	else method = bias ? 'tex2DBias' : 'tex2D';

	if ( bias ) code = method + '(' + tex + ',' + coord + ',' + bias + ')';
	else code = method + '(' + tex + ',' + coord + ')';

	if ( builder.isSlot( 'color' ) ) {

		code = 'mapTexelToLinear(' + code + ')';

	} else if ( builder.isSlot( 'emissive' ) ) {

		code = 'emissiveMapTexelToLinear(' + code + ')';

	} else if ( builder.isSlot( 'environment' ) ) {

		code = 'envMapTexelToLinear(' + code + ')';

	}

	return builder.format( code, this.type, output );

};

THREE.TextureNode.prototype.toJSON = function ( meta ) {

	var data = this.getJSONNode( meta );

	if ( ! data ) {

		data = this.createJSONNode( meta );

		if ( this.value ) data.value = this.value.uuid;

		data.coord = this.coord.toJSON( meta ).uuid;
		data.project = this.project;

		if ( this.bias ) data.bias = this.bias.toJSON( meta ).uuid;

	}

	return data;

};
