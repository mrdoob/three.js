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

	#if DEPTH_PACKING == 3100

		float color = 1.0 - smoothstep( mNear, mFar, vViewZDepth );
		gl_FragColor = vec4( vec3( color ), opacity );

	#elif DEPTH_PACKING == 3101

		gl_FragColor = packDepthToRGBA( vViewZDepth, mNear, mFar );

	#elif DEPTH_PACKING == 3102

		gl_FragColor = packDepthToNearBiasedRGBA( vViewZDepth, mNear, mFar );

	#else

		gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );

	#endif

}
