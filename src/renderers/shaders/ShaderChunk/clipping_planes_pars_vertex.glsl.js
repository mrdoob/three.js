export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0 && ! defined( STANDARD ) && ! defined( PHONG ) && ! defined( MATCAP )
	varying vec3 vViewPosition;
#endif
`;
