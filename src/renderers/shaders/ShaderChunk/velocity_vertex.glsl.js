export default /* glsl */`
vec3 transformed = vec3( position );
vec4 mvPosition = vec4( transformed, 1.0 );
vec4 mvPreviousPosition = vec4( transformed, 1.0 );

#ifdef USE_INSTANCING

	mvPosition = instanceMatrix * mvPosition;
	mvPreviousPosition = previousInstanceMatrix * mvPreviousPosition;

#endif

clipPositionCurrent = projectionMatrix * ( modelViewMatrix * mvPosition );
clipPositionPrevious = projectionMatrix * ( previousViewMatrix * (previousModelMatrix * mvPreviousPosition ));

gl_Position = clipPositionCurrent;
`;
