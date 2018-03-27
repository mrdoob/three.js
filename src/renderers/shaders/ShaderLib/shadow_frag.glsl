uniform vec3 color;
uniform float opacity;

out vec4 glFragColor;

#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main() {

	glFragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );

	#include <fog_fragment>

}
