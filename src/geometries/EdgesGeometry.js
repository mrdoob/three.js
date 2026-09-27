import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { DEG2RAD } from '../math/MathUtils.js';
import { Triangle } from '../math/Triangle.js';
import { Vector3 } from '../math/Vector3.js';

const _v0 = /*@__PURE__*/ new Vector3();
const _v1 = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();
const _triangle = /*@__PURE__*/ new Triangle();

/**
 * Can be used as a helper object to view the edges of a geometry.
 *
 * ```js
 * const geometry = new THREE.BoxGeometry();
 * const edges = new THREE.EdgesGeometry( geometry );
 * const line = new THREE.LineSegments( edges );
 * scene.add( line );
 * ```
 *
 * Note: It is not yet possible to serialize/deserialize instances of this class.
 *
 * @augments BufferGeometry
 */
class EdgesGeometry extends BufferGeometry {

	/**
	 * Constructs a new edges geometry.
	 *
	 * @param {?BufferGeometry} [geometry=null] - The geometry.
	 * @param {number} [thresholdAngle=1] - An edge is only rendered if the angle (in degrees)
	 * between the face normals of the adjoining faces exceeds this value.
	 */
	constructor( geometry = null, thresholdAngle = 1 ) {

		super();

		this.type = 'EdgesGeometry';

		/**
		 * Holds the constructor parameters that have been
		 * used to generate the geometry. Any modification
		 * after instantiation does not change the geometry.
		 *
		 * @type {Object}
		 */
		this.parameters = {
			geometry: geometry,
			thresholdAngle: thresholdAngle
		};

		if ( geometry !== null ) {

			const precisionPoints = 4;
			const precision = Math.pow( 10, precisionPoints );
			const thresholdDot = Math.cos( DEG2RAD * thresholdAngle );

			const indexAttr = geometry.getIndex();
			const positionAttr = geometry.getAttribute( 'position' );
			const indexCount = indexAttr ? indexAttr.count : positionAttr.count;

			const indexArr = [ 0, 0, 0 ];
			const vertKeys = [ 'a', 'b', 'c' ];
			const ids = [ 0, 0, 0 ];

			// assign an id to each quantized position via an open-addressed hash table
			// (slots hold id + 1, 0 means empty). the extra id is for out-of-range
			// vertices, which all read as NaN
			const maxIds = Math.ceil( positionAttr.count ) + 1;
			const quantized = new Float64Array( maxIds * 3 );

			let tableSize = 1;
			while ( tableSize < maxIds * 2 ) tableSize <<= 1;
			const tableMask = tableSize - 1;
			const table = new Int32Array( tableSize );
			let uniqueCount = 0;

			// store edges in creation order and find them by the ids of their vertices
			// through a second hash table. an edge's face offset into faceNormals is set
			// to -1 once its sibling edge has been found
			let edgeTableSize = 1;
			while ( edgeTableSize < indexCount * 2 ) edgeTableSize <<= 1;
			const edgeTableMask = edgeTableSize - 1;
			const edgeTable = new Int32Array( edgeTableSize );

			const edgeIds = new Int32Array( indexCount * 2 );
			const edgeIndices = new Uint32Array( indexCount * 2 );
			const edgeFaces = new Int32Array( indexCount );
			const faceNormals = new Float64Array( indexCount );
			let edgeCount = 0;

			// returns the slot of the edge from id0 to id1, or the empty slot it would go in
			function findEdgeSlot( id0, id1 ) {

				let slot = ( Math.imul( id0, 73856093 ) ^ Math.imul( id1, 19349663 ) ) & edgeTableMask;

				while ( true ) {

					const edge = edgeTable[ slot ];

					if ( edge === 0 || ( edgeIds[ 2 * edge - 2 ] === id0 && edgeIds[ 2 * edge - 1 ] === id1 ) ) return slot;

					slot = ( slot + 1 ) & edgeTableMask;

				}

			}

			const vertices = [];
			for ( let i = 0; i < indexCount; i += 3 ) {

				if ( indexAttr ) {

					indexArr[ 0 ] = indexAttr.getX( i );
					indexArr[ 1 ] = indexAttr.getX( i + 1 );
					indexArr[ 2 ] = indexAttr.getX( i + 2 );

				} else {

					indexArr[ 0 ] = i;
					indexArr[ 1 ] = i + 1;
					indexArr[ 2 ] = i + 2;

				}

				const { a, b, c } = _triangle;
				a.fromBufferAttribute( positionAttr, indexArr[ 0 ] );
				b.fromBufferAttribute( positionAttr, indexArr[ 1 ] );
				c.fromBufferAttribute( positionAttr, indexArr[ 2 ] );
				_triangle.getNormal( _normal );

				// look up the ids of the vertices
				for ( let j = 0; j < 3; j ++ ) {

					const v = _triangle[ vertKeys[ j ] ];
					let qx = Math.round( v.x * precision );
					let qy = Math.round( v.y * precision );
					let qz = Math.round( v.z * precision );

					// make NaN equal to itself, Math.round() never returns 0.5
					if ( qx !== qx ) qx = 0.5;
					if ( qy !== qy ) qy = 0.5;
					if ( qz !== qz ) qz = 0.5;

					// mix the hash before masking, grids with power-of-two spacing leave
					// the low bits of every coordinate at zero
					let h = Math.imul( qx, 73856093 ) ^ Math.imul( qy, 19349663 ) ^ Math.imul( qz, 83492791 );
					h = Math.imul( h ^ ( h >>> 16 ), 0x45d9f3b );
					let slot = ( h ^ ( h >>> 16 ) ) & tableMask;

					while ( true ) {

						const id = table[ slot ];

						if ( id === 0 ) {

							const q3 = 3 * uniqueCount;
							quantized[ q3 + 0 ] = qx;
							quantized[ q3 + 1 ] = qy;
							quantized[ q3 + 2 ] = qz;

							table[ slot ] = uniqueCount + 1;
							ids[ j ] = uniqueCount ++;
							break;

						}

						const q3 = 3 * ( id - 1 );

						if ( quantized[ q3 + 0 ] === qx && quantized[ q3 + 1 ] === qy && quantized[ q3 + 2 ] === qz ) {

							ids[ j ] = id - 1;
							break;

						}

						slot = ( slot + 1 ) & tableMask;

					}

				}

				// skip degenerate triangles
				if ( ids[ 0 ] === ids[ 1 ] || ids[ 1 ] === ids[ 2 ] || ids[ 2 ] === ids[ 0 ] ) {

					continue;

				}

				faceNormals[ i + 0 ] = _normal.x;
				faceNormals[ i + 1 ] = _normal.y;
				faceNormals[ i + 2 ] = _normal.z;

				// iterate over every edge
				for ( let j = 0; j < 3; j ++ ) {

					// get the first and next vertex making up the edge
					const jNext = ( j + 1 ) % 3;
					const id0 = ids[ j ];
					const id1 = ids[ jNext ];
					const v0 = _triangle[ vertKeys[ j ] ];
					const v1 = _triangle[ vertKeys[ jNext ] ];

					const reverseEdge = edgeTable[ findEdgeSlot( id1, id0 ) ] - 1;
					const slot = findEdgeSlot( id0, id1 );

					if ( reverseEdge !== - 1 && edgeFaces[ reverseEdge ] !== - 1 ) {

						// if we found a sibling edge add it into the vertex array if
						// it meets the angle threshold and mark the edge as matched.
						const f = edgeFaces[ reverseEdge ];

						if ( _normal.x * faceNormals[ f ] + _normal.y * faceNormals[ f + 1 ] + _normal.z * faceNormals[ f + 2 ] <= thresholdDot ) {

							vertices.push( v0.x, v0.y, v0.z );
							vertices.push( v1.x, v1.y, v1.z );

						}

						edgeFaces[ reverseEdge ] = - 1;

					} else if ( edgeTable[ slot ] === 0 ) {

						// if we've already got an edge here then skip adding a new one
						edgeTable[ slot ] = edgeCount + 1;
						edgeIds[ 2 * edgeCount + 0 ] = id0;
						edgeIds[ 2 * edgeCount + 1 ] = id1;
						edgeIndices[ 2 * edgeCount + 0 ] = indexArr[ j ];
						edgeIndices[ 2 * edgeCount + 1 ] = indexArr[ jNext ];
						edgeFaces[ edgeCount ] = i;
						edgeCount ++;

					}

				}

			}

			// iterate over all remaining, unmatched edges and add them to the vertex array
			for ( let e = 0; e < edgeCount; e ++ ) {

				if ( edgeFaces[ e ] !== - 1 ) {

					_v0.fromBufferAttribute( positionAttr, edgeIndices[ 2 * e + 0 ] );
					_v1.fromBufferAttribute( positionAttr, edgeIndices[ 2 * e + 1 ] );

					vertices.push( _v0.x, _v0.y, _v0.z );
					vertices.push( _v1.x, _v1.y, _v1.z );

				}

			}

			this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

}

export { EdgesGeometry };
