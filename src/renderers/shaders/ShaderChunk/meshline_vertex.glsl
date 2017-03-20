#ifdef USE_MESHLINE

	// the following code creates so called 'Screen-Space Projected Lines'
	// see https://mattdesl.svbtle.com/drawing-lines-is-hard#screenspace-projected-lines_2

	float aspect = resolution.x / resolution.y;
	mat4 m = projectionMatrix * modelViewMatrix;

	// calculate positions in clip space

	vec4 currPosClip = m * vec4( position, 1.0 );
	vec4 prevPosClip = m * vec4( prev, 1.0 );
	vec4 nextPosClip = m * vec4( next, 1.0 );

	// convert our points from clip space to NDC space

	vec2 currPosNDC = convertToNDC( currPosClip, aspect );
	vec2 prevPosNDC = convertToNDC( prevPosClip, aspect );
	vec2 nextPosNDC = convertToNDC( nextPosClip, aspect );

	float thickness = 1.8 * lineWidth * width;

	if ( sizeAttenuation == 0.0 ) {

		float pixelWidthRatio = 1.0 / ( resolution.x * projectionMatrix[ 0 ][ 0 ] );
		thickness *= ( currPosClip.w * pixelWidthRatio );

	}

	// compute direction vector for extrusion

	vec2 direction;

	if ( currPosNDC == nextPosNDC ) {

		direction = normalize( currPosNDC - prevPosNDC );

	} else if ( currPosNDC == prevPosNDC ) {

		direction = normalize( nextPosNDC - currPosNDC );

	} else {

		vec2 direction1 = normalize( currPosNDC - prevPosNDC );
		vec2 direction2 = normalize( nextPosNDC - currPosNDC );
		direction = normalize( direction1 + direction2 );

	}

	vec2 offsetDirection = vec2( - direction.y, direction.x );
	offsetDirection.x /= aspect;
	offsetDirection *= side;

	// perfrom extrusion from the center point

	vec2 offset = offsetDirection * thickness * 0.5;
	currPosClip.xy += offset;

	gl_Position = currPosClip;

#endif
