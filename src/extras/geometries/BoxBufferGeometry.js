import { BufferGeometry } from '../../core/BufferGeometry';
import { Vector3 } from '../../math/Vector3';
import { BufferAttribute } from '../../core/BufferAttribute';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function BoxBufferGeometry ( width, height, depth, widthSegments, heightSegments, depthSegments ) {
	this.isBoxBufferGeometry = this.isBufferGeometry = true;

	BufferGeometry.call( this );

	this.type = 'BoxBufferGeometry';

	this.parameters = {
		width: width,
		height: height,
		depth: depth,
		widthSegments: widthSegments,
		heightSegments: heightSegments,
		depthSegments: depthSegments
	};

	var scope = this;

	// segments
	widthSegments = Math.floor( widthSegments ) || 1;
	heightSegments = Math.floor( heightSegments ) || 1;
	depthSegments = Math.floor( depthSegments ) || 1;

	// these are used to calculate buffer length
	var vertexCount = calculateVertexCount( widthSegments, heightSegments, depthSegments );
	var indexCount = calculateIndexCount( widthSegments, heightSegments, depthSegments );

	// buffers
	var indices = new ( indexCount > 65535 ? Uint32Array : Uint16Array )( indexCount );
	var vertices = new Float32Array( vertexCount * 3 );
	var normals = new Float32Array( vertexCount * 3 );
	var uvs = new Float32Array( vertexCount * 2 );

	// offset variables
	var vertexBufferOffset = 0;
	var uvBufferOffset = 0;
	var indexBufferOffset = 0;
	var numberOfVertices = 0;

	// group variables
	var groupStart = 0;

	// build each side of the box geometry
	buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height,   width,  depthSegments, heightSegments, 0 ); // px
	buildPlane( 'z', 'y', 'x',   1, - 1, depth, height, - width,  depthSegments, heightSegments, 1 ); // nx
	buildPlane( 'x', 'z', 'y',   1,   1, width, depth,    height, widthSegments, depthSegments,  2 ); // py
	buildPlane( 'x', 'z', 'y',   1, - 1, width, depth,  - height, widthSegments, depthSegments,  3 ); // ny
	buildPlane( 'x', 'y', 'z',   1, - 1, width, height,   depth,  widthSegments, heightSegments, 4 ); // pz
	buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth,  widthSegments, heightSegments, 5 ); // nz

	// build geometry
	this.setIndex( new BufferAttribute( indices, 1 ) );
	this.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );
	this.addAttribute( 'normal', new BufferAttribute( normals, 3 ) );
	this.addAttribute( 'uv', new BufferAttribute( uvs, 2 ) );

	// helper functions

	function calculateVertexCount ( w, h, d ) {

		var vertices = 0;

		// calculate the amount of vertices for each side (plane)
		vertices += (w + 1) * (h + 1) * 2; // xy
		vertices += (w + 1) * (d + 1) * 2; // xz
		vertices += (d + 1) * (h + 1) * 2; // zy

		return vertices;

	}

	function calculateIndexCount ( w, h, d ) {

		var index = 0;

		// calculate the amount of squares for each side
		index += w * h * 2; // xy
		index += w * d * 2; // xz
		index += d * h * 2; // zy

		return index * 6; // two triangles per square => six vertices per square

	}

	function buildPlane ( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex ) {

		var segmentWidth	= width / gridX;
		var segmentHeight = height / gridY;

		var widthHalf = width / 2;
		var heightHalf = height / 2;
		var depthHalf = depth / 2;

		var gridX1 = gridX + 1;
		var gridY1 = gridY + 1;

		var vertexCounter = 0;
		var groupCount = 0;

		var vector = new Vector3();

		// generate vertices, normals and uvs

		for ( var iy = 0; iy < gridY1; iy ++ ) {

			var y = iy * segmentHeight - heightHalf;

			for ( var ix = 0; ix < gridX1; ix ++ ) {

				var x = ix * segmentWidth - widthHalf;

				// set values to correct vector component
				vector[ u ] = x * udir;
				vector[ v ] = y * vdir;
				vector[ w ] = depthHalf;

				// now apply vector to vertex buffer
				vertices[ vertexBufferOffset ] = vector.x;
				vertices[ vertexBufferOffset + 1 ] = vector.y;
				vertices[ vertexBufferOffset + 2 ] = vector.z;

				// set values to correct vector component
				vector[ u ] = 0;
				vector[ v ] = 0;
				vector[ w ] = depth > 0 ? 1 : - 1;

				// now apply vector to normal buffer
				normals[ vertexBufferOffset ] = vector.x;
				normals[ vertexBufferOffset + 1 ] = vector.y;
				normals[ vertexBufferOffset + 2 ] = vector.z;

				// uvs
				uvs[ uvBufferOffset ] = ix / gridX;
				uvs[ uvBufferOffset + 1 ] = 1 - ( iy / gridY );

				// update offsets and counters
				vertexBufferOffset += 3;
				uvBufferOffset += 2;
				vertexCounter += 1;

			}

		}

		// 1. you need three indices to draw a single face
		// 2. a single segment consists of two faces
		// 3. so we need to generate six (2*3) indices per segment

		for ( iy = 0; iy < gridY; iy ++ ) {

			for ( ix = 0; ix < gridX; ix ++ ) {

				// indices
				var a = numberOfVertices + ix + gridX1 * iy;
				var b = numberOfVertices + ix + gridX1 * ( iy + 1 );
				var c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
				var d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

				// face one
				indices[ indexBufferOffset ] = a;
				indices[ indexBufferOffset + 1 ] = b;
				indices[ indexBufferOffset + 2 ] = d;

				// face two
				indices[ indexBufferOffset + 3 ] = b;
				indices[ indexBufferOffset + 4 ] = c;
				indices[ indexBufferOffset + 5 ] = d;

				// update offsets and counters
				indexBufferOffset += 6;
				groupCount += 6;

			}

		}

		// add a group to the geometry. this will ensure multi material support
		scope.addGroup( groupStart, groupCount, materialIndex );

		// calculate new start value for groups
		groupStart += groupCount;

		// update total number of vertices
		numberOfVertices += vertexCounter;

	}

};

BoxBufferGeometry.prototype = Object.create( BufferGeometry.prototype );
BoxBufferGeometry.prototype.constructor = BoxBufferGeometry;


export { BoxBufferGeometry };