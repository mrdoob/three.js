/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 */

THREE.AfterimagePass = function ( damp ) {

	THREE.Pass.call( this );

	if ( THREE.AfterimageShader === undefined )
		console.error( "THREE.AfterimagePass relies on THREE.AfterimageShader" );

	this.shader = THREE.AfterimageShader;

	this.uniforms = THREE.UniformsUtils.clone( this.shader.uniforms );

	this.uniforms[ "damp" ].value = damp !== undefined ? damp : 0.96;

	this.textureComp = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.textureOld = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {

		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat

	} );

	this.shaderMaterial = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: this.shader.vertexShader,
		fragmentShader: this.shader.fragmentShader

	} );

	this.compFsQuad = new THREE.Pass.FullScreenQuad( this.shaderMaterial );

	var material = new THREE.MeshBasicMaterial( {
		map: this.textureComp.texture
	} );
	this.screenFsQuad = new THREE.Pass.FullScreenQuad( material );

};

THREE.AfterimagePass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.AfterimagePass,

	render: function ( renderer, writeBuffer, readBuffer ) {

		this.uniforms[ "tOld" ].value = this.textureOld.texture;
		this.uniforms[ "tNew" ].value = readBuffer.texture;

		renderer.setRenderTarget( this.textureComp );
		this.compFsQuad.render( renderer );

		renderer.setRenderTarget( this.textureOld );
		this.screenFsQuad.render( renderer );

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.screenFsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this.screenFsQuad.render( renderer );

		}

	}

} );
