/**
 * @author jjxtra / https://www.digitalruby.com
 */

THREE.DepthPass = function ( scene, camera ) {

	THREE.Pass.call( this );

	this.scene = scene;
	this.camera = camera;
	this.needsSwap = false;

};

THREE.DepthPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.DepthPass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		this.scene.overrideMaterial = null;
		renderer.clearDepth();
		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		renderer.state.buffers.color.setMask( false, false, false, false, false );
		renderer.state.buffers.depth.setMask( true );
		renderer.render( this.scene, this.camera );
		renderer.state.buffers.color.setMask( true, true, true, true, true );

	}

} );
