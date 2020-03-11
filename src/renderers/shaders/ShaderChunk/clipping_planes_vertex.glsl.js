export default /* glsl */`
#if NUM_CLIPPING_PLANES > 0 && ! defined( STANDARD ) && ! defined( PHONG ) && ! defined( MATCAP ) && ! defined( TOON )
	vViewPosition = - mvPosition.xyz;
#endif
`;
