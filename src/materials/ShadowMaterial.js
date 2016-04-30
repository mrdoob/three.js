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

	this.lights = true;
	this.transparent = true;

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

THREE.ShadowMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );
THREE.ShadowMaterial.prototype.constructor = THREE.ShadowMaterial;
