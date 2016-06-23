/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ClearPass = function () {

	this.enabled = true;

};

THREE.ClearPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer ) {

		renderer.setRenderTarget( readBuffer );
		renderer.clear();

	}

};
