/**
 * @author WestLangley / http://github.com/WestLangley
 * @author thezwap / http://github.com/thezwap
 */

THREE.MathUtils = {

	setQuaternionFromProperEuler: function ( q, a, b, c, order ) {

		// Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles

		// rotations are applied to the axes in the order specified by 'order'
		// rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
		// angles are in radians

		var cos = Math.cos;
		var sin = Math.sin;

		var c2 = cos( b / 2 );
		var s2 = sin( b / 2 );

		var c13 = cos( ( a + c ) / 2 );
		var s13 = sin( ( a + c ) / 2 );

		var c1_3 = cos( ( a - c ) / 2 );
		var s1_3 = sin( ( a - c ) / 2 );

		var c3_1 = cos( ( c - a ) / 2 );
		var s3_1 = sin( ( c - a ) / 2 );

		if ( order === 'XYX' ) {

			q.set( c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13 );

		} else if ( order === 'YZY' ) {

			q.set( s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13 );

		} else if ( order === 'ZXZ' ) {

			q.set( s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13 );

		} else if ( order === 'XZX' ) {

			q.set( c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13 );

		} else if ( order === 'YXY' ) {

			q.set( s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13 );

		} else if ( order === 'ZYZ' ) {

			q.set( s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13 );

		} else {

			console.warn( 'THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order.' );

		}

	}

};
