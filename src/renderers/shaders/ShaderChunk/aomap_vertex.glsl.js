export default /* glsl */ `

#if defined( USE_SSAOMAP ) && defined(USE_SSAOMAPMATRIX )

	vec4 ssaoCoords = ssaoMapMatrix * modelMatrix * vec4(transformed, 1.0);
	vAoCoords = (ssaoCoords.xy / ssaoCoords.w) * 0.5 + 0.5;

#endif

`;
