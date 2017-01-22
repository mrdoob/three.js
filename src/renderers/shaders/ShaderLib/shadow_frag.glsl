uniform float opacity;

#include <common>
#include <packing>
#include <bsdfs>
#include <lights_pars>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main() {

	gl_FragColor = vec4( 0.0, 0.0, 0.0, opacity * ( 1.0 - getShadowMask() ) );

}
