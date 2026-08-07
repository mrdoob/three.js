import {
	DoubleSide,
	WebGLCoordinateSystem,
	box3Create,
	box3IntersectsBox,
	box3Set,
	box3SetFromPoints,
	colorCreate,
	colorFromArray,
	frustumCreate,
	frustumIntersectsObject,
	frustumIntersectsSprite,
	frustumSetFromProjectionMatrix,
	mat3Create,
	mat3GetNormalMatrix,
	mat4Copy,
	mat4Create,
	mat4MultiplyMatrices,
	vec2Create,
	vec2FromArray,
	vec3ApplyMatrix3,
	vec3ApplyMatrix4,
	vec3Copy,
	vec3Create,
	vec3Cross,
	vec3FromArray,
	vec3Normalize,
	vec3Set,
	vec3SetFromMatrixPosition,
	vec3SubVectors,
	vec4ApplyMatrix4,
	vec4Copy,
	vec4Create,
	vec4Lerp,
	vec4LerpVectors,
	vec4MultiplyScalar,
	vec4Set
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

		this.normalModel = vec3Create();

		this.vertexNormalsModel = [ vec3Create(), vec3Create(), vec3Create() ];
		this.vertexNormalsLength = 0;

		this.color = colorCreate();
		this.material = null;
		this.uvs = [ vec2Create(), vec2Create(), vec2Create() ];

		this.z = 0;
		this.renderOrder = 0;

	}

}

//

class RenderableVertex {

	constructor() {

		this.position = vec3Create();
		this.positionWorld = vec3Create();
		this.positionScreen = vec4Create();

		this.visible = true;

	}

	copy( vertex ) {

		vec3Copy( vertex.positionWorld, this.positionWorld );
		vec4Copy( vertex.positionScreen, this.positionScreen );

	}

}

//

class RenderableLine {

	constructor() {

		this.id = 0;

		this.v1 = new RenderableVertex();
		this.v2 = new RenderableVertex();

		this.vertexColors = [ colorCreate(), colorCreate() ];
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
		this.scale = vec2Create();

		this.material = null;
		this.renderOrder = 0;

	}

}

/**
 * This class can project a given scene in 3D space into a 2D representation
 * used for rendering with a 2D API. `Projector` is currently used by {@link SVGRenderer}
 * and was previously used by the legacy `CanvasRenderer`.
 *
 * @three_import import { Projector } from 'three/addons/renderers/Projector.js';
 */
class Projector {

