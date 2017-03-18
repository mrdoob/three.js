#ifdef USE_MESHLINE

	// the following code creates so called 'Screen-Space Projected Lines'
	// see https://mattdesl.svbtle.com/drawing-lines-is-hard#screenspace-projected-lines_2

	float aspect = resolution.x / resolution.y;
	float pixelWidthRatio = 1.0 / ( resolution.x * projectionMatrix[ 0 ][ 0 ] );

	mat4 m = projectionMatrix * modelViewMatrix;

	// calculate positions in clip space

	vec4 currentPosition = m * vec4( position, 1.0 );
	vec4 prevPosition = m * vec4( prev, 1.0 );
	vec4 nextPosition = m * vec4( next, 1.0 );

	// convert our points from clip space to NDC space

	vec2 c = convertToNDC( currentPosition, aspect );
	vec2 p = convertToNDC( prevPosition, aspect );
	vec2 n = convertToNDC( nextPosition, aspect );

	float pixelWidth = currentPosition.w * pixelWidthRatio;
	float w = 1.8 * lineWidth * width * pixelWidth;

	// compute direction vector for extrusion

	vec2 dir;

	if ( c == n ) {

		dir = normalize( c - p );

	} else if ( c == p ) {

		dir = normalize( n - c );

	} else {

		vec2 dir1 = normalize( c - p );
		vec2 dir2 = normalize( n - c );
		dir = normalize( dir1 + dir2 );

	}

	vec2 offsetDirection = vec2( - dir.y, dir.x );
	offsetDirection.x /= aspect;
	offsetDirection *= side;

	// perfrom extrusion from the center point

	vec2 offset = offsetDirection * 0.5 * w;
	currentPosition.xy += offset;

	gl_Position = currentPosition;

#endif
