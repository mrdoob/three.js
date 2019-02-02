/**
 * @author alteredq / http://alteredqualia.com/
 * @author Oletus / http://oletus.fi/
 */

THREE.ShaderPass2 = function ( shader, textureID ) {

	THREE.Pass2.call( this );

	this.colorWriteBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorWriteBufferConfig.clear = true;

	this.colorReadBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorReadBufferConfig.isOutput = false;
	this.colorReadBufferConfig.isInput = true;

	this.bufferConfigs = [ this.colorWriteBufferConfig, this.colorReadBufferConfig ];

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	if ( shader instanceof THREE.ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if ( shader ) {

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

			defines: Object.assign( {}, shader.defines ),
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

	}

	this.fillQuad = THREE.Pass2.createFillQuadScene( this.material );

};

THREE.ShaderPass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {

	constructor: THREE.ShaderPass2,

	render: function( renderer, buffers, deltaTime, maskActive ) {

		var writeBuffer = buffers[0];
		var readBuffer = buffers[1];

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.fillQuad.quad.material = this.material;

		THREE.Pass2.renderWithClear( renderer, this.fillQuad.scene, this.fillQuad.camera, writeBuffer, this.colorWriteBufferConfig.clear );

	}

} );
