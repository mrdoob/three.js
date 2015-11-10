#ifdef USE_SHADOWMAP

	uniform float shadowDarkness[ NUM_SHADOWS ];
	uniform mat4 shadowMatrix[ NUM_SHADOWS ];
	varying vec4 vShadowCoord[ NUM_SHADOWS ];

#endif