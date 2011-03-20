/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.Projector = function() {

	var _object, _objectCount, _objectPool = [],
	_vertex, _vertexCount, _vertexPool = [],
	_face3, _face32, _face3Count, _face3Pool = [],
	_line, _lineCount, _linePool = [],
	_particle, _particleCount, _particlePool = [],

	_vector3 = new THREE.Vector4(),
	_vector4 = new THREE.Vector4(),
	_projScreenMatrix = new THREE.Matrix4(),
	_projScreenObjectMatrix = new THREE.Matrix4(),

	_frustum = [
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4(),
		new THREE.Vector4()
	 ],

	_clippedVertex1PositionScreen = new THREE.Vector4(),
	_clippedVertex2PositionScreen = new THREE.Vector4(),

	_face3VertexNormals;


	this.projectVector = function ( vector, camera ) {

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
		_projScreenMatrix.multiplyVector3( vector );

		return vector;

	};

	this.unprojectVector = function ( vector, camera ) {

		_projScreenMatrix.multiply( THREE.Matrix4.makeInvert( camera.projectionMatrix ), camera.matrixWorld );
		_projScreenMatrix.multiplyVector3( vector );

		/*
		var matrix = camera.matrixWorld.clone();

		matrix.multiplySelf( THREE.Matrix4.makeInvert( camera.projectionMatrix ) );
		matrix.multiplyVector3( vector );
		*/

		return vector;

	};

	this.projectObjects = function ( scene, camera, sort ) {

		var renderList = [],
		o, ol, objects, object, matrix;

		_objectCount = 0;

		objects = scene.objects;

		for ( o = 0, ol = objects.length; o < ol; o ++ ) {

			object = objects[ o ];

			if ( !object.visible || ( object instanceof THREE.Mesh && !isInFrustum( object ) ) ) continue;

			_object = getNextObjectInPool();

			_vector3.copy( object.position );
			_projScreenMatrix.multiplyVector3( _vector3 );

			_object.object = object;
			_object.z = _vector3.z;

			renderList.push( _object );

		}

		sort && renderList.sort( painterSort );

		return renderList;

	};

	// TODO: Rename to projectElements?

	this.projectScene = function ( scene, camera, sort ) {

		var renderList = [], near = camera.near, far = camera.far,
		o, ol, v, vl, f, fl, n, nl, objects, object,
		objectMatrix, objectMaterials,
		objectMatrixRotation,
		geometry, vertices, vertex, vertexPositionScreen,
		faces, face, faceVertexNormals, normal, v1, v2, v3, v4;

		_face3Count = 0;
		_lineCount = 0;
		_particleCount = 0;

		camera.matrixAutoUpdate && camera.updateMatrix();

		scene.update( undefined, false, camera );

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
		computeFrustum( _projScreenMatrix );

		objects = this.projectObjects( scene, camera, true );

		for ( o = 0, ol = objects.length; o < ol; o++ ) {

			object = objects[ o ].object;

			if ( !object.visible ) continue;

			objectMatrix = object.matrixWorld;
			objectMatrixRotation = object.matrixRotationWorld;

			objectMaterials = object.materials;

			_vertexCount = 0;

			if ( object instanceof THREE.Mesh ) {

				geometry = object.geometry;
				vertices = geometry.vertices;
				faces = geometry.faces;

				for ( v = 0, vl = vertices.length; v < vl; v ++ ) {

					_vertex = getNextVertexInPool();
					_vertex.positionWorld.copy( vertices[ v ].position );

					objectMatrix.multiplyVector3( _vertex.positionWorld );

					_vertex.positionScreen.copy( _vertex.positionWorld );
					_projScreenMatrix.multiplyVector4( _vertex.positionScreen );

					_vertex.positionScreen.x /= _vertex.positionScreen.w;
					_vertex.positionScreen.y /= _vertex.positionScreen.w;

					_vertex.visible = _vertex.positionScreen.z > near && _vertex.positionScreen.z < far;

				}

				for ( f = 0, fl = faces.length; f < fl; f ++ ) {

					face = faces[ f ];

					if ( face instanceof THREE.Face3 ) {

						v1 = _vertexPool[ face.a ];
						v2 = _vertexPool[ face.b ];
						v3 = _vertexPool[ face.c ];

						if ( v1.visible && v2.visible && v3.visible ) {

							if ( ( object.doubleSided || ( object.flipSided !=
							   ( v3.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
							   ( v3.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) < 0 ) ) ) {

								_face3 = getNextFaceInPool();

								_face3.v1.copy( v1 );
								_face3.v2.copy( v2 );
								_face3.v3.copy( v3 );

								_face3.normalWorld.copy( face.normal );
								objectMatrixRotation.multiplyVector3( _face3.normalWorld );

								_face3.centroidWorld.copy( face.centroid );
								objectMatrix.multiplyVector3( _face3.centroidWorld );

								_face3.centroidScreen.copy( _face3.centroidWorld );
								_projScreenMatrix.multiplyVector3( _face3.centroidScreen );

								faceVertexNormals = face.vertexNormals;
								_face3VertexNormals = _face3.vertexNormalsWorld;

								for ( n = 0; n < 3; n ++ ) {

									normal = _face3VertexNormals[ n ];
									normal.copy( faceVertexNormals[ n ] );
									objectMatrixRotation.multiplyVector3( normal );

								}

								_face3.z = _face3.centroidScreen.z;

								_face3.meshMaterials = objectMaterials;
								_face3.faceMaterials = face.materials;

								if ( object.geometry.faceUvs[ f ] ) {

									_face3.uvs[ 0 ] = object.geometry.faceUvs[ f ][ 0 ];
									_face3.uvs[ 1 ] = object.geometry.faceUvs[ f ][ 1 ];
									_face3.uvs[ 2 ] = object.geometry.faceUvs[ f ][ 2 ];

								}

								renderList.push( _face3 );

							}

						}

					} /* else if ( face instanceof THREE.Face4 ) {

						v1 = vertices[ face.a ]; v2 = vertices[ face.b ]; v3 = vertices[ face.c ]; v4 = vertices[ face.d ];

						if ( v1.__visible && v2.__visible && v3.__visible && v4.__visible ) {

							if ( ( object.doubleSided || ( object.flipSided !=
							   ( ( v4.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
							   ( v4.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) < 0 ||
							   ( v2.positionScreen.x - v3.positionScreen.x ) * ( v4.positionScreen.y - v3.positionScreen.y ) -
							   ( v2.positionScreen.y - v3.positionScreen.y ) * ( v4.positionScreen.x - v3.positionScreen.x ) < 0 ) ) ) ) {

								_face3 = _face3Pool[ _face3Count ] = _face3Pool[ _face3Count ] || new THREE.RenderableFace3();

								_face3.v1.positionWorld.copy( v1.positionWorld );
								_face3.v2.positionWorld.copy( v2.positionWorld );
								_face3.v3.positionWorld.copy( v4.positionWorld );

								_face3.v1.positionScreen.copy( v1.positionScreen );
								_face3.v2.positionScreen.copy( v2.positionScreen );
								_face3.v3.positionScreen.copy( v4.positionScreen );

								_face3.normalWorld.copy( face.normal );
								objectMatrixRotation.multiplyVector3( _face3.normalWorld );

								_face3.centroidWorld.copy( face.centroid );
								objectMatrix.multiplyVector3( _face3.centroidWorld );

								_face3.centroidScreen.copy( _face3.centroidWorld );
								_projScreenMatrix.multiplyVector3( _face3.centroidScreen );

								// TODO: Handle vertex normals

								_face3.z = _face3.centroidScreen.z;

								_face3.meshMaterials = objectMaterials;
								_face3.faceMaterials = face.materials;

								if ( object.geometry.uvs[ f ] ) {

									_face3.uvs[ 0 ] = object.geometry.uvs[ f ][ 0 ];
									_face3.uvs[ 1 ] = object.geometry.uvs[ f ][ 1 ];
									_face3.uvs[ 2 ] = object.geometry.uvs[ f ][ 3 ];

								}

								renderList.push( _face3 );

								_face3Count ++;

								// 

								_face32 = _face3Pool[ _face3Count ] = _face3Pool[ _face3Count ] || new THREE.RenderableFace3();

								_face32.v1.positionWorld.copy( v2.positionWorld );
								_face32.v2.positionWorld.copy( v3.positionWorld );
								_face32.v3.positionWorld.copy( v4.positionWorld );

								_face32.v1.positionScreen.copy( v2.positionScreen );
								_face32.v2.positionScreen.copy( v3.positionScreen );
								_face32.v3.positionScreen.copy( v4.positionScreen );

								_face32.normalWorld.copy( _face3.normalWorld );
								_face32.centroidWorld.copy( _face3.centroidWorld );
								_face32.centroidScreen.copy( _face3.centroidScreen );

								// TODO: Handle vertex normals

								_face32.z = _face32.centroidScreen.z;

								_face32.meshMaterials = objectMaterials;
								_face32.faceMaterials = face.materials;

								if ( object.geometry.uvs[ f ] ) {

									_face32.uvs[ 0 ] = object.geometry.uvs[ f ][ 1 ];
									_face32.uvs[ 1 ] = object.geometry.uvs[ f ][ 2 ];
									_face32.uvs[ 2 ] = object.geometry.uvs[ f ][ 3 ];

								}

								renderList.push( _face32 );

								_face3Count ++;

							}

						}

					} */

				}

			} else if ( object instanceof THREE.Line ) {

				_projScreenObjectMatrix.multiply( _projScreenMatrix, objectMatrix );

				vertices = object.geometry.vertices;

				v1 = getNextVertexInPool();
				v1.positionScreen.copy( vertices[ 0 ].position );
				_projScreenObjectMatrix.multiplyVector4( v1.positionScreen );

				for ( v = 1, vl = vertices.length; v < vl; v++ ) {

					v1 = getNextVertexInPool();
					v1.positionScreen.copy( vertices[ v ].position );
					_projScreenObjectMatrix.multiplyVector4( v1.positionScreen );

					v2 = _vertexPool[ _vertexCount - 2 ];

					_clippedVertex1PositionScreen.copy( v1.positionScreen );
					_clippedVertex2PositionScreen.copy( v2.positionScreen );

					if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) ) {

						// Perform the perspective divide
						_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
						_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

						_line = getNextLineInPool();
						_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
						_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

						_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );

						_line.materials = object.materials;

						renderList.push( _line );

					}
				}

			} else if ( object instanceof THREE.Particle ) {

				_vector4.set( object.position.x, object.position.y, object.position.z, 1 );
				_projScreenMatrix.multiplyVector4( _vector4 );

				_vector4.z /= _vector4.w;

				if ( _vector4.z > 0 && _vector4.z < 1 ) {

					_particle = getNextParticleInPool();
					_particle.x = _vector4.x / _vector4.w;
					_particle.y = _vector4.y / _vector4.w;
					_particle.z = _vector4.z;

					_particle.rotation = object.rotation.z;

					_particle.scale.x = object.scale.x * Math.abs( _particle.x - ( _vector4.x + camera.projectionMatrix.n11 ) / ( _vector4.w + camera.projectionMatrix.n14 ) );
					_particle.scale.y = object.scale.y * Math.abs( _particle.y - ( _vector4.y + camera.projectionMatrix.n22 ) / ( _vector4.w + camera.projectionMatrix.n24 ) );

					_particle.materials = object.materials;

					renderList.push( _particle );

				}

			}

		}

		sort && renderList.sort( painterSort );

		return renderList;

	};

	// Pools

	function getNextObjectInPool() {

		var object = _objectPool[ _objectCount ] = _objectPool[ _objectCount ] || new THREE.RenderableObject();

		_objectCount ++;

		return object;

	}

	function getNextVertexInPool() {

		var vertex = _vertexPool[ _vertexCount ] = _vertexPool[ _vertexCount ] || new THREE.RenderableVertex();

		_vertexCount ++;

		return vertex;

	}

	function getNextFaceInPool() {

		var face = _face3Pool[ _face3Count ] = _face3Pool[ _face3Count ] || new THREE.RenderableFace3();

		_face3Count ++;

		return face;

	}

	function getNextLineInPool() {

		var line = _linePool[ _lineCount ] = _linePool[ _lineCount ] || new THREE.RenderableLine();

		_lineCount ++;

		return line;

	}

	function getNextParticleInPool() {

		var particle = _particlePool[ _particleCount ] = _particlePool[ _particleCount ] || new THREE.RenderableParticle();
		_particleCount ++;
		return particle;

	}

	//

	function painterSort( a, b ) {

		return b.z - a.z;

	}

	function computeFrustum( m ) {

		_frustum[ 0 ].set( m.n41 - m.n11, m.n42 - m.n12, m.n43 - m.n13, m.n44 - m.n14 );
		_frustum[ 1 ].set( m.n41 + m.n11, m.n42 + m.n12, m.n43 + m.n13, m.n44 + m.n14 );
		_frustum[ 2 ].set( m.n41 + m.n21, m.n42 + m.n22, m.n43 + m.n23, m.n44 + m.n24 );
		_frustum[ 3 ].set( m.n41 - m.n21, m.n42 - m.n22, m.n43 - m.n23, m.n44 - m.n24 );
		_frustum[ 4 ].set( m.n41 - m.n31, m.n42 - m.n32, m.n43 - m.n33, m.n44 - m.n34 );
		_frustum[ 5 ].set( m.n41 + m.n31, m.n42 + m.n32, m.n43 + m.n33, m.n44 + m.n34 );

		for ( var i = 0; i < 6; i ++ ) {

			var plane = _frustum[ i ];
			plane.divideScalar( Math.sqrt( plane.x * plane.x + plane.y * plane.y + plane.z * plane.z ) );

		}

	}

	function isInFrustum( object ) {

		var distance, matrix = object.matrixWorld,
		radius = - object.geometry.boundingSphere.radius * Math.max( object.scale.x, Math.max( object.scale.y, object.scale.z ) );

		for ( var i = 0; i < 6; i ++ ) {

			distance = _frustum[ i ].x * matrix.n14 + _frustum[ i ].y * matrix.n24 + _frustum[ i ].z * matrix.n34 + _frustum[ i ].w;
			if ( distance <= radius ) return false;

		}

		return true;

	};

	function clipLine( s1, s2 ) {

		var alpha1 = 0, alpha2 = 1,

		// Calculate the boundary coordinate of each vertex for the near and far clip planes,
		// Z = -1 and Z = +1, respectively.
		bc1near =  s1.z + s1.w,
		bc2near =  s2.z + s2.w,
		bc1far =  - s1.z + s1.w,
		bc2far =  - s2.z + s2.w;

		if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

			// Both vertices lie entirely within all clip planes.
			return true;

		} else if ( ( bc1near < 0 && bc2near < 0) || (bc1far < 0 && bc2far < 0 ) ) {

			// Both vertices lie entirely outside one of the clip planes.
			return false;

		} else {

			// The line segment spans at least one clip plane.

			if ( bc1near < 0 ) {

				// v1 lies outside the near plane, v2 inside
				alpha1 = Math.max( alpha1, bc1near / ( bc1near - bc2near ) );

			} else if ( bc2near < 0 ) {

				// v2 lies outside the near plane, v1 inside
				alpha2 = Math.min( alpha2, bc1near / ( bc1near - bc2near ) );

			}

			if ( bc1far < 0 ) {

				// v1 lies outside the far plane, v2 inside
				alpha1 = Math.max( alpha1, bc1far / ( bc1far - bc2far ) );

			} else if ( bc2far < 0 ) {

				// v2 lies outside the far plane, v2 inside
				alpha2 = Math.min( alpha2, bc1far / ( bc1far - bc2far ) );

			}

			if ( alpha2 < alpha1 ) {

				// The line segment spans two boundaries, but is outside both of them.
				// (This can't happen when we're only clipping against just near/far but good
				//  to leave the check here for future usage if other clip planes are added.)
				return false;

			} else {

				// Update the s1 and s2 vertices to match the clipped line segment.
				s1.lerpSelf( s2, alpha1 );
				s2.lerpSelf( s1, 1 - alpha2 );

				return true;

			}

		}

	}

};
