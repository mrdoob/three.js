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

 	render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

 		this.scene.overrideMaterial = null;
		renderer.clearDepth();
		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		renderer.context.colorMask( false, false, false, false );
		renderer.context.depthMask( true );
		renderer.render( this.scene, this.camera );
		renderer.context.colorMask( true, true, true, true );

 	}

} );
