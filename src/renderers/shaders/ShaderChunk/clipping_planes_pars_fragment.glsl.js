export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];

	#ifdef USE_CLIPPING_VOLUMES

		uniform int clippingNumVolumes;
		uniform int clippingNumIncludeVolumes;

		#if NUM_CLIPPING_VOLUMES > 0

			uniform int clippingVolumePlaneStart[ NUM_CLIPPING_VOLUMES ];
			uniform int clippingVolumePlaneCount[ NUM_CLIPPING_VOLUMES ];
			uniform int clippingVolumeMode[ NUM_CLIPPING_VOLUMES ];

		#endif

	#endif

#endif
`;
