export default /* glsl */`
#ifdef USE_PACKED_NORMAL
	objectNormal = decodeNormal(objectNormal);
#endif
`;