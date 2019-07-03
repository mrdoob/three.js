export default /* glsl */`
uniform float tFlip;
uniform float opacity;
uniform float roughness;

varying vec3 vWorldPosition;

#include <common>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>

void main() {

	vec3 queryVec = vec3( tFlip * vWorldPosition.x, vWorldPosition.yz );

	vec4 envMapColor = vec4( 0.0 );

	#if defined( ENVMAP_TYPE_CUBE )

		#ifdef TEXTURE_LOD_EXT

			envMapColor = textureCubeLodEXT( envMap, queryVec, roughness * 8.0 );

		#else

			envMapColor = textureCube( envMap, queryVec, roughness * 8.0 );

		#endif

		envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;
		envMapColor.rgb *= envMapIntensity;

	#elif defined( ENVMAP_TYPE_CUBE_UV )

		envMapColor = textureCubeUV( queryVec, queryVec, roughness );
		envMapColor.rgb *= envMapIntensity;

	#endif

	gl_FragColor = envMapColor;
	gl_FragColor.a = opacity;

	#include <tonemapping_fragment>
	#include <encodings_fragment>

}
`;
