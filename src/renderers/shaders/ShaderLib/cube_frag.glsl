uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;

in vec3 vWorldPosition;

out vec4 glFragColor;

void main() {

	glFragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );
	glFragColor.a *= opacity;

}
