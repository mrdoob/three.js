uniform float envMapIntensity;
uniform float tFlip;
uniform float opacity;
uniform float roughness;

varying vec3 vWorldPosition;

#include <common>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec3 queryReflectVec = vec3( tFlip * vWorldPosition.x, vWorldPosition.yz );

	vec4 envMapColor = vec4( 0.0 );

	#if defined( ENVMAP_TYPE_CUBE )

		#ifdef TEXTURE_LOD_EXT

			envMapColor = textureCubeLodEXT( envMap, queryReflectVec, roughness * 8.0 );

		#else

			envMapColor = textureCube( envMap, queryReflectVec, roughness * 8.0 );

		#endif

		envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

	#elif defined( ENVMAP_TYPE_CUBE_UV )

		envMapColor = textureCubeUV( queryReflectVec, roughness );

	#endif

	gl_FragColor = envMapColor;
	gl_FragColor.rgb *= envMapIntensity;
	gl_FragColor.a = opacity;

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <logdepthbuf_fragment>

}
