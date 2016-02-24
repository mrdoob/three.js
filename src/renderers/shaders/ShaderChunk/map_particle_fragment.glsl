#ifdef USE_MAP

	vec4 mapTexel = texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );
	diffuseColor *= mapTexelToLinear( mapTexel );

#endif
