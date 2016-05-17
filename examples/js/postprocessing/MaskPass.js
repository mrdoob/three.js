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

		state.buffers.color.mask( false );
		state.buffers.depth.mask( false );

		// lock buffers

		state.buffers.color.locked( true );
		state.buffers.depth.locked( true );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.test( true );
		state.buffers.stencil.op( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.func( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.clear( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.locked( false );
		state.buffers.depth.locked( false );

		// only render where stencil is set to 1

		state.buffers.stencil.func( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		state.buffers.stencil.op( context.KEEP, context.KEEP, context.KEEP );

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

		renderer.state.buffers.stencil.test( false );

	}

};
