import { Vector3 } from '../../math/Vector3.js';
import { Curve } from '../core/Curve.js';

/**
 * @author FracturedShader https://github.com/FracturedShader
 *
 * Centripetal Catmull-Rom Curves avoid cusps and self-intersections
 * in non-uniform catmull rom curves.
 * http://www.cemyuksel.com/research/catmullrom_param/catmullrom.pdf
 *
 * curve.type accepts centripetal(default), chordal and catmullrom
 * curve.tension is used for catmullrom which defaults to 0.5
 */


/*
* Based on an optimized c++ solution in
*  - http://stackoverflow.com/questions/9489736/catmull-rom-curve-with-no-cusps-and-no-self-intersections/
*  - http://ideone.com/NoEbVM
*
* HermiteSegment may be useful elsewhere for caching calculations, as it is just a standard Uniform Cubic Hermite Spline.
*  - https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Unit_interval_.280.2C_1.29
*/

function HermiteSegment() {

	var c0 = 0, c1 = 0, c2 = 0, c3 = 0;

	/*
	 * Compute coefficients for a cubic polynomial
	 *   p(s) = c0 + c1*s + c2*s^2 + c3*s^3
	 * such that
	 *   p(0) = x0, p(1) = x1
	 *  and
	 *   p'(0) = t0, p'(1) = t1.
	 */
	function init( x0, x1, t0, t1 ) {

		c0 = x0;
		c1 = t0;
		c2 = - 3 * x0 + 3 * x1 - 2 * t0 - t1;
		c3 = 2 * x0 - 2 * x1 + t0 + t1;

	}

	return {
		// Standard Catmull-Rom spline
		initCatmullRom: function ( x0, x1, x2, x3, tension ) {

			init( x1, x2, tension * ( x2 - x0 ), tension * ( x3 - x1 ) );

		},

		// Computes coefficients for a nonuniform Catmull-Rom spline
		initNonuniformCatmullRom: function ( x0, x1, x2, x3, dt0, dt1, dt2 ) {

			// compute tangents when parameterized in [t1,t2]
			var t1 = ( x1 - x0 ) / dt0 - ( x2 - x0 ) / ( dt0 + dt1 ) + ( x2 - x1 ) / dt1;
			var t2 = ( x2 - x1 ) / dt1 - ( x3 - x1 ) / ( dt1 + dt2 ) + ( x3 - x2 ) / dt2;

			// rescale tangents for parametrization in [0,1]
			t1 *= dt1;
			t2 *= dt1;

			init( x1, x2, t1, t2 );

		},

		calc: function ( t ) {

			var t2 = t * t;
			var t3 = t2 * t;
			return c0 + c1 * t + c2 * t2 + c3 * t3;

		}
	};

}

function CatmullRomCurve3( points ) {

	Curve.call( this );

	if ( points.length < 2 ) {

		console.warn( 'THREE.CatmullRomCurve3: Points array needs at least two entries.' );

	}

	this.points = points || [];
	this.closed = false;
	this.hermiteSegments = [];
	this.timeValues = [];
	this.segmentsOutdated = true;

}

CatmullRomCurve3.prototype = Object.create( Curve.prototype );
CatmullRomCurve3.prototype.constructor = CatmullRomCurve3;

