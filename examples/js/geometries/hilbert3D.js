/**
 * Hilbert Curve: Generates 2D-Coordinates in a very fast way.
 *
 * @author Dylan Grafmyre
 *
 * Based on work by:
 * @author Thomas Diewald
 * @link http://www.openprocessing.org/visuals/?visualID=15599
 *
 * Based on `examples/canvas_lines_colors.html`:
 * @author OpenShift guest
 * @link https://github.com/mrdoob/three.js/blob/8413a860aa95ed29c79cbb7f857c97d7880d260f/examples/canvas_lines_colors.html
 * @see  Line 149 - 186
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
function hilbert3D(center, size, iterations, v0, v1, v2, v3, v4, v5, v6, v7) {
	// Default Vars
	var center     = undefined !== center ? center : new THREE.Vector3(0, 0, 0),
		size       = undefined !== size ? size : 10,
		half       = size / 2,
		iterations = undefined !== iterations ? iterations : 1,
		v0 = undefined !== v0 ? v0 : 0,
		v1 = undefined !== v1 ? v1 : 1,
		v2 = undefined !== v2 ? v2 : 2,
		v3 = undefined !== v3 ? v3 : 3,
		v4 = undefined !== v4 ? v4 : 4,
		v5 = undefined !== v5 ? v5 : 5,
		v6 = undefined !== v6 ? v6 : 6,
		v7 = undefined !== v7 ? v7 : 7
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
	if( --iterations >= 0 ) {
		var tmp = [];

		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 0 ], half, iterations, v0, v3, v4, v7, v6, v5, v2, v1 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 1 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 2 ], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 3 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 4 ], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 5 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 6 ], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7 ) );
		Array.prototype.push.apply( tmp, hilbert3D ( vec[ 7 ], half, iterations, v6, v5, v2, v1, v0, v3, v4, v7 ) );

		// Return recursive call
		return tmp;
	}

	// Return complete Hilbert Curve.
	return vec;
}
