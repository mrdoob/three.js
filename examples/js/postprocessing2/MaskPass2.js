/**
 * @author alteredq / http://alteredqualia.com/
 * @author Oletus / http://oletus.fi/ - Ported to EffectComposer2
 */

THREE.MaskPass2 = function ( scene, camera ) {

	THREE.Pass2.call( this );

	this.scene = scene;
	this.camera = camera;

	this.clearStencil = true;

	this.inverse = false;

};

THREE.MaskPass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.MaskPass2,

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		var context = renderer.context;
		var state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		state.buffers.depth.setLocked( true );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );

		// draw into the stencil buffer

		renderer.autoClearStencil = true;
		renderer.render( this.scene, this.camera, buffers[0], this.clearStencil );
		renderer.render( this.scene, this.camera, buffers[1], this.clearStencil );
		renderer.autoClearStencil = false;

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		// only render where stencil is set to 1

		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );

	}

} );


THREE.ClearMaskPass2 = function () {

	THREE.Pass2.call( this );

};

THREE.ClearMaskPass2.prototype = Object.create( THREE.Pass2.prototype );

Object.assign( THREE.ClearMaskPass2.prototype, {

	render: function ( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

		renderer.state.buffers.stencil.setTest( false );

	}

} );
