/**
 * @author yomboprime https://github.com/yomboprime
 *
 * THREE.ConvexObjectBreaker
 *
 *
 * @param {int} maxRadialIterations Iterations for radial cuts.
 * @param {int} maxRandomIterations Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {double} minSizeForBreak Min size a debris can have to break.
 * @param {double} minSizeForRadialSubdivision Min size a debris can have to break in radial subdivision.
 * 
  */

THREE.ConvexObjectBreaker = function( maxRadialIterations, maxRandomIterations, minSizeForBreak, minSizeForRadialSubdivision, smallDelta ) {

	this.maxRadialIterations = maxRadialIterations || 3;
	this.maxRandomIterations = maxRandomIterations || 2;
	this.minSizeForBreak = minSizeForBreak || 1.4;
	this.minSizeForRadialSubdivision = minSizeForRadialSubdivision || 2.5;
	this.smallDelta = smallDelta || 0.0001;

	this.tempLine1 = new THREE.Line3();
	this.tempCM1 = new THREE.Vector3();
	this.tempCM2 = new THREE.Vector3();

};

THREE.ConvexObjectBreaker.prototype = {

	constructor: THREE.ConvexObjectBreaker,

	createSegmentedObject: function( points, segments, mass, pos, quat, velocity, angularVelocity, breakable ) {

		// Create points mark
		for ( var i = 0, il = points.length; i < il; i++ ) {
			var p = points[ i ];
			p.mark = 0;
			p.index0 = -1;
			p.index1 = -1;
		}

		return {

			points: points,
			segments: segments,

			mass: mass,

			pos: pos.clone(),
			quat: quat.clone(),

			velocity: velocity.clone(),
			angularVelocity: angularVelocity.clone(),

			breakable: breakable

		};

	},

	createParalellepipedSegmentedObject: function( halfDimensions, pos, quat, velocity, angularVelocity, mass ) {

		var w = halfDimensions.x;
		var h = halfDimensions.y;
		var d = halfDimensions.z;

		var points = [

			new THREE.Vector3( w, h, d ),
			new THREE.Vector3( w, h, - d ),
			new THREE.Vector3( w, - h, d ),
			new THREE.Vector3( w, - h, - d ),
			new THREE.Vector3( - w, h, d ),
			new THREE.Vector3( - w, h, - d ),
			new THREE.Vector3( - w, - h, d ),
			new THREE.Vector3( - w, - h, - d )

		];

		var segments = [

			0, 4,
			1, 5,
			2, 6,
			3, 7,

			0, 1,
			4, 5,
			2, 3,
			6, 7,

			0, 2,
			4, 6,
			1, 3,
			5, 7

		];

		return this.createSegmentedObject( points, segments, mass, pos, quat, velocity, angularVelocity, true );

	},

	subdivideByImpact: function( pointOfImpact, segmentedObject ) {

		var debris = [];


		return debris;

	},

	cutByPlane: function( segmentedObject, plane, output ) {

		// Returns objects in output.segmentedObject1 and output.segmentedObject2 members, the resulting 2 pieces of the cut.
		// segmentedObject2 can be null if the plane doesn't cut the object.
		// segmentedObject1 can be null only in case of internal error
		// Returned value is number of pieces, 0 for error.

		var points1 = [];
		var points2 = [];
		var segments1 = [];
		var segments2 = [];

		var points = segmentedObject.points;
		var segments = segmentedObject.segments;

		var delta = this.smallDelta;

		for ( var i = 0, il = segments.length; i < il; i += 2 ) {

			var i0 = segments[ i ];
			var i1 = segments[ i + 1];
			var p0 = points[ i0 ];
			var p1 = points[ i1 ];

			if ( p0.mark === 0 ) {

				var d = plane.distanceToPoint( p0 );

				// mark: 1 for negative side, 2 for positive side, 3 for coplanar point
				if ( d > delta ) {
					p0.mark = 2;
					p0.index0 = points2.push( p0 ) - 1;
				}
				else if ( d < - delta ) {
					p0.mark = 1;
					p0.index0 = points1.push( p0 ) - 1;
				}
				else {
					p0.mark = 3;
					p0.index0 = points1.push( p0 ) - 1;
					p0.index1 = points2.push( p0 ).clone() - 1;
				}

			}

			if ( p1.mark === 0 ) {

				var d = plane.distanceToPoint( p1 );

				// mark: 1 for negative side, 2 for positive side, 3 for coplanar point
				if ( d > delta ) {
					p1.mark = 2;
					p1.index0 = points2.push( p1 ) - 1;
				}
				else if ( d < - delta ) {
					p1.mark = 1;
					p1.index0 = points1.push( p1 ) - 1;
				}
				else {
					p1.mark = 3;
					p1.index0 = points1.push( p1 ) - 1;
					p1.index1 = points2.push( p1 ).clone() - 1;
				}

			}
			
			var mark0 = p0.mark;
			var mark1 = p1.mark;

			if ( mark0 === 1 && mark1 === 1 ) {

				segments1[ segments1.length ] = p0.index0;
				segments1[ segments1.length ] = p1.index0;

			}
			else if ( mark0 === 2 && mark1 === 2 ) {

				segments2[ segments2.length ] = p0.index0;
				segments2[ segments2.length ] = p1.index0;

			}
			else if ( ( mark0 === 1 && mark1 === 2 ) || ( mark0 === 2 && mark1 === 1 ) ) {

				// Intersection of segment with the plane

				this.tempLine1.start.copy( p0 );
				this.tempLine1.end.copy( p1 );
				var intersection = plane.intersectLine( this.tempLine1 );
				if ( intersection === undefined ) {
					// Shouldn't happen
					console.error( "Internal error: segment does not intersect plane." );
					output.segmentedObject1 = null;
					output.segmentedObject2 = null;
					return 0;
				}
				
				var iIntersection0 = points1.push( intersection );
				var iIntersection1 = points2.push( intersection.clone() );

				if ( mark0 === 1 ) {
					segments1[ segments1.length ] = p0.index0;
					segments1[ segments1.length ] = iIntersection0;
					segments2[ segments2.length ] = p1.index0;
					segments2[ segments2.length ] = iIntersection1;
				}
				else {
					segments1[ segments1.length ] = p1.index0;
					segments1[ segments1.length ] = iIntersection0;
					segments2[ segments2.length ] = p0.index0;
					segments2[ segments2.length ] = iIntersection1;
				}

			}
			else if ( mark1 === 3 ) {

				if ( mark0 === 1 ) {
					segments1[ segments1.length ] = p0.index0;
					segments1[ segments1.length ] = p1.index0;
				}
				else if ( mark0 === 2 ) {
					segments2[ segments2.length ] = p0.index0;
					segments2[ segments2.length ] = p1.index1;
				}
				else {
					segments1[ segments1.length ] = p0.index0;
					segments1[ segments1.length ] = p1.index0;
					segments2[ segments2.length ] = p0.index1;
					segments2[ segments2.length ] = p1.index1;
				}

			}
			else if ( mark0 === 3 ) {

				if ( mark1 === 1 ) {
					segments1[ segments1.length ] = p0.index0;
					segments1[ segments1.length ] = p1.index0;
				}
				else if ( mark1 === 2 ) {
					segments2[ segments2.length ] = p0.index1;
					segments2[ segments2.length ] = p1.index0;
				}
				else {
					segments1[ segments1.length ] = p0.index0;
					segments1[ segments1.length ] = p1.index0;
					segments2[ segments2.length ] = p0.index1;
					segments2[ segments2.length ] = p1.index1;
				}

			}

		}

		// Calculate debris mass (very fast and imprecise):
		var newMass = segmentedObject.mass * 0.5;

		// Calculate debris Center of Mass (again fast and imprecise)
		this.tempCM1.set( 0, 0, 0 );
		var numPoints1 = points1.length;
		if ( numPoints1 > 0 ) {
			for ( var i = 0; i < numPoints1; i++ ) {
				this.tempCM1.add( points1[ i ] );
			}
			this.tempCM1.divideScalar( numPoints1 );
			for ( var i = 0; i < numPoints1; i++ ) {
				points1[ i ].sub( this.tempCM1 );
			}
			this.tempCM1.add( segmentedObject.pos );
		}

		this.tempCM2.set( 0, 0, 0 );
		var numPoints2 = points2.length;
		if ( numPoints2 > 0 ) {
			for ( var i = 0; i < numPoints2; i++ ) {
				this.tempCM2.add( points2[ i ] );
			}
			this.tempCM2.divideScalar( numPoints2 );
			for ( var i = 0; i < numPoints2; i++ ) {
				points2[ i ].sub( this.tempCM2 );
			}
			this.tempCM2.add( segmentedObject.pos );
		}

		var segmentedObject1 = null;
		var segmentedObject2 = null;

		if ( numPoints1 > 0 ) {

			segmentedObject1 = this.createSegmentedObject( points1, segments1, newMass, this.tempCM1, segmentedObject.quat, segmentedObject.velocity, segmentedObject.angularVelocity, true );

		}

		if ( numPoints2 > 0 ) {

			segmentedObject2 = this.createSegmentedObject( points2, segments2, newMass, this.tempCM2, segmentedObject.quat, segmentedObject.velocity, segmentedObject.angularVelocity, true );

		}

		output.segmentedObject1 = segmentedObject1;
		output.segmentedObject2 = segmentedObject2;

	}

};
