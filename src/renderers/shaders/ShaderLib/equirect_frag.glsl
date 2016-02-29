uniform sampler2D tEquirect;
uniform float tFlip;

varying vec3 vWorldPosition;

#include <common>
#include <logdepthbuf_pars_fragment>

void main() {

	// 	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	vec3 direction = normalize( vWorldPosition );
	vec2 sampleUV;
	sampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );
	sampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;
	gl_FragColor = texture2D( tEquirect, sampleUV );

	#include <logdepthbuf_fragment>

}
