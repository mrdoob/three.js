/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial ) {

	this.scene = scene;
	this.camera = camera;
	this.overrideMaterial = overrideMaterial;

	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		this.scene.overrideMaterial = null;

	}

};
