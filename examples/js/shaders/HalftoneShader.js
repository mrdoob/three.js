/**
 * RGB Halftone shader for three.js.
 *	NOTE:
 * 		Shape (1 = Dot, 2 = Ellipse, 3 = Line, 4 = Square)
 *		Blending Mode (1 = Linear, 2 = Multiply, 3 = Add, 4 = Lighter, 5 = Darker)
 */

THREE.HalftoneShader = {

	uniforms: {
		"tDiffuse": { value: null },
		"shape": { value: 1 },
		"radius": { value: 4 },
		"rotateR": { value: Math.PI / 12 * 1 },
		"rotateG": { value: Math.PI / 12 * 2 },
		"rotateB": { value: Math.PI / 12 * 3 },
		"scatter": { value: 0 },
		"width": { value: 1 },
		"height": { value: 1 },
		"blending": { value: 1 },
		"blendingMode": { value: 1 },
		"greyscale": { value: false },
		"disable": { value: false }
	},

	vertexShader: [

		"varying vec2 vUV;",

		"void main() {",

		"	vUV = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#define SQRT2_MINUS_ONE 0.41421356",
		"#define SQRT2_HALF_MINUS_ONE 0.20710678",
		"#define PI2 6.28318531",
		"#define SHAPE_DOT 1",
		"#define SHAPE_ELLIPSE 2",
		"#define SHAPE_LINE 3",
		"#define SHAPE_SQUARE 4",
		"#define BLENDING_LINEAR 1",
		"#define BLENDING_MULTIPLY 2",
		"#define BLENDING_ADD 3",
		"#define BLENDING_LIGHTER 4",
		"#define BLENDING_DARKER 5",
		"uniform sampler2D tDiffuse;",
		"uniform float radius;",
		"uniform float rotateR;",
		"uniform float rotateG;",
		"uniform float rotateB;",
		"uniform float scatter;",
		"uniform float width;",
		"uniform float height;",
		"uniform int shape;",
		"uniform bool disable;",
		"uniform float blending;",
		"uniform int blendingMode;",
		"varying vec2 vUV;",
		"uniform bool greyscale;",
		"const int samples = 8;",

		"float blend( float a, float b, float t ) {",

		// linear blend
		"	return a * ( 1.0 - t ) + b * t;",

		"}",

		"float hypot( float x, float y ) {",

		// vector magnitude
		"	return sqrt( x * x + y * y );",

		"}",

		"float rand( vec2 seed ){",

		// get pseudo-random number
	    "return fract( sin( dot( seed.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );",

		"}",

		"float distanceToDotRadius( float channel, vec2 coord, vec2 normal, vec2 p, float angle, float rad_max ) {",

		// apply shape-specific transforms
		"	float dist = hypot( coord.x - p.x, coord.y - p.y );",
		"	float rad = channel;",

		"	if ( shape == SHAPE_DOT ) {",

		"		rad = pow( abs( rad ), 1.125 ) * rad_max;",

		"	} else if ( shape == SHAPE_ELLIPSE ) {",

		"		rad = pow( abs( rad ), 1.125 ) * rad_max;",

		"		if ( dist != 0.0 ) {",
		"			float dot_p = abs( ( p.x - coord.x ) / dist * normal.x + ( p.y - coord.y ) / dist * normal.y );",
		"			dist = ( dist * ( 1.0 - SQRT2_HALF_MINUS_ONE ) ) + dot_p * dist * SQRT2_MINUS_ONE;",
		"		}",

		"	} else if ( shape == SHAPE_LINE ) {",

		"		rad = pow( abs( rad ), 1.5) * rad_max;",
		"		float dot_p = ( p.x - coord.x ) * normal.x + ( p.y - coord.y ) * normal.y;",
		"		dist = hypot( normal.x * dot_p, normal.y * dot_p );",

		"	} else if ( shape == SHAPE_SQUARE ) {",

		"		float theta = atan( p.y - coord.y, p.x - coord.x ) - angle;",
		"		float sin_t = abs( sin( theta ) );",
		"		float cos_t = abs( cos( theta ) );",
		"		rad = pow( abs( rad ), 1.4 );",
		"		rad = rad_max * ( rad + ( ( sin_t > cos_t ) ? rad - sin_t * rad : rad - cos_t * rad ) );",

		"	}",

		"	return rad - dist;",

		"}",

		"struct Cell {",

		// grid sample positions
		"	vec2 normal;",
		"	vec2 p1;",
		"	vec2 p2;",
		"	vec2 p3;",
		"	vec2 p4;",
		"	float samp2;",
		"	float samp1;",
		"	float samp3;",
		"	float samp4;",

		"};",

		"vec4 getSample( vec2 point ) {",

		// multi-sampled point
		"	vec4 tex = texture2D( tDiffuse, vec2( point.x / width, point.y / height ) );",
		"	float base = rand( vec2( floor( point.x ), floor( point.y ) ) ) * PI2;",
		"	float step = PI2 / float( samples );",
		"	float dist = radius * 0.66;",

		"	for ( int i = 0; i < samples; ++i ) {",

		"		float r = base + step * float( i );",
		"		vec2 coord = point + vec2( cos( r ) * dist, sin( r ) * dist );",
		"		tex += texture2D( tDiffuse, vec2( coord.x / width, coord.y / height ) );",

		"	}",

		"	tex /= float( samples ) + 1.0;",
		"	return tex;",

		"}",

		"float getDotColour( Cell c, vec2 p, int channel, float angle, float aa ) {",

		// get colour for given point
		"	float dist_c_1, dist_c_2, dist_c_3, dist_c_4, res;",

		"	if ( channel == 0 ) {",

		"		c.samp1 = getSample( c.p1 ).r;",
		"		c.samp2 = getSample( c.p2 ).r;",
		"		c.samp3 = getSample( c.p3 ).r;",
		"		c.samp4 = getSample( c.p4 ).r;",

		"	} else if (channel == 1) {",

		"		c.samp1 = getSample( c.p1 ).g;",
		"		c.samp2 = getSample( c.p2 ).g;",
		"		c.samp3 = getSample( c.p3 ).g;",
		"		c.samp4 = getSample( c.p4 ).g;",

		"	} else {",

		"		c.samp1 = getSample( c.p1 ).b;",
		"		c.samp3 = getSample( c.p3 ).b;",
		"		c.samp2 = getSample( c.p2 ).b;",
		"		c.samp4 = getSample( c.p4 ).b;",

		"	}",

		"	dist_c_1 = distanceToDotRadius( c.samp1, c.p1, c.normal, p, angle, radius );",
		"	dist_c_2 = distanceToDotRadius( c.samp2, c.p2, c.normal, p, angle, radius );",
		"	dist_c_3 = distanceToDotRadius( c.samp3, c.p3, c.normal, p, angle, radius );",
		"	dist_c_4 = distanceToDotRadius( c.samp4, c.p4, c.normal, p, angle, radius );",
		"	res = ( dist_c_1 > 0.0 ) ? clamp( dist_c_1 / aa, 0.0, 1.0 ) : 0.0;",
		"	res += ( dist_c_2 > 0.0 ) ? clamp( dist_c_2 / aa, 0.0, 1.0 ) : 0.0;",
		"	res += ( dist_c_3 > 0.0 ) ? clamp( dist_c_3 / aa, 0.0, 1.0 ) : 0.0;",
		"	res += ( dist_c_4 > 0.0 ) ? clamp( dist_c_4 / aa, 0.0, 1.0 ) : 0.0;",
		"	res = clamp( res, 0.0, 1.0 );",

		"	return res;",

		"}",

		"Cell getReferenceCell( vec2 p, vec2 origin, float grid_angle, float step ) {",

		// get containing cell
		"	Cell c;",

		// calc grid
		"	vec2 n = vec2( cos( grid_angle ), sin( grid_angle ) );",
		"	float threshold = step * 0.5;",
		"	float dot_normal = n.x * ( p.x - origin.x ) + n.y * ( p.y - origin.y );",
		"	float dot_line = -n.y * ( p.x - origin.x ) + n.x * ( p.y - origin.y );",
		"	vec2 offset = vec2( n.x * dot_normal, n.y * dot_normal );",
		"	float offset_normal = mod( hypot( offset.x, offset.y ), step );",
		"	float normal_dir = ( dot_normal < 0.0 ) ? 1.0 : -1.0;",
		"	float normal_scale = ( ( offset_normal < threshold ) ? -offset_normal : step - offset_normal ) * normal_dir;",
		"	float offset_line = mod( hypot( ( p.x - offset.x ) - origin.x, ( p.y - offset.y ) - origin.y ), step );",
		"	float line_dir = ( dot_line < 0.0 ) ? 1.0 : -1.0;",
		"	float line_scale = ( ( offset_line < threshold ) ? -offset_line : step - offset_line ) * line_dir;",

		// get closest corner
		"	c.normal = n;",
		"	c.p1.x = p.x - n.x * normal_scale + n.y * line_scale;",
		"	c.p1.y = p.y - n.y * normal_scale - n.x * line_scale;",

		// scatter
		"	if ( scatter != 0.0 ) {",

		"		float off_mag = scatter * threshold * 0.5;",
		"		float off_angle = rand( vec2( floor( c.p1.x ), floor( c.p1.y ) ) ) * PI2;",
		"		c.p1.x += cos( off_angle ) * off_mag;",
		"		c.p1.y += sin( off_angle ) * off_mag;",

		"	}",

		// find corners
		"	float normal_step = normal_dir * ( ( offset_normal < threshold ) ? step : -step );",
		"	float line_step = line_dir * ( ( offset_line < threshold ) ? step : -step );",
		"	c.p2.x = c.p1.x - n.x * normal_step;",
		"	c.p2.y = c.p1.y - n.y * normal_step;",
		"	c.p3.x = c.p1.x + n.y * line_step;",
		"	c.p3.y = c.p1.y - n.x * line_step;",
		"	c.p4.x = c.p1.x - n.x * normal_step + n.y * line_step;",
		"	c.p4.y = c.p1.y - n.y * normal_step - n.x * line_step;",

		"	return c;",

		"}",

		"float blendColour( float a, float b, float t ) {",

		// blend colours
		"	if ( blendingMode == BLENDING_LINEAR ) {",
		"		return blend( a, b, 1.0 - t );",
		"	} else if ( blendingMode == BLENDING_ADD ) {",
		"		return blend( a, min( 1.0, a + b ), t );",
		"	} else if ( blendingMode == BLENDING_MULTIPLY ) {",
		"		return blend( a, max( 0.0, a * b ), t );",
		"	} else if ( blendingMode == BLENDING_LIGHTER ) {",
		"		return blend( a, max( a, b ), t );",
		"	} else if ( blendingMode == BLENDING_DARKER ) {",
		"		return blend( a, min( a, b ), t );",
		"	} else {",
		"		return blend( a, b, 1.0 - t );",
		"	}",

		"}",

		"void main() {",

		"	if ( ! disable ) {",

		// setup
		"		vec2 p = vec2( vUV.x * width, vUV.y * height );",
		"		vec2 origin = vec2( 0, 0 );",
		"		float aa = ( radius < 2.5 ) ? radius * 0.5 : 1.25;",

		// get channel samples
		"		Cell cell_r = getReferenceCell( p, origin, rotateR, radius );",
		"		Cell cell_g = getReferenceCell( p, origin, rotateG, radius );",
		"		Cell cell_b = getReferenceCell( p, origin, rotateB, radius );",
		"		float r = getDotColour( cell_r, p, 0, rotateR, aa );",
		"		float g = getDotColour( cell_g, p, 1, rotateG, aa );",
		"		float b = getDotColour( cell_b, p, 2, rotateB, aa );",

		// blend with original
		"		vec4 colour = texture2D( tDiffuse, vUV );",
		"		r = blendColour( r, colour.r, blending );",
		"		g = blendColour( g, colour.g, blending );",
		"		b = blendColour( b, colour.b, blending );",

		"		if ( greyscale ) {",
		"			r = g = b = (r + b + g) / 3.0;",
		"		}",

		"		gl_FragColor = vec4( r, g, b, 1.0 );",

		"	} else {",

		"		gl_FragColor = texture2D( tDiffuse, vUV );",

		"	}",

		"}"

	].join( "\n" )

};
