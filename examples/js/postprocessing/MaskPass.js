/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;

	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = Object.create( THREE.Pass.prototype );

THREE.MaskPass.prototype = {

	constructor: THREE.MaskPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		var context = renderer.context;
		var state = renderer.state;

		// don't update color or depth

		state.setColorWrite( false );
		state.setDepthWrite( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.setStencilTest( true );
		state.setStencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.setStencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		state.setColorWrite( true );
		state.setDepthWrite( true );

		// only render where stencil is set to 1

		state.setStencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		state.setStencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	THREE.Pass.call( this );

	this.needsSwap = false;

};

THREE.ClearMaskPass.prototype = Object.create( THREE.Pass.prototype );

THREE.ClearMaskPass.prototype = {

	constructor: THREE.ClearMaskPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		renderer.state.setStencilTest( false );

	}

};
