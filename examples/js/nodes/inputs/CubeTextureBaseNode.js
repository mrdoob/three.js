/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.CubeTextureBaseNode = function( value, type ) {

	THREE.InputNode.call( this, type || 'samplerCube' );

	this.value = value;

};

THREE.CubeTextureBaseNode.prototype = Object.create( THREE.InputNode.prototype );
THREE.CubeTextureBaseNode.prototype.constructor = THREE.CubeTextureBaseNode;

THREE.CubeTextureBaseNode.prototype.getTexture = function( builder, output ) {

	return THREE.InputNode.prototype.generate.call( this, builder, output, this.value.uuid, 't' );

};

THREE.CubeTextureBaseNode.prototype.generate = function( builder, output ) {

	return this.getTexture( builder, output );

};
