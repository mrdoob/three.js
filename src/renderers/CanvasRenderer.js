/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.CanvasRenderer = function () {

	var _renderList = null,
	_projector = new THREE.Projector(),

	_canvas = document.createElement( 'canvas' ),
	_canvasWidth, _canvasHeight, _canvasWidthHalf, _canvasHeightHalf,
	_context = _canvas.getContext( '2d' ),

	_contextGlobalAlpha = 1,
	_contextGlobalCompositeOperation = 0,
	_contextStrokeStyle = null,
	_contextFillStyle = null,
	_contextLineWidth = 1,

	_v1, _v2, _v3, _v4,
	_v5 = new THREE.Vertex(), _v6 = new THREE.Vertex(), // Needed for latter splitting quads to tris

	_v1x, _v1y, _v2x, _v2y, _v3x, _v3y,
	_v4x, _v4y, _v5x, _v5y, _v6x, _v6y,

	_color1, _color2, _color3, _color4,
	_2near, _farPlusNear, _farMinusNear,

	_bitmap, _bitmapWidth, _bitmapHeight,

	_clipRect = new THREE.Rectangle(),
	_clearRect = new THREE.Rectangle(),
	_bboxRect = new THREE.Rectangle(),

	_enableLighting = false,
	_color = new THREE.Color( 0xffffff ),
	_light = new THREE.Color( 0xffffff ),
	_ambientLight = new THREE.Color( 0x000000 ),
	_directionalLights = new THREE.Color( 0x000000 ),
	_pointLights = new THREE.Color( 0x000000 ),

	_pi2 = Math.PI * 2,
	_vector3 = new THREE.Vector3(), // Needed for PointLight
	_uv1 = new THREE.UV(), _uv2 = new THREE.UV(), _uv3 = new THREE.UV(), _uv4 = new THREE.UV(),

	_pixelMap, _pixelMapContext, _pixelMapImage, _pixelMapData,
	_gradientMap, _gradientMapContext, _gradientMapQuality = 16;

	_pixelMap = document.createElement( 'canvas' );
	_pixelMap.width = _pixelMap.height = 2;

	_pixelMapContext = _pixelMap.getContext( '2d' );
	_pixelMapContext.fillStyle = 'rgba(0,0,0,1)';
	_pixelMapContext.fillRect( 0, 0, 2, 2 );

	_pixelMapImage = _pixelMapContext.getImageData( 0, 0, 2, 2 );
	_pixelMapData = _pixelMapImage.data;

	_gradientMap = document.createElement( 'canvas' );
	_gradientMap.width = _gradientMap.height = _gradientMapQuality;

	_gradientMapContext = _gradientMap.getContext( '2d' );
	_gradientMapContext.translate( - _gradientMapQuality / 2, - _gradientMapQuality / 2 );
	_gradientMapContext.scale( _gradientMapQuality, _gradientMapQuality );

	_gradientMapQuality --; // Fix UVs

	this.domElement = _canvas;
	this.autoClear = true;

	this.setSize = function ( width, height ) {

		_canvasWidth = width;
		_canvasHeight = height;
		_canvasWidthHalf = _canvasWidth / 2;
		_canvasHeightHalf = _canvasHeight / 2;

		_canvas.width = _canvasWidth;
		_canvas.height = _canvasHeight;

		_clipRect.set( - _canvasWidthHalf, - _canvasHeightHalf, _canvasWidthHalf, _canvasHeightHalf );

	};

	this.clear = function () {

		if ( !_clearRect.isEmpty() ) {

			_clearRect.inflate( 1 );
			_clearRect.minSelf( _clipRect );

			_context.clearRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );

			_clearRect.empty();

		}
	};

	this.render = function ( scene, camera ) {

		var e, el, element, m, ml, fm, fml, material;

		_context.setTransform( 1, 0, 0, - 1, _canvasWidthHalf, _canvasHeightHalf );

		this.autoClear && this.clear();

		_renderList = _projector.projectScene( scene, camera );

		/* DEBUG
		_context.fillStyle = 'rgba(0, 255, 255, 0.5)';
		_context.fillRect( _clipRect.getX(), _clipRect.getY(), _clipRect.getWidth(), _clipRect.getHeight() );
		*/

		( _enableLighting = scene.lights.length > 0 ) && calculateLights( scene );

		for ( e = 0, el = _renderList.length; e < el; e++ ) {

			element = _renderList[ e ];

			_bboxRect.empty();

			if ( element instanceof THREE.RenderableParticle ) {

				_v1 = element;
				_v1.x *= _canvasWidthHalf; _v1.y *= _canvasHeightHalf;

				for ( m = 0, ml = element.material.length; m < ml; m++ ) {

					renderParticle( _v1, element, element.material[ m ], scene );

				}

			} else if ( element instanceof THREE.RenderableLine ) {

				_v1 = element.v1; _v2 = element.v2;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );

				if ( _clipRect.instersects( _bboxRect ) ) {

					m = 0; ml = element.material.length;

					while ( m < ml ) {

						renderLine( _v1, _v2, element, element.material[ m ++ ], scene );

					}

				}


			} else if ( element instanceof THREE.RenderableFace3 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
				_v3.positionScreen.x *= _canvasWidthHalf; _v3.positionScreen.y *= _canvasHeightHalf;

				if ( element.overdraw ) {

					expand( _v1.positionScreen, _v2.positionScreen );
					expand( _v2.positionScreen, _v3.positionScreen );
					expand( _v3.positionScreen, _v1.positionScreen );

				}

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );

				if ( _clipRect.instersects( _bboxRect ) ) {

					m = 0; ml = element.meshMaterial.length;

					while ( m < ml ) {

						material = element.meshMaterial[ m ++ ];

						if ( material instanceof THREE.MeshFaceMaterial ) {

							fm = 0; fml = element.faceMaterial.length;

							while ( fm < fml ) {

								material = element.faceMaterial[ fm ++ ];
								material && renderFace3( _v1, _v2, _v3, element, material, scene );

							}

							continue;

						}

						renderFace3( _v1, _v2, _v3, element, material, scene );

					}

				}

			} else if ( element instanceof THREE.RenderableFace4 ) {

				_v1 = element.v1; _v2 = element.v2; _v3 = element.v3; _v4 = element.v4;

				_v1.positionScreen.x *= _canvasWidthHalf; _v1.positionScreen.y *= _canvasHeightHalf;
				_v2.positionScreen.x *= _canvasWidthHalf; _v2.positionScreen.y *= _canvasHeightHalf;
				_v3.positionScreen.x *= _canvasWidthHalf; _v3.positionScreen.y *= _canvasHeightHalf;
				_v4.positionScreen.x *= _canvasWidthHalf; _v4.positionScreen.y *= _canvasHeightHalf;

				_v5.positionScreen.copy( _v2.positionScreen );
				_v6.positionScreen.copy( _v4.positionScreen );

				if ( element.overdraw ) {

					expand( _v1.positionScreen, _v2.positionScreen );
					expand( _v2.positionScreen, _v4.positionScreen );
					expand( _v4.positionScreen, _v1.positionScreen );

					expand( _v3.positionScreen, _v5.positionScreen );
					expand( _v3.positionScreen, _v6.positionScreen );

				}

				_bboxRect.addPoint( _v1.positionScreen.x, _v1.positionScreen.y );
				_bboxRect.addPoint( _v2.positionScreen.x, _v2.positionScreen.y );
				_bboxRect.addPoint( _v3.positionScreen.x, _v3.positionScreen.y );
				_bboxRect.addPoint( _v4.positionScreen.x, _v4.positionScreen.y );

				if ( _clipRect.instersects( _bboxRect ) ) {

					m = 0; ml = element.meshMaterial.length;

					while ( m < ml ) {

						material = element.meshMaterial[ m ++ ];

						if ( material instanceof THREE.MeshFaceMaterial ) {

							fm = 0; fml = element.faceMaterial.length;

							while ( fm < fml ) {

								material = element.faceMaterial[ fm ++ ];
								material && renderFace4( _v1, _v2, _v3, _v4, _v5, _v6, element, material, scene );

							}

							continue;

						}

						renderFace4( _v1, _v2, _v3, _v4, _v5, _v6, element, material, scene );

					}

				}

			}

			/*
			_context.lineWidth = 1;
			_context.strokeStyle = 'rgba( 0, 255, 0, 0.5 )';
			_context.strokeRect( _bboxRect.getX(), _bboxRect.getY(), _bboxRect.getWidth(), _bboxRect.getHeight() );
			*/

			_clearRect.addRectangle( _bboxRect );


		}

		/* DEBUG
		_context.lineWidth = 1;
		_context.strokeStyle = 'rgba( 255, 0, 0, 0.5 )';
		_context.strokeRect( _clearRect.getX(), _clearRect.getY(), _clearRect.getWidth(), _clearRect.getHeight() );
		*/

		_context.setTransform( 1, 0, 0, 1, 0, 0 );

	};

	function calculateLights( scene ) {

		var l, ll, light, lightColor,
		lights = scene.lights;

		_ambientLight.setRGB( 0, 0, 0 );
		_directionalLights.setRGB( 0, 0, 0 );
		_pointLights.setRGB( 0, 0, 0 );

		for ( l = 0, ll = lights.length; l < ll; l ++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.AmbientLight ) {

				_ambientLight.r += lightColor.r;
				_ambientLight.g += lightColor.g;
				_ambientLight.b += lightColor.b;

			} else if ( light instanceof THREE.DirectionalLight ) {

				_directionalLights.r += lightColor.r;
				_directionalLights.g += lightColor.g;
				_directionalLights.b += lightColor.b;

			} else if ( light instanceof THREE.PointLight ) {

				_pointLights.r += lightColor.r;
				_pointLights.g += lightColor.g;
				_pointLights.b += lightColor.b;

			}

		}

	}

	function calculateFaceLight( scene, element, color ) {

		var l, ll, light, lightColor, amount
		lights = scene.lights;

		for ( l = 0, ll = lights.length; l < ll; l ++ ) {

			light = lights[ l ];
			lightColor = light.color;

			if ( light instanceof THREE.DirectionalLight ) {

				amount = element.normalWorld.dot( light.position );

				if ( amount > 0 ) {

					amount *= light.intensity;
					color.r += lightColor.r * amount;
					color.g += lightColor.g * amount;
					color.b += lightColor.b * amount;

				}

			} else if ( light instanceof THREE.PointLight ) {

				_vector3.sub( light.position, element.centroidWorld );
				_vector3.normalize();

				amount = element.normalWorld.dot( _vector3 );

				if ( amount > 0 ) {

					amount *= light.intensity;
					color.r += lightColor.r * amount;
					color.g += lightColor.g * amount;
					color.b += lightColor.b * amount;

				}

			}

		}

	}

	function renderParticle ( v1, element, material, scene ) {

		if ( material.opacity == 0 ) return;

		setOpacity( material.opacity );
		setBlending( material.blending );

		var width, height, scaleX, scaleY,
		bitmap, bitmapWidth, bitmapHeight;

		if ( material instanceof THREE.ParticleBasicMaterial ) {

			if ( material.map ) {

				bitmap = material.map;
				bitmapWidth = bitmap.width >> 1;
				bitmapHeight = bitmap.height >> 1;

				scaleX = element.scale.x * _canvasWidthHalf;
				scaleY = element.scale.y * _canvasHeightHalf;

				width = scaleX * bitmapWidth;
				height = scaleY * bitmapHeight;

				// TODO: Rotations break this...

				_bboxRect.set( v1.x - width, v1.y - height, v1.x  + width, v1.y + height );

				if ( !_clipRect.instersects( _bboxRect ) ) {

					return;

				}

				_context.save();
				_context.translate( v1.x, v1.y );
				_context.rotate( - element.rotation );
				_context.scale( scaleX, - scaleY );
				_context.translate( - bitmapWidth, - bitmapHeight );

				_context.drawImage( bitmap, 0, 0 );

				_context.restore();

			}

			/* DEBUG
			_context.beginPath();
			_context.moveTo( v1.x - 10, v1.y );
			_context.lineTo( v1.x + 10, v1.y );
			_context.moveTo( v1.x, v1.y - 10 );
			_context.lineTo( v1.x, v1.y + 10 );
			_context.closePath();
			_context.strokeStyle = 'rgb(255,255,0)';
			_context.stroke();
			*/

		} else if ( material instanceof THREE.ParticleCircleMaterial ) {

			if ( _enableLighting ) {

				_light.r = _ambientLight.r + _directionalLights.r + _pointLights.r;
				_light.g = _ambientLight.g + _directionalLights.g + _pointLights.g;
				_light.b = _ambientLight.b + _directionalLights.b + _pointLights.b;

				_color.r = material.color.r * _light.r;
				_color.g = material.color.g * _light.g;
				_color.b = material.color.b * _light.b;

				_color.updateStyleString();

			} else {

				_color.__styleString = material.color.__styleString;

			}

			width = element.scale.x * _canvasWidthHalf;
			height = element.scale.y * _canvasHeightHalf;

			_bboxRect.set( v1.x - width, v1.y - height, v1.x + width, v1.y + height );

			if ( !_clipRect.instersects( _bboxRect ) ) {

				return;

			}

			setFillStyle( _color.__styleString );

			_context.save();
			_context.translate( v1.x, v1.y );
			_context.rotate( - element.rotation );
			_context.scale( width, height );

			_context.beginPath();
			_context.arc( 0, 0, 1, 0, _pi2, true );
			_context.closePath();

			_context.fill();
			_context.restore();

		}

	}

	function renderLine( v1, v2, element, material, scene ) {

		if ( material.opacity == 0 ) return;

		setOpacity( material.opacity );
		setBlending( material.blending );

		_context.beginPath();
		_context.moveTo( v1.positionScreen.x, v1.positionScreen.y );
		_context.lineTo( v2.positionScreen.x, v2.positionScreen.y );
		_context.closePath();

		if ( material instanceof THREE.LineBasicMaterial ) {

			_color.__styleString = material.color.__styleString;

			setLineWidth( material.linewidth );
			setStrokeStyle( _color.__styleString );

			_context.stroke();
			_bboxRect.inflate( material.linewidth * 2 );

		}

	}

	function renderFace3( v1, v2, v3, element, material, scene ) {

		if ( material.opacity == 0 ) return;

		setOpacity( material.opacity );
		setBlending( material.blending );

		_v1x = v1.positionScreen.x; _v1y = v1.positionScreen.y;
		_v2x = v2.positionScreen.x; _v2y = v2.positionScreen.y;
		_v3x = v3.positionScreen.x; _v3y = v3.positionScreen.y;

		if ( material.map ) {

			_bitmap = material.map.image;
			_bitmapWidth = _bitmap.width - 1;
			_bitmapHeight = _bitmap.height - 1;

			_uv1.u = element.uvs[ 0 ].u * _bitmapWidth; _uv1.v = element.uvs[ 0 ].v * _bitmapHeight;
			_uv2.u = element.uvs[ 1 ].u * _bitmapWidth; _uv2.v = element.uvs[ 1 ].v * _bitmapHeight;
			_uv3.u = element.uvs[ 2 ].u * _bitmapWidth; _uv3.v = element.uvs[ 2 ].v * _bitmapHeight;

			drawTexturedTriangle( _bitmap, _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv3.u, _uv3.v );

			return;

		}

		if ( material instanceof THREE.MeshBasicMaterial ) {

			drawTriangle( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, material.color, material.wireframe, material.wireframe_linewidth );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				if ( material.shading == THREE.FlatShading ) {

					_light.r = _ambientLight.r;
					_light.g = _ambientLight.g;
					_light.b = _ambientLight.b;

					calculateFaceLight( scene, element, _light );

					_color.r = material.color.r * _light.r;
					_color.g = material.color.g * _light.g;
					_color.b = material.color.b * _light.b;

					_color.updateStyleString();

					drawTriangle( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _color, material.wireframe, material.wireframe_linewidth );

				} else if ( material.shading == THREE.SmoothShading ) {

					_light.r = _ambientLight.r;
					_light.g = _ambientLight.g;
					_light.b = _ambientLight.b;

					calculateFaceLight( scene, element, _light );

					_color.r = material.color.r * _light.r;
					_color.g = material.color.g * _light.g;
					_color.b = material.color.b * _light.b;

					_color.updateStyleString();

				}

			} else {

				drawTriangle( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, material.color.__styleString, material.wireframe, material.wireframe_linewidth );

			}


		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			/*
			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear ) );
			_color.setRGB( _w, _w, _w );
			*/

			_2near = material.__2near;
			_farPlusNear = material.__farPlusNear;
			_farMinusNear = material.__farMinusNear;

			_color1 = ~~ ( ( 1 - ( _2near / ( _farPlusNear - v1.positionScreen.z * _farMinusNear ) ) ) * 255 );
			_color2 = ~~ ( ( 1 - ( _2near / ( _farPlusNear - v2.positionScreen.z * _farMinusNear ) ) ) * 255 );
			_color3 = ~~ ( ( 1 - ( _2near / ( _farPlusNear - v3.positionScreen.z * _farMinusNear ) ) ) * 255 );
			// _color4 = ~~ ( ( _color2 + _color3 ) * 0.5 );

			_bitmap = getGradientTexture( [ _color1, _color1, _color1 ], [ _color2, _color2, _color2 ], [ _color3, _color3, _color3 ], [ _color3, _color3, _color3 ] );

			_uv1.u = 0; _uv1.v = 0; 
			_uv2.u = _gradientMapQuality; _uv2.v = 0;
			_uv3.u = 0; _uv3.v = _gradientMapQuality;

			drawTexturedTriangle( _bitmap, _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv3.u, _uv3.v );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.r = normalToComponent( element.normalWorld.x );
			_color.g = normalToComponent( element.normalWorld.y );
			_color.b = normalToComponent( element.normalWorld.z );
			_color.updateStyleString();

			drawTriangle( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _color, material.wireframe, material.wireframe_linewidth );

		}

	}

	function renderFace4( v1, v2, v3, v4, v5, v6, element, material, scene ) {

		if ( material.opacity == 0 ) return;

		setOpacity( material.opacity );
		setBlending( material.blending );

		_v1x = v1.positionScreen.x; _v1y = v1.positionScreen.y;
		_v2x = v2.positionScreen.x; _v2y = v2.positionScreen.y;
		_v3x = v3.positionScreen.x; _v3y = v3.positionScreen.y;
		_v4x = v4.positionScreen.x; _v4y = v4.positionScreen.y;
		_v5x = v5.positionScreen.x; _v5y = v5.positionScreen.y;
		_v6x = v6.positionScreen.x; _v6y = v6.positionScreen.y;

		if ( material.map ) {

			_bitmap = material.map.image;
			_bitmapWidth = _bitmap.width - 1;
			_bitmapHeight = _bitmap.height - 1;

			_uv1.copy( element.uvs[ 0 ] );
			_uv2.copy( element.uvs[ 1 ] );
			_uv3.copy( element.uvs[ 2 ] );
			_uv4.copy( element.uvs[ 3 ] );

			_uv1.u *= _bitmapWidth; _uv1.v *= _bitmapHeight;
			_uv2.u *= _bitmapWidth; _uv2.v *= _bitmapHeight;
			_uv3.u *= _bitmapWidth; _uv3.v *= _bitmapHeight;
			_uv4.u *= _bitmapWidth; _uv4.v *= _bitmapHeight;

			drawTexturedTriangle( _bitmap, _v1x, _v1y, _v2x, _v2y, _v4x, _v4y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv4.u, _uv4.v );
			drawTexturedTriangle( _bitmap, _v5x, _v5y, _v3x, _v3y, _v6x, _v6y, _uv2.u, _uv2.v, _uv3.u, _uv3.v, _uv4.u, _uv4.v );

			return;

		}

		if ( material instanceof THREE.MeshBasicMaterial ) {

			drawQuad( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _v4x, _v4y, material.color, material.wireframe, material.wireframe_linewidth );

		} else if ( material instanceof THREE.MeshLambertMaterial ) {

			if ( _enableLighting ) {

				_light.r = _ambientLight.r;
				_light.g = _ambientLight.g;
				_light.b = _ambientLight.b;

				calculateFaceLight( scene, element, _light );

				_color.r = material.color.r * _light.r;
				_color.g = material.color.g * _light.g;
				_color.b = material.color.b * _light.b;

				_color.updateStyleString();

			} else {

				_color.__styleString = material.color.__styleString;

			}

			drawQuad( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _v4x, _v4y, _color, material.wireframe, material.wireframe_linewidth );

		} else if ( material instanceof THREE.MeshDepthMaterial ) {

			/*
			_w = 1 - ( material.__2near / (material.__farPlusNear - element.z * material.__farMinusNear ) );
			_color.setRGB( _w, _w, _w );
			*/

			_2near = material.__2near;
			_farPlusNear = material.__farPlusNear;
			_farMinusNear = material.__farMinusNear;

			_color1 = ~~ ( ( 1 - ( _2near / ( _farPlusNear - v1.positionScreen.z * _farMinusNear ) ) ) * 255 );
			_color2 = ~~ ( ( 1 - ( _2near / ( _farPlusNear - v2.positionScreen.z * _farMinusNear ) ) ) * 255 );
			_color3 = ~~ ( ( 1 - ( _2near / ( _farPlusNear - v3.positionScreen.z * _farMinusNear ) ) ) * 255 );
			_color4 = ~~ ( ( 1 - ( _2near / ( _farPlusNear - v4.positionScreen.z * _farMinusNear ) ) ) * 255 );

			_bitmap = getGradientTexture( [ _color1, _color1, _color1 ], [ _color2, _color2, _color2 ], [ _color4, _color4, _color4 ], [ _color3, _color3, _color3 ] );

			_uv1.u = 0; _uv1.v = 0; 
			_uv2.u = _gradientMapQuality; _uv2.v = 0;
			_uv3.u = _gradientMapQuality; _uv3.v = _gradientMapQuality;
			_uv4.u = 0; _uv4.v = _gradientMapQuality;

			drawTexturedTriangle( _bitmap, _v1x, _v1y, _v2x, _v2y, _v4x, _v4y, _uv1.u, _uv1.v, _uv2.u, _uv2.v, _uv4.u, _uv4.v );
			drawTexturedTriangle( _bitmap, _v5x, _v5y, _v3x, _v3y, _v6x, _v6y, _uv2.u, _uv2.v, _uv3.u, _uv3.v, _uv4.u, _uv4.v );

		} else if ( material instanceof THREE.MeshNormalMaterial ) {

			_color.r = normalToComponent( element.normalWorld.x );
			_color.g = normalToComponent( element.normalWorld.y );
			_color.b = normalToComponent( element.normalWorld.z );
			_color.updateStyleString();

			drawQuad( _v1x, _v1y, _v2x, _v2y, _v3x, _v3y, _v4x, _v4y, _color, material.wireframe, material.wireframe_linewidth );

		}

	}

	function drawTriangle( x0, y0, x1, y1, x2, y2, color, wireframe, wireframe_linewidth ) {

		_context.beginPath();
		_context.moveTo( x0, y0 );
		_context.lineTo( x1, y1 );
		_context.lineTo( x2, y2 );
		_context.lineTo( x0, y0 );
		_context.closePath();

		if ( wireframe ) {

			setLineWidth( wireframe_linewidth );
			setStrokeStyle( color.__styleString );

			_context.stroke();
			_bboxRect.inflate( wireframe_linewidth * 2 );

		} else {

			setFillStyle( color.__styleString );

			_context.fill();

		}

	}

	function drawQuad( x0, y0, x1, y1, x2, y2, x3, y3, color, wireframe, wireframe_linewidth ) {

		_context.beginPath();
		_context.moveTo( x0, y0 );
		_context.lineTo( x1, y1 );
		_context.lineTo( x2, y2 );
		_context.lineTo( x3, y3 );
		_context.lineTo( x0, y0 );
		_context.closePath();

		if ( wireframe ) {

			setLineWidth( wireframe_linewidth );
			setStrokeStyle( color.__styleString );

			_context.stroke();
			_bboxRect.inflate( wireframe_linewidth * 2 );

		} else {

			setFillStyle( color.__styleString );

			_context.fill();

		}

	}

	function drawTexturedTriangle( bitmap, x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2 ) {

		// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

		_context.beginPath();
		_context.moveTo( x0, y0 );
		_context.lineTo( x1, y1 );
		_context.lineTo( x2, y2 );
		_context.closePath();

		x1 -= x0; y1 -= y0;
		x2 -= x0; y2 -= y0;

		u1 -= u0; v1 -= v0;
		u2 -= u0; v2 -= v0;

		var det = 1 / ( u1 * v2 - u2 * v1 ),

		a = ( v2 * x1 - v1 * x2 ) * det,
		b = ( v2 * y1 - v1 * y2 ) * det,
		c = ( u1 * x2 - u2 * x1 ) * det,
		d = ( u1 * y2 - u2 * y1 ) * det,

		e = x0 - a * u0 - c * v0,
		f = y0 - b * u0 - d * v0;

		_context.save();
		_context.transform( a, b, c, d, e, f );
		_context.clip();
		_context.drawImage( bitmap, 0, 0 );
		_context.restore();

	}

	//

	function setOpacity( value ) {

		if ( _contextGlobalAlpha != value ) {

			_context.globalAlpha = _contextGlobalAlpha = value;

		}

	}

	function setBlending( value ) {

		if ( _contextGlobalCompositeOperation != value ) {

			switch ( value ) {

				case THREE.NormalBlending:

					_context.globalCompositeOperation = 'source-over';

					break;

				case THREE.AdditiveBlending:

					_context.globalCompositeOperation = 'lighter';

					break;

				case THREE.SubtractiveBlending:

					_context.globalCompositeOperation = 'darker';

					break;

			}

			_contextGlobalCompositeOperation = value;

		}

	}

	function setLineWidth( value ) {

		if ( _contextLineWidth != value ) {

			_context.lineWidth = _contextLineWidth = value;

		}

	}

	function setStrokeStyle( value ) {

		if ( _contextStrokeStyle != value ) {

			_context.strokeStyle = _contextStrokeStyle  = value;

		}

	}

	function setFillStyle( value ) {

		if ( _contextFillStyle != value ) {

			_context.fillStyle = _contextFillStyle = value;

		}

	}

	function getGradientTexture( c1, c2, c3, c4 ) {

		// http://mrdoob.com/blog/post/710

		_pixelMapData[ 0 ] = c1[ 0 ];
		_pixelMapData[ 1 ] = c1[ 1 ];
		_pixelMapData[ 2 ] = c1[ 2 ];

		_pixelMapData[ 4 ] = c2[ 0 ];
		_pixelMapData[ 5 ] = c2[ 1 ];
		_pixelMapData[ 6 ] = c2[ 2 ];

		_pixelMapData[ 8 ] = c3[ 0 ];
		_pixelMapData[ 9 ] = c3[ 1 ];
		_pixelMapData[ 10 ] = c3[ 2 ];

		_pixelMapData[ 12 ] = c4[ 0 ];
		_pixelMapData[ 13 ] = c4[ 1 ];
		_pixelMapData[ 14 ] = c4[ 2 ];

		_pixelMapContext.putImageData( _pixelMapImage, 0, 0 );
		_gradientMapContext.drawImage( _pixelMap, 0, 0 );

		return _gradientMap;

	}

	function normalToComponent( normal ) {

		// https://gist.github.com/665829

		return normal < 0 ? Math.min( ( 1 + normal ) * 0.5, 0.5 ) : 0.5 + Math.min( normal * 0.5, 0.5 );

	}

	// Hide anti-alias gaps

	function expand( v1, v2 ) {

		var x = v2.x - v1.x, y =  v2.y - v1.y,
		unit = 1 / Math.sqrt( x * x + y * y );

		x *= unit; y *= unit;

		v2.x += x; v2.y += y;
		v1.x -= x; v1.y -= y;

	}

};
