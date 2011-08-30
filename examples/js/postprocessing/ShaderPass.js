/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.MeshShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, renderTarget, delta ) {

		this.uniforms[ this.textureID ].texture = renderTarget;

		THREE.EffectComposer.quad.materials[ 0 ] = this.material;

		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, renderTarget, false );

		}

	}

};
