uniform float mNear;
uniform float mFar;
uniform float opacity;

varying float vViewZDepth;

#include <common>
#include <packing>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>

	float transformedDepth = 0.0;

	#if DEPTH_FORMAT == 3100

		transformedDepth = viewZToLinearClipZ( vViewZDepth, mNear, mFar );

	#elif DEPTH_FORMAT == 3101

		transformedDepth = viewZToInvClipZ( vViewZDepth, mNear, mFar );

	#else

		gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
		return;

	#endif

	#if DEPTH_PACKING == 3200

		gl_FragColor = vec4( vec3( transformedDepth ), opacity );

	#elif DEPTH_PACKING == 3201

		gl_FragColor = packLinearUnitToRGBA( transformedDepth );

	#else

		gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );

	#endif

}
