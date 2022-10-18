import {
	Box3,
	Color,
	DoubleSide,
	Frustum,
	Matrix3,
	Matrix4,
	Vector2,
	Vector3,
	Vector4
} from 'three';

class RenderableObject {

	constructor() {

		this.id = 0;

		this.object = null;
		this.z = 0;
		this.renderOrder = 0;

	}

}

//

class RenderableFace {

	constructor() {

		this.id = 0;

		this.v1 = new RenderableVertex();
		this.v2 = new RenderableVertex();
		this.v3 = new RenderableVertex();

		this.normalModel = new Vector3();

		this.vertexNormalsModel = [ new Vector3(), new Vector3(), new Vector3() ];
		this.vertexNormalsLength = 0;

		this.color = new Color();
		this.material = null;
		this.uvs = [ new Vector2(), new Vector2(), new Vector2() ];

		this.z = 0;
		this.renderOrder = 0;

	}

}

//

class RenderableVertex {

	constructor() {

		this.position = new Vector3();
		this.positionWorld = new Vector3();
		this.positionScreen = new Vector4();

		this.visible = true;

	}

	copy( vertex ) {

		this.positionWorld.copy( vertex.positionWorld );
		this.positionScreen.copy( vertex.positionScreen );

	}

}

//

class RenderableLine {

	constructor() {

		this.id = 0;

		this.v1 = new RenderableVertex();
		this.v2 = new RenderableVertex();

		this.vertexColors = [ new Color(), new Color() ];
		this.material = null;

		this.z = 0;
		this.renderOrder = 0;

	}

}

//

class RenderableSprite {

	constructor() {

		this.id = 0;

		this.object = null;

		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.rotation = 0;
		this.scale = new Vector2();

		this.material = null;
		this.renderOrder = 0;

	}

}

//

class Projector {

