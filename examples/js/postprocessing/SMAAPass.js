/**
 * @author mpk / http://polko.me/
 */

THREE.SMAAPass = function ( width, height, areaTexture ) {

	// render targets

	this.edgesRT = new THREE.WebGLRenderTarget( width, height, {
		depthBuffer: false,
		stencilBuffer: false,
		generateMipmaps: false,
		minFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	} );

	this.weightsRT = new THREE.WebGLRenderTarget( width, height, {
		depthBuffer: false,
		stencilBuffer: false,
		generateMipmaps: false,
		minFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat
	} );

	// textures

	if ( areaTexture === undefined ) {
		console.error( "THREE.SMAAPass relies on smaa-area.png texture. You can find it in examples/textures/." );
	}

	this.areaTexture = areaTexture;
	this.areaTexture.format = THREE.RGBFormat;
	this.areaTexture.minFilter = THREE.LinearFilter;
	this.areaTexture.generateMipmaps = false;
	this.areaTexture.flipY = false;

	this.searchTexture = new THREE.DataTexture( this.getSearchTextureBytes(), 66, 33, THREE.AlphaFormat );
	this.searchTexture.magFilter = THREE.NearestFilter;
	this.searchTexture.minFilter = THREE.NearestFilter;
	this.searchTexture.generateMipmaps = false;
	this.searchTexture.unpackAlignment = 1;
	this.searchTexture.needsUpdate = true;
	this.searchTexture.flipY = false;

	// materials - pass 1

	if ( THREE.SMAAShader === undefined ) {
		console.error( "THREE.SMAAPass relies on THREE.SMAAShader" );
	}

	this.uniformsEdges = THREE.UniformsUtils.clone( THREE.SMAAShader[0].uniforms );

	this.uniformsEdges[ "resolution" ].value.set( 1 / width, 1 / height );

	this.materialEdges = new THREE.ShaderMaterial( {
		defines: THREE.SMAAShader[0].defines,
		uniforms: this.uniformsEdges,
		vertexShader: THREE.SMAAShader[0].vertexShader,
		fragmentShader: THREE.SMAAShader[0].fragmentShader
	} );

	// materials - pass 2

	this.uniformsWeights = THREE.UniformsUtils.clone( THREE.SMAAShader[1].uniforms );

	this.uniformsWeights[ "resolution" ].value.set( 1 / width, 1 / height );
	this.uniformsWeights[ "tDiffuse" ].value = this.edgesRT;
	this.uniformsWeights[ "tArea" ].value = this.areaTexture;
	this.uniformsWeights[ "tSearch" ].value = this.searchTexture;

	this.materialWeights = new THREE.ShaderMaterial( {
		defines: THREE.SMAAShader[1].defines,
		uniforms: this.uniformsWeights,
		vertexShader: THREE.SMAAShader[1].vertexShader,
		fragmentShader: THREE.SMAAShader[1].fragmentShader
	} );

	// materials - pass 3

	this.uniformsBlend = THREE.UniformsUtils.clone( THREE.SMAAShader[2].uniforms );

	this.uniformsBlend[ "resolution" ].value.set( 1 / width, 1 / height );
	this.uniformsBlend[ "tDiffuse" ].value = this.weightsRT;

	this.materialBlend = new THREE.ShaderMaterial( {
		uniforms: this.uniformsBlend,
		vertexShader: THREE.SMAAShader[2].vertexShader,
		fragmentShader: THREE.SMAAShader[2].fragmentShader
	} );

	//

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.SMAAPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		// pass 1

		this.uniformsEdges[ "tDiffuse" ].value = readBuffer;

		this.quad.material = this.materialEdges;

		renderer.render( this.scene, this.camera, this.edgesRT, this.clear );

		// pass 2

		this.quad.material = this.materialWeights;

		renderer.render( this.scene, this.camera, this.weightsRT, this.clear );

		// pass 3

		this.uniformsBlend[ "tColor" ].value = readBuffer;

		this.quad.material = this.materialBlend;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	},

	setSize: function ( width, height ) {

		this.edgesRT.setSize( width, height );
		this.weightsRT.setSize( width, height );

		this.materialEdges.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		this.materialWeights.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
		this.materialBlend.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

	},

	getSearchTextureBytes: function () {

		return new Uint8Array( [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,
			1,0,0,1,1,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,
			1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,
			0,1,1,0,0,1,1,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,
			0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,1,
			1,0,0,2,2,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,2,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,1,1,0,0,2,2,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,2,1,0,
			0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,
			0,1,1,0,0,2,2,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,2,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,1,1,0,0,2,2,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,2,
			1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0 ] );

	}

};
