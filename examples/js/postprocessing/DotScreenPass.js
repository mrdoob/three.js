/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DotScreenPass = function( center, angle, scale ) {

	var shader = THREE.ShaderUtils.lib[ "dotscreen" ];

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if ( center !== undefined )
		this.uniforms[ "center" ].value.copy( center );

	if ( angle !== undefined )	this.uniforms[ "angle"].value = angle;
	if ( scale !== undefined )	this.uniforms[ "scale"].value = scale;

	this.material = new THREE.MeshShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

};

THREE.DotScreenPass.prototype = {

	render: function ( renderer, renderTarget, delta ) {

		this.uniforms[ "tDiffuse" ].texture = renderTarget;
		this.uniforms[ "tSize" ].value.set( renderTarget.width, renderTarget.height );

		THREE.EffectComposer.quad.materials[ 0 ] = this.material;

		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, renderTarget, false );

		}

	}

};
