/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ScreenNode = function( coord ) {

	THREE.TextureNode.call( this, undefined, coord );

};

THREE.ScreenNode.prototype = Object.create( THREE.TextureNode.prototype );
THREE.ScreenNode.prototype.constructor = THREE.ScreenNode;

THREE.ScreenNode.prototype.isUnique = function() {

	return true;

};

THREE.ScreenNode.prototype.getTexture = function( builder, output ) {

	return THREE.InputNode.prototype.generate.call( this, builder, output, this.getUuid(), 't', 'renderTexture' );

};
