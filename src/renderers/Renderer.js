/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 */

THREE.Renderer = function() {

	var face3Pool = [],
	face4Pool = [],
	linePool = [],
	particlePool = [],

	vector4 = new THREE.Vector4(),
	viewMatrix = new THREE.Matrix4();

	function painterSort( a, b ) {

		return b.z - a.z;

	}

	this.renderList = null;

	this.project = function (scene, camera) {

		var o, ol, v, vl, f, fl, vertex, vertex2, face, object, v1, v2, v3, v4,
		face3count = 0, face4count = 0, lineCount = 0, particleCount = 0;

		this.renderList = [];

		if( camera.autoUpdateMatrix ) {

			camera.updateMatrix();

		}

		for ( o = 0, ol = scene.objects.length; o < ol; o++ ) {

			object = scene.objects[ o ];

			if( object.autoUpdateMatrix ) {

				object.updateMatrix();

			}

			if ( object instanceof THREE.Mesh ) {

				viewMatrix.multiply( camera.matrix, object.matrix );

				// vertices

				for ( v = 0, vl = object.geometry.vertices.length; v < vl; v++ ) {

					vertex = object.geometry.vertices[ v ];
					vertex.screen.copy( vertex.position );

					viewMatrix.transform( vertex.screen );
					camera.projectionMatrix.transform( vertex.screen );

					vertex.__visible = vertex.screen.z > 0 && vertex.screen.z < 1;

				}

				// faces

				for ( f = 0, fl = object.geometry.faces.length; f < fl; f++ ) {

					face = object.geometry.faces[ f ];

					if ( face instanceof THREE.Face3 ) {

						v1 = object.geometry.vertices[ face.a ];
						v2 = object.geometry.vertices[ face.b ];
						v3 = object.geometry.vertices[ face.c ];

						if ( v1.__visible && v2.__visible && v3.__visible &&
						   ( object.doubleSided || ( object.flipSided !=
						   ( v3.screen.x - v1.screen.x ) * ( v2.screen.y - v1.screen.y ) -
						   ( v3.screen.y - v1.screen.y ) * ( v2.screen.x - v1.screen.x ) < 0 ) ) ) {

							if ( !face3Pool[ face3count ] ) {

								face3Pool[ face3count ] = new THREE.RenderableFace3();

							}

							face3Pool[ face3count ].v1.copy( v1.screen );
							face3Pool[ face3count ].v2.copy( v2.screen );
							face3Pool[ face3count ].v3.copy( v3.screen );
							face3Pool[ face3count ].z = Math.max( v1.screen.z, Math.max( v2.screen.z, v3.screen.z ) );

							face3Pool[ face3count ].material = object.material;
							face3Pool[ face3count ].overdraw = object.overdraw;
							face3Pool[ face3count ].uvs = object.geometry.uvs[ f ];
							face3Pool[ face3count ].color = face.color;

							this.renderList.push(face3Pool[face3count]);

							face3count++;
						}

					} else if ( face instanceof THREE.Face4 ) {

						v1 = object.geometry.vertices[ face.a ];
						v2 = object.geometry.vertices[ face.b ];
						v3 = object.geometry.vertices[ face.c ];
						v4 = object.geometry.vertices[ face.d ];

						if ( v1.__visible && v2.__visible && v3.__visible && v4.__visible &&
						   ( object.doubleSided || ( object.flipSided !=
						   ( ( v4.screen.x - v1.screen.x ) * ( v2.screen.y - v1.screen.y ) -
						   ( v4.screen.y - v1.screen.y ) * ( v2.screen.x - v1.screen.x ) < 0 ||
						   ( v2.screen.x - v3.screen.x ) * ( v4.screen.y - v3.screen.y ) -
						   ( v2.screen.y - v3.screen.y ) * ( v4.screen.x - v3.screen.x ) < 0 ) ) ) ) {

							if ( !face4Pool[ face4count ] ) {

								face4Pool[ face4count ] = new THREE.RenderableFace4();

							}

							face4Pool[ face4count ].v1.copy( v1.screen );
							face4Pool[ face4count ].v2.copy( v2.screen );
							face4Pool[ face4count ].v3.copy( v3.screen );
							face4Pool[ face4count ].v4.copy( v4.screen );
							face4Pool[ face4count ].z = Math.max( v1.screen.z, Math.max( v2.screen.z, Math.max( v3.screen.z, v4.screen.z ) ) );

							face4Pool[ face4count ].material = object.material;
							face4Pool[ face4count ].overdraw = object.overdraw;
							face4Pool[ face4count ].uvs = object.geometry.uvs[ f ];
							face4Pool[ face4count ].color = face.color;

							this.renderList.push( face4Pool[ face4count ] );

							face4count++;
						}

					}

				}

			} else if ( object instanceof THREE.Line ) {

				viewMatrix.multiply( camera.matrix, object.matrix );

				for ( v = 0, vl = object.geometry.vertices.length; v < vl; v++ ) {

					vertex = object.geometry.vertices[ v ];
					vertex.screen.copy( vertex.position );

					viewMatrix.transform( vertex.screen );
					camera.projectionMatrix.transform( vertex.screen );

					vertex.__visible = vertex.screen.z > 0 && vertex.screen.z < 1;

					if ( v > 0 ) {

						vertex2 = object.geometry.vertices[ v - 1 ];

						if ( vertex.__visible && vertex2.__visible ) {

							if ( !linePool[ lineCount ] ) {

								linePool[ lineCount ] = new THREE.RenderableLine();

							}

							linePool[ lineCount ].v1.copy( vertex.screen );
							linePool[ lineCount ].v2.copy( vertex2.screen );
							linePool[ lineCount ].z = Math.max( vertex.screen.z, vertex2.screen.z );
							linePool[ lineCount ].material = object.material;

							this.renderList.push( linePool[lineCount] );

							lineCount++;

						}
					}
				}

			} else if ( object instanceof THREE.Particle ) {

				vector4.set( object.position.x, object.position.y, object.position.z, 1 );

				camera.matrix.transform( vector4 );
				camera.projectionMatrix.transform( vector4 );

				object.screen.set( vector4.x / vector4.w, vector4.y / vector4.w, vector4.z / vector4.w );

				if ( object.screen.z > 0 && object.screen.z < 1 ) {

					if ( !particlePool[ particleCount ] ) {

						particlePool[ particleCount ] = new THREE.RenderableParticle();

					}

					particlePool[ particleCount ].x = object.screen.x;
					particlePool[ particleCount ].y = object.screen.y;
					particlePool[ particleCount ].z = object.screen.z;

					particlePool[ particleCount ].rotation = object.rotation.z;

					particlePool[ particleCount ].scale.x = object.scale.x * Math.abs( vector4.x / vector4.w - ( vector4.x + camera.projectionMatrix.n11 ) / ( vector4.w + camera.projectionMatrix.n14 ) );
					particlePool[ particleCount ].scale.y = object.scale.y * Math.abs( vector4.y / vector4.w - ( vector4.y + camera.projectionMatrix.n22 ) / ( vector4.w + camera.projectionMatrix.n24 ) );
					particlePool[ particleCount ].material = object.material;
					particlePool[ particleCount ].color = object.color;

					this.renderList.push( particlePool[ particleCount ] );

					particleCount++;

				}

			}

		}

		this.renderList.sort( painterSort );

	};

};
