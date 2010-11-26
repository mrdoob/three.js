/**
 * @author mr.doob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.Projector = function() {

	var _renderList = null,
	_face3, _face3Count, _face3Pool = [],
	_face4, _face4Count, _face4Pool = [],
	_line, _lineCount, _linePool = [],
	_particle, _particleCount, _particlePool = [],

	_vector4 = new THREE.Vector4(),
	_projScreenMatrix = new THREE.Matrix4(),
	_projScreenObjectMatrix = new THREE.Matrix4(),

	_clippedVertex1PositionScreen = new THREE.Vector4(),
	_clippedVertex2PositionScreen = new THREE.Vector4();

	this.projectScene = function ( scene, camera ) {

		var o, ol, v, vl, f, fl, objects, object,
		objectMatrix, objectRotationMatrix, objectMaterial, objectOverdraw,
		vertices, vertex, vertexPositionScreen,
		faces, face, v1, v2, v3, v4;

		_renderList = [];
		_face3Count = _face4Count = _lineCount = _particleCount = 0;

		camera.autoUpdateMatrix && camera.updateMatrix();

		_projScreenMatrix.multiply( camera.projectionMatrix, camera.matrix );

		objects = scene.objects;

		for ( o = 0, ol = objects.length; o < ol; o++ ) {

			object = objects[ o ];
			objectMatrix = object.matrix;
			objectRotationMatrix = object.rotationMatrix;
			objectMaterial = object.material;
			objectOverdraw = object.overdraw;

			object.autoUpdateMatrix && object.updateMatrix();

			if ( object instanceof THREE.Mesh ) {

				_projScreenObjectMatrix.multiply( _projScreenMatrix, objectMatrix );

				// vertices

				vertices = object.geometry.vertices;

				for ( v = 0, vl = vertices.length; v < vl; v++ ) {

					vertex = vertices[ v ];

					vertexPositionScreen = vertex.positionScreen;
					vertexPositionScreen.copy( vertex.position );
					_projScreenObjectMatrix.transform( vertexPositionScreen );

					// Perform the perspective divide. TODO: This should be be performend 
					// post clipping (imagine if the vertex lies at the same location as 
					// the camera, causing a divide by w = 0).
					vertexPositionScreen.multiplyScalar( 1 / vertexPositionScreen.w );

					vertex.__visible = vertexPositionScreen.z > 0 && vertexPositionScreen.z < 1;

				}

				// faces

				faces = object.geometry.faces;

				for ( f = 0, fl = faces.length; f < fl; f++ ) {

					face = faces[ f ];

					if ( face instanceof THREE.Face3 ) {

						v1 = vertices[ face.a ]; v2 = vertices[ face.b ]; v3 = vertices[ face.c ];

						if ( v1.__visible && v2.__visible && v3.__visible ) {

							if ( ( object.doubleSided || ( object.flipSided !=
							   ( v3.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
							   ( v3.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) < 0 ) ) ) {

								_face3 = _face3Pool[ _face3Count ] = _face3Pool[ _face3Count ] || new THREE.RenderableFace3();

								_face3.v1.positionScreen.copy( v1.positionScreen );
								_face3.v2.positionScreen.copy( v2.positionScreen );
								_face3.v3.positionScreen.copy( v3.positionScreen );

								_face3.normalWorld.copy( face.normal );
								objectRotationMatrix.transform( _face3.normalWorld );

								_face3.centroidWorld.copy( face.centroid );
								objectMatrix.transform( _face3.centroidWorld );

								_face3.centroidScreen.copy( _face3.centroidWorld );
								_projScreenMatrix.transform( _face3.centroidScreen );

								_face3.z = _face3.centroidScreen.z;

								_face3.meshMaterial = objectMaterial;
								_face3.faceMaterial = face.material;
								_face3.overdraw = objectOverdraw;
								_face3.uvs = object.geometry.uvs[ f ];

								_renderList.push( _face3 );

								_face3Count ++;

							}

						}

					} else if ( face instanceof THREE.Face4 ) {

						v1 = vertices[ face.a ]; v2 = vertices[ face.b ]; v3 = vertices[ face.c ]; v4 = vertices[ face.d ];

						if ( v1.__visible && v2.__visible && v3.__visible && v4.__visible ) {

							if ( ( object.doubleSided || ( object.flipSided !=
							   ( ( v4.positionScreen.x - v1.positionScreen.x ) * ( v2.positionScreen.y - v1.positionScreen.y ) -
							   ( v4.positionScreen.y - v1.positionScreen.y ) * ( v2.positionScreen.x - v1.positionScreen.x ) < 0 ||
							   ( v2.positionScreen.x - v3.positionScreen.x ) * ( v4.positionScreen.y - v3.positionScreen.y ) -
							   ( v2.positionScreen.y - v3.positionScreen.y ) * ( v4.positionScreen.x - v3.positionScreen.x ) < 0 ) ) ) ) {

								_face4 = _face4Pool[ _face4Count ] = _face4Pool[ _face4Count ] || new THREE.RenderableFace4();

								_face4.v1.positionScreen.copy( v1.positionScreen );
								_face4.v2.positionScreen.copy( v2.positionScreen );
								_face4.v3.positionScreen.copy( v3.positionScreen );
								_face4.v4.positionScreen.copy( v4.positionScreen );

								_face4.normalWorld.copy( face.normal );
								objectRotationMatrix.transform( _face4.normalWorld );

								_face4.centroidWorld.copy( face.centroid );
								objectMatrix.transform( _face4.centroidWorld );

								_face4.centroidScreen.copy( _face4.centroidWorld );
								_projScreenMatrix.transform( _face4.centroidScreen );

								_face4.z = _face4.centroidScreen.z;

								_face4.meshMaterial = objectMaterial;
								_face4.faceMaterial = face.material;
								_face4.overdraw = objectOverdraw;
								_face4.uvs = object.geometry.uvs[ f ];

								_renderList.push( _face4 );

								_face4Count ++;

							}

						}

					}

				}

			} else if ( object instanceof THREE.Line ) {

				_projScreenObjectMatrix.multiply( _projScreenMatrix, objectMatrix );

				vertices = object.geometry.vertices;

				vertex = vertices[ 0 ];
				vertex.positionScreen.copy( vertex.position );
				_projScreenObjectMatrix.transform( vertex.positionScreen );

				for ( v = 1, vl = vertices.length; v < vl; v++ ) {

					v1 = vertices[ v ];

					v1.positionScreen.copy( v1.position );
					_projScreenObjectMatrix.transform( v1.positionScreen );

					v2 = vertices[ v - 1 ];

					_clippedVertex1PositionScreen.copy( v1.positionScreen );
					_clippedVertex2PositionScreen.copy( v2.positionScreen );

					if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) ) {

						// Perform the perspective divide
						_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
						_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

						_line = _linePool[ _lineCount ] = _linePool[ _lineCount ] || new THREE.RenderableLine();
						_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
						_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

						_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );

						_line.material = object.material;

						_renderList.push( _line );

						_lineCount ++;
					}
				}

			} else if ( object instanceof THREE.Particle ) {

				_vector4.set( object.position.x, object.position.y, object.position.z, 1 );

				_projScreenMatrix.transform( _vector4 );

				_vector4.z /= _vector4.w;

				if ( _vector4.z > 0 && _vector4.z < 1 ) {

					_particle = _particlePool[ _particleCount ] = _particlePool[ _particleCount ] || new THREE.RenderableParticle();
					_particle.x = _vector4.x / _vector4.w;
					_particle.y = _vector4.y / _vector4.w;
					_particle.z = _vector4.z;

					_particle.rotation = object.rotation.z;

					_particle.scale.x = object.scale.x * Math.abs( _particle.x - ( _vector4.x + camera.projectionMatrix.n11 ) / ( _vector4.w + camera.projectionMatrix.n14 ) );
					_particle.scale.y = object.scale.y * Math.abs( _particle.y - ( _vector4.y + camera.projectionMatrix.n22 ) / ( _vector4.w + camera.projectionMatrix.n24 ) );

					_particle.material = object.material;

					_renderList.push( _particle );

					_particleCount ++;

				}

			}

		}

		_renderList.sort( function ( a, b ) { return b.z - a.z; } );

		return _renderList;

	};

	this.unprojectVector = function ( vector, camera ) {

		var matrix = new THREE.Matrix4();

		matrix.multiply( THREE.Matrix4.makeInvert( camera.matrix ), THREE.Matrix4.makeInvert( camera.projectionMatrix ) );
		matrix.transform( vector );

		return vector;

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
