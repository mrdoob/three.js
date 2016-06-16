/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ClearPass = function () {

	THREE.Pass.call( this );

	this.needsSwap = false;

};

THREE.ClearPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.ClearPass,

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		renderer.setRenderTarget( readBuffer );
		renderer.clear();

	}

} );
