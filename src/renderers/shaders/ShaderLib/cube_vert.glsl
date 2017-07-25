varying vec3 vWorldPosition;

#include <common>

void main() {

	vWorldPosition = transformDirection( position, modelMatrix );
	gl_Position = projectionMatrix * vec4( normalMatrix * position, 1.0 );

}
