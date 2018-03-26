uniform vec3 diffuse;
uniform float opacity;

uniform float dashSize;
uniform float totalSize;

#if defined(NEEDSGLSL300)
in float vLineDistance;
#else
varying float vLineDistance;
#endif

#if defined(NEEDSGLSL300)
out vec4 glFragColor;
#endif

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	if ( mod( vLineDistance, totalSize ) > dashSize ) {

		discard;

	}

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <logdepthbuf_fragment>
	#include <color_fragment>

	outgoingLight = diffuseColor.rgb; // simple shader

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
