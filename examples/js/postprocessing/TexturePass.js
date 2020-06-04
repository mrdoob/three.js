console.warn( "THREE.TexturePass: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function ( map, opacity ) {

	THREE.Pass.call( this );

	if ( THREE.CopyShader === undefined )
		console.error( "THREE.TexturePass relies on THREE.CopyShader" );

	var shader = THREE.CopyShader;

	this.map = map;
	this.opacity = ( opacity !== undefined ) ? opacity : 1.0;

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		depthTest: false,
		depthWrite: false

	} );

	this.needsSwap = false;

	this.fsQuad = new THREE.Pass.FullScreenQuad( null );

};

THREE.TexturePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.TexturePass,

	render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.fsQuad.material = this.material;

		this.uniforms[ "opacity" ].value = this.opacity;
		this.uniforms[ "tDiffuse" ].value = this.map;
		this.material.transparent = ( this.opacity < 1.0 );

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		if ( this.clear ) renderer.clear();
		this.fsQuad.render( renderer );

		renderer.autoClear = oldAutoClear;

	}

} );