	constructor() {

		let _object, _objectCount, _objectPoolLength = 0,
			_vertex, _vertexCount, _vertexPoolLength = 0,
			_face, _faceCount, _facePoolLength = 0,
			_line, _lineCount, _linePoolLength = 0,
			_sprite, _spriteCount, _spritePoolLength = 0,
			_modelMatrix;

		const

			_renderData = { objects: [], lights: [], elements: [] },

			_vector3 = new Vector3(),
			_vector4 = new Vector4(),

			_clipBox = new Box3( new Vector3( - 1, - 1, - 1 ), new Vector3( 1, 1, 1 ) ),
			_boundingBox = new Box3(),
			_points3 = new Array( 3 ),

			_viewMatrix = new Matrix4(),
			_viewProjectionMatrix = new Matrix4(),

			_modelViewProjectionMatrix = new Matrix4(),

			_frustum = new Frustum(),

			_objectPool = [], _vertexPool = [], _facePool = [], _linePool = [], _spritePool = [];

		//

		function RenderList() {

			const normals = [];
			const colors = [];
			const uvs = [];

			let object = null;

			const normalMatrix = new Matrix3();

			function setObject( value ) {

				object = value;

				normalMatrix.getNormalMatrix( object.matrixWorld );

				normals.length = 0;
				colors.length = 0;
				uvs.length = 0;

			}

			function projectVertex( vertex ) {

				const position = vertex.position;
				const positionWorld = vertex.positionWorld;
				const positionScreen = vertex.positionScreen;

				positionWorld.copy( position ).applyMatrix4( _modelMatrix );
				positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

				const invW = 1 / positionScreen.w;

				positionScreen.x *= invW;
				positionScreen.y *= invW;
				positionScreen.z *= invW;

				vertex.visible = positionScreen.x >= - 1 && positionScreen.x <= 1 &&
						 positionScreen.y >= - 1 && positionScreen.y <= 1 &&
						 positionScreen.z >= - 1 && positionScreen.z <= 1;

			}

			function pushVertex( x, y, z ) {

				_vertex = getNextVertexInPool();
				_vertex.position.set( x, y, z );

				projectVertex( _vertex );

			}

			function pushNormal( x, y, z ) {

				normals.push( x, y, z );

			}

			function pushColor( r, g, b ) {

				colors.push( r, g, b );

			}

			function pushUv( x, y ) {

				uvs.push( x, y );

			}

			function checkTriangleVisibility( v1, v2, v3 ) {

				if ( v1.visible === true || v2.visible === true || v3.visible === true ) return true;

				_points3[ 0 ] = v1.positionScreen;
				_points3[ 1 ] = v2.positionScreen;
				_points3[ 2 ] = v3.positionScreen;

				return _clipBox.intersectsBox( _boundingBox.setFromPoints( _points3 ) );

			}

			function checkBackfaceCulling( v1, v2, v3 ) {

				return ( ( v3.positionScreen.x - v1.positionScreen.x ) *
					    ( v2.positionScreen.y - v1.positionScreen.y ) -
					    ( v3.positionScreen.y - v1.positionScreen.y ) *
					    ( v2.positionScreen.x - v1.positionScreen.x ) ) < 0;

			}

			function pushLine( a, b ) {

				const v1 = _vertexPool[ a ];
				const v2 = _vertexPool[ b ];

				// Clip

				v1.positionScreen.copy( v1.position ).applyMatrix4( _modelViewProjectionMatrix );
				v2.positionScreen.copy( v2.position ).applyMatrix4( _modelViewProjectionMatrix );

				if ( clipLine( v1.positionScreen, v2.positionScreen ) === true ) {

					// Perform the perspective divide
					v1.positionScreen.multiplyScalar( 1 / v1.positionScreen.w );
					v2.positionScreen.multiplyScalar( 1 / v2.positionScreen.w );

					_line = getNextLineInPool();
					_line.id = object.id;
					_line.v1.copy( v1 );
					_line.v2.copy( v2 );
					_line.z = Math.max( v1.positionScreen.z, v2.positionScreen.z );
					_line.renderOrder = object.renderOrder;

					_line.material = object.material;

					if ( object.material.vertexColors ) {

						_line.vertexColors[ 0 ].fromArray( colors, a * 3 );
						_line.vertexColors[ 1 ].fromArray( colors, b * 3 );

					}

					_renderData.elements.push( _line );

				}

			}

			function pushTriangle( a, b, c, material ) {

				const v1 = _vertexPool[ a ];
				const v2 = _vertexPool[ b ];
				const v3 = _vertexPool[ c ];

				if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;

				if ( material.side === DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {

					_face = getNextFaceInPool();

					_face.id = object.id;
					_face.v1.copy( v1 );
					_face.v2.copy( v2 );
					_face.v3.copy( v3 );
					_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
					_face.renderOrder = object.renderOrder;

					// face normal
					_vector3.subVectors( v3.position, v2.position );
					_vector4.subVectors( v1.position, v2.position );
					_vector3.cross( _vector4 );
					_face.normalModel.copy( _vector3 );
					_face.normalModel.applyMatrix3( normalMatrix ).normalize();

					for ( let i = 0; i < 3; i ++ ) {

						const normal = _face.vertexNormalsModel[ i ];
						normal.fromArray( normals, arguments[ i ] * 3 );
						normal.applyMatrix3( normalMatrix ).normalize();

						const uv = _face.uvs[ i ];
						uv.fromArray( uvs, arguments[ i ] * 2 );

					}

					_face.vertexNormalsLength = 3;

					_face.material = material;

					if ( material.vertexColors ) {

						_face.color.fromArray( colors, a * 3 );

					}

					_renderData.elements.push( _face );

				}

			}

			return {
				setObject: setObject,
				projectVertex: projectVertex,
				checkTriangleVisibility: checkTriangleVisibility,
				checkBackfaceCulling: checkBackfaceCulling,
				pushVertex: pushVertex,
				pushNormal: pushNormal,
				pushColor: pushColor,
				pushUv: pushUv,
				pushLine: pushLine,
				pushTriangle: pushTriangle
			};

		}

		const renderList = new RenderList();

		function projectObject( object ) {

			if ( object.visible === false ) return;

			if ( object.isLight ) {

				_renderData.lights.push( object );

			} else if ( object.isMesh || object.isLine || object.isPoints ) {

				if ( object.material.visible === false ) return;
				if ( object.frustumCulled === true && _frustum.intersectsObject( object ) === false ) return;

				addObject( object );

			} else if ( object.isSprite ) {

				if ( object.material.visible === false ) return;
				if ( object.frustumCulled === true && _frustum.intersectsSprite( object ) === false ) return;

				addObject( object );

			}

			const children = object.children;

			for ( let i = 0, l = children.length; i < l; i ++ ) {

				projectObject( children[ i ] );

			}

		}

		function addObject( object ) {

			_object = getNextObjectInPool();
			_object.id = object.id;
			_object.object = object;

			_vector3.setFromMatrixPosition( object.matrixWorld );
			_vector3.applyMatrix4( _viewProjectionMatrix );
			_object.z = _vector3.z;
			_object.renderOrder = object.renderOrder;

			_renderData.objects.push( _object );

		}

		this.projectScene = function ( scene, camera, sortObjects, sortElements ) {

			_faceCount = 0;
			_lineCount = 0;
			_spriteCount = 0;

			_renderData.elements.length = 0;

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();
			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

			_viewMatrix.copy( camera.matrixWorldInverse );
			_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

			_frustum.setFromProjectionMatrix( _viewProjectionMatrix );

			//

			_objectCount = 0;

			_renderData.objects.length = 0;
			_renderData.lights.length = 0;

			projectObject( scene );

			if ( sortObjects === true ) {

				_renderData.objects.sort( painterSort );

			}

			//

			const objects = _renderData.objects;

			for ( let o = 0, ol = objects.length; o < ol; o ++ ) {

				const object = objects[ o ].object;
				const geometry = object.geometry;

				renderList.setObject( object );

				_modelMatrix = object.matrixWorld;

				_vertexCount = 0;

				if ( object.isMesh ) {

					let material = object.material;

					const isMultiMaterial = Array.isArray( material );

					const attributes = geometry.attributes;
					const groups = geometry.groups;

					if ( attributes.position === undefined ) continue;

					const positions = attributes.position.array;

					for ( let i = 0, l = positions.length; i < l; i += 3 ) {

						let x = positions[ i ];
						let y = positions[ i + 1 ];
						let z = positions[ i + 2 ];

						const morphTargets = geometry.morphAttributes.position;

						if ( morphTargets !== undefined ) {

							const morphTargetsRelative = geometry.morphTargetsRelative;
							const morphInfluences = object.morphTargetInfluences;

							for ( let t = 0, tl = morphTargets.length; t < tl; t ++ ) {

								const influence = morphInfluences[ t ];

								if ( influence === 0 ) continue;

								const target = morphTargets[ t ];

								if ( morphTargetsRelative ) {

									x += target.getX( i / 3 ) * influence;
									y += target.getY( i / 3 ) * influence;
									z += target.getZ( i / 3 ) * influence;

								} else {

									x += ( target.getX( i / 3 ) - positions[ i ] ) * influence;
									y += ( target.getY( i / 3 ) - positions[ i + 1 ] ) * influence;
									z += ( target.getZ( i / 3 ) - positions[ i + 2 ] ) * influence;

								}

							}

						}

						renderList.pushVertex( x, y, z );

					}

					if ( attributes.normal !== undefined ) {

						const normals = attributes.normal.array;

						for ( let i = 0, l = normals.length; i < l; i += 3 ) {

							renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );

						}

					}

					if ( attributes.color !== undefined ) {

						const colors = attributes.color.array;

						for ( let i = 0, l = colors.length; i < l; i += 3 ) {

							renderList.pushColor( colors[ i ], colors[ i + 1 ], colors[ i + 2 ] );

						}

					}

					if ( attributes.uv !== undefined ) {

						const uvs = attributes.uv.array;

						for ( let i = 0, l = uvs.length; i < l; i += 2 ) {

							renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );

						}

					}

					if ( geometry.index !== null ) {

						const indices = geometry.index.array;

						if ( groups.length > 0 ) {

							for ( let g = 0; g < groups.length; g ++ ) {

								const group = groups[ g ];

								material = isMultiMaterial === true
									 ? object.material[ group.materialIndex ]
									 : object.material;

								if ( material === undefined ) continue;

								for ( let i = group.start, l = group.start + group.count; i < l; i += 3 ) {

									renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ], material );

								}

							}

						} else {

							for ( let i = 0, l = indices.length; i < l; i += 3 ) {

								renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ], material );

							}

						}

					} else {

						if ( groups.length > 0 ) {

							for ( let g = 0; g < groups.length; g ++ ) {

								const group = groups[ g ];

								material = isMultiMaterial === true
									 ? object.material[ group.materialIndex ]
									 : object.material;

								if ( material === undefined ) continue;

								for ( let i = group.start, l = group.start + group.count; i < l; i += 3 ) {

									renderList.pushTriangle( i, i + 1, i + 2, material );

								}

							}

						} else {

							for ( let i = 0, l = positions.length / 3; i < l; i += 3 ) {

								renderList.pushTriangle( i, i + 1, i + 2, material );

							}

						}

					}

				} else if ( object.isLine ) {

					_modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

					const attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						const positions = attributes.position.array;

						for ( let i = 0, l = positions.length; i < l; i += 3 ) {

							renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

						}

						if ( attributes.color !== undefined ) {

							const colors = attributes.color.array;

							for ( let i = 0, l = colors.length; i < l; i += 3 ) {

								renderList.pushColor( colors[ i ], colors[ i + 1 ], colors[ i + 2 ] );

							}

						}

						if ( geometry.index !== null ) {

							const indices = geometry.index.array;

							for ( let i = 0, l = indices.length; i < l; i += 2 ) {

								renderList.pushLine( indices[ i ], indices[ i + 1 ] );

							}

						} else {

							const step = object.isLineSegments ? 2 : 1;

							for ( let i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {

								renderList.pushLine( i, i + 1 );

							}

						}

					}

				} else if ( object.isPoints ) {

					_modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

					const attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						const positions = attributes.position.array;

						for ( let i = 0, l = positions.length; i < l; i += 3 ) {

							_vector4.set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ], 1 );
							_vector4.applyMatrix4( _modelViewProjectionMatrix );

							pushPoint( _vector4, object, camera );

						}

					}

				} else if ( object.isSprite ) {

					object.modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
					_vector4.set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1 );
					_vector4.applyMatrix4( _viewProjectionMatrix );

					pushPoint( _vector4, object, camera );

				}

			}

			if ( sortElements === true ) {

				_renderData.elements.sort( painterSort );

			}

			return _renderData;

		};

		function pushPoint( _vector4, object, camera ) {

			const invW = 1 / _vector4.w;

			_vector4.z *= invW;

			if ( _vector4.z >= - 1 && _vector4.z <= 1 ) {

				_sprite = getNextSpriteInPool();
				_sprite.id = object.id;
				_sprite.x = _vector4.x * invW;
				_sprite.y = _vector4.y * invW;
				_sprite.z = _vector4.z;
				_sprite.renderOrder = object.renderOrder;
				_sprite.object = object;

				_sprite.rotation = object.rotation;

				_sprite.scale.x = object.scale.x * Math.abs( _sprite.x - ( _vector4.x + camera.projectionMatrix.elements[ 0 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 12 ] ) );
				_sprite.scale.y = object.scale.y * Math.abs( _sprite.y - ( _vector4.y + camera.projectionMatrix.elements[ 5 ] ) / ( _vector4.w + camera.projectionMatrix.elements[ 13 ] ) );

				_sprite.material = object.material;

				_renderData.elements.push( _sprite );

			}

		}

		// Pools

		function getNextObjectInPool() {

			if ( _objectCount === _objectPoolLength ) {

				const object = new RenderableObject();
				_objectPool.push( object );
				_objectPoolLength ++;
				_objectCount ++;
				return object;

			}

			return _objectPool[ _objectCount ++ ];

		}

		function getNextVertexInPool() {

			if ( _vertexCount === _vertexPoolLength ) {

				const vertex = new RenderableVertex();
				_vertexPool.push( vertex );
				_vertexPoolLength ++;
				_vertexCount ++;
				return vertex;

			}

			return _vertexPool[ _vertexCount ++ ];

		}

		function getNextFaceInPool() {

			if ( _faceCount === _facePoolLength ) {

				const face = new RenderableFace();
				_facePool.push( face );
				_facePoolLength ++;
				_faceCount ++;
				return face;

			}

			return _facePool[ _faceCount ++ ];


		}

		function getNextLineInPool() {

			if ( _lineCount === _linePoolLength ) {

				const line = new RenderableLine();
				_linePool.push( line );
				_linePoolLength ++;
				_lineCount ++;
				return line;

			}

			return _linePool[ _lineCount ++ ];

		}

		function getNextSpriteInPool() {

			if ( _spriteCount === _spritePoolLength ) {

				const sprite = new RenderableSprite();
				_spritePool.push( sprite );
				_spritePoolLength ++;
				_spriteCount ++;
				return sprite;

			}

			return _spritePool[ _spriteCount ++ ];

		}

		//

		function painterSort( a, b ) {

			if ( a.renderOrder !== b.renderOrder ) {

				return a.renderOrder - b.renderOrder;

			} else if ( a.z !== b.z ) {

				return b.z - a.z;

			} else if ( a.id !== b.id ) {

				return a.id - b.id;

			} else {

				return 0;

			}

		}

		function clipLine( s1, s2 ) {

			let alpha1 = 0, alpha2 = 1;

			// Calculate the boundary coordinate of each vertex for the near and far clip planes,
			// Z = -1 and Z = +1, respectively.

			const bc1near = s1.z + s1.w,
				bc2near = s2.z + s2.w,
				bc1far = - s1.z + s1.w,
				bc2far = - s2.z + s2.w;

			if ( bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0 ) {

				// Both vertices lie entirely within all clip planes.
				return true;

			} else if ( ( bc1near < 0 && bc2near < 0 ) || ( bc1far < 0 && bc2far < 0 ) ) {

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
					s1.lerp( s2, alpha1 );
					s2.lerp( s1, 1 - alpha2 );

					return true;

				}

			}

		}

	}

}

export { RenderableObject, RenderableFace, RenderableVertex, RenderableLine, RenderableSprite, Projector };
