/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author julianwa / https://github.com/julianwa
 */

THREE.RenderableObject = function () {

	this.id = 0;

	this.object = null;
	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableFace = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();
	this.v3 = new THREE.RenderableVertex();

	this.normalModel = new THREE.Vector3();

	this.vertexNormalsModel = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	this.vertexNormalsLength = 0;

	this.color = new THREE.Color();
	this.material = null;
	this.uvs = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];

	this.z = 0;
	this.renderOrder = 0;

};

//

THREE.RenderableFace.prototype.copy = function ( face ) {

	this.v1.copy( face.v1 );
	this.v2.copy( face.v2 );
	this.v3.copy( face.v3 );

	this.normalModel.copy( face.normalModel );

	this.vertexNormalsModel = face.vertexNormalsModel;
	this.vertexNormalsLength = face.vertexNormalsLength;

	this.color = face.color;
	this.material = face.material;
	this.uvs = [ face.uvs[0], face.uvs[1], face.uvs[2] ];
	this.renderOrder = face.renderOrder;

};

THREE.RenderableVertex = function () {

	this.position = new THREE.Vector3();
	this.positionWorld = new THREE.Vector3();
	this.positionScreen = new THREE.Vector4();

	this.visible = true;

};

THREE.RenderableVertex.prototype.copy = function ( vertex ) {

	this.positionWorld.copy( vertex.positionWorld );
	this.positionScreen.copy( vertex.positionScreen );

};

//

THREE.RenderableLine = function () {

	this.id = 0;

	this.v1 = new THREE.RenderableVertex();
	this.v2 = new THREE.RenderableVertex();

	this.vertexColors = [ new THREE.Color(), new THREE.Color() ];
	this.material = null;

	this.z = 0;
	this.renderOrder = 0;

};

THREE.RenderableLine.prototype.copy = function ( line ) {

	this.v1.copy( line.v1 );
	this.v2.copy( line.v2 );

	this.vertexColors = line.vertexColors;
	this.material = line.material;

};

//

THREE.RenderableSprite = function () {

	this.id = 0;

	this.object = null;

	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.rotation = 0;
	this.scale = new THREE.Vector2();

	this.material = null;
	this.renderOrder = 0;

};

//

