export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];

	float clippingPlaneOpacity( const in vec4 clippingPlane ) {

		float distanceToPlane = - dot( vClipPosition, clippingPlane.xyz ) + clippingPlane.w;
		float distanceGradient = fwidth( distanceToPlane ) / 2.0;
		return smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

	}

	uniform int clippingNumVolumes;
	uniform int clippingNumGlobalVolumes;
	uniform int clippingNumGlobalIncludeVolumes;
	uniform int clippingNumLocalIncludeVolumes;

	#if NUM_CLIPPING_VOLUMES > 0

		uniform int clippingVolumePlaneStart[ NUM_CLIPPING_VOLUMES ];
		uniform int clippingVolumePlaneCount[ NUM_CLIPPING_VOLUMES ];
		uniform int clippingVolumeMode[ NUM_CLIPPING_VOLUMES ];

	#endif

#endif
`;
