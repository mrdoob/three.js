/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

	}

};
