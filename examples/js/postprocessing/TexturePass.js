/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function( texture, opacity ) {

	var shader = THREE.ShaderUtils.lib[ "screen" ];

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
	this.uniforms[ "tDiffuse" ].texture = texture;

	this.material = new THREE.MeshShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

};

THREE.TexturePass.prototype = {

	render: function ( renderer, renderTarget, delta ) {

		THREE.EffectComposer.quad.materials[ 0 ] = this.material;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, renderTarget );

	}

};