	/**
	 * Constructs a new projector.
	 */
	constructor() {

		let _object, _objectCount, _objectPoolLength = 0,
			_vertex, _vertexCount, _vertexPoolLength = 0,
			_face, _faceCount, _facePoolLength = 0,
			_line, _lineCount, _linePoolLength = 0,
			_sprite, _spriteCount, _spritePoolLength = 0,
			_modelMatrix, _clipInput = [], _clipOutput = [];

		const

			_renderData = { objects: [], lights: [], elements: [] },

			_vector3 = vec3Create(),
			_vector4 = vec4Create(),

			_clipBox = box3Set( { x: - 1, y: - 1, z: - 1 }, { x: 1, y: 1, z: 1 } ),
			_boundingBox = box3Create(),
			_points3 = new Array( 3 ),

			_viewMatrix = mat4Create(),
			_viewProjectionMatrix = mat4Create(),

			_modelViewProjectionMatrix = mat4Create(),

			_frustum = frustumCreate(),

			_objectPool = [], _vertexPool = [], _facePool = [], _linePool = [], _spritePool = [],

			_clipVertexPool = [],
			_clipPos1 = vec4Create(),
			_clipPos2 = vec4Create(),
			_clipPos3 = vec4Create(),
			_screenVertexPool = [],
			_clipInputVertices = [ null, null, null ],

			_clipPlanes = [
				{ sign: + 1 },
				{ sign: - 1 }
			];

		//

		function RenderList() {

			const normals = [];
			const colors = [];
			const uvs = [];

			let object = null;

			const normalMatrix = mat3Create();

			function setObject( value ) {

				object = value;

				mat3GetNormalMatrix( object.matrixWorld, normalMatrix );

				normals.length = 0;
				colors.length = 0;
				uvs.length = 0;

			}

			function projectVertex( vertex ) {

				const position = vertex.position;
				const positionWorld = vertex.positionWorld;
				const positionScreen = vertex.positionScreen;

				vec3ApplyMatrix4( vec3Copy( position, positionWorld ), _modelMatrix, positionWorld );
				vec4ApplyMatrix4( vec4Copy( positionWorld, positionScreen ), _viewProjectionMatrix, positionScreen );

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
				vec3Set( _vertex.position, x, y, z );

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

				return box3IntersectsBox( _clipBox, box3SetFromPoints( _points3, _boundingBox ) );

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

				vec4ApplyMatrix4( vec4Copy( v1.position, v1.positionScreen ), _modelViewProjectionMatrix, v1.positionScreen );
				vec4ApplyMatrix4( vec4Copy( v2.position, v2.positionScreen ), _modelViewProjectionMatrix, v2.positionScreen );

				if ( clipLine( v1.positionScreen, v2.positionScreen ) === true ) {

					// Perform the perspective divide
					vec4MultiplyScalar( v1.positionScreen, 1 / v1.positionScreen.w, v1.positionScreen );
					vec4MultiplyScalar( v2.positionScreen, 1 / v2.positionScreen.w, v2.positionScreen );

					_line = getNextLineInPool();
					_line.id = object.id;
					_line.v1.copy( v1 );
					_line.v2.copy( v2 );
					_line.z = Math.max( v1.positionScreen.z, v2.positionScreen.z );
					_line.renderOrder = object.renderOrder;

					_line.material = object.material;

					if ( object.material.vertexColors ) {

						colorFromArray( colors, a * 3, _line.vertexColors[ 0 ] );
						colorFromArray( colors, b * 3, _line.vertexColors[ 1 ] );

					}

					_renderData.elements.push( _line );

				}

			}

			function pushTriangle( a, b, c, material ) {

				const v1 = _vertexPool[ a ];
				const v2 = _vertexPool[ b ];
				const v3 = _vertexPool[ c ];

				// Derive near/far clip distances from NDC z and stored clip-space w
				// (projectVertex already computed positionScreen = clipPos / w, with w preserved)
				const w1 = v1.positionScreen.w;
				const w2 = v2.positionScreen.w;
				const w3 = v3.positionScreen.w;

				const nearDist1 = w1 * ( v1.positionScreen.z + 1 );
				const nearDist2 = w2 * ( v2.positionScreen.z + 1 );
				const nearDist3 = w3 * ( v3.positionScreen.z + 1 );
				const farDist1 = w1 * ( 1 - v1.positionScreen.z );
				const farDist2 = w2 * ( 1 - v2.positionScreen.z );
				const farDist3 = w3 * ( 1 - v3.positionScreen.z );

				// Check if completely outside
				if ( ( nearDist1 < 0 && nearDist2 < 0 && nearDist3 < 0 ) ||
					( farDist1 < 0 && farDist2 < 0 && farDist3 < 0 ) ) {

					return; // Triangle completely clipped

				}

				// Check if completely inside (no clipping needed)
				if ( nearDist1 >= 0 && nearDist2 >= 0 && nearDist3 >= 0 &&
					farDist1 >= 0 && farDist2 >= 0 && farDist3 >= 0 ) {

					// No clipping needed - use original path
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
						vec3SubVectors( v3.position, v2.position, _vector3 );
						vec3SubVectors( v1.position, v2.position, _vector4 );
						vec3Cross( _vector3, _vector4, _vector3 );
						vec3Copy( _vector3, _face.normalModel );
						vec3Normalize( vec3ApplyMatrix3( _face.normalModel, normalMatrix, _face.normalModel ), _face.normalModel );

						for ( let i = 0; i < 3; i ++ ) {

							const normal = _face.vertexNormalsModel[ i ];
							vec3FromArray( normals, arguments[ i ] * 3, normal );
							vec3Normalize( vec3ApplyMatrix3( normal, normalMatrix, normal ), normal );

							const uv = _face.uvs[ i ];
							vec2FromArray( uvs, arguments[ i ] * 2, uv );

						}

						_face.vertexNormalsLength = 3;

						_face.material = material;

						if ( material.vertexColors ) {

							colorFromArray( colors, a * 3, _face.color );

						}

						_renderData.elements.push( _face );

					}

					return;

				}

				// Triangle needs clipping - reconstruct clip-space positions from NDC + w
				vec4Set( v1.positionScreen.x * w1, v1.positionScreen.y * w1, v1.positionScreen.z * w1, w1, _clipPos1 );
				vec4Set( v2.positionScreen.x * w2, v2.positionScreen.y * w2, v2.positionScreen.z * w2, w2, _clipPos2 );
				vec4Set( v3.positionScreen.x * w3, v3.positionScreen.y * w3, v3.positionScreen.z * w3, w3, _clipPos3 );
				_clipInputVertices[ 0 ] = _clipPos1;
				_clipInputVertices[ 1 ] = _clipPos2;
				_clipInputVertices[ 2 ] = _clipPos3;
				const clippedCount = clipTriangle( _clipInputVertices );

				if ( clippedCount < 3 ) return; // Triangle completely clipped

				// Perform perspective divide on clipped vertices and create screen vertices
				for ( let i = 0; i < clippedCount; i ++ ) {

					const cv = _clipInput[ i ];

					// Get or create renderable vertex from pool
					let sv = _screenVertexPool[ i ];
					if ( ! sv ) {

						sv = new RenderableVertex();
						_screenVertexPool[ i ] = sv;

					}

					// Perform perspective divide
					const invW = 1 / cv.w;
					vec4Set( cv.x * invW, cv.y * invW, cv.z * invW, 1, sv.positionScreen );

					// Interpolate world position (simplified - using weighted average based on barycentric-like coords)
					// For a proper implementation, we'd need to track interpolation weights
					vec3Copy( v1.positionWorld, sv.positionWorld );

					sv.visible = true;

				}

				// Triangulate the clipped polygon (simple fan triangulation)
				for ( let i = 1; i < clippedCount - 1; i ++ ) {

					const tv1 = _screenVertexPool[ 0 ];
					const tv2 = _screenVertexPool[ i ];
					const tv3 = _screenVertexPool[ i + 1 ];

					if ( material.side === DoubleSide || checkBackfaceCulling( tv1, tv2, tv3 ) === true ) {

						_face = getNextFaceInPool();

						_face.id = object.id;
						_face.v1.copy( tv1 );
						_face.v2.copy( tv2 );
						_face.v3.copy( tv3 );
						_face.z = ( tv1.positionScreen.z + tv2.positionScreen.z + tv3.positionScreen.z ) / 3;
						_face.renderOrder = object.renderOrder;

						// face normal - use original triangle's normal
						vec3SubVectors( v3.position, v2.position, _vector3 );
						vec3SubVectors( v1.position, v2.position, _vector4 );
						vec3Cross( _vector3, _vector4, _vector3 );
						vec3Copy( _vector3, _face.normalModel );
						vec3Normalize( vec3ApplyMatrix3( _face.normalModel, normalMatrix, _face.normalModel ), _face.normalModel );

						// Use original vertex normals and UVs (simplified - proper impl would interpolate)
						for ( let j = 0; j < 3; j ++ ) {

							const normal = _face.vertexNormalsModel[ j ];
							vec3FromArray( normals, arguments[ j ] * 3, normal );
							vec3Normalize( vec3ApplyMatrix3( normal, normalMatrix, normal ), normal );

							const uv = _face.uvs[ j ];
							vec2FromArray( uvs, arguments[ j ] * 2, uv );

						}

						_face.vertexNormalsLength = 3;

						_face.material = material;

						if ( material.vertexColors ) {

							colorFromArray( colors, a * 3, _face.color );

						}

						_renderData.elements.push( _face );

					}

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
				if ( object.frustumCulled === true && frustumIntersectsObject( _frustum, object ) === false ) return;

				addObject( object );

			} else if ( object.isSprite ) {

				if ( object.material.visible === false ) return;
				if ( object.frustumCulled === true && frustumIntersectsSprite( _frustum, object ) === false ) return;

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

			vec3SetFromMatrixPosition( object.matrixWorld, _vector3 );
			vec3ApplyMatrix4( _vector3, _viewProjectionMatrix, _vector3 );
			_object.z = _vector3.z;
			_object.renderOrder = object.renderOrder;

			_renderData.objects.push( _object );

		}

		/**
		 * Projects the given scene in 3D space into a 2D representation. The result
		 * is an object with renderable items.
		 *
		 * @param {Object3D} scene - A scene or any other type of 3D object.
		 * @param {Camera} camera - The camera.
		 * @param {boolean} sortObjects - Whether to sort objects or not.
		 * @param {boolean} sortElements - Whether to sort elements (faces, lines and sprites) or not.
		 * @return {{objects:Array<Objects>,lights:Array<Objects>,elements:Array<Objects>}} The projected scene as renderable objects.
		 */
		this.projectScene = function ( scene, camera, sortObjects, sortElements ) {

			_faceCount = 0;
			_lineCount = 0;
			_spriteCount = 0;

			_renderData.elements.length = 0;

			if ( scene.matrixWorldAutoUpdate === true ) scene.updateMatrixWorld();
			if ( camera.parent === null && camera.matrixWorldAutoUpdate === true ) camera.updateMatrixWorld();

			mat4Copy( camera.matrixWorldInverse, _viewMatrix );
			mat4MultiplyMatrices( camera.projectionMatrix, _viewMatrix, _viewProjectionMatrix );

			frustumSetFromProjectionMatrix( _viewProjectionMatrix, WebGLCoordinateSystem, false, _frustum );

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

					mat4MultiplyMatrices( _viewProjectionMatrix, _modelMatrix, _modelViewProjectionMatrix );

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

					mat4MultiplyMatrices( _viewProjectionMatrix, _modelMatrix, _modelViewProjectionMatrix );

					const attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						const positions = attributes.position.array;

						for ( let i = 0, l = positions.length; i < l; i += 3 ) {

							vec4Set( positions[ i ], positions[ i + 1 ], positions[ i + 2 ], 1, _vector4 );
							vec4ApplyMatrix4( _vector4, _modelViewProjectionMatrix, _vector4 );

							pushPoint( _vector4, object, camera );

						}

					}

				} else if ( object.isSprite ) {

					mat4MultiplyMatrices( camera.matrixWorldInverse, object.matrixWorld, object.modelViewMatrix );
					vec4Set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1, _vector4 );
					vec4ApplyMatrix4( _vector4, _viewProjectionMatrix, _vector4 );

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

		// Sutherland-Hodgman triangle clipping in homogeneous clip space
		// Returns count of vertices in clipped polygon (0 if completely clipped, 3+ if partially clipped)
		// Result vertices are in _clipInput array
		function clipTriangle( vertices ) {

			// Initialize input with the three input vertices
			_clipInput[ 0 ] = vertices[ 0 ];
			_clipInput[ 1 ] = vertices[ 1 ];
			_clipInput[ 2 ] = vertices[ 2 ];

			let inputCount = 3;
			let outputCount = 0;

			for ( let p = 0; p < _clipPlanes.length; p ++ ) {

				const plane = _clipPlanes[ p ];
				outputCount = 0;

				if ( inputCount === 0 ) break;

				for ( let i = 0; i < inputCount; i ++ ) {

					const v1 = _clipInput[ i ];
					const v2 = _clipInput[ ( i + 1 ) % inputCount ];

					const d1 = plane.sign * v1.z + v1.w;
					const d2 = plane.sign * v2.z + v2.w;

					const v1Inside = d1 >= 0;
					const v2Inside = d2 >= 0;

					if ( v1Inside && v2Inside ) {

						// Both inside - add v1
						_clipOutput[ outputCount ++ ] = v1;

					} else if ( v1Inside && ! v2Inside ) {

						// v1 inside, v2 outside - add v1 and intersection
						_clipOutput[ outputCount ++ ] = v1;

						const t = d1 / ( d1 - d2 );
						let intersection = _clipVertexPool[ outputCount ];
						if ( ! intersection ) {

							intersection = vec4Create();
							_clipVertexPool[ outputCount ] = intersection;

						}

						vec4LerpVectors( v1, v2, t, intersection );
						_clipOutput[ outputCount ++ ] = intersection;

					} else if ( ! v1Inside && v2Inside ) {

						// v1 outside, v2 inside - add intersection only
						const t = d1 / ( d1 - d2 );
						let intersection = _clipVertexPool[ outputCount ];
						if ( ! intersection ) {

							intersection = vec4Create();
							_clipVertexPool[ outputCount ] = intersection;

						}

						vec4LerpVectors( v1, v2, t, intersection );
						_clipOutput[ outputCount ++ ] = intersection;

					}

					// Both outside - add nothing

				}

				// Swap input/output
				const temp = _clipInput;
				_clipInput = _clipOutput;
				_clipOutput = temp;
				inputCount = outputCount;

			}

			return inputCount;

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
					vec4Lerp( s1, s2, alpha1, s1 );
					vec4Lerp( s2, s1, 1 - alpha2, s2 );

					return true;

				}

			}

		}

	}

}

export { RenderableObject, RenderableFace, RenderableVertex, RenderableLine, RenderableSprite, Projector };
