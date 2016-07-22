import { BufferGeometry } from '../../core/BufferGeometry';
import { BufferAttribute } from '../../core/BufferAttribute';
import { Vector3 } from '../../math/Vector3';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function TorusBufferGeometry ( radius, tube, radialSegments, tubularSegments, arc ) {
	this.isTorusBufferGeometry = this.isBufferGeometry = true;

	BufferGeometry.call( this );

	this.type = 'TorusBufferGeometry';

	this.parameters = {
		radius: radius,
		tube: tube,
		radialSegments: radialSegments,
		tubularSegments: tubularSegments,
		arc: arc
	};

	radius = radius || 100;
	tube = tube || 40;
	radialSegments = Math.floor( radialSegments ) || 8;
	tubularSegments = Math.floor( tubularSegments ) || 6;
	arc = arc || Math.PI * 2;

	// used to calculate buffer length
	var vertexCount = ( ( radialSegments + 1 ) * ( tubularSegments + 1 ) );
	var indexCount = radialSegments * tubularSegments * 2 * 3;

	// buffers
	var indices = new ( indexCount > 65535 ? Uint32Array : Uint16Array )( indexCount );
	var vertices = new Float32Array( vertexCount * 3 );
	var normals = new Float32Array( vertexCount * 3 );
	var uvs = new Float32Array( vertexCount * 2 );

	// offset variables
	var vertexBufferOffset = 0;
	var uvBufferOffset = 0;
	var indexBufferOffset = 0;

	// helper variables
	var center = new Vector3();
	var vertex = new Vector3();
	var normal = new Vector3();

	var j, i;

	// generate vertices, normals and uvs

	for ( j = 0; j <= radialSegments; j ++ ) {

		for ( i = 0; i <= tubularSegments; i ++ ) {

			var u = i / tubularSegments * arc;
			var v = j / radialSegments * Math.PI * 2;

			// vertex
			vertex.x = ( radius + tube * Math.cos( v ) ) * Math.cos( u );
			vertex.y = ( radius + tube * Math.cos( v ) ) * Math.sin( u );
			vertex.z = tube * Math.sin( v );

			vertices[ vertexBufferOffset ] = vertex.x;
			vertices[ vertexBufferOffset + 1 ] = vertex.y;
			vertices[ vertexBufferOffset + 2 ] = vertex.z;

			// this vector is used to calculate the normal
			center.x = radius * Math.cos( u );
			center.y = radius * Math.sin( u );

			// normal
			normal.subVectors( vertex, center ).normalize();

			normals[ vertexBufferOffset ] = normal.x;
			normals[ vertexBufferOffset + 1 ] = normal.y;
			normals[ vertexBufferOffset + 2 ] = normal.z;

			// uv
			uvs[ uvBufferOffset ] = i / tubularSegments;
			uvs[ uvBufferOffset + 1 ] = j / radialSegments;

			// update offsets
			vertexBufferOffset += 3;
			uvBufferOffset += 2;

		}

	}

	// generate indices

	for ( j = 1; j <= radialSegments; j ++ ) {

		for ( i = 1; i <= tubularSegments; i ++ ) {

			// indices
			var a = ( tubularSegments + 1 ) * j + i - 1;
			var b = ( tubularSegments + 1 ) * ( j - 1 ) + i - 1;
			var c = ( tubularSegments + 1 ) * ( j - 1 ) + i;
			var d = ( tubularSegments + 1 ) * j + i;

			// face one
			indices[ indexBufferOffset ] = a;
			indices[ indexBufferOffset + 1 ] = b;
			indices[ indexBufferOffset + 2 ] = d;

			// face two
			indices[ indexBufferOffset + 3 ] = b;
			indices[ indexBufferOffset + 4 ] = c;
			indices[ indexBufferOffset + 5 ] = d;

			// update offset
			indexBufferOffset += 6;

		}

	}

	// build geometry
	this.setIndex( new BufferAttribute( indices, 1 ) );
	this.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

};

TorusBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
TorusBufferGeometry.prototype.constructor = TorusBufferGeometry;


export { TorusBufferGeometry };