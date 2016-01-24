/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = false;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var writeValue, clearValue;

		var context = renderer.context;
		var state = renderer.state;

		// check inverse masking

		if ( this.inverse === true ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		// setup WebGL state to prepare the stencil test

		state.clearStencil( clearValue );

		state.setStencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.setStencilOp( context.REPLACE, context.REPLACE, context.REPLACE );

		// clear the stencil buffer before drawing

		renderer.clearTarget( readBuffer, false, false, true );
		renderer.clearTarget( writeBuffer, false, false, true );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// setup WebGL state for upcoming stencil tests.
		// only render where stencil is set to 1

		state.setStencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		state.setStencilOp( context.KEEP, context.KEEP, context.KEEP );
	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

	}

};
