/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function( shader, textureID ) {

	THREE.Pass.call( this );

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	if ( shader instanceof THREE.ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	}
	else if ( shader ) {

		this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		this.material = new THREE.ShaderMaterial( {

			defines: shader.defines || {},
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

	}

};

THREE.ShaderPass.prototype = Object.create( THREE.Pass.prototype );

THREE.ShaderPass.prototype = {

	constructor: THREE.ShaderPass,

	render: function( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		renderer.renderPass( this.material, this.renderToScreen ? null : writeBuffer, this.clear ? renderer.getClearColor() : null, this.clear ? renderer.getClearAlpha() : null );

	}

};
