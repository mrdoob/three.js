/**
 * @author Kaleb Murphy
 */

THREE.RingBufferGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	THREE.BufferGeometry.call( this );

	this.type = 'RingBufferGeometry';

	this.parameters = {
		innerRadius: innerRadius,
		outerRadius: outerRadius,
		thetaSegments: thetaSegments,
		phiSegments: phiSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	innerRadius = innerRadius || 0;
	outerRadius = outerRadius || 50;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
	phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 8;

	var vertices = (thetaSegments + 1) * (phiSegments + 1);

	var positions = new Float32Array( vertices * 3 );
	var normals = new Float32Array( vertices * 3 );
	var uvs = new Float32Array( vertices * 2 );

	var i, o, ii = 0, oo = 0, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );

	for ( i = 0; i < phiSegments + 1; i ++) {

		// concentric circles inside ring

		for ( o = 0; o < thetaSegments + 1; o ++, ii += 3, oo += 2) {

			// number of segments per circle

			var segment = thetaStart + o / thetaSegments * thetaLength;
			positions[ ii + 0 ] = radius * Math.cos( segment );
			positions[ ii + 1 ] = radius * Math.sin( segment );

			uvs[ oo + 0 ] = ( positions[ ii + 0 ] / outerRadius + 1 ) / 2;
			uvs[ oo + 1 ] = ( positions[ ii + 1 ] / outerRadius + 1 ) / 2;

			normals[ ii + 2 ] = 1; // normal z

		}

		radius += radiusStep;

	}

	var indices = [];

	for ( i = 0; i < phiSegments; i ++ ) {

		// concentric circles inside ring

		var thetaSegment = i * ( thetaSegments + 1 );

		for ( o = 0; o < thetaSegments ; o ++ ) {

			// number of segments per circle

			var segment1 = o + thetaSegment,
			    segment2 = segment1 + thetaSegments;

			indices.push( segment1, segment2 + 1, segment2 + 2 );
			indices.push( segment1, segment2 + 2, segment1 + 1 );

		}

	}

	this.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );
	this.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	this.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), outerRadius );

};

THREE.RingBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.RingBufferGeometry.prototype.constructor = THREE.RingBufferGeometry;

THREE.RingBufferGeometry.prototype.clone = function () {

	var parameters = this.parameters;

	return new THREE.RingBufferGeometry(
		parameters.innerRadius,
		parameters.outerRadius,
		parameters.thetaSegments,
		parameters.phiSegments,
		parameters.thetaStart,
		parameters.thetaLength
	);

};
