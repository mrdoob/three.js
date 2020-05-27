console.warn( "THREE.SavePass: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SavePass = function ( renderTarget ) {

	THREE.Pass.call( this );

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.SavePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.textureID = "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderTarget = renderTarget;

	if ( this.renderTarget === undefined ) {

		this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false } );
		this.renderTarget.texture.name = "SavePass.rt";

	}

	this.needsSwap = false;

	this.fsQuad = new THREE.Pass.FullScreenQuad( this.material );

};

THREE.SavePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.SavePass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		renderer.setRenderTarget( this.renderTarget );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

	}

} );
