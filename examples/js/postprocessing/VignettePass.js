/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.VignettePass = function( offset, darkness ) {

	var shader = THREE.ShaderUtils.lib[ "vignette" ];

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( offset !== undefined )	this.uniforms[ "offset"].value = offset;
	if ( darkness !== undefined ) this.uniforms[ "darkness"].value = darkness;

	this.material = new THREE.MeshShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

};

THREE.VignettePass.prototype = {

	render: function ( renderer, renderTarget, delta ) {

		this.uniforms[ "tDiffuse" ].texture = renderTarget;

		THREE.EffectComposer.quad.materials[ 0 ] = this.material;

		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, renderTarget, false );

		}

	}

};
