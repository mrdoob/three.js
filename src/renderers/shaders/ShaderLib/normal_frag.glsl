uniform float opacity;
varying vec3 vNormal;

#include <common>
#include <logdepthbuf_pars_fragment>

void main() {

	gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );

	#include <logdepthbuf_fragment>

}
