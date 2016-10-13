import { BufferGeometry } from '../core/BufferGeometry';
import { Float32Attribute, Uint16Attribute, Uint32Attribute } from '../core/BufferAttribute';
import { _Math } from '../math/Math';
import { Vector2 } from '../math/Vector2';
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';

/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Creates a tube which extrudes along a 3d spline.
 *
 * Uses parallel transport frames as described in:
 *
 * http://www.cs.indiana.edu/pub/techreports/TR425.pdf
 */

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
	closed = closed || false;

	var frames = new FrenetFrames( path, tubularSegments, closed );

	// expose internals

	this.tangents = frames.tangents;
	this.normals = frames.normals;
	this.binormals = frames.binormals;

	// helper variables

	var vertex = new Vector3();
	var normal = new Vector3();
	var uv = new Vector2();

	var i, j;

	// buffer

	var vertices = [];
	var normals = [];
	var uvs = [];
	var indices = [];

	// create buffer data

	generateBufferData();

	// build geometry

	this.setIndex( ( indices.length > 65535 ? Uint32Attribute : Uint16Attribute )( indices, 1 ) );
	this.addAttribute( 'position', Float32Attribute( vertices, 3 ) );
	this.addAttribute( 'normal', Float32Attribute( normals, 3 ) );
	this.addAttribute( 'uv', Float32Attribute( uvs, 2 ) );

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

		var P = path.getPointAt( i / tubularSegments );

		// retrieve corresponding normal and binormal

		var N = frames.normals[ i ];
		var B = frames.binormals[ i ];

		// generate normals and vertices for the current segment

		for ( j = 0; j <= radialSegments; j ++ ) {

			var v = j / radialSegments * Math.PI * 2;

			var sin =   Math.sin( v );
			var cos = - Math.cos( v );

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

// For computing of Frenet frames, exposing the tangents, normals and binormals the spline

function FrenetFrames( path, segments, closed ) {

	var	normal = new Vector3();

	var tangents = [];
	var normals = [];
	var binormals = [];

	var vec = new Vector3();
	var mat = new Matrix4();

	var i, u, theta;

	// expose internals

	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	// compute the tangent vectors for each segment on the path

	for ( i = 0; i <= segments; i ++ ) {

		u = i / segments;

		tangents[ i ] = path.getTangentAt( u );
		tangents[ i ].normalize();

	}

	// select an initial normal vector perpendicular to the first tangent vector,
	// and in the direction of the minimum tangent xyz component

	normals[ 0 ] = new Vector3();
	binormals[ 0 ] = new Vector3();
	var min = Number.MAX_VALUE;
	var tx = Math.abs( tangents[ 0 ].x );
	var ty = Math.abs( tangents[ 0 ].y );
	var tz = Math.abs( tangents[ 0 ].z );

	if ( tx <= min ) {

		min = tx;
		normal.set( 1, 0, 0 );

	}

	if ( ty <= min ) {

		min = ty;
		normal.set( 0, 1, 0 );

	}

	if ( tz <= min ) {

		normal.set( 0, 0, 1 );

	}

	vec.crossVectors( tangents[ 0 ], normal ).normalize();

	normals[ 0 ].crossVectors( tangents[ 0 ], vec );
	binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );


	// compute the slowly-varying normal and binormal vectors for each segment on the path

	for ( i = 1; i <= segments; i ++ ) {

		normals[ i ] = normals[ i - 1 ].clone();

		binormals[ i ] = binormals[ i - 1 ].clone();

		vec.crossVectors( tangents[ i - 1 ], tangents[ i ] );

		if ( vec.length() > Number.EPSILON ) {

			vec.normalize();

			theta = Math.acos( _Math.clamp( tangents[ i - 1 ].dot( tangents[ i ] ), - 1, 1 ) ); // clamp for floating pt errors

			normals[ i ].applyMatrix4( mat.makeRotationAxis( vec, theta ) );

		}

		binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

	}

	// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

	if ( closed ) {

		theta = Math.acos( _Math.clamp( normals[ 0 ].dot( normals[ segments ] ), - 1, 1 ) );
		theta /= segments;

		if ( tangents[ 0 ].dot( vec.crossVectors( normals[ 0 ], normals[ segments ] ) ) > 0 ) {

			theta = - theta;

		}

		for ( i = 1; i <= segments; i ++ ) {

			// twist a little...
			normals[ i ].applyMatrix4( mat.makeRotationAxis( tangents[ i ], theta * i ) );
			binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

		}

	}

}

export { TubeBufferGeometry };
