/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TextureNode = function( value, coord, bias ) {

	THREE.InputNode.call( this, 'v4' );

	this.value = value;
	this.coord = coord || new THREE.UVNode();
	this.bias = bias;

};

THREE.TextureNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.TextureNode.prototype.constructor = THREE.TextureNode;

THREE.TextureNode.prototype.getTexture = function( builder, output ) {

	return THREE.InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 't' );

};

THREE.TextureNode.prototype.generate = function( builder, output ) {

	var tex = this.getTexture( builder, output );
	var coord = this.coord.build( builder, 'v2' );
	var bias = this.bias ? this.bias.build( builder, 'fv1' ) : undefined;

	if ( bias == undefined && builder.requires.bias ) {

		bias = builder.requires.bias.build( builder, 'fv1' );

	}

	var code;

	if ( bias ) code = 'texture2D(' + tex + ',' + coord + ',' + bias + ')';
	else code = 'texture2D(' + tex + ',' + coord + ')';

	return builder.format( code, this.type, output );

};
