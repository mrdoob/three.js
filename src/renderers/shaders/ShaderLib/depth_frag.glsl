#if DEPTH_FORMAT != 3100

	uniform float mNear;
	uniform float mFar;

#endif

#if DEPTH_PACKING == 3200

	uniform float opacity;

#endif

#if DEPTH_FORMAT != 3100

	varying float vViewZDepth;

#endif

#include <common>
#include <packing>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>

	float transformedDepth = 0.0;

	#if DEPTH_FORMAT == 3100 // AutoDepthFormat

		transformedDepth = gl_FragCoord.z;

	#elif DEPTH_FORMAT == 3101

		transformedDepth = viewZToLinearClipZ( vViewZDepth, mNear, mFar );

	#elif DEPTH_FORMAT == 3102

		transformedDepth = viewZToInvClipZ( vViewZDepth, mNear, mFar );

	#endif

	#if DEPTH_PACKING == 3200

		gl_FragColor = vec4( vec3( transformedDepth ), opacity );

	#elif DEPTH_PACKING == 3201

		gl_FragColor = packLinearUnitToRGBA( transformedDepth );

	#endif

}
