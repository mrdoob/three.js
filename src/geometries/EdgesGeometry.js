/**
 * @author WestLangley / http://github.com/WestLangley
 * @author Mugen87 / https://github.com/Mugen87
 */

import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Geometry } from '../core/Geometry.js';
import { MathUtils } from '../math/MathUtils.js';

function EdgesGeometry( geometry, thresholdAngle ) {

	BufferGeometry.call( this );

	this.type = 'EdgesGeometry';

	this.parameters = {
		thresholdAngle: thresholdAngle
	};

	thresholdAngle = ( thresholdAngle !== undefined ) ? thresholdAngle : 1;

	// buffer

	const vertices = [];

	// helper variables

	const thresholdDot = Math.cos( MathUtils.DEG2RAD * thresholdAngle );
	const edge = [ 0, 0 ], edges = {};
	let edge1, edge2, key;
	const keys = [ 'a', 'b', 'c' ];

	// prepare source geometry

	let geometry2;

	if ( geometry.isBufferGeometry ) {

		geometry2 = new Geometry();
		geometry2.fromBufferGeometry( geometry );

	} else {

		geometry2 = geometry.clone();

	}

	geometry2.mergeVertices();
	geometry2.computeFaceNormals();

	const sourceVertices = geometry2.vertices;
	const faces = geometry2.faces;

	// now create a data structure where each entry represents an edge with its adjoining faces

	for ( let i = 0, l = faces.length; i < l; i ++ ) {

		const face = faces[ i ];

		for ( let j = 0; j < 3; j ++ ) {

			edge1 = face[ keys[ j ] ];
			edge2 = face[ keys[ ( j + 1 ) % 3 ] ];
			edge[ 0 ] = Math.min( edge1, edge2 );
			edge[ 1 ] = Math.max( edge1, edge2 );

			key = edge[ 0 ] + ',' + edge[ 1 ];

			if ( edges[ key ] === undefined ) {

				edges[ key ] = { index1: edge[ 0 ], index2: edge[ 1 ], face1: i, face2: undefined };

			} else {

				edges[ key ].face2 = i;

			}

		}

	}

	// generate vertices

	for ( key in edges ) {

		const e = edges[ key ];

		// an edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.

		if ( e.face2 === undefined || faces[ e.face1 ].normal.dot( faces[ e.face2 ].normal ) <= thresholdDot ) {

			let vertex = sourceVertices[ e.index1 ];
			vertices.push( vertex.x, vertex.y, vertex.z );

			vertex = sourceVertices[ e.index2 ];
			vertices.push( vertex.x, vertex.y, vertex.z );

		}

	}

	// build geometry

	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

}

EdgesGeometry.prototype = Object.create( BufferGeometry.prototype );
EdgesGeometry.prototype.constructor = EdgesGeometry;


export { EdgesGeometry };
