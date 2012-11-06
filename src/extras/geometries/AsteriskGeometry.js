/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- 3d asterisk shape (for line pieces THREE.Line)
 */

THREE.AsteriskGeometry = function ( innerRadius, outerRadius ) {

	THREE.Geometry.call( this );

	var sd = innerRadius;
	var ed = outerRadius;

	var sd2 = 0.707 * sd;
	var ed2 = 0.707 * ed;

	var rays = [ [ sd, 0, 0 ], [ ed, 0, 0 ], [ -sd, 0, 0 ], [ -ed, 0, 0 ],
				 [ 0, sd, 0 ], [ 0, ed, 0 ], [ 0, -sd, 0 ], [ 0, -ed, 0 ],
				 [ 0, 0, sd ], [ 0, 0, ed ], [ 0, 0, -sd ], [ 0, 0, -ed ],
				 [ sd2, sd2, 0 ], [ ed2, ed2, 0 ], [ -sd2, -sd2, 0 ], [ -ed2, -ed2, 0 ],
				 [ sd2, -sd2, 0 ], [ ed2, -ed2, 0 ], [ -sd2, sd2, 0 ], [ -ed2, ed2, 0 ],
				 [ sd2, 0, sd2 ], [ ed2, 0, ed2 ], [ -sd2, 0, -sd2 ], [ -ed2, 0, -ed2 ],
				 [ sd2, 0, -sd2 ], [ ed2, 0, -ed2 ], [ -sd2, 0, sd2 ], [ -ed2, 0, ed2 ],
				 [ 0, sd2, sd2 ], [ 0, ed2, ed2 ], [ 0, -sd2, -sd2 ], [ 0, -ed2, -ed2 ],
				 [ 0, sd2, -sd2 ], [ 0, ed2, -ed2 ], [ 0, -sd2, sd2 ], [ 0, -ed2, ed2 ]
	];

	for ( var i = 0, il = rays.length; i < il; i ++ ) {

		var x = rays[ i ][ 0 ];
		var y = rays[ i ][ 1 ];
		var z = rays[ i ][ 2 ];

		this.vertices.push( new THREE.Vector3( x, y, z ) );

	}

};

THREE.AsteriskGeometry.prototype = Object.create( THREE.Geometry.prototype );