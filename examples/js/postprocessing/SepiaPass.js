/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SepiaPass = function( amount ) {

	var shader = THREE.ShaderUtils.lib[ "sepia" ];

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	this.uniforms[ "amount" ].value = ( amount !== undefined ) ? amount : 1.0;

	this.material = new THREE.MeshShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

};

THREE.SepiaPass.prototype = {

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
