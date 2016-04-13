uniform vec3 lightPos;
varying vec4 vWorldPosition;

#include <common>
#include <packing>
#include <clipping_planes_pars_fragment>

void main () {

	#include <clipping_planes_fragment>

	gl_FragColor = packDepthToRGBA( length( vWorldPosition.xyz - lightPos.xyz ) / 1000.0 );

}
