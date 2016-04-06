uniform vec3 lightPos;
varying vec4 vWorldPosition;

#include <common>
#include <packing>


void main () {

	gl_FragColor = packLinearUnitToRGBA( length( vWorldPosition.xyz - lightPos.xyz ) / 1000.0 );

}
