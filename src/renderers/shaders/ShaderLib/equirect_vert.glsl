#if defined(NEEDSGLSL300)
out vec3 vWorldPosition;
#else
varying vec3 vWorldPosition;
#endif

#include <common>

void main() {

	vWorldPosition = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

}
