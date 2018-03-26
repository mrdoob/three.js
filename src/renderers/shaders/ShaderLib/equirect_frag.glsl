uniform sampler2D tEquirect;

#if defined(NEEDSGLSL300)
in vec3 vWorldPosition;
#else
varying vec3 vWorldPosition;
#endif

#if defined(NEEDSGLSL300)
out vec4 glFragColor;
#endif

#include <common>

void main() {

	vec3 direction = normalize( vWorldPosition );

	vec2 sampleUV;

	sampleUV.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;

	sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;

#if defined(NEEDSGLSL300)
	glFragColor = texture2D( tEquirect, sampleUV );
#else
	gl_FragColor = texture2D( tEquirect, sampleUV );
#endif

}
