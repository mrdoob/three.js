/**
 * @author oosmoxiecode / https://github.com/oosmoxiecode
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 * @author jonobr1 / https://github.com/jonobr1
 * @author Mugen87 / https://github.com/Mugen87
 * @author spite / https://github.com/spite
 *
 */

import { Geometry } from '../core/Geometry.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Path } from '../extras/core/Path.js';

// TubeGeometry

function TubeGeometry( path, tubularSegments, radius, radialSegments, closed, taper ) {

	Geometry.call( this );

	this.type = 'TubeGeometry';

	this.parameters = {
		path: path,
		tubularSegments: tubularSegments,
		radius: radius,
		radialSegments: radialSegments,
		closed: closed
	};

	if ( taper !== undefined ) console.warn( 'THREE.TubeGeometry: taper has been removed.' );

	var bufferGeometry = new TubeBufferGeometry( path, tubularSegments, radius, radialSegments, closed );

	// expose internals

	this.tangents = bufferGeometry.tangents;
	this.normals = bufferGeometry.normals;
	this.binormals = bufferGeometry.binormals;

	// create geometry

	this.fromBufferGeometry( bufferGeometry );
	this.mergeVertices();

}

TubeGeometry.prototype = Object.create( Geometry.prototype );
TubeGeometry.prototype.constructor = TubeGeometry;

// TubeBufferGeometry

function TubeBufferGeometry( path, tubularSegments, radius, radialSegments, closed ) {

	BufferGeometry.call( this );

	this.type = 'TubeBufferGeometry';

	this.parameters = {
		path: path,
		tubularSegments: tubularSegments,
		radius: radius,
		radialSegments: radialSegments,
		closed: closed
	};

	tubularSegments = tubularSegments || 64;
	radius = radius || 1;
	radialSegments = radialSegments || 8;
	closed = closed || false;

	var frames = path.computeFrenetFrames( tubularSegments, closed );

	// expose internals

	this.tangents = frames.tangents;
	this.normals = frames.normals;
	this.binormals = frames.binormals;

	// helper variables

	var vertex = new Vector3();
	var normal = new Vector3();
	var uv = new Vector2();
	var P = new Vector3();

	var i, j;

	// buffer

	var vertices = [];
	var normals = [];
	var uvs = [];
	var indices = [];

	// create buffer data

	generateBufferData();

	// build geometry

	this.setIndex( indices );
	this.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	// functions

	function generateBufferData() {

		for ( i = 0; i < tubularSegments; i ++ ) {

			generateSegment( i );

		}

		// if the geometry is not closed, generate the last row of vertices and normals
		// at the regular position on the given path
		//
		// if the geometry is closed, duplicate the first row of vertices and normals (uvs will differ)

		generateSegment( ( closed === false ) ? tubularSegments : 0 );

		// uvs are generated in a separate function.
		// this makes it easy compute correct values for closed geometries

		generateUVs();

		// finally create faces

		generateIndices();

	}

	function generateSegment( i ) {

		// we use getPointAt to sample evenly distributed points from the given path

		P = path.getPointAt( i / tubularSegments, P );
		var P1 = new Vector3();
		var P2 = new Vector3();

		// retrieve corresponding normal and binormal

		var T = frames.tangents[ i ];
		var N = frames.normals[ i ];
		var B = frames.binormals[ i ];

		// generate normals and vertices for the current segment

		for ( j = 0; j <= radialSegments; j ++ ) {

			var v = j / radialSegments * Math.PI * 2;

			var sin = Math.sin( v );
			var cos = - Math.cos( v );

			// normal

			normal.x = ( cos * N.x + sin * B.x );
			normal.y = ( cos * N.y + sin * B.y );
			normal.z = ( cos * N.z + sin * B.z );
			normal.normalize();

			// vertex

			var r = radius instanceof Path ? radius.getPointAt( i / tubularSegments ).y : radius;
			vertex.x = P.x + r * normal.x;
			vertex.y = P.y + r * normal.y;
			vertex.z = P.z + r * normal.z;

			vertices.push( vertex.x, vertex.y, vertex.z );

			// adjust normals if the radius is a Path

			if ( radius instanceof Path ) {

				var delta = 0.0001;
				var t1 = i / tubularSegments - delta;
				var t2 = i / tubularSegments + delta;

				// Capping in case of danger

				if ( t1 < 0 ) t1 = 0;
				if ( t2 > 1 ) t2 = 1;

				path.getPointAt( t1, P1 );
				path.getPointAt( t2, P2 );
				var delta = P1.distanceTo( P2 );

				var r1 = radius.getPointAt( t1 ).y;
				var r2 = radius.getPointAt( t2 ).y;

				// prevent dividing by zero

				if ( delta !== 0 ) {

					normal.addScaledVector( T, - ( r2 - r1 ) / delta ).normalize();

				}

			}

			// push the normal

			normals.push( normal.x, normal.y, normal.z );

		}

	}

	function generateIndices() {

		for ( j = 1; j <= tubularSegments; j ++ ) {

			for ( i = 1; i <= radialSegments; i ++ ) {

				var a = ( radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );
				var b = ( radialSegments + 1 ) * j + ( i - 1 );
				var c = ( radialSegments + 1 ) * j + i;
				var d = ( radialSegments + 1 ) * ( j - 1 ) + i;

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

	}

	function generateUVs() {

		for ( i = 0; i <= tubularSegments; i ++ ) {

			for ( j = 0; j <= radialSegments; j ++ ) {

				uv.x = i / tubularSegments;
				uv.y = j / radialSegments;

				uvs.push( uv.x, uv.y );

			}

		}

	}

}

TubeBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
TubeBufferGeometry.prototype.constructor = TubeBufferGeometry;


export { TubeGeometry, TubeBufferGeometry };
