#ifdef USE_BUMPMAP

#if ! defined( TEXTURE_SLOTS )

	uniform sampler2D bumpMap;
	uniform float bumpScale;

#endif

	// Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen
	// http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html

	// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

	vec2 dHdxy_fwd() {

#if defined( TEXTURE_SLOTS )
		vec2 bumpUv = bumpMapUV();
#else
		vec2 bumpUv = vUv;
#endif

		vec2 dSTdx = dFdx( bumpUv );
		vec2 dSTdy = dFdy( bumpUv );

		float Hll = bumpMapTexelTransform( texture2D( bumpMap, bumpUv ) ).x;
		float dBx = bumpMapTexelTransform( texture2D( bumpMap, bumpUv + dSTdx ) ).x - Hll;
		float dBy = bumpMapTexelTransform( texture2D( bumpMap, bumpUv + dSTdy ) ).x - Hll;

		return vec2( dBx, dBy );

	}

	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {

		vec3 vSigmaX = dFdx( surf_pos );
		vec3 vSigmaY = dFdy( surf_pos );
		vec3 vN = surf_norm;		// normalized

		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );

		float fDet = dot( vSigmaX, R1 );

		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );

	}

#endif
