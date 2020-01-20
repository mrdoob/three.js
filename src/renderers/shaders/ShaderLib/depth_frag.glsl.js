export default /* glsl */`
#if DEPTH_PACKING == 3200

	uniform float opacity;

#endif

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

#ifdef USE_DEPTH_OFFSET
	uniform float depthOffsetUnits;
	uniform float depthOffsetFactor;
#endif

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( 1.0 );

	#if DEPTH_PACKING == 3200

		diffuseColor.a = opacity;

	#endif

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>

	#include <logdepthbuf_fragment>

	float depth = gl_FragCoord.z;

	#ifdef USE_DEPTH_OFFSET
		// polygon offset seems not working properly when using ANGLE (OpenGL on top of Direct3D layer)
		// the shader needs to provide the required functionality instead
		float dx = dFdx(depth);
		float dy = dFdy(depth);
		float d = sqrt(dx*dx + dy*dy);

		float unit = 1e-7; // cca 1 / 2^23
		depth += d * depthOffsetFactor + depthOffsetUnits * unit;
	#endif

	#if DEPTH_PACKING == 3200

		gl_FragColor = vec4( vec3( 1.0 - depth ), opacity );

	#elif DEPTH_PACKING == 3201

		gl_FragColor = packDepthToRGBA( depth );

	#endif

}
`;
