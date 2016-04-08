/**
 * @author Ben Houston / bhouston / http://clara.io
 *
 * Test depth pack, unpack and range
 *
 */

THREE.DepthRGBAUnpackedShader = {

	vertexShader: THREE.ShaderChunk[ 'depth_vert' ],

	fragmentShader: [
		"#include <common>",
		"#include <packing>",
		"#include <logdepthbuf_pars_fragment>",

		"void main() {",

			"#include <logdepthbuf_fragment>",

			"#ifdef USE_LOGDEPTHBUF_EXT",

				"float depth = gl_FragDepthEXT;",

			"#else",

				"float depth = gl_FragCoord.z;",

			"#endif",

			"gl_FragColor = vec4( vec3( unpackRGBAToLinearUnit( packLinearUnitToRGBA( depth ) ) ), 1.0 );",

		"}"
		].join( "\n" )

};
