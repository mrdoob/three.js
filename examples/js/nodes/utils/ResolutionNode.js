/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.ResolutionNode = function( renderer ) {

	THREE.Vector2Node.call( this );

	this.requestUpdate = true;

	this.renderer = renderer;

};

THREE.ResolutionNode.prototype = Object.create( THREE.Vector2Node.prototype );
THREE.ResolutionNode.prototype.constructor = THREE.ResolutionNode;

THREE.ResolutionNode.prototype.updateFrame = function( delta ) {

	var size = this.renderer.getSize(),
		pixelRatio = this.renderer.getPixelRatio();

	this.x = size.width * pixelRatio;
	this.y = size.height * pixelRatio;

};
