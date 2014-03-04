/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BufferGeometry = function () {

	this.id = THREE.GeometryIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	// attributes

	this.attributes = {};

	// offsets for chunks when using indexed elements

	this.offsets = [];

	// boundings

	this.boundingBox = null;
	this.boundingSphere = null;

};

THREE.BufferGeometry.prototype = {

	constructor: THREE.BufferGeometry,

	addAttribute: function ( name, type, numItems, itemSize ) {

		this.attributes[ name ] = {

			array: new type( numItems * itemSize ),
			itemSize: itemSize

		};

		return this.attributes[ name ];

	},

	applyMatrix: function ( matrix ) {

		var position = this.attributes.position;

		if ( position !== undefined ) {

			matrix.multiplyVector3Array( position.array );
			position.needsUpdate = true;

		}

		var normal = this.attributes.normal;

		if ( normal !== undefined ) {

			var normalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );

			normalMatrix.multiplyVector3Array( normal.array );
			normal.needsUpdate = true;

		}

	},

	computeBoundingBox: function () {

		if ( this.boundingBox === null ) {

			this.boundingBox = new THREE.Box3();

		}

		var positions = this.attributes[ "position" ].array;

		if ( positions ) {

			var bb = this.boundingBox;

			if( positions.length >= 3 ) {
				bb.min.x = bb.max.x = positions[ 0 ];
				bb.min.y = bb.max.y = positions[ 1 ];
				bb.min.z = bb.max.z = positions[ 2 ];
			}

			for ( var i = 3, il = positions.length; i < il; i += 3 ) {

				var x = positions[ i ];
				var y = positions[ i + 1 ];
				var z = positions[ i + 2 ];

				// bounding box

				if ( x < bb.min.x ) {

					bb.min.x = x;

				} else if ( x > bb.max.x ) {

					bb.max.x = x;

				}

				if ( y < bb.min.y ) {

					bb.min.y = y;

				} else if ( y > bb.max.y ) {

					bb.max.y = y;

				}

				if ( z < bb.min.z ) {

					bb.min.z = z;

				} else if ( z > bb.max.z ) {

					bb.max.z = z;

				}

			}

		}

		if ( positions === undefined || positions.length === 0 ) {

			this.boundingBox.min.set( 0, 0, 0 );
			this.boundingBox.max.set( 0, 0, 0 );

		}

	},

	computeBoundingSphere: function () {

		var box = new THREE.Box3();
		var vector = new THREE.Vector3();

		return function () {

			if ( this.boundingSphere === null ) {

				this.boundingSphere = new THREE.Sphere();

			}

			var positions = this.attributes[ "position" ].array;

			if ( positions ) {

				box.makeEmpty();

				var center = this.boundingSphere.center;

				for ( var i = 0, il = positions.length; i < il; i += 3 ) {

					vector.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
					box.addPoint( vector );

				}

				box.center( center );

				var maxRadiusSq = 0;

				for ( var i = 0, il = positions.length; i < il; i += 3 ) {

					vector.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );
					maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( vector ) );

				}

				this.boundingSphere.radius = Math.sqrt( maxRadiusSq );

			}

		}

	}(),

	computeVertexNormals: function () {

		if ( this.attributes[ "position" ] ) {

			var i, il;
			var j, jl;

			var nVertexElements = this.attributes[ "position" ].array.length;

			if ( this.attributes[ "normal" ] === undefined ) {

				this.attributes[ "normal" ] = {

					itemSize: 3,
					array: new Float32Array( nVertexElements )

				};

			} else {

				// reset existing normals to zero

				for ( i = 0, il = this.attributes[ "normal" ].array.length; i < il; i ++ ) {

					this.attributes[ "normal" ].array[ i ] = 0;

				}

			}

			var positions = this.attributes[ "position" ].array;
			var normals = this.attributes[ "normal" ].array;

			var vA, vB, vC, x, y, z,

			pA = new THREE.Vector3(),
			pB = new THREE.Vector3(),
			pC = new THREE.Vector3(),

			cb = new THREE.Vector3(),
			ab = new THREE.Vector3();

			// indexed elements

			if ( this.attributes[ "index" ] ) {

				var indices = this.attributes[ "index" ].array;

				var offsets = this.offsets;

				for ( j = 0, jl = offsets.length; j < jl; ++ j ) {

					var start = offsets[ j ].start;
					var count = offsets[ j ].count;
					var index = offsets[ j ].index;

					for ( i = start, il = start + count; i < il; i += 3 ) {

						vA = index + indices[ i ];
						vB = index + indices[ i + 1 ];
						vC = index + indices[ i + 2 ];

						x = positions[ vA * 3 ];
						y = positions[ vA * 3 + 1 ];
						z = positions[ vA * 3 + 2 ];
						pA.set( x, y, z );

						x = positions[ vB * 3 ];
						y = positions[ vB * 3 + 1 ];
						z = positions[ vB * 3 + 2 ];
						pB.set( x, y, z );

						x = positions[ vC * 3 ];
						y = positions[ vC * 3 + 1 ];
						z = positions[ vC * 3 + 2 ];
						pC.set( x, y, z );

						cb.subVectors( pC, pB );
						ab.subVectors( pA, pB );
						cb.cross( ab );

						normals[ vA * 3     ] += cb.x;
						normals[ vA * 3 + 1 ] += cb.y;
						normals[ vA * 3 + 2 ] += cb.z;

						normals[ vB * 3     ] += cb.x;
						normals[ vB * 3 + 1 ] += cb.y;
						normals[ vB * 3 + 2 ] += cb.z;

						normals[ vC * 3     ] += cb.x;
						normals[ vC * 3 + 1 ] += cb.y;
						normals[ vC * 3 + 2 ] += cb.z;

					}

				}

			// non-indexed elements (unconnected triangle soup)

			} else {

				for ( i = 0, il = positions.length; i < il; i += 9 ) {

					x = positions[ i ];
					y = positions[ i + 1 ];
					z = positions[ i + 2 ];
					pA.set( x, y, z );

					x = positions[ i + 3 ];
					y = positions[ i + 4 ];
					z = positions[ i + 5 ];
					pB.set( x, y, z );

					x = positions[ i + 6 ];
					y = positions[ i + 7 ];
					z = positions[ i + 8 ];
					pC.set( x, y, z );

					cb.subVectors( pC, pB );
					ab.subVectors( pA, pB );
					cb.cross( ab );

					normals[ i     ] = cb.x;
					normals[ i + 1 ] = cb.y;
					normals[ i + 2 ] = cb.z;

					normals[ i + 3 ] = cb.x;
					normals[ i + 4 ] = cb.y;
					normals[ i + 5 ] = cb.z;

					normals[ i + 6 ] = cb.x;
					normals[ i + 7 ] = cb.y;
					normals[ i + 8 ] = cb.z;

				}

			}

			this.normalizeNormals();

			this.normalsNeedUpdate = true;

		}

	},

	normalizeNormals: function () {

		var normals = this.attributes[ "normal" ].array;

		var x, y, z, n;

		for ( var i = 0, il = normals.length; i < il; i += 3 ) {

			x = normals[ i ];
			y = normals[ i + 1 ];
			z = normals[ i + 2 ];

			n = 1.0 / Math.sqrt( x * x + y * y + z * z );

			normals[ i     ] *= n;
			normals[ i + 1 ] *= n;
			normals[ i + 2 ] *= n;

		}

	},

	computeTangents: function () {

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( this.attributes[ "index" ] === undefined ||
			 this.attributes[ "position" ] === undefined ||
			 this.attributes[ "normal" ] === undefined ||
			 this.attributes[ "uv" ] === undefined ) {

			console.warn( "Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()" );
			return;

		}

		var indices = this.attributes[ "index" ].array;
		var positions = this.attributes[ "position" ].array;
		var normals = this.attributes[ "normal" ].array;
		var uvs = this.attributes[ "uv" ].array;

		var nVertices = positions.length / 3;

		if ( this.attributes[ "tangent" ] === undefined ) {

			var nTangentElements = 4 * nVertices;

			this.attributes[ "tangent" ] = {

				itemSize: 4,
				array: new Float32Array( nTangentElements )

			};

		}

		var tangents = this.attributes[ "tangent" ].array;

		var tan1 = [], tan2 = [];

		for ( var k = 0; k < nVertices; k ++ ) {

			tan1[ k ] = new THREE.Vector3();
			tan2[ k ] = new THREE.Vector3();

		}

		var xA, yA, zA,
			xB, yB, zB,
			xC, yC, zC,

			uA, vA,
			uB, vB,
			uC, vC,

			x1, x2, y1, y2, z1, z2,
			s1, s2, t1, t2, r;

		var sdir = new THREE.Vector3(), tdir = new THREE.Vector3();

		function handleTriangle( a, b, c ) {

			xA = positions[ a * 3 ];
			yA = positions[ a * 3 + 1 ];
			zA = positions[ a * 3 + 2 ];

			xB = positions[ b * 3 ];
			yB = positions[ b * 3 + 1 ];
			zB = positions[ b * 3 + 2 ];

			xC = positions[ c * 3 ];
			yC = positions[ c * 3 + 1 ];
			zC = positions[ c * 3 + 2 ];

			uA = uvs[ a * 2 ];
			vA = uvs[ a * 2 + 1 ];

			uB = uvs[ b * 2 ];
			vB = uvs[ b * 2 + 1 ];

			uC = uvs[ c * 2 ];
			vC = uvs[ c * 2 + 1 ];

			x1 = xB - xA;
			x2 = xC - xA;

			y1 = yB - yA;
			y2 = yC - yA;

			z1 = zB - zA;
			z2 = zC - zA;

			s1 = uB - uA;
			s2 = uC - uA;

			t1 = vB - vA;
			t2 = vC - vA;

			r = 1.0 / ( s1 * t2 - s2 * t1 );

			sdir.set(
				( t2 * x1 - t1 * x2 ) * r,
				( t2 * y1 - t1 * y2 ) * r,
				( t2 * z1 - t1 * z2 ) * r
			);

			tdir.set(
				( s1 * x2 - s2 * x1 ) * r,
				( s1 * y2 - s2 * y1 ) * r,
				( s1 * z2 - s2 * z1 ) * r
			);

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		var i, il;
		var j, jl;
		var iA, iB, iC;

		var offsets = this.offsets;

		for ( j = 0, jl = offsets.length; j < jl; ++ j ) {

			var start = offsets[ j ].start;
			var count = offsets[ j ].count;
			var index = offsets[ j ].index;

			for ( i = start, il = start + count; i < il; i += 3 ) {

				iA = index + indices[ i ];
				iB = index + indices[ i + 1 ];
				iC = index + indices[ i + 2 ];

				handleTriangle( iA, iB, iC );

			}

		}

		var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
		var n = new THREE.Vector3(), n2 = new THREE.Vector3();
		var w, t, test;

		function handleVertex( v ) {

			n.x = normals[ v * 3 ];
			n.y = normals[ v * 3 + 1 ];
			n.z = normals[ v * 3 + 2 ];

			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? -1.0 : 1.0;

			tangents[ v * 4     ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( j = 0, jl = offsets.length; j < jl; ++ j ) {

			var start = offsets[ j ].start;
			var count = offsets[ j ].count;
			var index = offsets[ j ].index;

			for ( i = start, il = start + count; i < il; i += 3 ) {

				iA = index + indices[ i ];
				iB = index + indices[ i + 1 ];
				iC = index + indices[ i + 2 ];

				handleVertex( iA );
				handleVertex( iB );
				handleVertex( iC );

			}

		}

	},

	/*
		computeOffsets
		Compute the draw offset for large models by chunking the index buffer into chunks of 65k addressable vertices.
		This method will effectively rewrite the index buffer and remap all attributes to match the new indices.
		WARNING: This method will also expand the vertex count to prevent sprawled triangles across draw offsets.
		indexBufferSize - Defaults to 65535, but allows for larger or smaller chunks.
	*/
	computeOffsets: function(indexBufferSize) {

		var size = indexBufferSize;
		if(indexBufferSize === undefined)
			size = 65535; //WebGL limits type of index buffer values to 16-bit.

		var s = Date.now();

		var indices = this.attributes['index'].array;
		var vertices = this.attributes['position'].array;

		var verticesCount = (vertices.length/3);
		var facesCount = (indices.length/3);

		/*
		console.log("Computing buffers in offsets of "+size+" -> indices:"+indices.length+" vertices:"+vertices.length);
		console.log("Faces to process: "+(indices.length/3));
		console.log("Reordering "+verticesCount+" vertices.");
		*/

		var sortedIndices = new Uint16Array( indices.length ); //16-bit buffers
		var indexPtr = 0;
		var vertexPtr = 0;

		var offsets = [ { start:0, count:0, index:0 } ];
		var offset = offsets[0];

		var duplicatedVertices = 0;
		var newVerticeMaps = 0;
		var faceVertices = new Int32Array(6);
		var vertexMap = new Int32Array( vertices.length );
		var revVertexMap = new Int32Array( vertices.length );
		for(var j = 0; j < vertices.length; j++) { vertexMap[j] = -1; revVertexMap[j] = -1; }

		/*
			Traverse every face and reorder vertices in the proper offsets of 65k.
			We can have more than 65k entries in the index buffer per offset, but only reference 65k values.
		*/
		for(var findex = 0; findex < facesCount; findex++) {
			newVerticeMaps = 0;

			for(var vo = 0; vo < 3; vo++) {
				var vid = indices[ findex*3 + vo ];
				if(vertexMap[vid] == -1) {
					//Unmapped vertice
					faceVertices[vo*2] = vid;
					faceVertices[vo*2+1] = -1;
					newVerticeMaps++;
				} else if(vertexMap[vid] < offset.index) {
					//Reused vertices from previous block (duplicate)
					faceVertices[vo*2] = vid;
					faceVertices[vo*2+1] = -1;
					duplicatedVertices++;
				} else {
					//Reused vertice in the current block
					faceVertices[vo*2] = vid;
					faceVertices[vo*2+1] = vertexMap[vid];
				}
			}

			var faceMax = vertexPtr + newVerticeMaps;
			if(faceMax > (offset.index + size)) {
				var new_offset = { start:indexPtr, count:0, index:vertexPtr };
				offsets.push(new_offset);
				offset = new_offset;

				//Re-evaluate reused vertices in light of new offset.
				for(var v = 0; v < 6; v+=2) {
					var new_vid = faceVertices[v+1];
					if(new_vid > -1 && new_vid < offset.index)
						faceVertices[v+1] = -1;
				}
			}

			//Reindex the face.
			for(var v = 0; v < 6; v+=2) {
				var vid = faceVertices[v];
				var new_vid = faceVertices[v+1];

				if(new_vid === -1)
					new_vid = vertexPtr++;

				vertexMap[vid] = new_vid;
				revVertexMap[new_vid] = vid;
				sortedIndices[indexPtr++] = new_vid - offset.index; //XXX overflows at 16bit
				offset.count++;
			}
		}

		/* Move all attribute values to map to the new computed indices , also expand the vertice stack to match our new vertexPtr. */
		this.reorderBuffers(sortedIndices, revVertexMap, vertexPtr);
		this.offsets = offsets;

		/*
		var orderTime = Date.now();
		console.log("Reorder time: "+(orderTime-s)+"ms");
		console.log("Duplicated "+duplicatedVertices+" vertices.");
		console.log("Compute Buffers time: "+(Date.now()-s)+"ms");
		console.log("Draw offsets: "+offsets.length);
		*/

		return offsets;
	},

	/*
		reoderBuffers:
		Reorder attributes based on a new indexBuffer and indexMap.
		indexBuffer - Uint16Array of the new ordered indices.
		indexMap - Int32Array where the position is the new vertex ID and the value the old vertex ID for each vertex.
		vertexCount - Amount of total vertices considered in this reordering (in case you want to grow the vertice stack).
	*/
	reorderBuffers: function(indexBuffer, indexMap, vertexCount) {

		/* Create a copy of all attributes for reordering. */
		var sortedAttributes = {};
		var types = [ Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array ];
		for( var attr in this.attributes ) {
			if(attr == 'index')
				continue;
			var sourceArray = this.attributes[attr].array;
			for ( var i = 0, il = types.length; i < il; i++ ) {
				var type = types[i];
				if (sourceArray instanceof type) {
					sortedAttributes[attr] = new type( this.attributes[attr].itemSize * vertexCount );
					break;
				}
			}
		}

		/* Move attribute positions based on the new index map */
		for(var new_vid = 0; new_vid < vertexCount; new_vid++) {
			var vid = indexMap[new_vid];
			for ( var attr in this.attributes ) {
				if(attr == 'index')
					continue;
				var attrArray = this.attributes[attr].array;
				var attrSize = this.attributes[attr].itemSize;
				var sortedAttr = sortedAttributes[attr];
				for(var k = 0; k < attrSize; k++)
					sortedAttr[ new_vid * attrSize + k ] = attrArray[ vid * attrSize + k ];
			}
		}

		/* Carry the new sorted buffers locally */
		this.attributes['index'].array = indexBuffer;
		for ( var attr in this.attributes ) {
			if(attr == 'index')
				continue;
			this.attributes[attr].array = sortedAttributes[attr];
			this.attributes[attr].numItems = this.attributes[attr].itemSize * vertexCount;
		}
	},

	clone: function () {

		var geometry = new THREE.BufferGeometry();

		var types = [ Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array ];

		for ( var attr in this.attributes ) {

			var sourceAttr = this.attributes[ attr ];
			var sourceArray = sourceAttr.array;

			var attribute = {

				itemSize: sourceAttr.itemSize,
				array: null

			};

			for ( var i = 0, il = types.length; i < il; i ++ ) {

				var type = types[ i ];

				if ( sourceArray instanceof type ) {

					attribute.array = new type( sourceArray );
					break;

				}

			}

			geometry.attributes[ attr ] = attribute;

		}

		for ( var i = 0, il = this.offsets.length; i < il; i ++ ) {

			var offset = this.offsets[ i ];

			geometry.offsets.push( {

				start: offset.start,
				index: offset.index,
				count: offset.count

			} );

		}

		return geometry;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.BufferGeometry.prototype );
