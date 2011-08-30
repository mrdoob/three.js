/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.clear = true;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, renderTarget, delta ) {

		renderer.render( this.scene, this.camera, renderTarget, this.clear );

	}

};
