export default /* glsl */`
#ifdef USE_BUMPMAP

	uniform sampler2D bumpMap;
	uniform float bumpScale;

	// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
	// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

	// Evaluate the derivative of the height w.r.t. screen-space. The texture gradient is taken with central
	// differences one texel apart so it interpolates smoothly across texels, then mapped to screen-space

	vec2 dHdxy_fwd() {

		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );

		vec2 texelSize = 1.0 / vec2( textureSize( bumpMap, 0 ) );
		vec2 dx = vec2( texelSize.x, 0.0 );
		vec2 dy = vec2( 0.0, texelSize.y );
		float gradU = ( texture2D( bumpMap, vBumpMapUv + dx ).x - texture2D( bumpMap, vBumpMapUv - dx ).x ) / ( 2.0 * texelSize.x );
		float gradV = ( texture2D( bumpMap, vBumpMapUv + dy ).x - texture2D( bumpMap, vBumpMapUv - dy ).x ) / ( 2.0 * texelSize.y );

		float dBx = bumpScale * ( gradU * dSTdx.x + gradV * dSTdx.y );
		float dBy = bumpScale * ( gradU * dSTdy.x + gradV * dSTdy.y );

		return vec2( dBx, dBy );

	}

	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {

		// normalize is done to ensure that the bump map looks the same regardless of the texture's scale
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm; // normalized

		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );

		float fDet = dot( vSigmaX, R1 ) * faceDirection;

		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );

	}

#endif
`;
