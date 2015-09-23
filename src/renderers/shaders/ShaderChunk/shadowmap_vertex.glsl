#ifdef USE_SHADOWMAP

	for( int i = 0; i < MAX_SHADOWS; i ++ ) {

		#if defined(POINT_LIGHT_SHADOWS)

			// if shadowDarkness[ i ] < 0.0, that means we have a point light with a cube
			// shadow map
			if( shadowDarkness[ i ] < 0.0 ) {

				// calculate vector from light to vertex in view space

				vec3 fromLight = mvPosition.xyz - pointLightPosition[ i ];

				// Transform 'fromLight' into world space by multiplying it on the left
				// side of 'viewMatrix'. This is equivalent to multiplying it on the right
				// side of the transpose of 'viewMatrix'. Since 'viewMatrix' is orthogonal, 
				// its transpose is the same as its inverse.

				fromLight = fromLight * mat3( viewMatrix );

				// We repurpose vShadowCoord to hold the distance in world space from the
				// light to the vertex. This value will be interpolated correctly in the fragment shader.

				vShadowCoord[ i ] = vec4( fromLight, 1.0 );

			} else {

				vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;

			}

		#else

			vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;

		#endif

	}

#endif