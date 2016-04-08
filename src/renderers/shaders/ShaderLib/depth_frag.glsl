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

	float color = 1.0 - smoothstep( mNear, mFar, vViewZDepth );
	gl_FragColor = vec4( vec3( color ), opacity );

}
