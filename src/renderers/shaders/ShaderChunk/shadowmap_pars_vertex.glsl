#ifdef USE_SHADOWMAP

	uniform float shadowDarkness[ MAX_SHADOWS ];
	uniform mat4 shadowMatrix[ MAX_SHADOWS ];
	varying vec4 vShadowCoord[ MAX_SHADOWS ];

#endif