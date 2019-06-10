import { WebGLRenderTarget } from './WebGLRenderTarget.js';

/**
 * @author alteredq / http://alteredqualia.com
 * @author WestLangley / http://github.com/WestLangley
 */

function WebGLRenderTargetCube( width, height, options ) {

	WebGLRenderTarget.call( this, width, height, options );

}

WebGLRenderTargetCube.prototype = Object.create( WebGLRenderTarget.prototype );
WebGLRenderTargetCube.prototype.constructor = WebGLRenderTargetCube;

WebGLRenderTargetCube.prototype.isWebGLRenderTargetCube = true;

WebGLRenderTargetCube.prototype.fromEquirectangularTexture = function ( renderer, texture ) {

	this.texture.type = texture.type;
	this.texture.format = texture.format;
	this.texture.encoding = texture.encoding;

	var scene = new THREE.Scene();

	var shader = {

		uniforms: {
			tEquirect: { value: null },
		},

		vertexShader: [

			"varying vec3 vWorldDirection;",

			"vec3 transformDirection( in vec3 dir, in mat4 matrix ) {",

			"	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );",

			"}",

			"void main() {",

			"	vWorldDirection = transformDirection( position, modelMatrix );",

			"	#include <begin_vertex>",
			"	#include <project_vertex>",

			"}"

		].join( '\n' ),

		fragmentShader: [

			"uniform sampler2D tEquirect;",

			"varying vec3 vWorldDirection;",

			"#define RECIPROCAL_PI 0.31830988618",
			"#define RECIPROCAL_PI2 0.15915494",

			"void main() {",

			"	vec3 direction = normalize( vWorldDirection );",

			"	vec2 sampleUV;",

			"	sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;",

			"	sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;",

			"	gl_FragColor = texture2D( tEquirect, sampleUV );",

			"}"

		].join( '\n' ),
	};

	var material = new THREE.ShaderMaterial( {

		type: 'CubemapFromEquirect',

		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		side: THREE.BackSide,
		blending: THREE.NoBlending

	} );

	material.uniforms.tEquirect.value = texture;

	var mesh = new THREE.Mesh( new THREE.BoxBufferGeometry( 5, 5, 5 ), material );

	scene.add( mesh );

	var camera = new THREE.CubeCamera( 1, 10, 1 );

	camera.renderTarget = this;
	camera.renderTarget.texture.name = 'CubeCameraTexture';

	camera.update( renderer, scene );

	mesh.geometry.dispose();
	mesh.material.dispose();

	return this;

};

export { WebGLRenderTargetCube };
