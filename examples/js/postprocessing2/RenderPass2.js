/**
 * @author alteredq / http://alteredqualia.com/
 * @author Oletus / http://oletus.fi/
 */

THREE.RenderPass2 = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	THREE.Pass2.call( this );

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

	this.colorBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorBufferConfig.clear = true;
	this.colorBufferConfig.isInput = true;

	this.bufferConfigs = [ this.colorBufferConfig ];

	this.clearDepth = false;

};

THREE.RenderPass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.RenderPass2,

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		colorBuffer = buffers[0];

		this.scene.overrideMaterial = this.overrideMaterial;

		var oldClearColor, oldClearAlpha;

		if ( this.clearColor ) {

			oldClearColor = renderer.getClearColor().getHex();
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		if ( this.clearDepth ) {

			renderer.clearDepth();

		}

		THREE.Pass2.renderWithClear( renderer, this.scene, this.camera, colorBuffer, this.colorBufferConfig.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( oldClearColor, oldClearAlpha );

		}

		this.scene.overrideMaterial = null;
	}

} );
