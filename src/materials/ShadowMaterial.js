/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ShadowMaterial = function () {

	THREE.ShaderMaterial.call( this, {
		uniforms: THREE.UniformsUtils.merge( [
			THREE.UniformsLib[ "lights" ],
			{
				opacity: { value: 1.0 }
			}
		] ),
		vertexShader: THREE.ShaderChunk[ 'shadow_vert' ],
		fragmentShader: THREE.ShaderChunk[ 'shadow_frag' ]
	} );

	Object.defineProperties( this, {
		opacity: {
			enumerable: true,
			get: function () {
				return this.uniforms.opacity.value;
			},
			set: function ( value ) {
				this.uniforms.opacity.value = value;
			}
		}
	} );

};

THREE.Asset.assignPrototype( THREE.ShadowMaterial, THREE.ShaderMaterial, {

	type: 'ShadowMaterial',

	DefaultState: {

		lights: true,
		transparent: true,
		opacity: 1

	}

} );

