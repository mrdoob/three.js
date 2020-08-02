import { Geometry } from '../core/Geometry.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';

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

	const bufferGeometry = new TubeBufferGeometry( path, tubularSegments, radius, radialSegments, closed );

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

	const frames = path.computeFrenetFrames( tubularSegments, closed );

	// expose internals

	this.tangents = frames.tangents;
	this.normals = frames.normals;
	this.binormals = frames.binormals;

	// helper variables

	const vertex = new Vector3();
	const normal = new Vector3();
	const uv = new Vector2();
	let P = new Vector3();

	// buffer

	const vertices = [];
	const normals = [];
	const uvs = [];
	const indices = [];

	// create buffer data

	generateBufferData();

	// build geometry

	this.setIndex( indices );
	this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
	this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
	this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	// functions

	function generateBufferData() {

		for ( let i = 0; i < tubularSegments; i ++ ) {

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

		// retrieve corresponding normal and binormal

		const N = frames.normals[ i ];
		const B = frames.binormals[ i ];

		// generate normals and vertices for the current segment

		for ( let j = 0; j <= radialSegments; j ++ ) {

			const v = j / radialSegments * Math.PI * 2;

			const sin = Math.sin( v );
			const cos = - Math.cos( v );

			// normal

			normal.x = ( cos * N.x + sin * B.x );
			normal.y = ( cos * N.y + sin * B.y );
			normal.z = ( cos * N.z + sin * B.z );
			normal.normalize();

			normals.push( normal.x, normal.y, normal.z );

			// vertex

			vertex.x = P.x + radius * normal.x;
			vertex.y = P.y + radius * normal.y;
			vertex.z = P.z + radius * normal.z;

			vertices.push( vertex.x, vertex.y, vertex.z );

		}

	}

	function generateIndices() {

		for ( let j = 1; j <= tubularSegments; j ++ ) {

			for ( let i = 1; i <= radialSegments; i ++ ) {

				const a = ( radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );
				const b = ( radialSegments + 1 ) * j + ( i - 1 );
				const c = ( radialSegments + 1 ) * j + i;
				const d = ( radialSegments + 1 ) * ( j - 1 ) + i;

				// faces

				indices.push( a, b, d );
				indices.push( b, c, d );

			}

		}

	}

	function generateUVs() {

		for ( let i = 0; i <= tubularSegments; i ++ ) {

			for ( let j = 0; j <= radialSegments; j ++ ) {

				uv.x = i / tubularSegments;
				uv.y = j / radialSegments;

				uvs.push( uv.x, uv.y );

			}

		}

	}

}

TubeBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
TubeBufferGeometry.prototype.constructor = TubeBufferGeometry;

TubeBufferGeometry.prototype.toJSON = function () {

	const data = BufferGeometry.prototype.toJSON.call( this );

	data.path = this.parameters.path.toJSON();

	return data;

};

export { TubeGeometry, TubeBufferGeometry };
