/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.TextureBaseNode = function( value, type ) {

	THREE.InputNode.call( this, type || 'sampler2D' );

	this.value = value;

};

THREE.TextureBaseNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.TextureBaseNode.prototype.constructor = THREE.TextureBaseNode;

THREE.TextureBaseNode.prototype.getTexture = function( builder, output ) {

	return THREE.InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 't' );

};

THREE.TextureBaseNode.prototype.generate = function( builder, output ) {

	return this.getTexture( builder, output );

};
