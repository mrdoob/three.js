/**
 * @author Kaleb Murphy
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Geometry } from '../core/Geometry.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';

// RingGeometry

function RingGeometry( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	Geometry.call( this );

	this.type = 'RingGeometry';

	this.parameters = {
		innerRadius: innerRadius,
		outerRadius: outerRadius,
		thetaSegments: thetaSegments,
		phiSegments: phiSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new RingBufferGeometry( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) );
	this.mergeVertices();

}

RingGeometry.prototype = Object.create( Geometry.prototype );
RingGeometry.prototype.constructor = RingGeometry;

// RingBufferGeometry

function RingBufferGeometry( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	BufferGeometry.call( this );

	this.type = 'RingBufferGeometry';

	this.parameters = {
		innerRadius: innerRadius,
		outerRadius: outerRadius,
		thetaSegments: thetaSegments,
		phiSegments: phiSegments,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	innerRadius = innerRadius || 0.5;
	outerRadius = outerRadius || 1;

	thetaStart = thetaStart !== undefined ? thetaStart : 0;
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
	phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 1;

	// buffers

	const indices = [];
	const vertices = [];
	const normals = [];
	const uvs = [];

	// some helper variables

	let radius = innerRadius;
	const radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );
	const vertex = new Vector3();
	const uv = new Vector2();

	// generate vertices, normals and uvs

	for ( let j = 0; j <= phiSegments; j ++ ) {

		for ( let i = 0; i <= thetaSegments; i ++ ) {

			// values are generate from the inside of the ring to the outside

			const segment = thetaStart + i / thetaSegments * thetaLength;

			// vertex

			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			vertices.push( vertex.x, vertex.y, vertex.z );

			// normal

			normals.push( 0, 0, 1 );

			// uv

			uv.x = ( vertex.x / outerRadius + 1 ) / 2;
			uv.y = ( vertex.y / outerRadius + 1 ) / 2;

			uvs.push( uv.x, uv.y );

		}

		// increase the radius for next row of vertices

		radius += radiusStep;

	}

	// indices

	for ( let j = 0; j < phiSegments; j ++ ) {

		const thetaSegmentLevel = j * ( thetaSegments + 1 );

		for ( let i = 0; i < thetaSegments; i ++ ) {

			const segment = i + thetaSegmentLevel;

			const a = segment;
			const b = segment + thetaSegments + 1;
			const c = segment + thetaSegments + 2;
			const d = segment + 1;

			// faces

			indices.push( a, b, d );
			indices.push( b, c, d );

		}

	}

	// build geometry

	this.setIndex( indices );
	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

}

RingBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
RingBufferGeometry.prototype.constructor = RingBufferGeometry;


export { RingGeometry, RingBufferGeometry };
