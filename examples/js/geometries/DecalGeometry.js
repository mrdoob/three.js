THREE.DecalVertex = function( v, n ) {

	this.vertex = v;
	this.normal = n;

};

THREE.DecalVertex.prototype.clone = function() {

	return new THREE.DecalVertex( this.vertex.clone(), this.normal.clone() );

};

THREE.DecalGeometry = function( mesh, position, rotation, dimensions, check ) {

	THREE.Geometry.call( this );

	if ( check === undefined ) check = null;
	check = check || new THREE.Vector3( 1, 1, 1 );

	this.uvs = [];

	this.cube = new THREE.Mesh( new THREE.BoxGeometry( dimensions.x, dimensions.y, dimensions.z ), new THREE.MeshBasicMaterial() );
	this.cube.rotation.set( rotation.x, rotation.y, rotation.z );
	this.cube.position.copy( position );
	this.cube.scale.set( 1, 1, 1 );
	this.cube.updateMatrix();

	this.iCubeMatrix = ( new THREE.Matrix4() ).getInverse( this.cube.matrix );

	this.faceIndices = [ 'a', 'b', 'c', 'd' ];

	this.clipFace = function( inVertices, plane ) {

		var size = .5 * Math.abs( ( dimensions.clone() ).dot( plane ) );

		function clip( v0, v1, p ) {

			var d0 = v0.vertex.dot( p ) - size,
				d1 = v1.vertex.dot( p ) - size;

			var s = d0 / ( d0 - d1 );
			var v = new THREE.DecalVertex(
				new THREE.Vector3(
					v0.vertex.x + s * ( v1.vertex.x - v0.vertex.x ),
					v0.vertex.y + s * ( v1.vertex.y - v0.vertex.y ),
					v0.vertex.z + s * ( v1.vertex.z - v0.vertex.z )
				),
				new THREE.Vector3(
					v0.normal.x + s * ( v1.normal.x - v0.normal.x ),
					v0.normal.y + s * ( v1.normal.y - v0.normal.y ),
					v0.normal.z + s * ( v1.normal.z - v0.normal.z )
				)
			);

			// need to clip more values (texture coordinates)? do it this way:
			//intersectpoint.value = a.value + s*(b.value-a.value);

			return v;

		}

		if ( inVertices.length === 0 ) return [];
		var outVertices = [];

		for ( var j = 0; j < inVertices.length; j += 3 ) {

			var v1Out, v2Out, v3Out, total = 0;

			var d1 = inVertices[ j + 0 ].vertex.dot( plane ) - size,
				d2 = inVertices[ j + 1 ].vertex.dot( plane ) - size,
				d3 = inVertices[ j + 2 ].vertex.dot( plane ) - size;

			v1Out = d1 > 0;
			v2Out = d2 > 0;
			v3Out = d3 > 0;

			total = ( v1Out ? 1 : 0 ) + ( v2Out ? 1 : 0 ) + ( v3Out ? 1 : 0 );

			switch ( total ) {
				case 0: {

					outVertices.push( inVertices[ j ] );
					outVertices.push( inVertices[ j + 1 ] );
					outVertices.push( inVertices[ j + 2 ] );
					break;

				}
				case 1: {

					var nV1, nV2, nV3, nV4;
					if ( v1Out ) {

						nV1 = inVertices[ j + 1 ];
						nV2 = inVertices[ j + 2 ];
						nV3 = clip( inVertices[ j ], nV1, plane );
						nV4 = clip( inVertices[ j ], nV2, plane );

					}
					if ( v2Out ) {

						nV1 = inVertices[ j ];
						nV2 = inVertices[ j + 2 ];
						nV3 = clip( inVertices[ j + 1 ], nV1, plane );
						nV4 = clip( inVertices[ j + 1 ], nV2, plane );

						outVertices.push( nV3 );
						outVertices.push( nV2.clone() );
						outVertices.push( nV1.clone() );

						outVertices.push( nV2.clone() );
						outVertices.push( nV3.clone() );
						outVertices.push( nV4 );
						break;

					}
					if ( v3Out ) {

						nV1 = inVertices[ j ];
						nV2 = inVertices[ j + 1 ];
						nV3 = clip( inVertices[ j + 2 ], nV1, plane );
						nV4 = clip( inVertices[ j + 2 ], nV2, plane );

					}

					outVertices.push( nV1.clone() );
					outVertices.push( nV2.clone() );
					outVertices.push( nV3 );

					outVertices.push( nV4 );
					outVertices.push( nV3.clone() );
					outVertices.push( nV2.clone() );

					break;

				}
				case 2: {

					var nV1, nV2, nV3;
					if ( ! v1Out ) {

						nV1 = inVertices[ j ].clone();
						nV2 = clip( nV1, inVertices[ j + 1 ], plane );
						nV3 = clip( nV1, inVertices[ j + 2 ], plane );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}
					if ( ! v2Out ) {

						nV1 = inVertices[ j + 1 ].clone();
						nV2 = clip( nV1, inVertices[ j + 2 ], plane );
						nV3 = clip( nV1, inVertices[ j ], plane );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}
					if ( ! v3Out ) {

						nV1 = inVertices[ j + 2 ].clone();
						nV2 = clip( nV1, inVertices[ j ], plane );
						nV3 = clip( nV1, inVertices[ j + 1 ], plane );
						outVertices.push( nV1 );
						outVertices.push( nV2 );
						outVertices.push( nV3 );

					}

					break;

				}
				case 3: {

					break;

				}
			}

		}

		return outVertices;

	};

	this.pushVertex = function( vertices, id, n ) {

		var v = mesh.geometry.vertices[ id ].clone();
		v.applyMatrix4( mesh.matrix );
		v.applyMatrix4( this.iCubeMatrix );
		vertices.push( new THREE.DecalVertex( v, n.clone() ) );

	};

	this.computeDecal = function() {

		var finalVertices = [];

		for ( var i = 0; i < mesh.geometry.faces.length; i ++ ) {

			var f = mesh.geometry.faces[ i ];
			var vertices = [];

			this.pushVertex( vertices, f[ this.faceIndices[ 0 ] ], f.vertexNormals[ 0 ] );
			this.pushVertex( vertices, f[ this.faceIndices[ 1 ] ], f.vertexNormals[ 1 ] );
			this.pushVertex( vertices, f[ this.faceIndices[ 2 ] ], f.vertexNormals[ 2 ] );

			if ( check.x ) {

				vertices = this.clipFace( vertices, new THREE.Vector3( 1, 0, 0 ) );
				vertices = this.clipFace( vertices, new THREE.Vector3( - 1, 0, 0 ) );

			}
			if ( check.y ) {

				vertices = this.clipFace( vertices, new THREE.Vector3( 0, 1, 0 ) );
				vertices = this.clipFace( vertices, new THREE.Vector3( 0, - 1, 0 ) );

			}
			if ( check.z ) {

				vertices = this.clipFace( vertices, new THREE.Vector3( 0, 0, 1 ) );
				vertices = this.clipFace( vertices, new THREE.Vector3( 0, 0, - 1 ) );

			}

			for ( var j = 0; j < vertices.length; j ++ ) {

				var v = vertices[ j ];

				this.uvs.push( new THREE.Vector2(
					.5 + ( v.vertex.x / dimensions.x ),
					.5 + ( v.vertex.y / dimensions.y )
				) );

				vertices[ j ].vertex.applyMatrix4( this.cube.matrix );

			}

			if ( vertices.length === 0 ) continue;

			finalVertices = finalVertices.concat( vertices );

		}

		for ( var k = 0; k < finalVertices.length; k += 3 ) {

			this.vertices.push(
				finalVertices[ k ].vertex,
				finalVertices[ k + 1 ].vertex,
				finalVertices[ k + 2 ].vertex
			);

			var f = new THREE.Face3(
				k,
				k + 1,
				k + 2
			);
			f.vertexNormals.push( finalVertices[ k + 0 ].normal );
			f.vertexNormals.push( finalVertices[ k + 1 ].normal );
			f.vertexNormals.push( finalVertices[ k + 2 ].normal );

			this.faces.push( f );

			this.faceVertexUvs[ 0 ].push( [
				this.uvs[ k ],
				this.uvs[ k + 1 ],
				this.uvs[ k + 2 ]
			] );

		}

		this.verticesNeedUpdate = true;
		this.elementsNeedUpdate = true;
		this.morphTargetsNeedUpdate = true;
		this.uvsNeedUpdate = true;
		this.normalsNeedUpdate = true;
		this.colorsNeedUpdate = true;
		this.computeFaceNormals();

	};

	this.computeDecal();

};

THREE.DecalGeometry.prototype = Object.create( THREE.Geometry.prototype );
THREE.DecalGeometry.prototype.constructor = THREE.DecalGeometry;
