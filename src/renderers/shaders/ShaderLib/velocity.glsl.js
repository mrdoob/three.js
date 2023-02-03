export const vertex = /* glsl */`
uniform mat4 previousViewMatrices[2];
uniform mat4 previousModelMatrix;
#define previousViewMatrix previousViewMatrices[VIEW_ID];

varying vec4 clipPositionCurrent;
varying vec4 clipPositionPrevious;

#include <common>

void main() {

	#include <velocity_vertex>

}
`;

export const fragment = /* glsl */`
void main() {

	highp vec4 motionVector = (clipPositionCurrent / clipPositionCurrent.w - clipPositionPrevious / clipPositionPrevious.w );
	gl_FragColor = motionVector;

}
`;
