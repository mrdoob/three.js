uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;

varying vec3 vWorldPosition;

#include <common>

void main() {

	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	gl_FragColor.a *= opacity;

}
