/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.TexturePass = function( texture, opacity ) {

	var shader = THREE.ShaderExtras[ "screen" ];

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.uniforms[ "opacity" ].value = ( opacity !== undefined ) ? opacity : 1.0;
	this.uniforms[ "tDiffuse" ].texture = texture;

	this.material = new THREE.MeshShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.needsSwap = false;

};

THREE.TexturePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		THREE.EffectComposer.quad.materials[ 0 ] = this.material;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, readBuffer );

	}

};
