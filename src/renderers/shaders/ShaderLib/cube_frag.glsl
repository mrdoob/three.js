uniform samplerCube tCube;
uniform float tFlip;

varying vec3 vWorldPosition;

#include <common>
#include <logdepthbuf_pars_fragment>

void main() {

	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );

	#include <logdepthbuf_fragment>

}
