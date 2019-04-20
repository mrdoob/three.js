/**
 * @author WestLangley / http://github.com/WestLangley
 */

export default /* glsl */`

varying vec3 vNormal;

	void main() {

	vNormal = normalize( normalMatrix * normal );

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`;
