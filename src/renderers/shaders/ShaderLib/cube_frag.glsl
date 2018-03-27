uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;

#if defined(NEEDSGLSL300)
in vec3 vWorldPosition;
#else
varying vec3 vWorldPosition;
#endif

#if defined(NEEDSGLSL300)
out vec4 glFragColor;
#endif

void main() {

#if defined(NEEDSGLSL300)
	glFragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	glFragColor.a *= opacity;
#else
	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	gl_FragColor.a *= opacity;
#endif

}
