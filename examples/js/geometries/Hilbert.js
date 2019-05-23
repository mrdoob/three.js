/**
 * Hilbert Curves.
 *
 * @author Dylan Grafmyre
 */

THREE.Hilbert = {

	/**
	 * Generates 2D-Coordinates in a very fast way.
	 *
	 * @author Dylan Grafmyre
	 *
	 * Based on work by:
	 * @author Thomas Diewald
	 * @link http://www.openprocessing.org/sketch/15493
	 *
	 * @param center     Center of Hilbert curve.
	 * @param size       Total width of Hilbert curve.
	 * @param iterations Number of subdivisions.
	 * @param v0         Corner index -X, -Z.
	 * @param v1         Corner index -X, +Z.
	 * @param v2         Corner index +X, +Z.
	 * @param v3         Corner index +X, -Z.
	 */
	generate2D( center, size, iterations, v0, v1, v2, v3 ) {

		// Default Vars
		var center = center !== undefined ? center : new THREE.Vector3( 0, 0, 0 ),
			size = size !== undefined ? size : 10,
			half = size / 2,
			iterations = iterations !== undefined ? iterations : 1,
			v0 = v0 !== undefined ? v0 : 0,
			v1 = v1 !== undefined ? v1 : 1,
			v2 = v2 !== undefined ? v2 : 2,
			v3 = v3 !== undefined ? v3 : 3
		;

		var vec_s = [
			new THREE.Vector3( center.x - half, center.y, center.z - half ),
			new THREE.Vector3( center.x - half, center.y, center.z + half ),
			new THREE.Vector3( center.x + half, center.y, center.z + half ),
			new THREE.Vector3( center.x + half, center.y, center.z - half )
		];

		var vec = [
			vec_s[ v0 ],
			vec_s[ v1 ],
			vec_s[ v2 ],
			vec_s[ v3 ]
		];

		// Recurse iterations
		if ( 0 <= -- iterations ) {

			var tmp = [];

			Array.prototype.push.apply( tmp, THREE.Hilbert.generate2D( vec[ 0 ], half, iterations, v0, v3, v2, v1 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate2D( vec[ 1 ], half, iterations, v0, v1, v2, v3 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate2D( vec[ 2 ], half, iterations, v0, v1, v2, v3 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate2D( vec[ 3 ], half, iterations, v2, v1, v0, v3 ) );

			// Return recursive call
			return tmp;

		}

		// Return complete Hilbert Curve.
		return vec;

	},

	/**
	 * Generates 3D-Coordinates in a very fast way.
	 *
	 * @author Dylan Grafmyre
	 *
	 * Based on work by:
	 * @author Thomas Diewald
	 * @link http://www.openprocessing.org/visuals/?visualID=15599
	 *
	 * @param center     Center of Hilbert curve.
	 * @param size       Total width of Hilbert curve.
	 * @param iterations Number of subdivisions.
	 * @param v0         Corner index -X, +Y, -Z.
	 * @param v1         Corner index -X, +Y, +Z.
	 * @param v2         Corner index -X, -Y, +Z.
	 * @param v3         Corner index -X, -Y, -Z.
	 * @param v4         Corner index +X, -Y, -Z.
	 * @param v5         Corner index +X, -Y, +Z.
	 * @param v6         Corner index +X, +Y, +Z.
	 * @param v7         Corner index +X, +Y, -Z.
	 */
	generate3D( center, size, iterations, v0, v1, v2, v3, v4, v5, v6, v7 ) {

		// Default Vars
		var center = center !== undefined ? center : new THREE.Vector3( 0, 0, 0 ),
			size = size !== undefined ? size : 10,
			half = size / 2,
			iterations = iterations !== undefined ? iterations : 1,
			v0 = v0 !== undefined ? v0 : 0,
			v1 = v1 !== undefined ? v1 : 1,
			v2 = v2 !== undefined ? v2 : 2,
			v3 = v3 !== undefined ? v3 : 3,
			v4 = v4 !== undefined ? v4 : 4,
			v5 = v5 !== undefined ? v5 : 5,
			v6 = v6 !== undefined ? v6 : 6,
			v7 = v7 !== undefined ? v7 : 7
		;

		var vec_s = [
			new THREE.Vector3( center.x - half, center.y + half, center.z - half ),
			new THREE.Vector3( center.x - half, center.y + half, center.z + half ),
			new THREE.Vector3( center.x - half, center.y - half, center.z + half ),
			new THREE.Vector3( center.x - half, center.y - half, center.z - half ),
			new THREE.Vector3( center.x + half, center.y - half, center.z - half ),
			new THREE.Vector3( center.x + half, center.y - half, center.z + half ),
			new THREE.Vector3( center.x + half, center.y + half, center.z + half ),
			new THREE.Vector3( center.x + half, center.y + half, center.z - half )
		];

		var vec = [
			vec_s[ v0 ],
			vec_s[ v1 ],
			vec_s[ v2 ],
			vec_s[ v3 ],
			vec_s[ v4 ],
			vec_s[ v5 ],
			vec_s[ v6 ],
			vec_s[ v7 ]
		];

		// Recurse iterations
		if ( -- iterations >= 0 ) {

			var tmp = [];

			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 0 ], half, iterations, v0, v3, v4, v7, v6, v5, v2, v1 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 1 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 2 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 3 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 4 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 5 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 6 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
			Array.prototype.push.apply( tmp, THREE.Hilbert.generate3D( vec[ 7 ], half, iterations, v6, v5, v2, v1, v0, v3, v4, v7 ) );

			// Return recursive call
			return tmp;

		}

		// Return complete Hilbert Curve.
		return vec;

	}

};
