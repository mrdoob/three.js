/**
 * Spline from Tween.js, slightly optimized (and trashed)
 * http://sole.github.com/tween.js/examples/05_spline.html
 *
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Spline = function ( points ) {

	this.points = points;

	var c = [], v3 = { x: 0, y: 0, z: 0 },
	point, intPoint, weight, w2, w3,
	pa, pb, pc, pd;

	this.initFromArray = function ( a ) {

		this.points = [];

		for ( var i = 0; i < a.length; i ++ ) {

			this.points[ i ] = { x: a[ i ][ 0 ], y: a[ i ][ 1 ], z: a[ i ][ 2 ] };

		}

	};

	this.getPoint = function ( k ) {

		point = ( this.points.length - 1 ) * k;
		intPoint = Math.floor( point );
		weight = point - intPoint;

		c[ 0 ] = intPoint === 0 ? intPoint : intPoint - 1;
		c[ 1 ] = intPoint;
		c[ 2 ] = intPoint  > this.points.length - 2 ? this.points.length - 1 : intPoint + 1;
		c[ 3 ] = intPoint  > this.points.length - 3 ? this.points.length - 1 : intPoint + 2;

		pa = this.points[ c[ 0 ] ];
		pb = this.points[ c[ 1 ] ];
		pc = this.points[ c[ 2 ] ];
		pd = this.points[ c[ 3 ] ];

		w2 = weight * weight;
		w3 = weight * w2;

		v3.x = interpolate( pa.x, pb.x, pc.x, pd.x, weight, w2, w3 );
		v3.y = interpolate( pa.y, pb.y, pc.y, pd.y, weight, w2, w3 );
		v3.z = interpolate( pa.z, pb.z, pc.z, pd.z, weight, w2, w3 );

		return v3;

	};

	this.getControlPointsArray = function () {

		var i, p, l = this.points.length,
			coords = [];

		for ( i = 0; i < l; i ++ ) {

			p = this.points[ i ];
			coords[ i ] = [ p.x, p.y, p.z ];

		}

		return coords;

	};

	// approximate length by summing linear segments

	this.getLength = function ( nSubDivisions ) {

		var i, index, nSamples, position,
			point = 0, intPoint = 0, oldIntPoint = 0,
			oldPosition = new THREE.Vector3(),
			tmpVec = new THREE.Vector3(),
			chunkLengths = [],
			totalLength = 0;

		// first point has 0 length

		chunkLengths[ 0 ] = 0;

		if ( ! nSubDivisions ) nSubDivisions = 100;

		nSamples = this.points.length * nSubDivisions;

		oldPosition.copy( this.points[ 0 ] );

		for ( i = 1; i < nSamples; i ++ ) {

			index = i / nSamples;

			position = this.getPoint( index );
			tmpVec.copy( position );

			totalLength += tmpVec.distanceTo( oldPosition );

			oldPosition.copy( position );

			point = ( this.points.length - 1 ) * index;
			intPoint = Math.floor( point );

			if ( intPoint != oldIntPoint ) {

				chunkLengths[ intPoint ] = totalLength;
				oldIntPoint = intPoint;

			}

		}

		// last point ends with total length

		chunkLengths[ chunkLengths.length ] = totalLength;

		return { chunks: chunkLengths, total: totalLength };

	};

	this.reparametrizeByArcLength = function ( samplingCoef ) {

		var i, j,
			index, indexCurrent, indexNext,
			realDistance,
			sampling, position,
			newpoints = [],
			tmpVec = new THREE.Vector3(),
			sl = this.getLength();

		newpoints.push( tmpVec.copy( this.points[ 0 ] ).clone() );

		for ( i = 1; i < this.points.length; i ++ ) {

			//tmpVec.copy( this.points[ i - 1 ] );
			//linearDistance = tmpVec.distanceTo( this.points[ i ] );

			realDistance = sl.chunks[ i ] - sl.chunks[ i - 1 ];

			sampling = Math.ceil( samplingCoef * realDistance / sl.total );

			indexCurrent = ( i - 1 ) / ( this.points.length - 1 );
			indexNext = i / ( this.points.length - 1 );

			for ( j = 1; j < sampling - 1; j ++ ) {

				index = indexCurrent + j * ( 1 / sampling ) * ( indexNext - indexCurrent );

				position = this.getPoint( index );
				newpoints.push( tmpVec.copy( position ).clone() );

			}

			newpoints.push( tmpVec.copy( this.points[ i ] ).clone() );

		}

		this.points = newpoints;

	};

	// Catmull-Rom

	function interpolate( p0, p1, p2, p3, t, t2, t3 ) {

		var v0 = ( p2 - p0 ) * 0.5,
			v1 = ( p3 - p1 ) * 0.5;

		return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( - 3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;

	};

};
