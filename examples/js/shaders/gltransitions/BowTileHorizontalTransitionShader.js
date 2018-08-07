/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery
 * @author huynx
 * 
 * All gltransitions are rewrited from https://gl-transitions.com/
 * 
 * License: MIT
 */

THREE.BowTileHorizontalTransitionShader = {

	uniforms: {},

	fragmentShader: [
	
		"vec2 bottom_left = vec2( 0.0, 1.0 );",
		"vec2 bottom_right = vec2( 1.0, 1.0 );",
		"vec2 top_left = vec2( 0.0, 0.0 );",
		"vec2 top_right = vec2( 1.0, 0.0 );",
		"vec2 center = vec2( 0.5, 0.5 );",

		"float check( vec2 p1, vec2 p2, vec2 p3 ) {",

			"return ( p1.x - p3.x ) * ( p2.y - p3.y ) - ( p2.x - p3.x ) * ( p1.y - p3.y );",

		"}",

		"bool PointInTriangle (vec2 pt, vec2 p1, vec2 p2, vec2 p3){",

			"bool b1, b2, b3;",
			"b1 = check( pt, p1, p2 ) < 0.0;",
			"b2 = check( pt, p2, p3 ) < 0.0;",
			"b3 = check( pt, p3, p1 ) < 0.0;",
			"return ( ( b1 == b2 ) && ( b2 == b3 ) );",

		"}",

		"bool inLeftTriangle( vec2 p ) {",

			"vec2 vertex1, vertex2, vertex3;",
			"vertex1 = vec2( progress, 0.5 );",
			"vertex2 = vec2( 0.0, 0.5 - progress );",
			"vertex3 = vec2( 0.0, 0.5 + progress );",

			"if ( PointInTriangle( p, vertex1, vertex2, vertex3 ) ) {",

				"return true;",

			"}",

			"return false;",

		"}",

		"bool inRightTriangle( vec2 p ) {",

			"vec2 vertex1, vertex2, vertex3;",
			"vertex1 = vec2( 1.0 - progress, 0.5 );",
			"vertex2 = vec2( 1.0, 0.5 - progress );",
			"vertex3 = vec2( 1.0, 0.5 + progress );",

			"if (PointInTriangle( p, vertex1, vertex2, vertex3 ) ) {",

				"return true;",

			"}",

			"return false;",

		"}",

		"float blurEdge( vec2 bot1, vec2 bot2, vec2 top, vec2 testPt ) {",

			"vec2 lineDir = bot1 - top;",
			"vec2 perpDir = vec2( lineDir.y, -lineDir.x );",
			"vec2 dirToPt1 = bot1 - testPt;",
			"float dist1 = abs( dot( normalize( perpDir ), dirToPt1 ) );",
  
			"lineDir = bot2 - top;",
			"perpDir = vec2( lineDir.y, -lineDir.x );",
			"dirToPt1 = bot2 - testPt;",
			"float minDist = min( abs( dot( normalize( perpDir ), dirToPt1 ) ), dist1 );",
  
			"if ( minDist < 0.005 ) {",

				"return minDist / 0.005;",

			"} else {",

				"return 1.0;",

			"};",

		"}",

		"vec4 transition ( vec2 uv ) {",

			"if ( inLeftTriangle( uv ) ) {",

				"if ( progress < 0.1 ) {",

					"return getFromColor( uv );",

				"}",

				"if ( uv.x < 0.5 ) {",

					"vec2 vertex1 = vec2( progress, 0.5 );",
					"vec2 vertex2 = vec2( 0.0, 0.5-progress );",
					"vec2 vertex3 = vec2( 0.0, 0.5+progress );",

					"return mix(",

						"getFromColor( uv ),",
						"getToColor( uv ),",
						"blurEdge( vertex2, vertex3, vertex1, uv )",

					");",

				"} else {",

					"if ( progress > 0.0 ) {",

						"return getToColor( uv );",

					"} else {",

						"return getFromColor( uv );",

					"}",

				"}",

			"} else if ( inRightTriangle( uv ) ) {",
  
				"if ( uv.x >= 0.5 ) {",

					"vec2 vertex1 = vec2( 1.0 - progress, 0.5 );",
					"vec2 vertex2 = vec2( 1.0, 0.5 - progress );",
					"vec2 vertex3 = vec2( 1.0, 0.5 + progress );",

					"return mix(",

						"getFromColor( uv ),",
						"getToColor( uv ),",
						"blurEdge( vertex2, vertex3, vertex1, uv )",

					");",

				"} else {",

					"return getFromColor( uv );",

				"}",

			"} else {",

				"return getFromColor( uv );",

			"}",

		"}"

	].join( "\n" )

};
