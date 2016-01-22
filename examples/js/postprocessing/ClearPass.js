/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ClearPass = function () {

	this.enabled = true;

};

THREE.ClearPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		renderer.setRenderTarget( readBuffer );
		renderer.clear();

		renderer.setRenderTarget( writeBuffer );
		renderer.clear();

	}

};
