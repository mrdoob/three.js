export default /* glsl */`
#ifdef USE_MAP

	vec4 texelColor = texture2D( map, MAP_UVS );

	texelColor = mapTexelToLinear( texelColor );
	diffuseColor *= texelColor;

#endif
`;