CatmullRomCurve3.prototype.generateSegments = function () {

	if ( ! this.segmentsOutdated ) {

		return;

	}

	// Reset the main data
	this.hermiteSegments = [];
	this.segmentsOutdated = false;
	this.timeValues = [ 0 ];

	// Define useful constants
	const epsilon = 1e-4;
	const points = this.points;
	const numPoints = points.length;
	const numSegments = this.closed ? numPoints : ( numPoints - 1 );
	const tmp = new Vector3();
	const isCatmullRom = this.type === "catmullrom";
	const tension = isCatmullRom ? ( ( this.tension === undefined ) ? 0.5 : this.tension ) : ( ( this.type === "chordal" ) ? 0.5 : 0.25 );

	// First, make sure all the time values are set
	let prevTime = 0,
		timeDiff = 0,
		numTimePoints = this.closed ? numPoints : ( numPoints + 1 );

	for ( let i = 1; i < numTimePoints; ++ i ) {

		if ( isCatmullRom ) {

			this.timeValues[ i ] = i;

		} else {

			timeDiff = Math.pow( points[ i - 1 ].distanceToSquared( points[ i % numPoints ] ), tension );

			if ( timeDiff < epsilon ) {

				timeDiff = 1;

			}

			this.timeValues[ i ] = prevTime = prevTime + timeDiff;

		}

	}

	// Data in play
	let p0, p1, p2, p3,
		px, py, pz;

	// Construct each segment
	for ( let i = 0; i < numSegments; ++ i ) {

		// p0 is a special case when looking at the first point
		if ( this.closed || i > 0 ) {

			let idx = i - 1;

			while ( idx < 0 ) {

				idx += numPoints;

			}

			p0 = points[ idx % numPoints ];

		} else {

			p0 = tmp.subVectors( points[ 0 ], points[ 1 ] ).add( points[ 0 ] ).clone();

		}

		p1 = points[ i % numPoints ];
		p2 = points[ ( i + 1 ) % numPoints ];

		// p3 is a special case when looking at the last point
		if ( this.closed || ( i + 2 ) < numPoints ) {

			p3 = points[ ( i + 2 ) % numPoints ];

		} else {

			p3 = tmp.subVectors( p2, p1 ).add( p2 ).clone();

		}

		px = new HermiteSegment();
		py = new HermiteSegment();
		pz = new HermiteSegment();

		if ( isCatmullRom ) {

			// Regular Catmull-Rom is pretty straightforward
			px.initCatmullRom( p0.x, p1.x, p2.x, p3.x, tension );
			py.initCatmullRom( p0.y, p1.y, p2.y, p3.y, tension );
			pz.initCatmullRom( p0.z, p1.z, p2.z, p3.z, tension );

		} else {

			let t0, t1, t2, t3;

			// As with p0, t0 is special when looking at the first point
			if ( this.closed || i > 0 ) {

				t0 = this.timeValues[ ( i - 1 ) % numPoints ];

			} else {

				t0 = - Math.pow( p0.distanceToSquared( points[ i % 1 ] ), tension );

				if ( t0 > - epsilon ) {

					t0 = - 1;

				}

			}

			t1 = this.timeValues[ i % numPoints ];
			t2 = this.timeValues[ ( i + 1 ) % numPoints ];

			// As with p3, t3 is special when looking at the last point
			if ( this.closed || ( i + 2 ) < numPoints ) {

				t3 = this.timeValues[ ( i + 2 ) % numPoints ];

			} else {

				t3 = Math.pow( p2.distanceToSquared( p3 ), tension );

				if ( t3 < epsilon ) {

					t3 = 1;

				}

				t3 += t2;

			}

			let dt0 = t1 - t0,
				dt1 = t2 - t1,
				dt2 = t3 - t2;

			px.initNonuniformCatmullRom( p0.x, p1.x, p2.x, p3.x, dt0, dt1, dt2 );
			py.initNonuniformCatmullRom( p0.y, p1.y, p2.y, p3.y, dt0, dt1, dt2 );
			pz.initNonuniformCatmullRom( p0.z, p1.z, p2.z, p3.z, dt0, dt1, dt2 );

		}

		this.hermiteSegments.push( { x: px, y: py, z: pz } );

	}

};

CatmullRomCurve3.prototype.getCatmullSegment = function ( t ) {

	if ( this.segmentsOutdated ) {

		this.generateSegments;

	}

	const timeValues = this.timeValues;
	const numTimeValues = timeValues.length;
	const totalTime = timeValues[ numTimeValues - 1 ];

	let i = 1;

	while ( t < 0 ) {

		t += totalTime;

	}

	while ( t > totalTime ) {

		t -= totalTime;

	}

	while ( t > timeValues[ i ] ) {

		++ i;
		t -= timeValues[ i ];

	}

	const segmentIdx = i - 1;
	const t1 = timeValues[ i - 1 ];
	const t2 = timeValues[ i ];

	return {
		segment: this.hermiteSegments[ segmentIdx ],
		localTime: t / ( t2 - t1 ),
		points: this.points.slice( segmentIdx, 2 ),
		times: [ t1, t2 ]
	};

};

CatmullRomCurve3.prototype.getCatmullPoint = function ( t ) {

	if ( this.segmentsOutdated ) {

		this.generateSegments();

	}

	const localizedSegment = this.getCatmullSegment( t );
	const segment = localizedSegment.segment;
	const localT = localizedSegment.localTime;

	return new Vector3( segment.x.calc( localT ), segment.y.calc( localT ), segment.z.calc( localT ) );

};

CatmullRomCurve3.prototype.getNormalizedSegment = function ( t ) {

	if ( this.segmentsOutdated ) {

		this.generateSegments();

	}

	const numPoints = this.points.length;
	const numSegments = this.hermiteSegments.length;
	const scaledTime = ( numPoints - ( this.closed ? 0 : 1 ) ) * t;
	let segmentIdx = Math.floor( scaledTime );
	let localT = scaledTime - segmentIdx;

	if ( this.closed ) {

		while ( segmentIdx < 0 ) {

			segmentIdx += numSegments;

		}

		segmentIdx = segmentIdx % numSegments;

	} else if ( localT === 0 && ( segmentIdx === numPoints - 1 ) ) {

		-- segmentIdx;
		localT = 1;

	}

	return {
		segment: this.hermiteSegments[ segmentIdx ],
		localTime: localT,
		points: this.points.slice( segmentIdx, 2 )
	};

};

CatmullRomCurve3.prototype.getNormalizedPoint = function ( t ) {

	if ( this.segmentsOutdated ) {

		this.generateSegments();

	}

	const localizedSegment = this.getNormalizedSegment( t );
	const segment = localizedSegment.segment;
	const localT = localizedSegment.localTime;

	return new Vector3( segment.x.calc( localT ), segment.y.calc( localT ), segment.z.calc( localT ) );

};

CatmullRomCurve3.prototype.getPoint = function ( t ) {

	return this.getNormalizedPoint( t );

};


export { CatmullRomCurve3 };
