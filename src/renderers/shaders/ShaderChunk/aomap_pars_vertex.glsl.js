export default /* glsl */`

#if defined( USE_SSAOMAP ) && defined(USE_SSAOMAPMATRIX )

	uniform mat4 ssaoMapMatrix;

	varying vec2 vAoCoords;

#endif

`;
