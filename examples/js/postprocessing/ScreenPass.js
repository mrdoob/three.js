/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ScreenPass = function( opacity ) {

	var shader = THREE.ShaderUtils.lib[ "screen" ];

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;

	this.material = new THREE.MeshShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

};

THREE.ScreenPass.prototype = {

	render: function ( renderer, renderTarget, delta ) {

		this.uniforms[ "tDiffuse" ].texture = renderTarget;

		THREE.EffectComposer.quad.materials[ 0 ] = this.material;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

	}

};
