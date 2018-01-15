/**
 * @author TristanVALCKE / https://github.com/TristanVALCKE
 *
 * This class allow to split any geometries type during runtime.
 * Keeping normals and Uvs. It is really usefull to see inside mesh like building.
 *
 * Constructor parameter:
 *
 * size - the size of the square view
 *
 */

( function () {

	function SplitModifier( size ) {

		var size = size || 4;
		var divisions = 1;
		var color1 = new THREE.Color( color1 !== undefined ? color1 : 0x444444 );

		var step = size / divisions;
		var halfSize = size / 2;

		var vertices = [], colors = [];

		for ( var i = 0, j = 0, k = - halfSize; i <= divisions; i ++, k += step ) {

			vertices.push( - halfSize, 0, k, halfSize, 0, k );
			vertices.push( k, 0, - halfSize, k, 0, halfSize );

			color1.toArray( colors, j ); j += 3;
			color1.toArray( colors, j ); j += 3;
			color1.toArray( colors, j ); j += 3;
			color1.toArray( colors, j ); j += 3;

		}

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
		geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

		var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

		THREE.LineSegments.call( this, geometry, material );

//		this.rotation.onChange( this.update.bind( this ) );
//		this.quaternion.onChange( this.update.bind( this ) );
		this.recursif = true;

		this.originalObjects = {};
		this.splittedObjects = {};

	}

	SplitModifier.prototype = Object.assign( Object.create( THREE.LineSegments.prototype ), {

		constructor: SplitModifier,

		add: function ( object ) {

			if ( ! object ) {

				console.error( 'SplitModifier: Unable to split null or undefined Mesh !' );
				return;

			}

			var objectType = object.type
            if ( objectType !== 'Group' && objectType !== 'Mesh' ) {

                console.error( 'SplitModifier: Can process only Group or Mesh !' );
                return;

            }

//			THREE.Object3D.prototype.add.call( this, object );

			this.originalObjects[ object.uuid ] = object;
			this.splittedObjects[ object.uuid ] = object.clone();

			this.splitMesh( object );

			return this.splittedObjects[ object.uuid ];

		},

		remove: function ( object ) {

//			THREE.Object3D.prototype.remove.call( this, object );

			delete this.originalObjects[ object.uuid ];
			delete this.splittedObjects[ object.uuid ];

		},

		update: function () {

			this.updateMatrixWorld();
			this.splitMeshes( this.originalObjects );

		},

		splitMeshes: function ( meshes ) {

			for ( var meshIndex in meshes ) {

				this.splitMesh( meshes[ meshIndex ] );

			}

		},

		splitMesh: function ( mesh ) {

			var meshGeometry = this.splittedObjects[ mesh.uuid ].geometry;
			if ( meshGeometry !== null && meshGeometry !== undefined ) {

				this.splittedObjects[ mesh.uuid ].geometry.dispose();
				this.splittedObjects[ mesh.uuid ].geometry = this.split( mesh.geometry );

			}

			var meshMaterial = this.splittedObjects[ mesh.uuid ].material;
			if ( meshMaterial !== null && meshMaterial !== undefined ) {

				this.splittedObjects[ mesh.uuid ].material.dispose();
				this.splittedObjects[ mesh.uuid ].material = mesh.material;

			}

			// OR

			// Instead of refresh all mesh properties that could change just reset a clone and use it !
//			this.splittedObjects[ mesh.uuid ] = mesh.clone();
//			this.splittedObjects[ mesh.uuid ].geometry = this.split( mesh.geometry );

			// OR

//			var splittedMesh = this.splittedObjects[ mesh.uuid ];
//			for ( var property in mesh ) {
//
//				if ( ! mesh.hasOwnProperty( property ) ) continue;
//
//				if ( property === "geometry" ) {
//
//					splittedMesh[ property ].geometry = this.split( mesh.geometry );
//
//				} else if ( property === "material" ) { // Material, Shadow, etc...
//
//					splittedMesh[ property ] = mesh[ property ];
//
//				}
//
//			}

			if ( this.recursif ) this.splitMeshes( mesh.children );

		},

		split: function ( geometry ) {

			if ( ! geometry ) throw new Error( "Invalid geometry argument !" );

			//Todo: Check if splitter intersect geometry

			var geometryToSplit = geometry.clone();

			if ( geometryToSplit.isGeometry ) {

				this.splitGeometry( geometryToSplit );

			} else if ( geometryToSplit.isBufferGeometry ) {

				if ( geometryToSplit.index && geometryToSplit.index.count > 0 ) {

					this.splitIndexedBufferGeometry( geometryToSplit );

				} else {

					this.splitBufferGeometry( geometryToSplit );

				}

			} else {

				console.error( "Unknown geometry type ! Abort splitting..." );
				return geometry;

			}

			return geometryToSplit;

		},

		getSideness: function ( vertex ) {

			var vec = new THREE.Vector3();

			vec.subVectors( vertex, this.position );
			vec.normalize();

			var normalMatrix = new THREE.Matrix3().getNormalMatrix( this.matrixWorld );
			var direction = new THREE.Vector3( 0, 1, 0 ).applyMatrix3( normalMatrix ).normalize();

			var sideness = vec.dot( direction );

			if ( sideness > 0 ) {

				return 1;

			} else if ( sideness < 0 ) {

				return - 1;

			} else {

				return 0;

			}

		},

		getIntersectionPointForSegment: function ( pointA, pointB ) {

			var matrix = new THREE.Matrix4().extractRotation( this.matrix );

			var rayOrigin = pointA;
			var rayDirection = new THREE.Vector3().subVectors( pointB, pointA );
			var facePoint = this.position;
			var faceNormal = new THREE.Vector3( 0, 1, 0 ).applyMatrix4( matrix );

			var d = ( facePoint.x * faceNormal.x ) + ( facePoint.y * faceNormal.y ) + ( facePoint.z * faceNormal.z );
			var numerator = ( faceNormal.x * rayOrigin.x ) + ( faceNormal.y * rayOrigin.y ) + ( faceNormal.z * rayOrigin.z );
			var denominator = ( faceNormal.x * rayDirection.x ) + ( faceNormal.y * rayDirection.y ) + ( faceNormal.z * rayDirection.z );
			var coef = ( d - numerator ) / denominator;

			var x = rayOrigin.x + ( rayDirection.x * coef );
			var y = rayOrigin.y + ( rayDirection.y * coef );
			var z = rayOrigin.z + ( rayDirection.z * coef );

			return [ x, y, z ];

		},

		splitGeometry: function ( geometry ) {

			var self = this;

			var faces = geometry.faces;
			var facesResult = [];

			var vertices = geometry.vertices;
			var verticesResult = [];

			var colors = geometry.colors;
			var haveColors = ( colors.length > 0 );
			var colorsResult = [];

			var faceVertexUvs = geometry.faceVertexUvs[ 0 ]; // Care !!! This is an array of array
			var haveFaceVertexUvs = ( faceVertexUvs.length > 0 );
			var faceVertexUvsResult = [];

			var morphNormals = geometry.morphNormals;
			var haveMorphNormals = ( morphNormals.length > 0 );
			var morphNormalsResult = [];

			var morphTargets = geometry.morphTargets;
			var haveMorphTargets = ( morphTargets.length > 0 );
			var morphTargetsResult = [];

			var skinIndices = geometry.skinIndices;
			var haveSkinIndices = ( skinIndices.length > 0 );
			var skinIndicesResult = [];

			var skinWeights = geometry.skinWeights;
			var haveSkinWeights = ( skinWeights.length > 0 );
			var skinWeightsResult = [];

			var vertexIndexToVertexNormals = {};
			var verticeIndexRelation = {};
			var computedEdges = {};
			var face = undefined;
			var newFace = undefined;
			var v1Index = undefined;
			var v2Index = undefined;
			var v3Index = undefined;
			var v1i = undefined;
			var v2i = undefined;
			var v3i = undefined;
			var v4i = undefined;
			var v1 = undefined;
			var v2 = undefined;
			var v3 = undefined;
			var v1Sideness = undefined;
			var v2Sideness = undefined;
			var v3Sideness = undefined;
			var normal = undefined;
			var onSplit = false;
			for ( var faceIndex = 0, numberOfFaces = faces.length; faceIndex < numberOfFaces; ++ faceIndex ) {

				face = faces[ faceIndex ];

				v1Index = face.a;
				v2Index = face.b;
				v3Index = face.c;

				normal = face.normal;

				v1 = vertices[ v1Index ];
				v2 = vertices[ v2Index ];
				v3 = vertices[ v3Index ];

				v1Sideness = this.getSideness( v1 );
				v2Sideness = this.getSideness( v2 );
				v3Sideness = this.getSideness( v3 );

				if ( v1Sideness > 0 && v2Sideness > 0 && v3Sideness > 0 ) {

					// Face is over the plan
					//  v1 ____ v2
					//     \  /
					//      \/
					//      v3
					//	__________ p
					// console.log( "Face up" );

					// Ignore it
					continue;

				} else if ( v1Sideness <= 0 && v2Sideness <= 0 && v3Sideness <= 0 ) {

					// Face is under or in the plan
					//
					// ____________ p
					//  v1 ____ v2
					//     \  /
					//      \/
					//      v3
					// console.log( "Face down" );

					// Update current face
					face.a = insertVertex( v1Index );
					face.b = insertVertex( v2Index );
					face.c = insertVertex( v3Index );

				} else if (
					( v1Sideness > 0 && v2Sideness > 0 ) ||
					( v1Sideness > 0 && v3Sideness > 0 ) ||
					( v2Sideness > 0 && v3Sideness > 0 ) ) {

					//  vX ____ vY
					//   __\__/__ p
					//      \/
					//      vZ

					if ( v1Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v1
						//						console.log( "v1 down" );

						v2i = insertVertexBetween( v1, v2, v1Index, v2Index );
						v1i = insertVertex( v1Index );
						v3i = insertVertexBetween( v1, v3, v1Index, v3Index );

					} else if ( v2Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v2
						//						console.log( "v2 down" );

						v1i = insertVertexBetween( v2, v1, v2Index, v1Index );
						v2i = insertVertex( v2Index );
						v3i = insertVertexBetween( v2, v3, v2Index, v3Index );

					} else if ( v3Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v3
						//						console.log( "v3 down" );

						v1i = insertVertexBetween( v3, v1, v3Index, v1Index );
						v3i = insertVertex( v3Index );
						v2i = insertVertexBetween( v3, v2, v3Index, v2Index );

					} else {

						//   ,-*
						// (_)  Boom !

					}

					// Update current face
					face.a = v1i;
					face.b = v2i;
					face.c = v3i;

				} else if (
					( v1Sideness <= 0 && v2Sideness <= 0 ) ||
					( v1Sideness <= 0 && v3Sideness <= 0 ) ||
					( v2Sideness <= 0 && v3Sideness <= 0 ) ) {

					//       vY
					//       /\
					//   ___/__\___ p
					//     /____\
					//   vX      vZ

					// Prepare new splitted face
					onSplit = true;
					newFace = face.clone();

					if ( v1Sideness > 0 ) {

						//       v1
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						//						console.log( "v1 up" );

						v1i = insertVertex( v2Index );
						v2i = insertVertex( v3Index );
						v3i = insertVertexBetween( v1, v2, v1Index, v2Index );
						v4i = insertVertexBetween( v1, v3, v1Index, v3Index );

						// Update current face
						face.a = v1i;
						face.b = v2i;
						face.c = v3i;

						// Update new face
						newFace.a = v2i;
						newFace.b = v4i;
						newFace.c = v3i;

					} else if ( v2Sideness > 0 ) {

						//       v2
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						//						console.log( "v2 up" );

						v1i = insertVertex( v1Index );
						v2i = insertVertex( v3Index );
						v3i = insertVertexBetween( v2, v1, v2Index, v1Index );
						v4i = insertVertexBetween( v2, v3, v2Index, v3Index );

						// Update current face
						face.a = v1i;
						face.b = v3i;
						face.c = v2i;

						// Update new face
						newFace.a = v2i;
						newFace.b = v3i;
						newFace.c = v4i;

					} else if ( v3Sideness > 0 ) {

						//       v3
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						//						console.log( "v3 up" );

						v1i = insertVertex( v1Index );
						v2i = insertVertex( v2Index );
						v3i = insertVertexBetween( v3, v1, v3Index, v1Index );
						v4i = insertVertexBetween( v3, v2, v3Index, v2Index );

						// Update current face
						face.a = v1i;
						face.b = v2i;
						face.c = v3i;

						// Update new face
						newFace.a = v2i;
						newFace.b = v4i;
						newFace.c = v3i;

					} else {

					}

				} else {

				}

				cacheNormalForFaceIndexes( normal, face );
				facesResult.push( face );
				//				if ( haveFaceVertexUvs ) faceVertexUvsResult.push( faceVertexUvs[ faceIndex ] );

				if ( onSplit ) {

					cacheNormalForFaceIndexes( normal, newFace );
					facesResult.push( newFace );

					onSplit = false;

				}

			}

			// Make normals average
			var normals = undefined;
			var normalsLength = undefined;
			var normalsSum = undefined;
			for ( var vertexIndex in vertexIndexToVertexNormals ) {

				normals = vertexIndexToVertexNormals[ vertexIndex ];
				normalsLength = normals.length;
				normalsSum = new THREE.Vector3( 0, 0, 0 );

				// Make sum
				for ( var normalIndex = 0; normalIndex < normalsLength; ++ normalIndex ) {

					normalsSum.add( normals[ normalIndex ] );

				}

				// Make average
				normalsSum.x /= normalsLength;
				normalsSum.y /= normalsLength;
				normalsSum.z /= normalsLength;

				// Replace previous normals by average normal
				vertexIndexToVertexNormals[ vertexIndex ] = normalsSum;

			}

			// Apply vertex normal to each faces
			for ( var faceIndex = 0, numberOfFaces = facesResult.length; faceIndex < numberOfFaces; ++ faceIndex ) {

				face = facesResult[ faceIndex ];
				face.vertexNormals[ 0 ] = vertexIndexToVertexNormals[ face.a ];
				face.vertexNormals[ 1 ] = vertexIndexToVertexNormals[ face.b ];
				face.vertexNormals[ 2 ] = vertexIndexToVertexNormals[ face.c ];

			}

			geometry.faces = facesResult;
			geometry.vertices = verticesResult;
			//			if ( haveFaceVertexUvs ) geometry.faceVertexUvs[ 0 ] = faceVertexUvsResult;
			geometry.faceVertexUvs = [];

			function insertVertex( originalFaceVertexIndex ) {

				var vertexIndex = getBaseIndex( originalFaceVertexIndex );

				// Append new vertex
				verticesResult.push( vertices[ originalFaceVertexIndex ] );

				return vertexIndex;

			}

			function insertVertexBetween( v1, v2, faceVertexIndex1, faceVertexIndex2 ) {

				var vertexIndex = getIntersectionIndex( faceVertexIndex1, faceVertexIndex2 );

				// Append new vertex
				var intersectionPoint = self.getIntersectionPointForSegment( v1, v2 );
				verticesResult.push( new THREE.Vector3().fromArray( intersectionPoint ) );

				return vertexIndex;

			}

			function getBaseIndex( vIndex ) {

				var baseIndex = undefined;

				if ( verticeIndexRelation[ vIndex ] ) {

					baseIndex = verticeIndexRelation[ vIndex ][ "baseIndex" ];

					if ( baseIndex === undefined ) {

						baseIndex = verticesResult.length;
						verticeIndexRelation[ vIndex ][ "baseIndex" ] = baseIndex;

					}

				} else {

					baseIndex = verticesResult.length;
					verticeIndexRelation[ vIndex ] = {};
					verticeIndexRelation[ vIndex ][ "baseIndex" ] = baseIndex;

				}

				return baseIndex;

			}

			function getIntersectionIndex( v1Index, v2Index ) {

				var intersectionIndex = undefined;

				if ( verticeIndexRelation[ v1Index ] ) {

					if ( verticeIndexRelation[ v1Index ][ v2Index ] ) {

						intersectionIndex = verticeIndexRelation[ v1Index ][ v2Index ];

					} else {

						intersectionIndex = verticesResult.length;
						verticeIndexRelation[ v1Index ][ v2Index ] = intersectionIndex;

					}

				} else if ( verticeIndexRelation[ v2Index ] ) {

					if ( verticeIndexRelation[ v2Index ][ v1Index ] ) {

						intersectionIndex = verticeIndexRelation[ v2Index ][ v1Index ];

					} else {

						intersectionIndex = verticesResult.length;
						verticeIndexRelation[ v2Index ][ v1Index ] = intersectionIndex;

					}

				} else {

					intersectionIndex = verticesResult.length;

					verticeIndexRelation[ v1Index ] = {};
					verticeIndexRelation[ v1Index ][ v2Index ] = intersectionIndex;

					verticeIndexRelation[ v2Index ] = {};
					verticeIndexRelation[ v2Index ][ v1Index ] = intersectionIndex;

				}

				return intersectionIndex;

			}

			// Store normal for each vertex of the face
			function cacheNormalForFaceIndexes( normal, face ) {

				cacheNormalForIndex( normal, face.a );
				cacheNormalForIndex( normal, face.b );
				cacheNormalForIndex( normal, face.c );

			}

			function cacheNormalForIndex( normal, vertexIndex ) {

				if ( ! vertexIndexToVertexNormals[ vertexIndex ] ) vertexIndexToVertexNormals[ vertexIndex ] = [];
				vertexIndexToVertexNormals[ vertexIndex ].push( normal );

			}

		},

		splitIndexedBufferGeometry: function ( geometry ) {

			var self = this;

			var positions = geometry.attributes.position;
			var havePositions = ( typeof positions !== 'undefined' );
			var positionsItemSize = ( havePositions ) ? positions.itemSize : 0;
			var positionsResult = [];

			var normals = geometry.attributes.normal;
			var haveNormals = ( typeof normals !== 'undefined' );
			var normalsItemSize = ( haveNormals ) ? normals.itemSize : 0;
			var normalsResult = [];

			var uvs = geometry.attributes.uv;
			var haveUvs = ( typeof uvs !== 'undefined' );
			var uvsItemSize = ( haveUvs ) ? uvs.itemSize : 0;
			var uvsResult = [];

			var indices = geometry.index;
			var haveIndices = ( typeof indices !== 'undefined' );
			var indicesLength = ( haveIndices ) ? indices.count : 0;
			var indicesItemSize = ( haveIndices ) ? indices.itemSize : 0;
			var indicesResult = [];

			// Todo ?
			// var groups = geometry.groups;

			var computedEdges = {};
			var intersectionPoint = undefined;

			var v1 = {};
			var v2 = {};
			var v3 = {};

			var v1Index = undefined;
			var v2Index = undefined;
			var v3Index = undefined;
			var v1Sideness = undefined;
			var v2Sideness = undefined;
			var v3Sideness = undefined;
			for ( var index = 0, offset = 0, numberOfTriangles = ( indicesLength / 3 ); index < numberOfTriangles; ++ index, offset += 3 ) {

				v1Index = indices.getX( offset + 0 );
				v2Index = indices.getX( offset + 1 );
				v3Index = indices.getX( offset + 2 );

				v1 = getVertexWithIndex( v1Index );
				v2 = getVertexWithIndex( v2Index );
				v3 = getVertexWithIndex( v3Index );

				v1Sideness = this.getSideness( v1.position );
				v2Sideness = this.getSideness( v2.position );
				v3Sideness = this.getSideness( v3.position );

				if ( v1Sideness > 0 && v2Sideness > 0 && v3Sideness > 0 ) {

					// Face is over the plan
					//  v1 ____ v2
					//     \  /
					//      \/
					//      v3
					//	__________ p
					// console.log( "Face up" );

					// Ignore it
					continue;

				} else if ( v1Sideness <= 0 && v2Sideness <= 0 && v3Sideness <= 0 ) {

					// Face is under or in the plan
					//
					// ____________ p
					//  v1 ____ v2
					//     \  /
					//      \/
					//      v3
					// console.log( "Face down" );

					var v1i = insertVertex( v1 );
					var v2i = insertVertex( v2 );
					var v3i = insertVertex( v3 );
					indicesResult.push( v1i, v2i, v3i );

				} else if (
					( v1Sideness > 0 && v2Sideness > 0 ) ||
					( v1Sideness > 0 && v3Sideness > 0 ) ||
					( v2Sideness > 0 && v3Sideness > 0 ) ) {

					//  vX ____ vY
					//   __\__/__ p
					//      \/
					//      vZ

					if ( v1Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v1
						// console.log( "v1 down" );

						var v2i = insertVertexBetween( v1, v2 );
						var v1i = insertVertex( v1 );
						var v3i = insertVertexBetween( v1, v3 );
						indicesResult.push( v1i, v2i, v3i );

					} else if ( v2Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v2
						// console.log( "v2 down" );

						var v1i = insertVertexBetween( v2, v1 );
						var v2i = insertVertex( v2 );
						var v3i = insertVertexBetween( v2, v3 );
						indicesResult.push( v1i, v2i, v3i );

					} else if ( v3Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v3
						// console.log( "v3 down" );

						var v1i = insertVertexBetween( v3, v1 );
						var v3i = insertVertex( v3 );
						var v2i = insertVertexBetween( v3, v2 );
						indicesResult.push( v1i, v2i, v3i );

					} else {

						//   ,-*
						// (_)  Boom !

					}

				} else if (
					( v1Sideness <= 0 && v2Sideness <= 0 ) ||
					( v1Sideness <= 0 && v3Sideness <= 0 ) ||
					( v2Sideness <= 0 && v3Sideness <= 0 ) ) {

					//       vY
					//       /\
					//   ___/__\___ p
					//     /____\
					//   vX      vZ

					if ( v1Sideness > 0 ) {

						//       v1
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						// console.log( "v1 up" );

						var v1i = insertVertex( v2 );
						var v2i = insertVertex( v3 );
						var v3i = insertVertexBetween( v2, v1 );
						var v4i = insertVertexBetween( v3, v1 );

						//                |--- Face 1 ---|--- Face 2 ---|
						indicesResult.push( v1i, v2i, v3i, v2i, v4i, v3i );

					} else if ( v2Sideness > 0 ) {

						//       v2
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						// console.log( "v2 up" );

						var v1i = insertVertex( v1 );
						var v2i = insertVertex( v3 );
						var v3i = insertVertexBetween( v1, v2 );
						var v4i = insertVertexBetween( v3, v2 );

						//                |--- Face 1 ---|--- Face 2 ---|
						indicesResult.push( v1i, v3i, v2i, v2i, v3i, v4i );

					} else if ( v3Sideness > 0 ) {

						//       v3
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						// console.log( "v3 up" );

						var v1i = insertVertex( v1 );
						var v2i = insertVertex( v2 );
						var v3i = insertVertexBetween( v1, v3 );
						var v4i = insertVertexBetween( v2, v3 );

						//                |--- Face 1 ---|--- Face 2 ---|
						indicesResult.push( v1i, v2i, v3i, v2i, v4i, v3i );

					} else {



					}

				} else {


				}

			}

			// Update geometry
			if ( havePositions ) {

				positions.array = Float32Array.from( positionsResult );
				positions.count = ( positionsResult.length / positionsItemSize );

			}

			if ( haveNormals ) {

				normals.array = Float32Array.from( normalsResult );
				normals.count = ( normalsResult.length / normalsItemSize );

			}

			if ( haveUvs ) {

				uvs.array = Float32Array.from( uvsResult );
				uvs.count = ( uvsResult.length / uvsItemSize );

			}

			if ( haveIndices ) {

				indices.array = Uint16Array.from( indicesResult );
				indices.count = ( indicesResult.length / indicesItemSize );

			}

			function getVertexWithIndex( index ) {

				return {
					originalIndex: index,
					position: new THREE.Vector3( positions.getX( index ), positions.getY( index ), positions.getZ( index ) ),
					normal: ( haveNormals ) ? [ normals.getX( index ), normals.getY( index ), normals.getZ( index ) ] : [],
					uv: ( haveUvs ) ? [ uvs.getX( index ), uvs.getY( index ) ] : []
				};

			}

			function insertVertex( vertex ) {

				var newIndex = getBaseIndex( vertex.originalIndex );

				Array.prototype.push.apply( positionsResult, Object.values( vertex.position ) );
				if ( haveNormals ) Array.prototype.push.apply( normalsResult, vertex.normal );
				if ( haveUvs ) Array.prototype.push.apply( uvsResult, vertex.uv );

				return newIndex;

			}

			function insertVertexBetween( vertex1, vertex2 ) {

				var intersectionPointIndex = getIntersectionIndex( vertex1.originalIndex, vertex2.originalIndex );

				intersectionPoint = self.getIntersectionPointForSegment( vertex1.position, vertex2.position );

				Array.prototype.push.apply( positionsResult, intersectionPoint );

				if ( haveNormals ) {

					//					var normalVec = new THREE.Vector3(
					//						vertex1.normal[ 0 ] + vertex2.normal[ 0 ],
					//						vertex1.normal[ 1 ] + vertex2.normal[ 1 ],
					//						vertex1.normal[ 2 ] + vertex2.normal[ 2 ]
					//					);
					//
					//					normalsResult.push(
					//						normalVec.x,
					//						normalVec.z,
					//						normalVec.y
					//					);

					normalsResult.push(
						( ( vertex2.normal[ 0 ] + vertex1.normal[ 0 ] ) / 2 ),
						( ( vertex2.normal[ 1 ] + vertex1.normal[ 1 ] ) / 2 ),
						( ( vertex2.normal[ 2 ] + vertex1.normal[ 2 ] ) / 2 )
					);

				}

				if ( haveUvs ) {

					uvsResult.push(
						( ( vertex1.uv[ 0 ] + vertex2.uv[ 0 ] ) / 2 ),
						( ( vertex1.uv[ 1 ] + vertex2.uv[ 1 ] ) / 2 )
					);

				}

				return intersectionPointIndex;

			}

			function getBaseIndex( vIndex ) {

				var baseIndex = undefined;

				if ( computedEdges[ vIndex ] ) {

					baseIndex = computedEdges[ vIndex ][ "baseIndex" ];

					if ( baseIndex === undefined ) {

						baseIndex = ( positionsResult.length / positionsItemSize );
						computedEdges[ vIndex ][ "baseIndex" ] = baseIndex;

					}

				} else {

					baseIndex = ( positionsResult.length / positionsItemSize );
					computedEdges[ vIndex ] = {};
					computedEdges[ vIndex ][ "baseIndex" ] = baseIndex;

				}

				return baseIndex;

			}

			function getIntersectionIndex( v1Index, v2Index ) {

				var intersectionIndex = undefined;

				if ( computedEdges[ v1Index ] ) {

					if ( computedEdges[ v1Index ][ v2Index ] ) {

						intersectionIndex = computedEdges[ v1Index ][ v2Index ];

					} else {

						intersectionIndex = ( positionsResult.length / positionsItemSize );
						computedEdges[ v1Index ][ v2Index ] = intersectionIndex;

					}

				} else if ( computedEdges[ v2Index ] ) {

					if ( computedEdges[ v2Index ][ v1Index ] ) {

						intersectionIndex = computedEdges[ v2Index ][ v1Index ];

					} else {

						intersectionIndex = ( positionsResult.length / positionsItemSize );
						computedEdges[ v2Index ][ v1Index ] = intersectionIndex;

					}

				} else {

					intersectionIndex = ( positionsResult.length / positionsItemSize );

					computedEdges[ v1Index ] = {};
					computedEdges[ v1Index ][ v2Index ] = intersectionIndex;

					computedEdges[ v2Index ] = {};
					computedEdges[ v2Index ][ v1Index ] = intersectionIndex;

				}

				return intersectionIndex;

			}

		},

		splitBufferGeometry: function ( geometry ) {

			var self = this;

			var positions = geometry.attributes.position;
			var havePositions = ( typeof positions !== 'undefined' );
			var positionsLength = ( havePositions ) ? positions.count : 0;
			var positionsItemSize = ( havePositions ) ? positions.itemSize : 0;
			var positionsResult = [];

			var normals = geometry.attributes.normal;
			var haveNormals = ( typeof normals !== 'undefined' );
			var normalsItemSize = ( haveNormals ) ? normals.itemSize : 0;
			var normalsResult = [];

			var uvs = geometry.attributes.uv;
			var haveUvs = ( typeof uvs !== 'undefined' );
			var uvsItemSize = ( haveUvs ) ? uvs.itemSize : 0;
			var uvsResult = [];

			var v1 = undefined;
			var v2 = undefined;
			var v3 = undefined;
			var v1Sideness = undefined;
			var v2Sideness = undefined;
			var v3Sideness = undefined;
			for ( var vertexIndex = 0; vertexIndex < positionsLength; vertexIndex += 3 ) {

				v1 = getVertexWithIndex( vertexIndex + 0 );
				v2 = getVertexWithIndex( vertexIndex + 1 );
				v3 = getVertexWithIndex( vertexIndex + 2 );

				v1Sideness = this.getSideness( v1.position );
				v2Sideness = this.getSideness( v2.position );
				v3Sideness = this.getSideness( v3.position );

				if ( v1Sideness > 0 && v2Sideness > 0 && v3Sideness > 0 ) {

					// Face is over the plan
					//  v1 ____ v2
					//     \  /
					//      \/
					//      v3
					//	__________ p
					// console.log( "Face up" );

					// Ignore it
					continue;

				} else if ( v1Sideness <= 0 && v2Sideness <= 0 && v3Sideness <= 0 ) {

					// Face is under or in the plan
					//
					// ____________ p
					//  v1 ____ v2
					//     \  /
					//      \/
					//      v3
					// console.log( "Face down" );

					insertVertex( v1 );
					insertVertex( v2 );
					insertVertex( v3 );

				} else if (
					( v1Sideness > 0 && v2Sideness > 0 ) ||
					( v1Sideness > 0 && v3Sideness > 0 ) ||
					( v2Sideness > 0 && v3Sideness > 0 ) ) {

					//  vX ____ vY
					//   __\__/__ p
					//      \/
					//      vZ

					if ( v1Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v1
						// console.log( "v1 down" );

						insertVertex( v1 );
						insertVertexBetween( v1, v2 );
						insertVertexBetween( v1, v3 );

					} else if ( v2Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v2
						// console.log( "v2 down" );

						insertVertexBetween( v2, v1 );
						insertVertex( v2 );
						insertVertexBetween( v2, v3 );

					} else if ( v3Sideness <= 0 ) {

						//  vX ____ vY
						//   __\__/__ p
						//      \/
						//      v3
						// console.log( "v3 down" );

						insertVertex( v3 );
						insertVertexBetween( v3, v1 );
						insertVertexBetween( v3, v2 );

					} else {

						//   ,-*
						// (_)  Boom !

					}

				} else if (
					( v1Sideness <= 0 && v2Sideness <= 0 ) ||
					( v1Sideness <= 0 && v3Sideness <= 0 ) ||
					( v2Sideness <= 0 && v3Sideness <= 0 ) ) {

					//       vY
					//       /\
					//   ___/__\___ p
					//     /____\
					//   vX      vZ

					if ( v1Sideness > 0 ) {

						//       v1
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
//						 console.log( "v1 up" );

						insertVertex( v2 );
						insertVertex( v3 );
						insertVertexBetween( v2, v1 );

						insertVertexBetween( v2, v1 );
						insertVertex( v3 );
						insertVertexBetween( v3, v1 );

					} else if ( v2Sideness > 0 ) {

						//       v2
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						// console.log( "v2 up" );

						insertVertex( v1 );
						insertVertexBetween( v1, v2 );
						insertVertex( v3 );

						insertVertexBetween( v3, v2 );
						insertVertex( v3 );
						insertVertexBetween( v1, v2 );

					} else if ( v3Sideness > 0 ) {

						//       v3
						//       /\
						//   ___/__\___ p
						//     /____\
						//   vX      vZ
						// console.log( "v3 up" );

						insertVertex( v1 );
						insertVertex( v2 );
						insertVertexBetween( v1, v3 );

						insertVertexBetween( v1, v3 );
						insertVertex( v2 );
						insertVertexBetween( v2, v3 );

					} else {



					}

				} else {


				}

			}

			// Update geometry vertices
			if ( havePositions ) {

				positions.array = Float32Array.from( positionsResult );
				positions.count = ( positionsResult.length / positionsItemSize );

			}

			if ( haveNormals ) {

				normals.array = Float32Array.from( normalsResult );
				normals.count = ( normalsResult.length / normalsItemSize );

			}

			if ( haveUvs ) {

				uvs.array = Float32Array.from( uvsResult );
				uvs.count = ( uvsResult.length / uvsItemSize );

			}

			function getVertexWithIndex( index ) {

				return {
					originalIndex: index,
					position: new THREE.Vector3( positions.getX( index ), positions.getY( index ), positions.getZ( index ) ),
					normal: ( haveNormals ) ? [ normals.getX( index ), normals.getY( index ), normals.getZ( index ) ] : [],
					uv: ( haveUvs ) ? [ uvs.getX( index ), uvs.getY( index ) ] : []
				};

			}

			function insertVertex( vertex ) {

				Array.prototype.push.apply( positionsResult, Object.values( vertex.position ) );
				if ( haveNormals ) Array.prototype.push.apply( normalsResult, vertex.normal );
				if ( haveUvs ) Array.prototype.push.apply( uvsResult, vertex.uv );

			}

			function insertVertexBetween( vertex1, vertex2 ) {

				var intersectionPoint = self.getIntersectionPointForSegment( vertex1.position, vertex2.position );

				Array.prototype.push.apply( positionsResult, intersectionPoint );

				if ( haveNormals ) {

					normalsResult.push(
						( ( vertex2.normal[ 0 ] + vertex1.normal[ 0 ] ) / 2 ),
						( ( vertex2.normal[ 1 ] + vertex1.normal[ 1 ] ) / 2 ),
						( ( vertex2.normal[ 2 ] + vertex1.normal[ 2 ] ) / 2 )
					);

				}

				if ( haveUvs ) {

					uvsResult.push(
						( ( vertex1.uv[ 0 ] + vertex2.uv[ 0 ] ) / 2 ),
						( ( vertex1.uv[ 1 ] + vertex2.uv[ 1 ] ) / 2 )
					);

				}

			}

		}

	} );

	// Export
	THREE.SplitModifier = SplitModifier;

} )();