THREE.Projector = function () {

	var _object, _objectCount, _objectPool = [], _objectPoolLength = 0,
	_vertex, _camera, _vertexCount, _vertexPool = [], _vertexPoolLength = 0,
	_face, _faceCount, _facePool = [], _facePoolLength = 0,
	_line, _lineCount, _linePool = [], _linePoolLength = 0,
	_sprite, _spriteCount, _spritePool = [], _spritePoolLength = 0,

	_renderData = { objects: [], lights: [], elements: [] },

	_vector3 = new THREE.Vector3(),
	_vector4 = new THREE.Vector4(),

	_clipBox = new THREE.Box3( new THREE.Vector3( - 1, - 1, - 1 ), new THREE.Vector3( 1, 1, 1 ) ),
	_boundingBox = new THREE.Box3(),
	_points3 = new Array( 3 ),
	_points4 = new Array( 4 ),

	_viewMatrix = new THREE.Matrix4(),
	_viewProjectionMatrix = new THREE.Matrix4(),

	_modelMatrix,
	_modelViewProjectionMatrix = new THREE.Matrix4(),

	_normalMatrix = new THREE.Matrix3(),

	_frustum = new THREE.Frustum(),

	_clippedVertex1PositionScreen = new THREE.Vector4(),
	_clippedVertex2PositionScreen = new THREE.Vector4();

	//

	this.projectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
		vector.project( camera );

	};

	this.unprojectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
		vector.unproject( camera );

	};

	this.pickingRay = function ( vector, camera ) {

		console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

	};

	//

	var RenderList = function () {

		var normals = [];
		var uvs = [];

		var object = null;
		var material = null;

		var normalMatrix = new THREE.Matrix3();

		function setObject( value ) {

			object = value;
			material = object.material;

			normalMatrix.getNormalMatrix( object.matrixWorld );

			normals.length = 0;
			uvs.length = 0;

		}

		function projectVertex( vertex ) {

			var position = vertex.position;
			var positionWorld = vertex.positionWorld;
			var positionScreen = vertex.positionScreen;

			positionWorld.copy( position ).applyMatrix4( _modelMatrix );
			positionScreen.copy( positionWorld ).applyMatrix4( _viewProjectionMatrix );

			var invW = 1 / positionScreen.w;

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

			var v1 = _vertexPool[ a ];
			var v2 = _vertexPool[ b ];

			_line = getNextLineInPool();

			_line.id = object.id;
			_line.v1.copy( v1 );
			_line.v2.copy( v2 );
			_line.z = ( v1.positionScreen.z + v2.positionScreen.z ) / 2;
			_line.renderOrder = object.renderOrder;

			_line.material = object.material;

			_renderData.elements.push( _line );

		}

		function pushTriangle( a, b, c ) {

			var v1 = _vertexPool[ a ];
			var v2 = _vertexPool[ b ];
			var v3 = _vertexPool[ c ];

			if ( checkTriangleVisibility( v1, v2, v3 ) === false ) return;

			if ( material.side === THREE.DoubleSide || checkBackfaceCulling( v1, v2, v3 ) === true ) {

				_face = getNextFaceInPool();

				_face.id = object.id;
				_face.v1.copy( v1 );
				_face.v2.copy( v2 );
				_face.v3.copy( v3 );
				_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
				_face.renderOrder = object.renderOrder;

				// use first vertex normal as face normal

				_face.normalModel.fromArray( normals, a * 3 );
				_face.normalModel.applyMatrix3( normalMatrix ).normalize();

				for ( var i = 0; i < 3; i ++ ) {

					var normal = _face.vertexNormalsModel[ i ];
					normal.fromArray( normals, arguments[ i ] * 3 );
					normal.applyMatrix3( normalMatrix ).normalize();

					var uv = _face.uvs[ i ];
					uv.fromArray( uvs, arguments[ i ] * 2 );

				}

				_face.vertexNormalsLength = 3;

				_face.material = object.material;

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
			pushUv: pushUv,
			pushLine: pushLine,
			pushTriangle: pushTriangle
		}

	};

	var renderList = new RenderList();

	this.projectScene = function ( scene, camera, sortObjects, sortElements, useBSP ) {

		_faceCount = 0;
		_lineCount = 0;
		_spriteCount = 0;

		_renderData.elements.length = 0;

		_camera = camera;

		if ( scene.autoUpdate === true ) scene.updateMatrixWorld();
		if ( camera.parent === null ) camera.updateMatrixWorld();

		_viewMatrix.copy( camera.matrixWorldInverse.getInverse( camera.matrixWorld ) );
		_viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, _viewMatrix );

		_frustum.setFromMatrix( _viewProjectionMatrix );

		//

		_objectCount = 0;

		_renderData.objects.length = 0;
		_renderData.lights.length = 0;

		function addObject( object ) {

			_object = getNextObjectInPool();
			_object.id = object.id;
			_object.object = object;

			_vector3.setFromMatrixPosition( object.matrixWorld );
			_vector3.applyProjection( _viewProjectionMatrix );
			_object.z = _vector3.z;
			_object.renderOrder = object.renderOrder;

			_renderData.objects.push( _object );

		}

		scene.traverseVisible( function ( object ) {

			if ( object instanceof THREE.Light ) {

				_renderData.lights.push( object );

			} else if ( object instanceof THREE.Mesh || object instanceof THREE.Line ) {

				if ( object.material.visible === false ) return;
				if ( object.frustumCulled === true && _frustum.intersectsObject( object ) === false ) return;

				addObject( object );

			} else if ( object instanceof THREE.Sprite ) {

				if ( object.material.visible === false ) return;
				if ( object.frustumCulled === true && _frustum.intersectsSprite( object ) === false ) return;

				addObject( object );

			}

		} );

		if ( sortObjects === true && useBSP !== true ) {

			_renderData.objects.sort( painterSort );

		}

		//

		for ( var o = 0, ol = _renderData.objects.length; o < ol; o ++ ) {

			var object = _renderData.objects[ o ].object;
			var geometry = object.geometry;

			renderList.setObject( object );

			_modelMatrix = object.matrixWorld;

			_vertexCount = 0;

			if ( object instanceof THREE.Mesh ) {

				if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;
					var groups = geometry.groups;

					if ( attributes.position === undefined ) continue;

					var positions = attributes.position.array;

					for ( var i = 0, l = positions.length; i < l; i += 3 ) {

						renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

					}

					if ( attributes.normal !== undefined ) {

						var normals = attributes.normal.array;

						for ( var i = 0, l = normals.length; i < l; i += 3 ) {

							renderList.pushNormal( normals[ i ], normals[ i + 1 ], normals[ i + 2 ] );

						}

					}

					if ( attributes.uv !== undefined ) {

						var uvs = attributes.uv.array;

						for ( var i = 0, l = uvs.length; i < l; i += 2 ) {

							renderList.pushUv( uvs[ i ], uvs[ i + 1 ] );

						}

					}

					if ( geometry.index !== null ) {

						var indices = geometry.index.array;

						if ( groups.length > 0 ) {

							for ( var o = 0; o < groups.length; o ++ ) {

								var group = groups[ o ];

								for ( var i = group.start, l = group.start + group.count; i < l; i += 3 ) {

									renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

								}

							}

						} else {

							for ( var i = 0, l = indices.length; i < l; i += 3 ) {

								renderList.pushTriangle( indices[ i ], indices[ i + 1 ], indices[ i + 2 ] );

							}

						}

					} else {

						for ( var i = 0, l = positions.length / 3; i < l; i += 3 ) {

							renderList.pushTriangle( i, i + 1, i + 2 );

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					var vertices = geometry.vertices;
					var faces = geometry.faces;
					var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

					_normalMatrix.getNormalMatrix( _modelMatrix );

					var material = object.material;

					var isFaceMaterial = material instanceof THREE.MultiMaterial;
					var objectMaterials = isFaceMaterial === true ? object.material : null;

					for ( var v = 0, vl = vertices.length; v < vl; v ++ ) {

						var vertex = vertices[ v ];

						_vector3.copy( vertex );

						if ( material.morphTargets === true ) {

							var morphTargets = geometry.morphTargets;
							var morphInfluences = object.morphTargetInfluences;

							for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

								var influence = morphInfluences[ t ];

								if ( influence === 0 ) continue;

								var target = morphTargets[ t ];
								var targetVertex = target.vertices[ v ];

								_vector3.x += ( targetVertex.x - vertex.x ) * influence;
								_vector3.y += ( targetVertex.y - vertex.y ) * influence;
								_vector3.z += ( targetVertex.z - vertex.z ) * influence;

							}

						}

						renderList.pushVertex( _vector3.x, _vector3.y, _vector3.z );

					}

					for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

						var face = faces[ f ];

						material = isFaceMaterial === true
							 ? objectMaterials.materials[ face.materialIndex ]
							 : object.material;

						if ( material === undefined ) continue;

						var side = material.side;

						var v1 = _vertexPool[ face.a ];
						var v2 = _vertexPool[ face.b ];
						var v3 = _vertexPool[ face.c ];

						if ( renderList.checkTriangleVisibility( v1, v2, v3 ) === false ) continue;

						var visible = renderList.checkBackfaceCulling( v1, v2, v3 );

						if ( side !== THREE.DoubleSide ) {

							if ( side === THREE.FrontSide && visible === false ) continue;
							if ( side === THREE.BackSide && visible === true ) continue;

						}

						_face = getNextFaceInPool();

						_face.id = object.id;
						_face.v1.copy( v1 );
						_face.v2.copy( v2 );
						_face.v3.copy( v3 );

						_face.normalModel.copy( face.normal );

						if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

							_face.normalModel.negate();

						}

						_face.normalModel.applyMatrix3( _normalMatrix ).normalize();

						var faceVertexNormals = face.vertexNormals;

						for ( var n = 0, nl = Math.min( faceVertexNormals.length, 3 ); n < nl; n ++ ) {

							var normalModel = _face.vertexNormalsModel[ n ];
							normalModel.copy( faceVertexNormals[ n ] );

							if ( visible === false && ( side === THREE.BackSide || side === THREE.DoubleSide ) ) {

								normalModel.negate();

							}

							normalModel.applyMatrix3( _normalMatrix ).normalize();

						}

						_face.vertexNormalsLength = faceVertexNormals.length;

						var vertexUvs = faceVertexUvs[ f ];

						if ( vertexUvs !== undefined ) {

							for ( var u = 0; u < 3; u ++ ) {

								_face.uvs[ u ].copy( vertexUvs[ u ] );

							}

						}

						_face.color = face.color;
						_face.material = material;

						_face.z = ( v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z ) / 3;
						_face.renderOrder = object.renderOrder;

						_renderData.elements.push( _face );

					}

				}

			} else if ( object instanceof THREE.Line ) {

				if ( geometry instanceof THREE.BufferGeometry ) {

					var attributes = geometry.attributes;

					if ( attributes.position !== undefined ) {

						var positions = attributes.position.array;

						for ( var i = 0, l = positions.length; i < l; i += 3 ) {

							renderList.pushVertex( positions[ i ], positions[ i + 1 ], positions[ i + 2 ] );

						}

						if ( geometry.index !== null ) {

							var indices = geometry.index.array;

							for ( var i = 0, l = indices.length; i < l; i += 2 ) {

								renderList.pushLine( indices[ i ], indices[ i + 1 ] );

							}

						} else {

							var step = object instanceof THREE.LineSegments ? 2 : 1;

							for ( var i = 0, l = ( positions.length / 3 ) - 1; i < l; i += step ) {

								renderList.pushLine( i, i + 1 );

							}

						}

					}

				} else if ( geometry instanceof THREE.Geometry ) {

					_modelViewProjectionMatrix.multiplyMatrices( _viewProjectionMatrix, _modelMatrix );

					var vertices = object.geometry.vertices;

					if ( vertices.length === 0 ) continue;

					v1 = getNextVertexInPool();
					v1.positionScreen.copy( vertices[ 0 ] ).applyMatrix4( _modelViewProjectionMatrix );

					var step = object instanceof THREE.LineSegments ? 2 : 1;

					for ( var v = 1, vl = vertices.length; v < vl; v ++ ) {

						v1 = getNextVertexInPool();
						v1.positionScreen.copy( vertices[ v ] ).applyMatrix4( _modelViewProjectionMatrix );

						if ( ( v + 1 ) % step > 0 ) continue;

						v2 = _vertexPool[ _vertexCount - 2 ];

						_clippedVertex1PositionScreen.copy( v1.positionScreen );
						_clippedVertex2PositionScreen.copy( v2.positionScreen );

						if ( clipLine( _clippedVertex1PositionScreen, _clippedVertex2PositionScreen ) === true ) {

							// Perform the perspective divide
							_clippedVertex1PositionScreen.multiplyScalar( 1 / _clippedVertex1PositionScreen.w );
							_clippedVertex2PositionScreen.multiplyScalar( 1 / _clippedVertex2PositionScreen.w );

							_line = getNextLineInPool();

							_line.id = object.id;
							_line.v1.positionScreen.copy( _clippedVertex1PositionScreen );
							_line.v2.positionScreen.copy( _clippedVertex2PositionScreen );

							_line.z = Math.max( _clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z );
							_line.renderOrder = object.renderOrder;

							_line.material = object.material;

							if ( object.material.vertexColors === THREE.VertexColors ) {

								_line.vertexColors[ 0 ].copy( object.geometry.colors[ v ] );
								_line.vertexColors[ 1 ].copy( object.geometry.colors[ v - 1 ] );

							}

							_renderData.elements.push( _line );

						}

					}

				}

			} else if ( object instanceof THREE.Sprite ) {

				_vector4.set( _modelMatrix.elements[ 12 ], _modelMatrix.elements[ 13 ], _modelMatrix.elements[ 14 ], 1 );
				_vector4.applyMatrix4( _viewProjectionMatrix );

				var invW = 1 / _vector4.w;

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

		}

		if ( sortElements === true && useBSP !== true ) {

			_renderData.elements.sort( painterSort );

		}

		//

		if ( useBSP === true ) {

			var tree = new BSPTree( _renderData.elements );
			_renderData.elements = tree.toArray();

		}

		return _renderData;

	};

	// Pools

	function getNextObjectInPool() {

		if ( _objectCount === _objectPoolLength ) {

			var object = new THREE.RenderableObject();
			_objectPool.push( object );
			_objectPoolLength ++;
			_objectCount ++;
			return object;

		}

		return _objectPool[ _objectCount ++ ];

	}

	function getNextVertexInPool() {

		if ( _vertexCount === _vertexPoolLength ) {

			var vertex = new THREE.RenderableVertex();
			_vertexPool.push( vertex );
			_vertexPoolLength ++;
			_vertexCount ++;
			return vertex;

		}

		return _vertexPool[ _vertexCount ++ ];

	}

	function getNextFaceInPool() {

		if ( _faceCount === _facePoolLength ) {

			var face = new THREE.RenderableFace();
			_facePool.push( face );
			_facePoolLength ++;
			_faceCount ++;
			return face;

		}

		return _facePool[ _faceCount ++ ];


	}

	function getNextLineInPool() {

		if ( _lineCount === _linePoolLength ) {

			var line = new THREE.RenderableLine();
			_linePool.push( line );
			_linePoolLength ++;
			_lineCount ++;
			return line;

		}

		return _linePool[ _lineCount ++ ];

	}

	function getNextSpriteInPool() {

		if ( _spriteCount === _spritePoolLength ) {

			var sprite = new THREE.RenderableSprite();
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

	//

	function BSPTree( data ) {

		if ( data.length ) {

			this.root = BSPTree.utils.createNode( data[ 0 ] );
			for ( var i = 1; i < data.length; i ++ ) {

				this.insert( data[ i ] );

			}

		}

	}

	BSPTree.prototype.insert = function ( element, compareWith ) {

		compareWith = compareWith || this.root;
		var node = ( element instanceof BSPTree.Node ) ?
					element :
					BSPTree.utils.createNode( element );

		var comparison = node.isBehind( compareWith );
		if ( comparison === undefined ) {

			var fragments = node.separate(
				compareWith.getNormal(),
				compareWith.getPointOnPlane()
			);

			var self = this;

			fragments.forEach( function ( f ) {

				self.insert( f, compareWith );

			} );
			return;

		}

		if ( comparison === 0 ) {

			var nodeRenderOrder = BSPTree.utils.getRenderOrder( node );
			var otherRenderOrder = BSPTree.utils.getRenderOrder( compareWith );

			if ( nodeRenderOrder > otherRenderOrder ) {

				comparison = - 1;

			} else {

				comparison = 1;

			}

		}

		if ( comparison === 1 ) {

			if ( ! compareWith.back ) {

				compareWith.back = node;

			} else {

				this.insert( node, compareWith.back );

			}

		} else {

			if ( ! compareWith.front ) {

				compareWith.front = node;

			} else {

				this.insert( node, compareWith.front );

			}

		}

	};

	BSPTree.prototype.toArray = function () {

		var output = [];

		if ( this.root ) {

			this.root.traverse( function ( elem ) {

				output.push( elem );

			} );

		}

		return output;

	}

	BSPTree.utils = {
		createNode: function ( element ) {

			if ( element instanceof THREE.RenderableFace ) return new BSPTree.TriangleNode( element );
			if ( element instanceof THREE.RenderableLine ) return new BSPTree.LineNode( element );
			throw new Error( 'Current BSP algorithm only supports triangles and lines' );

		},
		getPointSign: function ( normal, point, pointOnPlane ) {

			return this.sign( normal.dot( point.clone().sub( pointOnPlane ) ) );

		},
		getRenderOrder: function ( node ) {

			if ( typeof node.element.renderOrder === 'number' ) {

				return node.element.renderOrder;

			} else {

				return 0;

			}

		},
		interpolateUVs: function ( uv1, uv2, p1, p2, intersection ) {

			var alpha = p1.distanceTo( intersection ) / p1.distanceTo( p2 );
			return new THREE.Vector2().lerpVectors( uv1, uv2, alpha );

		},
		isPointInSegment: function ( point, p1, p2 ) {

			// This function assumes that point lies on the line
			// and determines whether it is in line _segment_
			var minX = Math.min( p1.x, p2.x );
			var minY = Math.min( p1.y, p2.y );
			var minZ = Math.min( p1.z, p2.z );
			var maxX = Math.max( p1.x, p2.x );
			var maxY = Math.max( p1.y, p2.y );
			var maxZ = Math.max( p1.z, p2.z );

			return ( point.x >= minX && point.x <= maxX ) &&
				   ( point.y >= minY && point.y <= maxY ) &&
				   ( point.z >= minZ && point.z <= maxZ );

		},
		isZero: function ( x ) {

			return Math.abs( x ) < this.EPSILON;

		},
		linePlaneIntersection: function ( normal, pointOnPlane, p1, p2 ) {

			var upper = pointOnPlane.clone().sub( p1 );
			upper = upper.dot( normal );

			var l = p2.clone().sub( p1 );
			var lower = l.dot( normal );

			if ( lower === 0 ) return undefined;

			var d = upper / lower;

			var intersectionPoint = l.multiplyScalar( d ).add( p1 );

			return BSPTree.utils.isPointInSegment(
				intersectionPoint, p1, p2
			) ? intersectionPoint : undefined;

		},
		pointsEqual: function ( p1, p2 ) {

			return this.isZero( p2.distanceTo( p1 ) );

		},
		projectVertex: function ( vertex ) {

			var oldModelMatrix = _modelMatrix;
			_modelMatrix = this.IDENTITY_MATRIX;
			renderList.projectVertex( vertex );
			vertex.positionScreen.w = 1;
			_modelMatrix = oldModelMatrix;

		},
		sign: function ( x ) {

			if ( Math.abs(x) < 1e-2 ) {

				return 0;

			} else if ( x > 0 ) {

				return 1;

			} else {

				return - 1;

			}

		},

		EPSILON: 1e-20,
		IDENTITY_MATRIX: new THREE.Matrix4()
	}


	BSPTree.Node = function () {

		this.back = null;
		this.front = null;

	}

	BSPTree.Node.prototype.isBehind = function ( node ) {

		var normal = node.getNormal();
		var point = node.getPointOnPlane();

		var viewer = _camera.position;
		var viewerSign = BSPTree.utils.getPointSign( normal, viewer, point );
		var thisSign = this.getSign( normal, point );

		if ( thisSign === undefined ) return undefined;

		if ( thisSign === 0 ) return 0;

		if ( viewerSign !== thisSign ) {

			return 1;

		} else {

			return - 1;

		}

	}

	BSPTree.Node.prototype.traverse = function ( callback ) {

		if ( ! callback ) {

			return;

		}

		if ( this.back ) {

			this.back.traverse( callback );

		}

		callback( this.element );

		if ( this.front ) {

			this.front.traverse( callback );

		}

	}


	BSPTree.LineNode = function ( element ) {

		this.element = element;
		this.isTriangle = false;

	};
	BSPTree.LineNode.prototype = Object.create( BSPTree.Node.prototype );

	BSPTree.LineNode.prototype.getNormal = function () {

		var l = new THREE.Line3(
			this.element.v1.positionWorld,
			this.element.v2.positionWorld
		);
		var pt = l.closestPointToPoint( _camera.position, false );
		return pt.sub( _camera.position );

	}

	BSPTree.LineNode.prototype.getPointOnPlane = function () {

		return this.element.v1.positionWorld;

	}

	BSPTree.LineNode.prototype.getSign = function ( normal, pointOnPlane ) {

		var s1 = BSPTree.utils.getPointSign( normal, this.element.v1.positionWorld, pointOnPlane );
		var s2 = BSPTree.utils.getPointSign( normal, this.element.v2.positionWorld, pointOnPlane );

		var sMax = Math.max( s1, s2 );
		var sMin = Math.min( s1, s2 );

		switch ( Math.abs( sMax - sMin ) ){
			case 0:
				return sMax;
			case 1:
				return sMax || sMin;
			case 2:
				return undefined;
		}

	}

	BSPTree.LineNode.prototype.separate = function ( normal, point ) {

		var intersectionPoint = BSPTree.utils.linePlaneIntersection(
			normal, point,
			this.element.v1.positionWorld,
			this.element.v2.positionWorld
		);

		if ( intersectionPoint ) {

			var newLine = getNextLineInPool();
			newLine.copy( this.element );

			var vertex = new THREE.RenderableVertex();
			vertex.position.copy( intersectionPoint );
			BSPTree.utils.projectVertex( vertex );

			newLine.v1.copy( vertex );
			newLine.v2 = this.element.v2;
			this.element.v2 = vertex;

			return [ this, BSPTree.utils.createNode( newLine ) ];

		} else {

			return [ this ];

		}

	}


	BSPTree.TriangleNode = function ( element ) {

		this.element = element;
		this.isTriangle = true;

	};
	BSPTree.TriangleNode.prototype = Object.create( BSPTree.Node.prototype );

	BSPTree.TriangleNode.prototype.getNormal = function () {

		return this.element.normalModel;

	}

	BSPTree.TriangleNode.prototype.getPointOnPlane = function () {

		return this.element.v1.positionWorld;

	}

	BSPTree.TriangleNode.prototype.getSign = function ( normal, pointOnPlane ) {

		var s1 = BSPTree.utils.getPointSign( normal, this.element.v1.positionWorld, pointOnPlane );
		var s2 = BSPTree.utils.getPointSign( normal, this.element.v2.positionWorld, pointOnPlane );
		var s3 = BSPTree.utils.getPointSign( normal, this.element.v3.positionWorld, pointOnPlane );

		var sMax = Math.max( s1, s2, s3 );
		var sMin = Math.min( s1, s2, s3 );

		switch ( Math.abs( sMax - sMin ) ){
			case 0:
				return sMax;
			case 1:
				return sMax || sMin;
			case 2:
				return undefined;
		}

	}

	BSPTree.TriangleNode.prototype.separate = function ( normal, pointOnPlane ) {

		var p1 = this.element.v1.positionWorld;
		var p2 = this.element.v2.positionWorld;
		var p3 = this.element.v3.positionWorld;

		// Intersection points
		var i12 = BSPTree.utils.linePlaneIntersection(
			normal, pointOnPlane, p1, p2
		);
		var i23 = BSPTree.utils.linePlaneIntersection(
			normal, pointOnPlane, p2, p3
		);
		var i31 = BSPTree.utils.linePlaneIntersection(
			normal, pointOnPlane, p3, p1
		);

		if ( i12 && i23 && i31 ) {

			// Special case, one split point is a vertex
			// In this case we split triangle into two
			var vertex = new THREE.RenderableVertex();
			var newTriangle = getNextFaceInPool();
			newTriangle.copy( this.element );

			if ( BSPTree.utils.pointsEqual( i12, i23 ) ) {

				vertex.position = i31;
				BSPTree.utils.projectVertex( vertex );

				var uv = BSPTree.utils.interpolateUVs(
					this.element.uvs[0], this.element.uvs[2], p1, p3, i31
				);
				this.element.uvs[2] = newTriangle.uvs[0] = uv;

				this.element.v3.copy( vertex );
				newTriangle.v1 = vertex;

			} else if ( BSPTree.utils.pointsEqual( i23, i31 ) ) {

				vertex.position = i12;
				BSPTree.utils.projectVertex( vertex );

				var uv = BSPTree.utils.interpolateUVs(
					this.element.uvs[0], this.element.uvs[1], p1, p2, i12
				);
				this.element.uvs[0] = newTriangle.uvs[1] = uv;

				this.element.v1.copy( vertex );
				newTriangle.v2 = vertex;

			} else {

				vertex.position = i23;
				BSPTree.utils.projectVertex( vertex );

				var uv = BSPTree.utils.interpolateUVs(
					this.element.uvs[1], this.element.uvs[2], p2, p3, i23
				);
				this.element.uvs[1] = newTriangle.uvs[2] = uv;

				this.element.v2.copy( vertex );
				newTriangle.v3 = vertex;

			}

			return [ this, BSPTree.utils.createNode( newTriangle ) ];

		} else {

			var t1 = getNextFaceInPool();
			var t2 = getNextFaceInPool();

			t1.copy( this.element );
			t2.copy( this.element );

			// Split triangle into three triangles
			if ( ! i12 ) {

				var uv1 = BSPTree.utils.interpolateUVs(
					this.element.uvs[0], this.element.uvs[2], p1, p3, i31
				);
				var uv2 = BSPTree.utils.interpolateUVs(
					this.element.uvs[1], this.element.uvs[2], p2, p3, i23
				);
				this.element.uvs[0] = t1.uvs[2] = uv1;
				this.element.uvs[1] = t1.uvs[1] = t2.uvs[2] = uv2;

				this.element.v1.position = i31;
				this.element.v2.position = i23;
				BSPTree.utils.projectVertex( this.element.v1 );
				BSPTree.utils.projectVertex( this.element.v2 );

				t1.v2.copy( this.element.v2 );
				t1.v3.copy( this.element.v1 );

				t2.v3.copy( this.element.v2 );

			} else if ( ! i23 ) {

				var uv1 = BSPTree.utils.interpolateUVs(
					this.element.uvs[0], this.element.uvs[1], p1, p2, i12
				);
				var uv2 = BSPTree.utils.interpolateUVs(
					this.element.uvs[0], this.element.uvs[2], p1, p3, i31
				);
				this.element.uvs[1] = t1.uvs[0] = uv1;
				this.element.uvs[2] = t1.uvs[2] = t2.uvs[0] = uv2;

				this.element.v2.position = i12;
				this.element.v3.position = i31;
				BSPTree.utils.projectVertex( this.element.v2 );
				BSPTree.utils.projectVertex( this.element.v3 );

				t1.v1.copy( this.element.v2 );
				t1.v3.copy( this.element.v3 );

				t2.v1.copy( this.element.v3 );

			} else {

				var uv1 = BSPTree.utils.interpolateUVs(
					this.element.uvs[0], this.element.uvs[1], p1, p2, i12
				);
				var uv2 = BSPTree.utils.interpolateUVs(
					this.element.uvs[1], this.element.uvs[2], p2, p3, i23
				);
				this.element.uvs[0] = t1.uvs[0] = t2.uvs[1] = uv1;
				this.element.uvs[2] = t1.uvs[1] = uv2;

				this.element.v1.position = i12;
				this.element.v3.position = i23;
				BSPTree.utils.projectVertex( this.element.v1 );
				BSPTree.utils.projectVertex( this.element.v3 );

				t1.v1.copy( this.element.v1 );
				t1.v2.copy( this.element.v3 );

				t2.v2.copy( this.element.v1 );

			}

			return [
				this,
				BSPTree.utils.createNode( t1 ),
				BSPTree.utils.createNode( t2 )
			]

		}

	}

	//

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

};
