uniform vec3 diffuse;
uniform float opacity;

#if defined(NEEDSGLSL300)
out vec4 glFragColor;
#endif

#include <common>
#include <packing>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <fog_pars_fragment>
#include <shadowmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>

	outgoingLight = diffuseColor.rgb;

#if defined(NEEDSGLSL300)
	glFragColor = vec4( outgoingLight, diffuseColor.a );
#else
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
#endif

	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>

}
