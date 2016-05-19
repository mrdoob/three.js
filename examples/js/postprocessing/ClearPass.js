/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ClearPass = function () {

	THREE.Pass.call( this );

	this.needsSwap = false;

};

THREE.ClearPass.prototype = Object.create( THREE.Pass.prototype );

Object.assign( THREE.ClearPass.prototype, {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		renderer.setRenderTarget( readBuffer );
		renderer.clear();

	}

} );
