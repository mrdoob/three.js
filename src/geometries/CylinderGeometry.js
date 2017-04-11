/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Geometry } from '../core/Geometry';

function CylinderGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	Geometry.call( this );

	this.type = 'CylinderGeometry';

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	this.fromBufferGeometry( new CylinderBufferGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) );
	this.mergeVertices();

}

CylinderGeometry.prototype = Object.create( Geometry.prototype );
CylinderGeometry.prototype.constructor = CylinderGeometry;

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import { Float32BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';
import { Vector3 } from '../math/Vector3';
import { Vector2 } from '../math/Vector2';

function CylinderBufferGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength ) {

	BufferGeometry.call( this );

	this.type = 'CylinderBufferGeometry';

	this.parameters = {
		radiusTop: radiusTop,
		radiusBottom: radiusBottom,
		height: height,
		radialSegments: radialSegments,
		heightSegments: heightSegments,
		openEnded: openEnded,
		thetaStart: thetaStart,
		thetaLength: thetaLength
	};

	var scope = this;

	radiusTop = radiusTop !== undefined ? radiusTop : 20;
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;
	height = height !== undefined ? height : 100;

	radialSegments = Math.floor( radialSegments ) || 8;
	heightSegments = Math.floor( heightSegments ) || 1;

	openEnded = openEnded !== undefined ? openEnded : false;
	thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
	thetaLength = thetaLength !== undefined ? thetaLength : 2.0 * Math.PI;

	// buffers

	var indices = [];
	var vertices = [];
	var normals = [];
	var uvs = [];

	// helper variables

	var index = 0;
	var indexOffset = 0;
	var indexArray = [];
	var halfHeight = height / 2;
	var groupStart = 0;

	// generate geometry

	generateTorso();

	if ( openEnded === false ) {

		if ( radiusTop > 0 ) generateCap( true );
		if ( radiusBottom > 0 ) generateCap( false );

	}

	// build geometry

	this.setIndex( indices );
	this.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	function generateTorso() {

		var x, y;
		var normal = new Vector3();
		var vertex = new Vector3();

		var groupCount = 0;

		// this will be used to calculate the normal
		var slope = ( radiusBottom - radiusTop ) / height;

		// generate vertices, normals and uvs

		for ( y = 0; y <= heightSegments; y ++ ) {

			var indexRow = [];

			var v = y / heightSegments;

			// calculate the radius of the current row

			var radius = v * ( radiusBottom - radiusTop ) + radiusTop;

			for ( x = 0; x <= radialSegments; x ++ ) {

				var u = x / radialSegments;

				var theta = u * thetaLength + thetaStart;

				var sinTheta = Math.sin( theta );
				var cosTheta = Math.cos( theta );

				// vertex

				vertex.x = radius * sinTheta;
				vertex.y = - v * height + halfHeight;
				vertex.z = radius * cosTheta;
				vertices.push( vertex.x, vertex.y, vertex.z );

				// normal

				normal.set( sinTheta, slope, cosTheta ).normalize();
				normals.push( normal.x, normal.y, normal.z );

				// uv

				uvs.push( u, 1 - v );

				// save index of vertex in respective row

				indexRow.push( index ++ );

			}

			// now save vertices of the row in our index array

			indexArray.push( indexRow );

		}

		// generate indices

		for ( x = 0; x < radialSegments; x ++ ) {

			for ( y = 0; y < heightSegments; y ++ ) {

				// we use the index array to access the correct indices

				var a = indexArray[ y ][ x ];
				var b = indexArray[ y + 1 ][ x ];
				var c = indexArray[ y + 1 ][ x + 1 ];
				var d = indexArray[ y ][ x + 1 ];

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

				// update group counter

				groupCount += 6;

			}

		}

		// add a group to the geometry. this will ensure multi material support

		scope.addGroup( groupStart, groupCount, 0 );

		// calculate new start value for groups

		groupStart += groupCount;

	}

	function generateCap( top ) {

		var x, centerIndexStart, centerIndexEnd;

		var uv = new Vector2();
		var vertex = new Vector3();

		var groupCount = 0;

		var radius = ( top === true ) ? radiusTop : radiusBottom;
		var sign = ( top === true ) ? 1 : - 1;

		// save the index of the first center vertex
		centerIndexStart = index;

		// first we generate the center vertex data of the cap.
		// because the geometry needs one set of uvs per face,
		// we must generate a center vertex per face/segment

		for ( x = 1; x <= radialSegments; x ++ ) {

			// vertex

			vertices.push( 0, halfHeight * sign, 0 );

			// normal

			normals.push( 0, sign, 0 );

			// uv

			uvs.push( 0.5, 0.5 );

			// increase index

			index ++;

		}

		// save the index of the last center vertex

		centerIndexEnd = index;

		// now we generate the surrounding vertices, normals and uvs

		for ( x = 0; x <= radialSegments; x ++ ) {

			var u = x / radialSegments;
			var theta = u * thetaLength + thetaStart;

			var cosTheta = Math.cos( theta );
			var sinTheta = Math.sin( theta );

			// vertex

			vertex.x = radius * sinTheta;
			vertex.y = halfHeight * sign;
			vertex.z = radius * cosTheta;
			vertices.push( vertex.x, vertex.y, vertex.z );

			// normal

			normals.push( 0, sign, 0 );

			// uv

			uv.x = ( cosTheta * 0.5 ) + 0.5;
			uv.y = ( sinTheta * 0.5 * sign ) + 0.5;
			uvs.push( uv.x, uv.y );

			// increase index

			index ++;

		}

		// generate indices

		for ( x = 0; x < radialSegments; x ++ ) {

			var c = centerIndexStart + x;
			var i = centerIndexEnd + x;

			if ( top === true ) {

				// face top

				indices.push( i, i + 1, c );

			} else {

				// face bottom

				indices.push( i + 1, i, c );

			}

			groupCount += 3;

		}

		// add a group to the geometry. this will ensure multi material support

		scope.addGroup( groupStart, groupCount, top === true ? 1 : 2 );

		// calculate new start value for groups

		groupStart += groupCount;

	}

}

CylinderBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
CylinderBufferGeometry.prototype.constructor = CylinderBufferGeometry;

export { CylinderGeometry, CylinderBufferGeometry };
