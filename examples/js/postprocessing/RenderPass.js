/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;
	this.clearColor = clearColor;

	this.clear = true;
	this.needsSwap = false;

	this.oldClearColor = new THREE.Color();

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			renderer.setClearColor( this.clearColor, 1 );

		}

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, 1 );

		}

		this.scene.overrideMaterial = null;

	}

};
