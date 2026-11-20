export default /* glsl */`
#ifdef USE_BUMPMAP

	uniform sampler2D bumpMap;
	uniform float bumpScale;

	// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
	// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

	// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

	vec2 dHdxy_fwd() {

		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );

		float scale = bumpScale;

		float Hll = scale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = scale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = scale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;

		return vec2( dBx, dBy );

	}

	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {

		// the surface derivatives are not normalized so the bump height keeps its units and the
		// slope stays the same at any view distance
		vec3 vSigmaX = dFdx( surf_pos.xyz );
		vec3 vSigmaY = dFdy( surf_pos.xyz );

		// bumpScale is a height in local units, so the surface is displaced along the local
		// normal carried to view space as a direction, which matches the displacement map
		vec3 vN = surf_norm * vBumpMatrix;
		float invLength = inversesqrt( dot( vN, vN ) );
		vN = vBumpMatrix * vN * invLength;

		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );

		float fDet = dot( vSigmaX, R1 ) * faceDirection;

		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * invLength * surf_norm - vGrad );

	}

#endif
`;
