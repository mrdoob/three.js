export default /* glsl */`
#ifdef USE_WIREFRAME

	float thickness = wireframeLinewidth;

	vec3 afwidth = fwidth( vCenter.xyz );

	vec3 edge3 = smoothstep( ( thickness - 1.0 ) * afwidth, thickness * afwidth, vCenter.xyz );

	// grok alternative
	//vec3 vCenterInPixels = vCenter.xyz / afwidth;
	//vec3 edge3 = smoothstep( vec3( 0.0 ), vec3( thickness ), vCenterInPixels );

	float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );   

	diffuseColor.a *= edge;

	if ( diffuseColor.a == 0.0 ) discard;

#endif
`;
