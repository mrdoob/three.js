export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
	uniform int clippingPlaneVolumeState[ NUM_CLIPPING_PLANES ];

	const int CLIPPING_PLANE_VOLUME_GLOBAL_INCLUDE = 0;
	const int CLIPPING_PLANE_VOLUME_GLOBAL_EXCLUDE = 1;
	const int CLIPPING_PLANE_VOLUME_LOCAL_INCLUDE = 2;
	const int CLIPPING_PLANE_VOLUME_LOCAL_EXCLUDE = 3;
	const int CLIPPING_PLANE_VOLUME_END = 4;

	float clippingPlaneOpacity( const in vec4 clippingPlane ) {

		float distanceToPlane = - dot( vClipPosition, clippingPlane.xyz ) + clippingPlane.w;
		float distanceGradient = fwidth( distanceToPlane ) / 2.0;
		return smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

	}

	uniform int clippingNumGlobalIncludeVolumes;
	uniform int clippingNumLocalIncludeVolumes;

#endif
`;
