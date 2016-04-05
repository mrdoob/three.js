uniform float opacity;
varying vec3 vNormal;

#include <common>
#include <packing>
#include <logdepthbuf_pars_fragment>

void main() {

	gl_FragColor = vec4( packNormalToRGB( vNormal ), opacity );

	#include <logdepthbuf_fragment>

}
