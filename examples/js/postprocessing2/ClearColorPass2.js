/**
 * @author mrdoob / http://mrdoob.com/
 * @author Oletus / http://oletus.fi/
 */

THREE.ClearColorPass2 = function ( clearColor, clearAlpha ) {

	THREE.Pass2.call( this );

	var colorBufferConfig = new THREE.IntermediateBufferConfig();
	colorBufferConfig.clear = true;

	this.bufferConfigs = [ colorBufferConfig ];

	this.clearColor = ( clearColor !== undefined ) ? clearColor : 0x000000;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

};

THREE.ClearColorPass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.ClearColorPass2,

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		var colorBuffer = buffers[0];

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.setRenderTarget( colorBuffer );
		renderer.clear();

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

	}

} );
