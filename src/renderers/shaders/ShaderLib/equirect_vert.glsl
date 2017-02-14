varying vec3 vWorldPosition;

#include <common>

void main() {

	#include <common_vertex>
	#include <begin_vertex>

	vWorldPosition = transformDirection( position, modelMatrix );

	#include <project_vertex>

}
