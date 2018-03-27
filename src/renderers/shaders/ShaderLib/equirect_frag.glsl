uniform sampler2D tEquirect;

in vec3 vWorldPosition;

out vec4 glFragColor;

#include <common>

void main() {

	vec3 direction = normalize( vWorldPosition );

	vec2 sampleUV;

	sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;

	sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;

	glFragColor = texture2D( tEquirect, sampleUV );

}
