/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ShadowMaterial = function () {

	THREE.ShaderMaterial.call( this, {
		uniforms: THREE.UniformsUtils.merge( [
			THREE.UniformsLib[ "lights" ],
			{
				opacity:  { type: 'f', value: 1.0 }
			}
		] ),
		vertexShader: [
			THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
			"void main() {",
				THREE.ShaderChunk[ "begin_vertex" ],
				THREE.ShaderChunk[ "project_vertex" ],
				THREE.ShaderChunk[ "worldpos_vertex" ],
				THREE.ShaderChunk[ "shadowmap_vertex" ],
			"}"
		].join( '\n' ),
		fragmentShader: [
			THREE.ShaderChunk[ "common" ],
			THREE.ShaderChunk[ "bsdfs" ],
			THREE.ShaderChunk[ "lights_pars" ],
			THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
			THREE.ShaderChunk[ "shadowmask_pars_fragment" ],
			"uniform float opacity;",
			"void main() {",
			"	gl_FragColor = vec4( 0.0, 0.0, 0.0, opacity * ( 1.0  - getShadowMask() ) );",
			"}"
		].join( '\n' )
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
